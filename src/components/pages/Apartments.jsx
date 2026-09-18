import { useState, useEffect } from "react";
import "../css/Apartments.css";

function Apartments() {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/appartments")
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error("API Error:", errData);
                    throw new Error(errData.error || "Network response was not ok");
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
    }, []);

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
        </div>
    );
}

export default Apartments;