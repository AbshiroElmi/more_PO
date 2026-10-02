import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu, RowAvatar, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Accounts() {
    const formFields = useTableInfo("accounts");
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({});

    const fetchAccounts = () => {
        fetchData("accounts")
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
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (account) => {
        setIsEditMode(true);
        setEditingAccountId(account.acc_no);
        setFormData(formFromRecord(formFields, account));
        setShowModal(true);
    };

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("accounts", { method: "PUT", id: editingAccountId, body: formData });
            } else {
                await fetchData("accounts", { method: "POST", body: formData });
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
            await fetchData("accounts", { method: "DELETE", id });
            fetchAccounts(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportAccounts = () => {
        exportToCSV(accounts, "accounts");
    };

    const handleImportAccounts = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData("accounts", { method: "POST", body: row });
            }
            fetchAccounts();
            alert(`Imported ${rows.length} account(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading accounts...</div>;
    if (error) return <div className="apartments-page">Error fetching accounts: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredAccounts = !q ? accounts : accounts.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    Accounts
                </h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search accounts..." />
                <span className="apartments-count">{filteredAccounts.length} accounts</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add Account</button>
                    <ExportImportMenu onExport={handleExportAccounts} onImport={handleImportAccounts} />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            {filteredAccounts.length > 0 &&
                                Object.keys(filteredAccounts[0]).map((key) => (
                                    <th key={key}>
                                        {key.replace(/_/g, " ").toUpperCase()}
                                    </th>
                                ))
                            }
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.map((account) => (
                            <tr key={account.acc_no}>
                                <td className="col-no">{account.acc_no}</td>
                                <td className="col-name"><RowAvatar name={account.acc_name} /></td>
                                <td>{account.institution}</td>
                                <td>${Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(account)}
                                        onDelete={() => handleDeleteAccount(account.acc_no)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredAccounts.length === 0 && (
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

export default Accounts;
