import "../css/Apartments.css";
const apartments = [
    { app_no: 1,  app_name: "Flat 101 A",     h_no: 1, rooms: 3, toilets: 2, description: "Luxury 3-bedroom apartment in Taleex", status: "available" },
    { app_no: 2,  app_name: "Flat 102 B",     h_no: 1, rooms: 2, toilets: 1, description: "Standard 2-bedroom apartment", status: "occupied" },
    { app_no: 3,  app_name: "Suite 201",       h_no: 2, rooms: 4, toilets: 3, description: "Spacious family apartment near KPP", status: "available" },
    { app_no: 4,  app_name: "Flat 301",        h_no: 3, rooms: 2, toilets: 2, description: "Modern apartment in Waberi", status: "available"    },
    { app_no: 5,  app_name: "Studio A",        h_no: 4, rooms: 1, toilets: 1, description: "Single studio apartment with sea breeze", status: "available" },
    { app_no: 6,  app_name: "Flat 1A",         h_no: 5, rooms: 3, toilets: 2, description: "Ground floor 3-bedroom apartment", status: "occupied" },
    { app_no: 7,  app_name: "Flat 2B",         h_no: 6, rooms: 2, toilets: 1, description: "Newly renovated 2-bedroom unit", status: "available" },
    { app_no: 8,  app_name: "Penthouse 501",   h_no: 7, rooms: 5, toilets: 4, description: "Executive penthouse unit at KM4", status: "occupied" },
    { app_no: 9,  app_name: "Flat 103",        h_no: 8, rooms: 2, toilets: 2, description: "Cozy 2-bedroom unit in Shibis", status: "available" },
    { app_no: 10, app_name: "Flat 202",        h_no: 9, rooms: 3, toilets: 2, description: "Spacious apartment near Ceel Gaab port area", status: "available" },
];

function Apartments() {
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