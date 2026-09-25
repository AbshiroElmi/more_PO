import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout

function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);

    const [formData, setFormData] = useState({
        acc_name: "", institution: "", balance: ""
    });

    const fetchAccounts = () => {
        fetch("http://localhost:5000/accounts")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAccounts(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingAccountId(null);
        setFormData({ acc_name: "", institution: "", balance: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (account) => {
        setIsEditMode(true);
        setEditingAccountId(account.acc_no);
        setFormData({ 
            acc_name: account.acc_name || "", 
            institution: account.institution || "",
            balance: account.balance || "" 
        });
        setShowModal(true);
    };

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/accounts/${editingAccountId}` 
                : "http://localhost:5000/accounts";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'add'} account`);
            }
            setShowModal(false);
            fetchAccounts(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteAccount = async (id) => {
        if (!window.confirm("Are you sure you want to delete this account?")) return;

        try {
            const res = await fetch(`http://localhost:5000/accounts/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to delete account");
            }
            fetchAccounts(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading accounts...</div>;
    if (error) return <div className="apartments-page">Error fetching accounts: {error}</div>;

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    <span className="page-icon">🏦</span>
                    Accounts
                </h1>
                <span className="apartments-count">{accounts.length} accounts</span>
                <button className="btn-add" onClick={handleOpenAddModal}>+ Add Account</button>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>Account No.</th>
                            <th>Account Name</th>
                            <th>Institution</th>
                            <th>Balance</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.acc_no}>
                                <td className="col-no">{account.acc_no}</td>
                                <td className="col-name">{account.acc_name}</td>
                                <td>{account.institution}</td>
                                <td>${Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => handleOpenEditModal(account)}
                                        style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteAccount(account.acc_no)}
                                        style={{ padding: '4px 8px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {accounts.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>No accounts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Account" : "Add New Account"}</h2>
                        <form className="modal-form" onSubmit={handleSaveAccount}>
                            <input 
                                type="text" 
                                name="acc_name" 
                                placeholder="Account Name" 
                                value={formData.acc_name} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="text" 
                                name="institution" 
                                placeholder="Institution (e.g., Bank)" 
                                value={formData.institution} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="number"
                                step="0.01" 
                                name="balance" 
                                placeholder="Balance" 
                                value={formData.balance} 
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

export default Accounts;
