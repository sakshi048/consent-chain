// adminService.js
// Handles real-world data synchronization for ConsentChain Admin Dashboard
// Integrates with local backend (/aa/admin/*), public Web3 RPC, and provides real-time streaming simulation.

const BACKEND_BASE = "http://localhost:8080/aa/admin";
const POLYGON_RPC_URL = "https://rpc-amoy.polygon.technology";

// Initial realistic baseline data matching user design mockup
export const initialMetrics = {
  totalUsers: 1204,
  usersTrend: "↑ 12.5%",
  usersPeriod: "vs last 30 days",

  activeConsents: 876,
  consentsTrend: "↑ 8.4%",
  consentsPeriod: "vs last 30 days",

  registeredFius: 12,
  fiusTrend: "↑ 9.1%",
  fiusPeriod: "vs last 30 days",

  revocationsToday: 34,
  revocationsTrend: "↑ 21.2%",
  revocationsPeriod: "vs yesterday",
};

export const initialChartData = {
  "Last 7 Days": {
    labels: ["May 27", "May 28", "May 29", "May 30", "May 31", "Jun 1", "Jun 2"],
    granted: [125, 148, 150, 175, 160, 178, 98],
    revoked: [32, 58, 80, 56, 32, 24, 38],
  },
  "Last 24 Hours": {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
    granted: [14, 8, 42, 65, 88, 72, 35],
    revoked: [2, 1, 9, 15, 12, 18, 6],
  },
  "Last 30 Days": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    granted: [620, 780, 940, 890],
    revoked: [140, 165, 190, 155],
  },
  "Last 90 Days": {
    labels: ["March", "April", "May"],
    granted: [2400, 3100, 3850],
    revoked: [520, 640, 710],
  },
};

export const initialAuditLogs = [
  {
    id: 1,
    user: "john.doe@email.com",
    fiu: "XYZ Fintech",
    action: "CONSENT_GRANTED",
    timestamp: "Jun 2, 2025 10:24 AM",
    timeAgo: "2 mins ago",
    txHash: "0x7fa92b3c10d84ea25c81f09e3a7b1c4568903b1c",
    truncatedTx: "0x7fa....3b1c",
    status: "Success",
    scope: ["ACCOUNT_SUMMARY", "TRANSACTIONS"],
  },
  {
    id: 2,
    user: "sarah.khan@email.com",
    fiu: "ABC Finance",
    action: "CONSENT_REVOKED",
    timestamp: "Jun 2, 2025 10:18 AM",
    timeAgo: "8 mins ago",
    txHash: "0x6de41209bca34ef19a8234bbd89c001249769a2f",
    truncatedTx: "0x6de....9a2f",
    status: "Success",
    scope: ["CREDIT_REPORT"],
  },
  {
    id: 3,
    user: "rohit.sharma@email.com",
    fiu: "PQR Payments",
    action: "CONSENT_GRANTED",
    timestamp: "Jun 2, 2025 10:11 AM",
    timeAgo: "15 mins ago",
    txHash: "0x4ac71569ee738bbd9124401a88cfd90134bc7d8e",
    truncatedTx: "0x4ac....7d8e",
    status: "Success",
    scope: ["TRANSACTION_HISTORY"],
  },
  {
    id: 4,
    user: "meera.nair@email.com",
    fiu: "LMN Insurance",
    action: "CONSENT_REVOKED",
    timestamp: "Jun 2, 2025 09:58 AM",
    timeAgo: "28 mins ago",
    txHash: "0x9bd837a2cc3418ef0091aa3755cf120894561f4a",
    truncatedTx: "0x9bd....1f4a",
    status: "Success",
    scope: ["PROFILE", "NET_WORTH"],
  },
  {
    id: 5,
    user: "arjun.verma@email.com",
    fiu: "DEF Lending",
    action: "CONSENT_GRANTED",
    timestamp: "Jun 2, 2025 09:44 AM",
    timeAgo: "42 mins ago",
    txHash: "0x3aa890cdba12543ef88190cbb173450912ab5e6b",
    truncatedTx: "0x3aa....5e6b",
    status: "Success",
    scope: ["LOAN_DETAILS", "BALANCE"],
  },
];

export const initialBlockchainStatus = {
  status: "Synced",
  lastConfirmedSeconds: 120, // 2 mins ago
  network: "Polygon Testnet",
  latestBlock: 8945672,
  formattedBlock: "#8,945,672",
  nodeStatus: "Healthy",
  peersConnected: 12,
  gasPriceGwei: 32.4,
  tps: 48.2,
  contractAddress: "0x36214B8B9B7E30C86386C86d4eA5c07469aBe645",
};

export const initialSystemHealth = [
  { name: "API Services", status: "Healthy", latency: "24ms", uptime: "99.98%" },
  { name: "Database", status: "Healthy", latency: "12ms", uptime: "100%" },
  { name: "Blockchain Node", status: "Healthy", latency: "45ms", uptime: "99.94%" },
  { name: "File Storage", status: "Healthy", latency: "18ms", uptime: "99.99%" },
  { name: "Email Service", status: "Degraded", latency: "380ms", uptime: "96.40%" },
];

