import {
    FaUniversity,
    FaTachometerAlt,
    FaPlus,
    FaClipboardList,
    FaDatabase,
    FaHistory,
    FaCog,
    FaSignOutAlt,
    FaEye,
} from "react-icons/fa";

import { fiuDashboardStyles } from "../assets/dummyStyles";

const requests = [
    {
        id: "REQ-1001",
        customer: "Sakshi Gaur",
        purpose: "Loan Application",
        status: "Pending Consent",
        date: "08 May 2025",
        time: "10:15 AM",
    },
    {
        id: "REQ-1002",
        customer: "Rahul Mehta",
        purpose: "Loan Application",
        status: "Approved",
        date: "08 May 2025",
        time: "09:40 AM",
    },
    {
        id: "REQ-1003",
        customer: "Priya S",
        purpose: "Insurance",
        status: "Data Received",
        date: "08 May 2025",
        time: "09:20 AM",
    },
];

const FiuDashboard = () => {
    return (
        <div className={fiuDashboardStyles.container}>
            <aside className={fiuDashboardStyles.sidebar}>
                <div className={fiuDashboardStyles.brand}>
                    <div className={fiuDashboardStyles.brandIcon}>
                        <FaUniversity />
                    </div>

                    <div>
                        <h1 className={fiuDashboardStyles.brandTitle}>
                            HDFC BANK
                        </h1>

                        <p className={fiuDashboardStyles.brandSubtitle}>
                            FIU Portal
                        </p>
                    </div>
                </div>

                <nav className={fiuDashboardStyles.navigation}>
                    <button className={fiuDashboardStyles.navItemActive}>
                        <FaTachometerAlt />
                        <span>Dashboard</span>
                    </button>

                    <button className={fiuDashboardStyles.navItem}>
                        <FaPlus />
                        <span>Create Request</span>
                    </button>

                    <button className={fiuDashboardStyles.navItem}>
                        <FaClipboardList />
                        <span>My Requests</span>
                    </button>

                    <button className={fiuDashboardStyles.navItem}>
                        <FaDatabase />
                        <span>Received Data</span>
                    </button>

                    <button className={fiuDashboardStyles.navItem}>
                        <FaHistory />
                        <span>Request History</span>
                    </button>

                    <button className={fiuDashboardStyles.navItem}>
                        <FaCog />
                        <span>Settings</span>
                    </button>
                </nav>

                <button className={fiuDashboardStyles.logoutButton}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </aside>

            <main className={fiuDashboardStyles.main}>
                <div className={fiuDashboardStyles.header}>
                    <div>
                        <h2 className={fiuDashboardStyles.title}>
                            FIU Dashboard
                        </h2>

                        <p className={fiuDashboardStyles.subtitle}>
                            Overview of your data-request activity
                        </p>
                    </div>
                </div>

                <div className={fiuDashboardStyles.summaryGrid}>
                    <div className={fiuDashboardStyles.summaryCard}>
                        <span className={fiuDashboardStyles.cardHeader}>
                            Pending Consent
                        </span>

                        <h3 className={fiuDashboardStyles.cardValue}>
                            3
                        </h3>

                        <button className={fiuDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>

                    <div className={fiuDashboardStyles.summaryCard}>
                        <span className={fiuDashboardStyles.cardHeader}>
                            Approved
                        </span>

                        <h3 className={fiuDashboardStyles.cardValue}>
                            8
                        </h3>

                        <button className={fiuDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>

                    <div className={fiuDashboardStyles.summaryCard}>
                        <span className={fiuDashboardStyles.cardHeader}>
                            Rejected
                        </span>

                        <h3 className={fiuDashboardStyles.cardValue}>
                            2
                        </h3>

                        <button className={fiuDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>

                    <div className={fiuDashboardStyles.summaryCard}>
                        <span className={fiuDashboardStyles.cardHeader}>
                            Data Received
                        </span>

                        <h3 className={fiuDashboardStyles.cardValue}>
                            6
                        </h3>

                        <button className={fiuDashboardStyles.viewButton}>
                            View All
                        </button>
                    </div>
                </div>

                <div className={fiuDashboardStyles.createRequestContainer}>
                    <button className={fiuDashboardStyles.createRequestButton}>
                        <FaPlus />
                        <span>Create Data Request</span>
                    </button>
                </div>

                <section className={fiuDashboardStyles.requestsCard}>
                    <div className={fiuDashboardStyles.requestsHeader}>
                        <h3 className={fiuDashboardStyles.requestsTitle}>
                            Recent Requests
                        </h3>

                        <button className={fiuDashboardStyles.viewAllButton}>
                            View All
                        </button>
                    </div>

                    <div className={fiuDashboardStyles.tableWrapper}>
                        <table className={fiuDashboardStyles.table}>
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Customer</th>
                                    <th>Purpose</th>
                                    <th>Status</th>
                                    <th>Requested On</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {requests.map((request) => (
                                    <tr
                                        key={request.id}
                                        className={fiuDashboardStyles.tableRow}
                                    >
                                        <td>
                                            <span className={fiuDashboardStyles.requestId}>
                                                {request.id}
                                            </span>
                                        </td>

                                        <td>
                                            {request.customer}
                                        </td>

                                        <td>
                                            {request.purpose}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    request.status === "Pending Consent"
                                                        ? fiuDashboardStyles.pendingBadge
                                                        : request.status === "Approved"
                                                            ? fiuDashboardStyles.approvedBadge
                                                            : fiuDashboardStyles.dataReceivedBadge
                                                }
                                            >
                                                {request.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={fiuDashboardStyles.date}>
                                                <span>{request.date}</span>
                                                <span>{request.time}</span>
                                            </div>
                                        </td>

                                        <td>
                                            <button
                                                className={fiuDashboardStyles.actionButton}
                                            >
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

export default FiuDashboard;