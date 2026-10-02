import { useState, useEffect } from "react";
import "../css/Apartments.css";
import { SearchBar, ExportImportMenu, RowAvatar, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

const TABLE = "people";

function People() {
    const formFields = useTableInfo(TABLE);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPersonId, setEditingPersonId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({});

    const load = () => {
        fetchData(TABLE)
            .then((data) => {
                setPeople(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => { load(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingPersonId(null);
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (person) => {
        setIsEditMode(true);
        setEditingPersonId(person.p_no);
        setFormData(formFromRecord(formFields, person));
        setShowModal(true);
    };

    const handleSavePerson = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData(TABLE, { method: "PUT", id: editingPersonId, body: formData });
            } else {
                await fetchData(TABLE, { method: "POST", body: formData });
            }
            setShowModal(false);
            load();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeletePerson = async (id) => {
        if (!window.confirm("Are you sure you want to delete this person?")) return;
        try {
            await fetchData(TABLE, { method: "DELETE", id });
            load();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportPeople = () => {
        exportToCSV(people, "people");
    };

    const handleImportPeople = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData(TABLE, { method: "POST", body: row });
            }
            load();
            alert(`Imported ${rows.length} person(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading people...</div>;
    if (error) return <div className="apartments-page">Error fetching people: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredPeople = !q ? people : people.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    People
                </h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search people..." />
                <span className="apartments-count">{filteredPeople.length} people</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add Person</button>
                    <ExportImportMenu onExport={handleExportPeople} onImport={handleImportPeople} />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>Person No.</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPeople.map((person) => (
                            <tr key={person.p_no}>
                                <td className="col-no">{person.p_no}</td>
                                <td className="col-name">
                                    <RowAvatar name={person.name} />
                                </td>
                                <td>{person.tell}</td>
                                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(person)}
                                        onDelete={() => handleDeletePerson(person.p_no)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredPeople.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>No people found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Person" : "Add New Person"}</h2>
                        <form className="modal-form" onSubmit={handleSavePerson}>
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

export default People;
