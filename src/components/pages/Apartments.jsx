import { useState, useEffect } from "react";
import "../css/Apartments.css";

function Apartments() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
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

    const handleAddApartment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/appartments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to add apartment");
            }
            setShowModal(false);
            setFormData({ app_name: "", h_no: "", rooms: "", toilets: "", description: "" });
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
                <button className="btn-add" onClick={() => setShowModal(true)}>+ Add Apartment</button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>App Name</th>
                            <th>House No.</th>
                            <th>Rooms</th>
                            <th>Toilets</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apartments.map((apt) => (
                            <tr key={apt.app_no}>
                                <td className="col-no">{apt.app_no}</td>
                                <td className="col-name">{apt.app_name}</td>
                                <td>
                                    <span className="h-badge">{apt.h_no}</span>
                                </td>
                                <td>
                                    <span className="stat-pill">🛏 {apt.rooms}</span>
                                </td>
                                <td>
                                    <span className="stat-pill">🚿 {apt.toilets}</span>
                                </td>
                                <td className="col-desc">{apt.description}</td>
                                <td>
                                    <span className={`status-badge ${apt.status === "occupied" ? "occupied" : "available"}`}>
                                        {apt.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Apartment Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Apartment</h2>
                        <form className="modal-form" onSubmit={handleAddApartment}>
                            <input type="text" name="app_name" placeholder="Apartment Name" value={formData.app_name} onChange={handleInputChange} required />
                            <input type="number" name="h_no" placeholder="House No." value={formData.h_no} onChange={handleInputChange} required />
                            <input type="number" name="rooms" placeholder="Rooms" value={formData.rooms} onChange={handleInputChange} required />
                            <input type="number" name="toilets" placeholder="Toilets" value={formData.toilets} onChange={handleInputChange} required />
                            <textarea name="description" placeholder="Description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Apartments;