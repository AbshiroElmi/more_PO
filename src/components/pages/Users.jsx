import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        user_name: "", pass: "", p_no: ""
    });

    const fetchUsers = () => {
        fetch("http://localhost:5000/users")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
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
        setFormData({ user_name: "", pass: "", p_no: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (user) => {
        setIsEditMode(true);
        setEditingUserId(user.user_id);
        // Pre-fill form data (we assume pass might be empty, let user re-type or just load empty if not sent from server, but our GET doesn't fetch pass, so it will be empty initially for edit)
        setFormData({ 
            user_name: user.user_name || "", 
            pass: "", // Not fetched from server for security, must be re-entered
            p_no: user.p_no || "" 
        });
        setShowModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/users/${editingUserId}` 
                : "http://localhost:5000/users";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'add'} user`);
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
            const res = await fetch(`http://localhost:5000/users/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to delete user");
            }
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
                await fetch("http://localhost:5000/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row)
                });
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
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Phone No</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.user_id}>
                                <td className="col-no">{user.user_id}</td>
                                <td className="col-name">{user.user_name}</td>
                                <td>{user.p_no}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => handleOpenEditModal(user)}
                                        style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteUser(user.user_id)}
                                        style={{ padding: '4px 8px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Delete
                                    </button>
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
                            <input 
                                type="text" 
                                name="user_name" 
                                placeholder="Username" 
                                value={formData.user_name} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="password" 
                                name="pass" 
                                placeholder="Password" 
                                value={formData.pass} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="number" 
                                name="p_no" 
                                placeholder="Phone No / PIN" 
                                value={formData.p_no} 
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

export default Users;
