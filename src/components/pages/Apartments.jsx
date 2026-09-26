import { useState, useEffect } from "react";
import "../css/Apartments.css";

function Apartments() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingApartmentId, setEditingApartmentId] = useState(null);
    const [formData, setFormData] = useState({
        app_name: "", h_no: "", rooms: "", toilets: "", description: ""
    });

    const fetchApartments = () => {
        fetch("http://localhost:5000/appartments")
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
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
        setFormData({ app_name: "", h_no: "", rooms: "", toilets: "", description: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (apt) => {
        setIsEditMode(true);
        setEditingApartmentId(apt.app_no);
        setFormData({
            app_name: apt.app_name || "",
            h_no: apt.h_no || "",
            rooms: apt.rooms || "",
            toilets: apt.toilets || "",
            description: apt.description || ""
        });
        setShowModal(true);
    };

    const handleSaveApartment = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode
                ? `http://localhost:5000/appartments/${editingApartmentId}`
                : "http://localhost:5000/appartments";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? "update" : "add"} apartment`);
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
            const res = await fetch(`http://localhost:5000/appartments/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to delete apartment");
            }
            fetchApartments();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading apartments...</div>;
    if (error) return <div className="apartments-page">Error fetching apartments: {error}</div>;

    return (
        <div className="apartments-page">

            {/* Header */}
            <div className="apartments-header">
                <h1>
                    <span className="page-icon">🏠</span>
                    Apartments
                </h1>
                <span className="apartments-count">{apartments.length} units</span>
                <button className="btn-add" onClick={handleOpenAddModal}>+ Add Apartment</button>
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
                        {apartments.map((apt, index) => (
                            <tr key={apt.app_no || index}>
                                {Object.keys(apartments[0]).map((key) => {
                                    if (key === 'app_no') return <td key={key} className="col-no">{apt[key]}</td>;
                                    if (key === 'app_name') return <td key={key} className="col-name">{apt[key]}</td>;
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
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleOpenEditModal(apt)}
                                        style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteApartment(apt.app_no)}
                                        style={{ padding: '4px 8px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {apartments.length === 0 && (
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
                            <input type="text" name="app_name" placeholder="Apartment Name" value={formData.app_name} onChange={handleInputChange} required />
                            <input type="number" name="h_no" placeholder="House No." value={formData.h_no} onChange={handleInputChange} required />
                            <input type="number" name="rooms" placeholder="Rooms" value={formData.rooms} onChange={handleInputChange} required />
                            <input type="number" name="toilets" placeholder="Toilets" value={formData.toilets} onChange={handleInputChange} required />
                            <textarea name="description" placeholder="Description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>

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