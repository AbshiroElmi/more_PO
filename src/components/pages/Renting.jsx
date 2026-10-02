import { useState, useEffect } from "react";
import "../css/Apartments.css";
import { SearchBar, ExportImportMenu, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Renting() {
    const formFields = useTableInfo("renting");
    const [rentingRecords, setRentingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({});

    const fetchRenting = () => {
        fetchData("renting")
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
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditMode(true);
        setEditingId(record.rt_no);
        setFormData(formFromRecord(formFields, { ...record, rt_date: record.formattedDate || record.rt_date }));
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("renting", { method: "PUT", id: editingId, body: formData });
            } else {
                await fetchData("renting", { method: "POST", body: formData });
            }
            setShowModal(false);
            fetchRenting();
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this renting record?")) return;
        try {
            await fetchData("renting", { method: "DELETE", id });
            fetchRenting();
        } catch (err) { alert(err.message); }
    };

    const handleExportRenting = () => {
        exportToCSV(rentingRecords, "renting", ["formattedDate"]);
    };

    const handleImportRenting = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData("renting", { method: "POST", body: row });
            }
            fetchRenting();
            alert(`Imported ${rows.length} renting record(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
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
                <h1> Renting</h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search renting records..." />
                <span className="apartments-count">{filteredRenting.length} records</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add Renting</button>
                    <ExportImportMenu onExport={handleExportRenting} onImport={handleImportRenting} />
                </div>
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
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(record)}
                                        onDelete={() => handleDelete(record.rt_no)}
                                    />
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
                            <Register formFields={formFields} formData={formData} onChange={handleInputChange} />
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
