import { useState, useEffect } from "react";
import "../css/Apartments.css";
import { SearchBar } from "../Common.jsx";

function Renting() {
    const [rentingRecords, setRentingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        app_no: "", customer: "", price: "", rt_date: "", deposit: "", description: ""
    });

    const fetchRenting = () => {
        fetch("http://localhost:5000/renting")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                const formatted = data.map(item => {
                    let d = new Date(item.rt_date);
                    return { ...item, formattedDate: !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "" };
                });
                setRentingRecords(formatted);
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchRenting(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ app_no: "", customer: "", price: "", rt_date: "", deposit: "", description: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditMode(true);
        setEditingId(record.rt_no);
        setFormData({
            app_no: record.app_no || "",
            customer: record.customer || "",
            price: record.price || "",
            rt_date: record.formattedDate || "",
            deposit: record.deposit || "",
            description: record.description || ""
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode ? `http://localhost:5000/renting/${editingId}` : "http://localhost:5000/renting";
            const method = isEditMode ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? "update" : "add"} renting record`);
            }
            setShowModal(false);
            fetchRenting();
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this renting record?")) return;
        try {
            const res = await fetch(`http://localhost:5000/renting/${id}`, { method: "DELETE" });
            if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Failed to delete"); }
            fetchRenting();
        } catch (err) { alert(err.message); }
    };

    if (loading) return <div className="apartments-page">Loading renting records...</div>;
    if (error) return <div className="apartments-page">Error: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredRenting = !q ? rentingRecords : rentingRecords.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1><span className="page-icon">🏠</span> Renting</h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search renting records..." />
                <span className="apartments-count">{filteredRenting.length} records</span>
                <button className="btn-add" onClick={handleOpenAddModal}>+ Add Renting</button>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>Rent No.</th>
                            <th>Apt No.</th>
                            <th>Customer</th>
                            <th>Price</th>
                            <th>Date</th>
                            <th>Deposit</th>
                            <th>Description</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRenting.map((record) => (
                            <tr key={record.rt_no}>
                                <td className="col-no">{record.rt_no}</td>
                                <td>{record.app_no}</td>
                                <td>{record.customer}</td>
                                <td>${Number(record.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>{record.formattedDate}</td>
                                <td>${Number(record.deposit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="col-desc">{record.description}</td>
                                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                    <button onClick={() => handleOpenEditModal(record)}
                                        style={{ marginRight: "8px", padding: "4px 8px", cursor: "pointer", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(record.rt_no)}
                                        style={{ padding: "4px 8px", cursor: "pointer", background: "#ef4444", color: "white", border: "none", borderRadius: "4px" }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredRenting.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: "center" }}>No renting records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Renting Record" : "Add New Renting Record"}</h2>
                        <form className="modal-form" onSubmit={handleSave}>
                            <input type="number" name="app_no" placeholder="Apartment No." value={formData.app_no} onChange={handleInputChange} required />
                            <input type="number" name="customer" placeholder="Customer (Person No.)" value={formData.customer} onChange={handleInputChange} required />
                            <input type="number" step="0.01" name="price" placeholder="Monthly Price" value={formData.price} onChange={handleInputChange} required />
                            <input type="date" name="rt_date" value={formData.rt_date} onChange={handleInputChange} required />
                            <input type="number" step="0.01" name="deposit" placeholder="Deposit" value={formData.deposit} onChange={handleInputChange} required />
                            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
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

export default Renting;
