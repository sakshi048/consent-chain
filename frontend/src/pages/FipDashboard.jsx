import {
    FaUniversity,
    FaTachometerAlt,
    FaFileAlt,
    FaHistory,
    FaUser,
    FaClipboardCheck,
    FaCog,
    FaSignOutAlt,
    FaEye,
} from "react-icons/fa";

import { fipDashboardStyles } from "../assets/dummyStyles";

const requests = [
    {
        id: "REQ-1001",
        customer: "Sakshi",
        fiu: "HDFC Bank",
        purpose: "Loan Application",
        status: "Pending",
        date: "08 May 2025",
        time: "10:15 AM",
    },
    {
        id: "REQ-1002",
        customer: "Rahul",
        fiu: "Fintech X",
        purpose: "Loan Application",
        status: "Completed",
        date: "08 May 2025",
        time: "09:40 AM",
    },
    {
        id: "REQ-1003",
        customer: "Priya",
        fiu: "Bank A",
        purpose: "Insurance",
        status: "Completed",
        date: "08 May 2025",
        time: "09:20 AM",
    },
];

const FipDashboard = () => {
    return (
        <div className={fipDashboardStyles.container}>
            <aside className={fipDashboardStyles.sidebar}>
                <div className={fipDashboardStyles.brand}>
                    <div className={fipDashboardStyles.brandIcon}>
                        <FaUniversity />
                    </div>

                    <div>
                        <h1 className={fipDashboardStyles.brandTitle}>HDFC BANK</h1>
                        <p className={fipDashboardStyles.brandSubtitle}>FIP Portal</p>
                    </div>
                </div>

                <nav className={fipDashboardStyles.navigation}>
                    <button className={fipDashboardStyles.navItemActive}>
                        <FaTachometerAlt />
                        <span>Dashboard</span>
                    </button>

                    <button className={fipDashboardStyles.navItem}>
                        <FaFileAlt />
                        <span>Data Requests</span>
                    </button>

                    <button className={fipDashboardStyles.navItem}>
                        <FaHistory />
                        <span>Request History</span>
                    </button>

                    <button className={fipDashboardStyles.navItem}>
                        <FaUser />
                        <span>Accounts</span>
                    </button>

                    <button className={fipDashboardStyles.navItem}>
                        <FaClipboardCheck />
                        <span>Audit Logs</span>
                    </button>

                    <button className={fipDashboardStyles.navItem}>
                        <FaCog />
                        <span>Settings</span>
                    </button>
                </nav>

                <button className={fipDashboardStyles.logoutButton}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </aside>

            <main className={fipDashboardStyles.main}>
                <div className={fipDashboardStyles.header}>
                    <div>
                        <h2 className={fipDashboardStyles.title}>FIP Dashboard</h2>
                        <p className={fipDashboardStyles.subtitle}>
                            Overview of AI-related activity
                        </p>
                    </div>
                </div>

                <div className={fipDashboardStyles.summaryGrid}>
                    <div className={fipDashboardStyles.summaryCard}>
                        <div className={fipDashboardStyles.cardHeader}>
                            <span>Financial Accounts</span>
                        </div>

                        <h3 className={fipDashboardStyles.cardValue}>12,540</h3>

                        <span className={fipDashboardStyles.cardLabel}>Total</span>
                    </div>

                    <div className={fipDashboardStyles.summaryCard}>
                        <div className={fipDashboardStyles.cardHeader}>
                            <span>Pending Requests</span>
                        </div>

                        <h3 className={fipDashboardStyles.cardValue}>3</h3>

                        <button className={fipDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>

                    <div className={fipDashboardStyles.summaryCard}>
                        <div className={fipDashboardStyles.cardHeader}>
                            <span>Completed Requests</span>
                        </div>

                        <h3 className={fipDashboardStyles.cardValue}>28</h3>

                        <button className={fipDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>

                    <div className={fipDashboardStyles.summaryCard}>
                        <div className={fipDashboardStyles.cardHeader}>
                            <span>Data Requests Today</span>
                        </div>

                        <h3 className={fipDashboardStyles.cardValue}>5</h3>

                        <button className={fipDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>
                </div>

                <section className={fipDashboardStyles.requestsCard}>
                    <div className={fipDashboardStyles.requestsHeader}>
                        <h3 className={fipDashboardStyles.requestsTitle}>
                            Recent Requests
                        </h3>

                        <button className={fipDashboardStyles.viewAllButton}>
                            View All
                        </button>
                    </div>

                    <div className={fipDashboardStyles.tableWrapper}>
                        <table className={fipDashboardStyles.table}>
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Customer</th>
                                    <th>FIU</th>
                                    <th>Purpose</th>
                                    <th>Status</th>
                                    <th>Requested On</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id}
                                        className={fipDashboardStyles.tableRow}>
                                        <td>
                                            <span className={fipDashboardStyles.requestId}>
                                                {request.id}
                                            </span>
                                        </td>

                                        <td>{request.customer}</td>

                                        <td>{request.fiu}</td>

                                        <td>{request.purpose}</td>

                                        <td>
                                            <span
                                                className={
                                                    request.status === "Pending"
                                                        ? fipDashboardStyles.pendingBadge
                                                        : fipDashboardStyles.completedBadge
                                                }
                                            >
                                                {request.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={fipDashboardStyles.date}>
                                                <span>{request.date}</span>
                                                <span>{request.time}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <button className={fipDashboardStyles.actionButton}>
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FipDashboard;