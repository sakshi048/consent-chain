import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminMetrics from "../components/admin/AdminMetrics";
import ConsentChart from "../components/admin/ConsentChart";
import AlertBanner from "../components/admin/AlertBanner";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import BlockchainSyncCard from "../components/admin/BlockchainSyncCard";
import SystemHealthCard from "../components/admin/SystemHealthCard";
import {
  BlockchainExplorerModal,
  SystemStatusModal,
  AlertsModal,
  AuditDetailModal,
} from "../components/admin/AdminModals";
import {
  UsersView,
  ConsentsView,
  FiusView,
  RevocationsView,
  SettingsView,
  ApiManagementView,
  SupportView,
} from "../components/admin/AdminSubviews";
import {
  initialMetrics,
  initialChartData,
  initialAuditLogs,
  initialBlockchainStatus,
  initialSystemHealth,
  initialAlerts,
  initialFius,
  initialUsers,
  initialConsents,
  fetchLiveBlockchainBlock,
  fetchBackendUsers,
  fetchBackendConsents,
  fetchBackendAuditLogs,
  generateRandomTxHash,
  truncateHash,
} from "../services/adminService";

export default function AdminDashboard() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChartRange, setActiveChartRange] = useState("Last 7 Days");

  // Core Data States
  const [metrics, setMetrics] = useState(initialMetrics);
  const [chartData, setChartData] = useState(initialChartData);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [blockchainStatus, setBlockchainStatus] = useState(initialBlockchainStatus);
  const [systemHealth, setSystemHealth] = useState(initialSystemHealth);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [fius, setFius] = useState(initialFius);
  const [users, setUsers] = useState(initialUsers);
  const [consents, setConsents] = useState(initialConsents);

  // Live real-world sync & simulation states
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      type: "alert",
      title: "Suspicious Consent Grant",
      message: "Multiple consent authorizations from foreign IP 185.220.101.4",
      time: "12m ago",
    },
    {
      type: "blockchain",
      title: "Block #8,945,672 Confirmed",
      message: "42 consent state hashes validated on Polygon Testnet",
      time: "2m ago",
    },
    {
      type: "info",
      title: "FIU Registered",
      message: "XYZ Fintech renewed their data access certificate",
      time: "1h ago",
    },
    {
      type: "alert",
      title: "Email Gateway Spike",
      message: "Notification latency reached 380ms threshold",
      time: "2h ago",
    },
    {
      type: "info",
      title: "Daily Audit Backup",
      message: "Cryptographic consensus proof exported to cold archive",
      time: "4h ago",
    },
  ]);

  // Modals state
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [showSystemStatusModal, setShowSystemStatusModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // 1. Initial Real-World Data Load (fetches real Polygon RPC block height & backend if online)
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);

    // Try fetching live Polygon testnet block number
    const liveBlock = await fetchLiveBlockchainBlock();
    if (liveBlock && liveBlock.success) {
      setBlockchainStatus((prev) => ({
        ...prev,
        latestBlock: liveBlock.blockNum,
        formattedBlock: liveBlock.formatted,
        lastConfirmedSeconds: 5,
      }));
    }

    // Try fetching backend Spring Boot APIs
    const [beUsers, beConsents, beLogs] = await Promise.all([
      fetchBackendUsers(),
      fetchBackendConsents(),
      fetchBackendAuditLogs(),
    ]);

    if (beUsers && beUsers.length > 0) {
      setUsers(beUsers);
      setMetrics((prev) => ({ ...prev, totalUsers: beUsers.length }));
    }

    if (beConsents && beConsents.length > 0) {
      setConsents(beConsents);
      const activeCount = beConsents.filter((c) => c.status === "APPROVED" || c.status === "ACTIVE").length;
      setMetrics((prev) => ({ ...prev, activeConsents: activeCount }));
    }

    if (beLogs && beLogs.length > 0) {
      // Map backend logs into visual table structure
      const mappedLogs = beLogs.map((l, idx) => {
        const hash = generateRandomTxHash();
        return {
          id: l.id || idx + 1,
          user: l.username || `user_${l.userId}@consentchain.io`,
          fiu: "HDFC Digital",
          action: l.action || "CONSENT_GRANTED",
          timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : "Just now",
          txHash: hash,
          truncatedTx: truncateHash(hash),
        };
      });
      setAuditLogs(mappedLogs);
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Run on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // 2. Real-time ticker for block confirmation time & live simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setBlockchainStatus((prev) => ({
        ...prev,
        lastConfirmedSeconds: (prev.lastConfirmedSeconds || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Periodic real-world simulated data updates (stream blocks & events if live mode is enabled)
  useEffect(() => {
    if (!isLiveUpdating) return;

    const liveInterval = setInterval(() => {
      // Automatically advance block count every ~16 seconds
      setBlockchainStatus((prev) => {
        const newBlock = (prev.latestBlock || 8945672) + 1;
        return {
          ...prev,
          latestBlock: newBlock,
          formattedBlock: "#" + newBlock.toLocaleString(),
          lastConfirmedSeconds: 0,
        };
      });
    }, 16000);

    return () => clearInterval(liveInterval);
  }, [isLiveUpdating]);

  // Handler to inject a real-world consent/revocation event
  const simulateLiveEvent = () => {
    const isGrant = Math.random() > 0.4;
    const action = isGrant ? "CONSENT_GRANTED" : "CONSENT_REVOKED";
    const sampleUsers = [
      "ananya.iyer@email.com",
      "vikram.singh@email.com",
      "tanvi.patel@email.com",
      "kunal.joshi@email.com",
    ];
    const sampleFius = ["XYZ Fintech", "ABC Finance", "PQR Payments", "DEF Lending", "HDFC Digital"];
    const chosenUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const chosenFiu = sampleFius[Math.floor(Math.random() * sampleFius.length)];
    const newTx = generateRandomTxHash();

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const timestampStr = `${formattedDate} ${formattedTime}`;

    const newLog = {
      id: Date.now(),
      user: chosenUser,
      fiu: chosenFiu,
      action: action,
      timestamp: timestampStr,
      timeAgo: "Just now",
      txHash: newTx,
      truncatedTx: truncateHash(newTx),
      status: "Success",
    };

    // Update audit logs
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 9)]);

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      activeConsents: isGrant ? prev.activeConsents + 1 : Math.max(0, prev.activeConsents - 1),
      revocationsToday: !isGrant ? prev.revocationsToday + 1 : prev.revocationsToday,
    }));

    // Update Blockchain
    setBlockchainStatus((prev) => {
      const nextBlock = (prev.latestBlock || 8945672) + 1;
      return {
        ...prev,
        latestBlock: nextBlock,
        formattedBlock: "#" + nextBlock.toLocaleString(),
        lastConfirmedSeconds: 0,
      };
    });

    // Add Notification
    setNotifications((prev) => [
      {
        type: isGrant ? "info" : "alert",
        title: isGrant ? "Consent Granted" : "Consent Revoked",
        message: `${chosenUser} ${isGrant ? "authorized" : "revoked access to"} ${chosenFiu}`,
        time: "Just now",
      },
      ...prev.slice(0, 8),
    ]);

    showToast(`Live Event: ${action} by ${chosenUser} (${truncateHash(newTx)})`);
  };

  // Revoke consent handler
  const handleRevokeConsent = (consentId) => {
    setConsents((prev) =>
      prev.map((c) => (c.id === consentId ? { ...c, status: "REVOKED", expires: "Revoked Just Now" } : c))
    );
    setMetrics((prev) => ({
      ...prev,
      activeConsents: Math.max(0, prev.activeConsents - 1),
      revocationsToday: prev.revocationsToday + 1,
    }));
  };

  // User status toggle
  const handleToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
      )
    );
  };

  // Resolve alert
  const handleResolveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Clear notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    showToast("Notifications cleared.");
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans antialiased text-slate-800 overflow-hidden">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        alertCount={alerts.length}
        onOpenProfile={() => setShowSystemStatusModal(true)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Header */}
        <AdminHeader
          title={
            activeTab === "dashboard"
              ? "Admin Dashboard"
              : activeTab === "users"
              ? "Users Management"
              : activeTab === "consents"
              ? "Consent Artefacts"
              : activeTab === "fius"
              ? "Registered FIUs"
              : activeTab === "auditLogs"
              ? "Comprehensive Audit Logs"
              : activeTab === "revocations"
              ? "Consent Revocations"
              : activeTab === "alerts"
              ? "Security Alerts"
              : activeTab === "reports"
              ? "System Analytics & Reports"
              : activeTab === "blockchain"
              ? "Blockchain Explorer"
              : activeTab === "settings"
              ? "System Settings"
              : activeTab === "api"
              ? "API Management"
              : "Support & Docs"
          }
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isLiveUpdating={isLiveUpdating}
          setIsLiveUpdating={setIsLiveUpdating}
          onRefresh={refreshAllData}
          isRefreshing={isRefreshing}
          onSimulateEvent={simulateLiveEvent}
          notifications={notifications}
          onClearNotifications={handleClearNotifications}
        />

        {/* Dashboard Body Container */}
        <main className="flex-1 p-4 md:p-7 max-w-[1520px] w-full mx-auto">
          {/* Main Dashboard Master View */}
          {activeTab === "dashboard" && (
            <div className="animate-fadeIn">
              {/* Top 4 Summary Cards */}
              <AdminMetrics
                metrics={metrics}
                onCardClick={(tab) => setActiveTab(tab)}
              />

              {/* 2-Column Responsive Layout matching mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (Chart, Alert Banner, Audit Logs) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Interactive SVG Chart */}
                  <ConsentChart
                    chartData={chartData}
                    activeRange={activeChartRange}
                    onRangeChange={(range) => setActiveChartRange(range)}
                  />

                  {/* Suspicious Activity Detected Alert Banner */}
                  <AlertBanner onViewAlerts={() => setShowAlertsModal(true)} />

                  {/* Recent Audit Logs Table */}
                  <AuditLogsTable
                    logs={auditLogs}
                    onViewAllLogs={() => setActiveTab("auditLogs")}
                    onSelectLog={(log) => setSelectedAuditLog(log)}
                    showToast={showToast}
                  />
                </div>

                {/* Right Column (Blockchain Sync Status, System Health) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Blockchain Sync Card */}
                  <BlockchainSyncCard
                    blockchainStatus={blockchainStatus}
                    onOpenExplorer={() => setShowExplorerModal(true)}
                  />

                  {/* System Health Card */}
                  <SystemHealthCard
                    services={systemHealth}
                    onOpenSystemStatus={() => setShowSystemStatusModal(true)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subviews for Sidebar Navigation Items */}
          {activeTab === "users" && (
            <UsersView
              users={users}
              onToggleUserStatus={handleToggleUserStatus}
              showToast={showToast}
            />
          )}

          {activeTab === "consents" && (
            <ConsentsView
              consents={consents}
              onRevokeConsent={handleRevokeConsent}
              showToast={showToast}
            />
          )}

          {activeTab === "fius" && <FiusView fius={fius} />}

          {activeTab === "auditLogs" && (
            <div className="animate-fadeIn">
              <AuditLogsTable
                logs={auditLogs}
                onViewAllLogs={() => {}}
                onSelectLog={(log) => setSelectedAuditLog(log)}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === "revocations" && (
            <RevocationsView auditLogs={auditLogs} />
          )}

          {activeTab === "alerts" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Active Security Threat Monitor
              </h3>
              <div className="space-y-4">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-950 text-sm block">
                        {alt.title}
                      </span>
                      <p className="text-slate-600 mt-1">{alt.description}</p>
                      <span className="text-slate-400 text-[11px] block mt-1">
                        Source: {alt.source} | Reported: {alt.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          showToast(`Resolved alert ${alt.id}`);
                          handleResolveAlert(alt.id);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                      >
                        Resolve Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                ConsentChain Ecosystem Reports
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Monthly compliance, audit trail, and throughput metrics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Consent Approval Rate</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">94.8%</p>
                  <span className="text-emerald-600 font-semibold text-xs mt-1 block">
                    ↑ 3.2% from last quarter
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Avg Cryptographic Proof Latency</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">1.84 sec</p>
                  <span className="text-emerald-600 font-semibold text-xs mt-1 block">
                    Optimal on Polygon Amoy
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Zero-Knowledge Validations</span>
                  <p className="text-2xl font-bold text-slate-800 mt-1">48,912</p>
                  <span className="text-blue-600 font-semibold text-xs mt-1 block">
                    100% data privacy intact
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "blockchain" && (
            <div className="animate-fadeIn">
              <BlockchainSyncCard
                blockchainStatus={blockchainStatus}
                onOpenExplorer={() => setShowExplorerModal(true)}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <SettingsView
              isLiveUpdating={isLiveUpdating}
              setIsLiveUpdating={setIsLiveUpdating}
              showToast={showToast}
            />
          )}

          {activeTab === "api" && <ApiManagementView showToast={showToast} />}

          {activeTab === "support" && <SupportView />}
        </main>
      </div>

      {/* 3. Interactive Modals */}
      <BlockchainExplorerModal
        isOpen={showExplorerModal}
        onClose={() => setShowExplorerModal(false)}
        blockchainStatus={blockchainStatus}
        showToast={showToast}
      />

      <SystemStatusModal
        isOpen={showSystemStatusModal}
        onClose={() => setShowSystemStatusModal(false)}
        services={systemHealth}
      />

      <AlertsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        alerts={alerts}
        onResolveAlert={handleResolveAlert}
        showToast={showToast}
      />

      <AuditDetailModal
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        log={selectedAuditLog}
        showToast={showToast}
      />

      {/* 4. Real-World Live Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-fadeIn text-xs md:text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
