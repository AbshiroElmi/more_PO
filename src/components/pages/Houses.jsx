import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout

function Houses() {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingHouseId, setEditingHouseId] = useState(null);

    const [formData, setFormData] = useState({
        house_name: "", owner: "", add_no: ""
    });

    const fetchHouses = () => {
        fetch("http://localhost:5000/houses")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setHouses(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchHouses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingHouseId(null);
        setFormData({ house_name: "", owner: "", add_no: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (house) => {
        setIsEditMode(true);
        setEditingHouseId(house.h_no);
        setFormData({ 
            house_name: house.house_name || "", 
            owner: house.owner || "",
            add_no: house.add_no || "" 
        });
        setShowModal(true);
    };

    const handleSaveHouse = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/houses/${editingHouseId}` 
                : "http://localhost:5000/houses";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'add'} house`);
            }
            setShowModal(false);
            fetchHouses(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteHouse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this house?")) return;

        try {
            const res = await fetch(`http://localhost:5000/houses/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to delete house");
            }
            fetchHouses(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading houses...</div>;
    if (error) return <div className="apartments-page">Error fetching houses: {error}</div>;

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    <span className="page-icon">🏘️</span>
                    Houses
                </h1>
                <span className="apartments-count">{houses.length} houses</span>
                <button className="btn-add" onClick={handleOpenAddModal}>+ Add House</button>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>House No.</th>
                            <th>House Name</th>
                            <th>Owner</th>
                            <th>Address No.</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {houses.map((house) => (
                            <tr key={house.h_no}>
                                <td className="col-no">{house.h_no}</td>
                                <td className="col-name">{house.house_name}</td>
                                <td>{house.owner}</td>
                                <td>{house.add_no}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => handleOpenEditModal(house)}
                                        style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteHouse(house.h_no)}
                                        style={{ padding: '4px 8px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {houses.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>No houses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit House" : "Add New House"}</h2>
                        <form className="modal-form" onSubmit={handleSaveHouse}>
                            <input 
                                type="text" 
                                name="house_name" 
                                placeholder="House Name" 
                                value={formData.house_name} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="text" 
                                name="owner" 
                                placeholder="Owner" 
                                value={formData.owner} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="number" 
                                name="add_no" 
                                placeholder="Address No." 
                                value={formData.add_no} 
                                onChange={handleInputChange} 
                                required 
                            />

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

export default Houses;