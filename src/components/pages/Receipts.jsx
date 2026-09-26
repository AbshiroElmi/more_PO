import { useState, useEffect } from "react";
import "../css/Apartments.css";
import { SearchBar, ExportImportMenu } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";

function Receipts() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ p_no: "", acc_no: "", rt_date: "" });

    const fetchReceipts = () => {
        fetch("http://localhost:5000/receipts")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                const formatted = data.map(item => {
                    let d = new Date(item.rt_date);
                    return { ...item, formattedDate: !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "" };
                });
                setReceipts(formatted);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchReceipts(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ p_no: "", acc_no: "", rt_date: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditMode(true);
        setEditingId(record.r_no);
        setFormData({ p_no: record.p_no || "", acc_no: record.acc_no || "", rt_date: record.formattedDate || "" });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode ? `http://localhost:5000/receipts/${editingId}` : "http://localhost:5000/receipts";
            const method = isEditMode ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? "update" : "add"} receipt`);
            }
            setShowModal(false);
            fetchReceipts();
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this receipt?")) return;
        try {
            const res = await fetch(`http://localhost:5000/receipts/${id}`, { method: "DELETE" });
            if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Failed to delete"); }
            fetchReceipts();
        } catch (err) { alert(err.message); }
    };

    const handleExportReceipts = () => {
        exportToCSV(receipts, "receipts", ["formattedDate"]);
    };

    const handleImportReceipts = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetch("http://localhost:5000/receipts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row)
                });
            }
            fetchReceipts();
            alert(`Imported ${rows.length} receipt(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading receipts...</div>;
    if (error) return <div className="apartments-page">Error: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredReceipts = !q ? receipts : receipts.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>Receipts</h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search receipts..." />
                <span className="apartments-count">{filteredReceipts.length} records</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add Receipt</button>
                    <ExportImportMenu onExport={handleExportReceipts} onImport={handleImportReceipts} />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>Receipt No.</th>
                            <th>Person No.</th>
                            <th>Account No.</th>
                            <th>Date</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map((record) => (
                            <tr key={record.r_no}>
                                <td className="col-no">{record.r_no}</td>
                                <td>{record.p_no}</td>
                                <td>{record.acc_no}</td>
                                <td>{record.formattedDate}</td>
                                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                    <button onClick={() => handleOpenEditModal(record)}
                                        style={{ marginRight: "8px", padding: "4px 8px", cursor: "pointer", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(record.r_no)}
                                        style={{ padding: "4px 8px", cursor: "pointer", background: "#ef4444", color: "white", border: "none", borderRadius: "4px" }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredReceipts.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: "center" }}>No receipts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Receipt" : "Add New Receipt"}</h2>
                        <form className="modal-form" onSubmit={handleSave}>
                            <input type="number" name="p_no" placeholder="Person No." value={formData.p_no} onChange={handleInputChange} required />
                            <input type="number" name="acc_no" placeholder="Account No." value={formData.acc_no} onChange={handleInputChange} required />
                            <input type="date" name="rt_date" value={formData.rt_date} onChange={handleInputChange} required />
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">{isEditMode ? "Update" : "Save"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Receipts;
