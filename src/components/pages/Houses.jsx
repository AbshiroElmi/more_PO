import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu, RowAvatar, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Houses() {
    const formFields = useTableInfo("houses");
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingHouseId, setEditingHouseId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({});

    const fetchHouses = () => {
        fetchData("houses")
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
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (house) => {
        setIsEditMode(true);
        setEditingHouseId(house.h_no);
        setFormData(formFromRecord(formFields, house));
        setShowModal(true);
    };

    const handleSaveHouse = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("houses", { method: "PUT", id: editingHouseId, body: formData });
            } else {
                await fetchData("houses", { method: "POST", body: formData });
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
            await fetchData("houses", { method: "DELETE", id });
            fetchHouses(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportHouses = () => {
        exportToCSV(houses, "houses");
    };

    const handleImportHouses = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData("houses", { method: "POST", body: row });
            }
            fetchHouses();
            alert(`Imported ${rows.length} house(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading houses...</div>;
    if (error) return <div className="apartments-page">Error fetching houses: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredHouses = !q ? houses : houses.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    Houses
                </h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search houses..." />
                <span className="apartments-count">{filteredHouses.length} houses</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add House</button>
                    <ExportImportMenu onExport={handleExportHouses} onImport={handleImportHouses} />
                </div>
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
                        {filteredHouses.map((house) => (
                            <tr key={house.h_no}>
                                <td className="col-no">{house.h_no}</td>
                                <td className="col-name"><RowAvatar name={house.house_name} /></td>
                                <td>{house.owner}</td>
                                <td>{house.add_no}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(house)}
                                        onDelete={() => handleDeleteHouse(house.h_no)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredHouses.length === 0 && (
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

export default Houses;