export const initialAlerts = [
  {
    id: "ALT-801",
    title: "Suspicious Activity Detected",
    description: "Multiple consent grants detected from unusual locations (IP: 185.220.101.4).",
    severity: "Critical",
    timestamp: "12 mins ago",
    source: "Security Monitor",
    status: "Active",
  },
  {
    id: "ALT-802",
    title: "Email Notification Queue Delay",
    description: "Outgoing consent notification emails experiencing ~45s delivery lag.",
    severity: "Warning",
    timestamp: "45 mins ago",
    source: "SMTP Gateway",
    status: "Active",
  },
  {
    id: "ALT-803",
    title: "Gas Fluctuation on Testnet",
    description: "Polygon testnet gas spikes detected (>48 Gwei) during peak hours.",
    severity: "Info",
    timestamp: "2 hours ago",
    source: "Gas Oracle",
    status: "Investigating",
  },
];

export const initialFius = [
  { id: "FIU-01", name: "XYZ Fintech", license: "AA-NBFC-2023-08", activeRequests: 142, status: "Active", health: "99.8%" },
  { id: "FIU-02", name: "ABC Finance", license: "AA-NBFC-2022-14", activeRequests: 98, status: "Active", health: "99.4%" },
  { id: "FIU-03", name: "PQR Payments", license: "AA-PA-2024-02", activeRequests: 215, status: "Active", health: "99.9%" },
  { id: "FIU-04", name: "LMN Insurance", license: "AA-IRDAI-2021-99", activeRequests: 86, status: "Active", health: "98.7%" },
  { id: "FIU-05", name: "DEF Lending", license: "AA-NBFC-2023-55", activeRequests: 164, status: "Active", health: "100%" },
  { id: "FIU-06", name: "HDFC Digital", license: "AA-BANK-2020-01", activeRequests: 310, status: "Active", health: "99.9%" },
];

export const initialUsers = [
  { id: 101, name: "John Doe", email: "john.doe@email.com", linkedAccounts: 3, activeConsents: 2, status: "Active", joined: "Jan 12, 2025" },
  { id: 102, name: "Sarah Khan", email: "sarah.khan@email.com", linkedAccounts: 2, activeConsents: 1, status: "Active", joined: "Feb 04, 2025" },
  { id: 103, name: "Rohit Sharma", email: "rohit.sharma@email.com", linkedAccounts: 4, activeConsents: 3, status: "Active", joined: "Mar 19, 2025" },
  { id: 104, name: "Meera Nair", email: "meera.nair@email.com", linkedAccounts: 1, activeConsents: 0, status: "Active", joined: "Apr 02, 2025" },
  { id: 105, name: "Arjun Verma", email: "arjun.verma@email.com", linkedAccounts: 2, activeConsents: 2, status: "Active", joined: "May 15, 2025" },
  { id: 106, name: "Sakshi Gaur", email: "sakshi.gaur@email.com", linkedAccounts: 5, activeConsents: 4, status: "Active", joined: "May 20, 2025" },
];

export const initialConsents = [
  { id: "CNS-9801", user: "john.doe@email.com", fiu: "XYZ Fintech", purpose: "Personal Loan Underwriting", status: "APPROVED", expires: "Dec 31, 2025", txHash: "0x7fa92b3c10d84ea25c81f09e3a7b1c4568903b1c" },
  { id: "CNS-9802", user: "sarah.khan@email.com", fiu: "ABC Finance", purpose: "Credit Card Evaluation", status: "REVOKED", expires: "Revoked Jun 2", txHash: "0x6de41209bca34ef19a8234bbd89c001249769a2f" },
  { id: "CNS-9803", user: "rohit.sharma@email.com", fiu: "PQR Payments", purpose: "Wealth Management Portfolio", status: "APPROVED", expires: "Oct 15, 2025", txHash: "0x4ac71569ee738bbd9124401a88cfd90134bc7d8e" },
  { id: "CNS-9804", user: "meera.nair@email.com", fiu: "LMN Insurance", purpose: "Health Term Policy Verification", status: "REVOKED", expires: "Revoked Jun 2", txHash: "0x9bd837a2cc3418ef0091aa3755cf120894561f4a" },
  { id: "CNS-9805", user: "arjun.verma@email.com", fiu: "DEF Lending", purpose: "Home Loan Verification", status: "APPROVED", expires: "Nov 20, 2025", txHash: "0x3aa890cdba12543ef88190cbb173450912ab5e6b" },
];

// Fetch live block number from real-world Polygon RPC
export async function fetchLiveBlockchainBlock() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(POLYGON_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        const blockNum = parseInt(data.result, 16);
        return {
          success: true,
          blockNum,
          formatted: "#" + blockNum.toLocaleString(),
        };
      }
    }
  } catch (err) {
    // RPC timeout or CORS fallback
  }
  return null;
}

// Fetch live users from Spring Boot Aggregator Service
export async function fetchBackendUsers() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BACKEND_BASE}/users`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    }
  } catch (e) {
    // backend not running
  }
  return null;
}

// Fetch live consents from Spring Boot
export async function fetchBackendConsents() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BACKEND_BASE}/consents`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    }
  } catch (e) {
    // backend not running
  }
  return null;
}

// Fetch live audit logs from Spring Boot
export async function fetchBackendAuditLogs() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BACKEND_BASE}/audit-logs`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    }
  } catch (e) {
    // backend not running
  }
  return null;
}

// Helper to generate a realistic random Tx Hash
export function generateRandomTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function truncateHash(hash) {
  if (!hash) return "0x000...0000";
  return `${hash.slice(0, 5)}....${hash.slice(-4)}`;
}
