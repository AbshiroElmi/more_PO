import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu, RowAvatar, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Users() {
    const formFields = useTableInfo("users");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({});

    const fetchUsers = () => {
        fetchData("users")
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingUserId(null);
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (user) => {
        setIsEditMode(true);
        setEditingUserId(user.user_id);
        setFormData({ ...formFromRecord(formFields, user), pass: "" });
        setShowModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("users", { method: "PUT", id: editingUserId, body: formData });
            } else {
                await fetchData("users", { method: "POST", body: formData });
            }
            setShowModal(false);
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await fetchData("users", { method: "DELETE", id });
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportUsers = () => {
        exportToCSV(users, "users");
    };

    const handleImportUsers = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData("users", { method: "POST", body: row });
            }
            fetchUsers();
            alert(`Imported ${rows.length} user(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading users...</div>;
    if (error) return <div className="apartments-page">Error fetching users: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredUsers = !q ? users : users.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    Users
                </h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
                <span className="apartments-count">{filteredUsers.length} users</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add User</button>
                    <ExportImportMenu onExport={handleExportUsers} onImport={handleImportUsers} />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            {filteredUsers.length > 0 &&
                                Object.keys(filteredUsers[0]).map((key) => (
                                    <th key={key}>
                                        {key.replace(/_/g, " ").toUpperCase()}
                                    </th>
                                ))
                            }
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.user_id}>
                                <td className="col-no">{user.user_id}</td>
                                <td className="col-name"><RowAvatar name={user.user_name} /></td>
                                <td>{user.p_no}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(user)}
                                        onDelete={() => handleDeleteUser(user.user_id)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit User" : "Add New User"}</h2>
                        <form className="modal-form" onSubmit={handleSaveUser}>
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

export default Users;
