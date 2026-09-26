import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";

function Billing() {
    const [billingRecords, setBillingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBillingId, setEditingBillingId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        rt_no: "", amount: "", bt_date: "", description: ""
    });

    const fetchBillingRecords = () => {
        fetch("http://localhost:5000/billing")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                // Format dates to YYYY-MM-DD for input fields later
                const formattedData = data.map(item => {
                    let d = new Date(item.bt_date);
                    return {
                        ...item,
                        formattedDate: !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : ""
                    };
                });
                setBillingRecords(formattedData);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBillingRecords();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingBillingId(null);
        setFormData({ rt_no: "", amount: "", bt_date: "", description: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditMode(true);
        setEditingBillingId(record.bl_no);
        setFormData({ 
            rt_no: record.rt_no || "", 
            amount: record.amount || "",
            bt_date: record.formattedDate || "",
            description: record.description || ""
        });
        setShowModal(true);
    };

    const handleSaveBilling = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/billing/${editingBillingId}` 
                : "http://localhost:5000/billing";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'add'} billing record`);
            }
            setShowModal(false);
            fetchBillingRecords(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteBilling = async (id) => {
        if (!window.confirm("Are you sure you want to delete this billing record?")) return;

        try {
            const res = await fetch(`http://localhost:5000/billing/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to delete billing record");
            }
            fetchBillingRecords(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportBilling = () => {
        exportToCSV(billingRecords, "billing", ["formattedDate"]);
    };

    const handleImportBilling = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetch("http://localhost:5000/billing", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row)
                });
            }
            fetchBillingRecords();
            alert(`Imported ${rows.length} billing record(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading billing data...</div>;
    if (error) return <div className="apartments-page">Error fetching billing data: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredBilling = !q ? billingRecords : billingRecords.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>Billing</h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search billing records..." />
                <span className="apartments-count">{filteredBilling.length} records</span>
                <button className="btn-add" onClick={handleOpenAddModal}>+ Add Billing</button>
                <ExportImportMenu onExport={handleExportBilling} onImport={handleImportBilling} />
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>Bill No.</th>
                            <th>Renting No.</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBilling.map((record) => (
                            <tr key={record.bl_no}>
                                <td className="col-no">{record.bl_no}</td>
                                <td>{record.rt_no}</td>
                                <td>${Number(record.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>{record.formattedDate}</td>
                                <td>{record.description}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => handleOpenEditModal(record)}
                                        style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteBilling(record.bl_no)}
                                        style={{ padding: '4px 8px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredBilling.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>No billing records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Billing Record" : "Add New Billing Record"}</h2>
                        <form className="modal-form" onSubmit={handleSaveBilling}>
                            <input 
                                type="number" 
                                name="rt_no" 
                                placeholder="Renting No." 
                                value={formData.rt_no} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="number" 
                                step="0.01"
                                name="amount" 
                                placeholder="Amount" 
                                value={formData.amount} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="date" 
                                name="bt_date" 
                                placeholder="Date" 
                                value={formData.bt_date} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <textarea 
                                name="description" 
                                placeholder="Description" 
                                value={formData.description} 
                                onChange={handleInputChange} 
                                rows="3"
                            ></textarea>

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

export default Billing;
