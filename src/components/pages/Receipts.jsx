import { useState, useEffect } from "react";
import "../css/Apartments.css";
import { SearchBar, ExportImportMenu, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Receipts() {
    const formFields = useTableInfo("receipts");
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({});

    const fetchReceipts = () => {
        fetchData("receipts")
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
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditMode(true);
        setEditingId(record.r_no);
        setFormData(formFromRecord(formFields, { ...record, rt_date: record.formattedDate || record.rt_date }));
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("receipts", { method: "PUT", id: editingId, body: formData });
            } else {
                await fetchData("receipts", { method: "POST", body: formData });
            }
            setShowModal(false);
            fetchReceipts();
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this receipt?")) return;
        try {
            await fetchData("receipts", { method: "DELETE", id });
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
                await fetchData("receipts", { method: "POST", body: row });
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
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(record)}
                                        onDelete={() => handleDelete(record.r_no)}
                                    />
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

export default Receipts;
