import { useState, useEffect } from "react";
import "../css/Dashboard.css";

function StatCard({ icon, label, value, accent, sub }) {
    return (
        <div className="stat-card" style={{ "--accent": accent }}>
            <div className="stat-card-top">
                <span className="stat-icon">{icon}</span>
                <span className="stat-arrow">↗</span>
            </div>
            <div className="stat-value">{value ?? "—"}</div>
            <div className="stat-label">{label}</div>
            {sub && <div className="stat-sub">{sub}</div>}
        </div>
    );
}

function formatDate(raw) {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/dashboard/stats")
            .then(r => r.json())
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const get = (key) => stats?.[key]?.[0]?.count ?? 0;

    const totalRentIncome = stats?.recentBilling
        ?.reduce((s, b) => s + Number(b.amount || 0), 0)
        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00";

    const username = localStorage.getItem("username") || "Abshiro";
    const userEmail = localStorage.getItem("userEmail") || "abshiro@gmail.com";

    return (
        <div className="dash-page">

            {/* Top bar */}
            <div className="dash-topbar">
                <div>
                    <h1 className="dash-title">Dashboard</h1>
                    <p className="dash-subtitle">Apartment Rental Management System</p>
                </div>
                <div className="dash-topbar-right">
                    <div className="dash-topbar-user">
                        <div className="dash-user-avatar">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="dash-user-details">
                            <span className="dash-user-name">{username}</span>
                            <span className="dash-user-email">{userEmail}</span>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="dash-loading">Loading dashboard data…</div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="dash-stats">
                        <StatCard icon="🏘️" label="Total Houses"     value={get("houses")}    accent="#22c55e" sub="Registered properties" />
                        <StatCard icon="🏠" label="Apartments"        value={get("apartments")} accent="#3b82f6" sub="Available units" />
                        <StatCard icon="👥" label="Tenants / People"  value={get("people")}    accent="#a855f7" sub="Registered persons" />
                        <StatCard icon="📋" label="Active Rentings"   value={get("renting")}   accent="#f59e0b" sub="Current contracts" />
                        <StatCard icon="💳" label="Billing Records"   value={get("billing")}   accent="#ef4444" sub="Total invoices" />
                        <StatCard icon="🏦" label="Accounts"          value={get("accounts")}  accent="#06b6d4" sub="Linked accounts" />
                    </div>

                    {/* Main grid */}
                    <div className="dash-grid">

                        {/* Recent Rentings */}
                        <div className="dash-card dash-card--wide">
                            <div className="dash-card-header">
                                <h2>🏠 Recent Rentings</h2>
                                <a href="/renting" className="dash-see-all">See all →</a>
                            </div>
                            <div className="dash-table-wrap">
                                <table className="dash-table">
                                    <thead>
                                        <tr>
                                            <th>Rent No.</th>
                                            <th>Apt No.</th>
                                            <th>Customer</th>
                                            <th>Price</th>
                                            <th>Deposit</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.recentRenting?.length > 0 ? stats.recentRenting.map(r => (
                                            <tr key={r.rt_no}>
                                                <td><span className="dash-badge green">#{r.rt_no}</span></td>
                                                <td>{r.app_no}</td>
                                                <td>{r.customer}</td>
                                                <td className="dash-money">${Number(r.price).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                                                <td className="dash-money">${Number(r.deposit).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                                                <td>{formatDate(r.rt_date)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" style={{textAlign:"center",color:"#888"}}>No renting records yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Billing */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h2>💳 Recent Billing</h2>
                                <a href="/billing" className="dash-see-all">See all →</a>
                            </div>
                            <div className="dash-billing-income">
                                <span>Recent Income</span>
                                <strong>${totalRentIncome}</strong>
                            </div>
                            <ul className="dash-billing-list">
                                {stats?.recentBilling?.length > 0 ? stats.recentBilling.map(b => (
                                    <li key={b.bl_no} className="dash-billing-item">
                                        <div className="dash-billing-left">
                                            <span className="dash-billing-icon">🧾</span>
                                            <div>
                                                <div className="dash-billing-title">Bill #{b.bl_no}</div>
                                                <div className="dash-billing-sub">Renting #{b.rt_no} · {formatDate(b.bt_date)}</div>
                                            </div>
                                        </div>
                                        <span className="dash-billing-amount">${Number(b.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                    </li>
                                )) : (
                                    <li style={{textAlign:"center",color:"#888",padding:"16px"}}>No billing records yet.</li>
                                )}
                            </ul>
                        </div>

                        {/* Quick Overview */}
                        <div className="dash-card dash-card--accent dash-card--overview">
                            <h2 className="dash-overview-title">📊 Quick Overview</h2>
                            <div className="dash-overview-list">
                                {[
                                    { label: "Houses",      val: get("houses"),     color: "#22c55e", icon: "🏘️" },
                                    { label: "Apartments",  val: get("apartments"), color: "#3b82f6", icon: "🏠" },
                                    { label: "People",      val: get("people"),     color: "#a855f7", icon: "👥" },
                                    { label: "Rentings",    val: get("renting"),    color: "#f59e0b", icon: "📋" },
                                    { label: "Billing",     val: get("billing"),    color: "#ef4444", icon: "💳" },
                                    { label: "Accounts",    val: get("accounts"),   color: "#06b6d4", icon: "🏦" },
                                ].map(item => (
                                    <div key={item.label} className="dash-overview-row">
                                        <div className="dash-overview-left">
                                            <span className="dash-overview-dot" style={{ background: item.color }} />
                                            <span>{item.icon} {item.label}</span>
                                        </div>
                                        <div className="dash-overview-bar-wrap">
                                            <div className="dash-overview-bar"
                                                style={{ width: `${Math.min((item.val / (Math.max(get("people"), get("houses"), get("apartments"), get("renting"), get("billing"), get("accounts"), 1))) * 100, 100)}%`, background: item.color }} />
                                        </div>
                                        <span className="dash-overview-val">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
