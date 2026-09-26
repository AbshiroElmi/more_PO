import { useState, useEffect } from "react";
import "../css/Apartments.css";
import "../css/Reports.css";

function formatDate(raw) {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(val) {
    return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const REPORTS = [
    {
        key: "apartments",
        label: "Apartments",
        icon: "🏠",
        endpoint: "http://localhost:5000/appartments",
        rowKey: "app_no",
        columns: [
            { header: "App No.", key: "app_no", className: "col-no" },
            { header: "Name", key: "app_name", className: "col-name" },
            { header: "House", key: "h_no", render: (v) => <span className="h-badge">{v}</span> },
            { header: "Rooms", key: "rooms", render: (v) => <span className="stat-pill">🛏 {v}</span> },
            { header: "Toilets", key: "toilets", render: (v) => <span className="stat-pill">🚿 {v}</span> },
            { header: "Description", key: "description", className: "col-desc" },
        ],
    },
    {
        key: "houses",
        label: "Houses",
        icon: "🏘️",
        endpoint: "http://localhost:5000/houses",
        rowKey: "h_no",
        columns: [
            { header: "House No.", key: "h_no", className: "col-no" },
            { header: "House Name", key: "house_name", className: "col-name" },
            { header: "Owner", key: "owner" },
            { header: "Address No.", key: "add_no" },
        ],
    },
    {
        key: "people",
        label: "People",
        icon: "👥",
        endpoint: "http://localhost:5000/people",
        rowKey: "p_no",
        columns: [
            { header: "Person No.", key: "p_no", className: "col-no" },
            { header: "Name", key: "name", className: "col-name" },
            { header: "Phone", key: "tell" },
        ],
    },
    {
        key: "renting",
        label: "Renting",
        icon: "📋",
        endpoint: "http://localhost:5000/renting",
        rowKey: "rt_no",
        columns: [
            { header: "Rent No.", key: "rt_no", className: "col-no" },
            { header: "Apt No.", key: "app_no" },
            { header: "Customer", key: "customer" },
            { header: "Price", key: "price", render: (v) => formatMoney(v) },
            { header: "Date", key: "rt_date", render: (v) => formatDate(v) },
            { header: "Deposit", key: "deposit", render: (v) => formatMoney(v) },
            { header: "Description", key: "description", className: "col-desc" },
        ],
    },
    {
        key: "billing",
        label: "Billing",
        icon: "💳",
        endpoint: "http://localhost:5000/billing",
        rowKey: "bl_no",
        columns: [
            { header: "Bill No.", key: "bl_no", className: "col-no" },
            { header: "Renting No.", key: "rt_no" },
            { header: "Amount", key: "amount", render: (v) => formatMoney(v) },
            { header: "Date", key: "bt_date", render: (v) => formatDate(v) },
            { header: "Description", key: "description", className: "col-desc" },
        ],
    },
    {
        key: "receipts",
        label: "Receipts",
        icon: "🧾",
        endpoint: "http://localhost:5000/receipts",
        rowKey: "r_no",
        columns: [
            { header: "Receipt No.", key: "r_no", className: "col-no" },
            { header: "Person No.", key: "p_no" },
            { header: "Account No.", key: "acc_no" },
            { header: "Date", key: "rt_date", render: (v) => formatDate(v) },
        ],
    },
    {
        key: "accounts",
        label: "Accounts",
        icon: "🏦",
        endpoint: "http://localhost:5000/accounts",
        rowKey: "acc_no",
        columns: [
            { header: "Account No.", key: "acc_no", className: "col-no" },
            { header: "Account Name", key: "acc_name", className: "col-name" },
            { header: "Institution", key: "institution" },
            { header: "Balance", key: "balance", render: (v) => formatMoney(v) },
        ],
    },
    {
        key: "address",
        label: "Address",
        icon: "📍",
        endpoint: "http://localhost:5000/address",
        rowKey: "add_no",
        columns: [
            { header: "Address No.", key: "add_no", className: "col-no" },
            { header: "District", key: "district", className: "col-name" },
            { header: "Village", key: "village" },
        ],
    },
    {
        key: "users",
        label: "Users",
        icon: "👤",
        endpoint: "http://localhost:5000/users",
        rowKey: "user_id",
        columns: [
            { header: "User ID", key: "user_id", className: "col-no" },
            { header: "Username", key: "user_name", className: "col-name" },
            { header: "Phone No", key: "p_no" },
        ],
    },
];

function Reports() {
    const [activeKey, setActiveKey] = useState(REPORTS[0].key);
    const [cache, setCache] = useState({});
    const [errors, setErrors] = useState({});

    const active = REPORTS.find((r) => r.key === activeKey);

    useEffect(() => {
        if (cache[activeKey] !== undefined || errors[activeKey]) return;

        let cancelled = false;
        fetch(active.endpoint)
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setCache((prev) => ({ ...prev, [activeKey]: data }));
            })
            .catch((err) => {
                if (!cancelled) setErrors((prev) => ({ ...prev, [activeKey]: err.message }));
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeKey]);

    const rows = cache[activeKey] || [];
    const errorKey = errors[activeKey];
    const isLoading = cache[activeKey] === undefined && !errorKey;

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    <span className="page-icon">📊</span>
                    Reports
                </h1>
                <span className="apartments-count">{rows.length} records</span>
            </div>

            <div className="report-tabs">
                {REPORTS.map((r) => (
                    <button
                        key={r.key}
                        className={`report-tab ${r.key === activeKey ? "active" : ""}`}
                        onClick={() => setActiveKey(r.key)}
                    >
                        <span className="report-tab-icon">{r.icon}</span>
                        {r.label}
                    </button>
                ))}
            </div>

            <div className="table-wrapper">
                {isLoading ? (
                    <div className="report-state">Loading {active.label.toLowerCase()} report…</div>
                ) : errorKey ? (
                    <div className="report-state report-state--error">Error: {errorKey}</div>
                ) : (
                    <table className="apt-table">
                        <thead>
                            <tr>
                                {active.columns.map((col) => (
                                    <th key={col.key}>{col.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row[active.rowKey] ?? idx}>
                                    {active.columns.map((col) => (
                                        <td key={col.key} className={col.className || ""}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={active.columns.length} style={{ textAlign: "center" }}>
                                        No {active.label.toLowerCase()} records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Reports;
