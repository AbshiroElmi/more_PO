import { useState, useEffect } from "react";
import "../css/Apartments.css";
import { SearchBar, ExportImportMenu, RowAvatar, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Apartments() {
    const formFields = useTableInfo("appartments");
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingApartmentId, setEditingApartmentId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({});

    const fetchApartments = () => {
        fetchData("appartments")
            .then(data => {
                setApartments(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchApartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingApartmentId(null);
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (apt) => {
        setIsEditMode(true);
        setEditingApartmentId(apt.app_no);
        setFormData(formFromRecord(formFields, apt));
        setShowModal(true);
    };

    const handleSaveApartment = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("appartments", { method: "PUT", id: editingApartmentId, body: formData });
            } else {
                await fetchData("appartments", { method: "POST", body: formData });
            }
            setShowModal(false);
            fetchApartments();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteApartment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this apartment?")) return;

        try {
            await fetchData("appartments", { method: "DELETE", id });
            fetchApartments();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportApartments = () => {
        exportToCSV(apartments, "apartments");
    };

    const handleImportApartments = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData("appartments", { method: "POST", body: row });
            }
            fetchApartments();
            alert(`Imported ${rows.length} apartment(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading apartments...</div>;
    if (error) return <div className="apartments-page">Error fetching apartments: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredApartments = !q ? apartments : apartments.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">

            {/* Header */}
            <div className="apartments-header">
                <h1>
                    Apartments
                </h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search apartments..." />
                <span className="apartments-count">{filteredApartments.length} units</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add Apartment</button>
                    <ExportImportMenu onExport={handleExportApartments} onImport={handleImportApartments} />
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            {apartments.length > 0 &&
                                Object.keys(apartments[0]).map((key) => (
                                    <th key={key}>
                                        {key.replace(/_/g, " ").toUpperCase()}
                                    </th>
                                ))
                            }
                            {apartments.length > 0 && <th style={{ textAlign: 'center' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApartments.map((apt, index) => (
                            <tr key={apt.app_no || index}>
                                {Object.keys(apartments[0]).map((key) => {
                                    if (key === 'app_no') return <td key={key} className="col-no">{apt[key]}</td>;
                                    if (key === 'app_name') return <td key={key} className="col-name"><RowAvatar name={apt[key]} /></td>;
                                    if (key === 'h_no') return <td key={key}><span className="h-badge">{apt[key]}</span></td>;
                                    if (key === 'rooms') return <td key={key}><span className="stat-pill">🛏 {apt[key]}</span></td>;
                                    if (key === 'toilets') return <td key={key}><span className="stat-pill">🚿 {apt[key]}</span></td>;
                                    if (key === 'description') return <td key={key} className="col-desc">{apt[key]}</td>;
                                    if (key === 'status') {
                                        return (
                                            <td key={key}>
                                                <span className={`status-badge ${apt[key]?.toLowerCase() || 'available'}`}>
                                                    {apt[key]}
                                                </span>
                                            </td>
                                        );
                                    }
                                    return <td key={key}>{apt[key]}</td>;
                                })}
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(apt)}
                                        onDelete={() => handleDeleteApartment(apt.app_no)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredApartments.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>No apartments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Apartment Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Apartment" : "Add New Apartment"}</h2>
                        <form className="modal-form" onSubmit={handleSaveApartment}>
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

export default Apartments;