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
        {apartments.length > 0 && 
            Object.keys(apartments[0]).map((key) => (
                <th key={key}>
                    {key.replace(/_/g, " ").toUpperCase()}
                </th>
            ))
        }
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