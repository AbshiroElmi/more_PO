import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu, RowAvatar, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

function Address() {
    const formFields = useTableInfo("address");
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({});

    const fetchAddresses = () => {
        fetchData("address")
            .then(data => {
                setAddresses(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingAddressId(null);
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (address) => {
        setIsEditMode(true);
        setEditingAddressId(address.add_no);
        setFormData(formFromRecord(formFields, address));
        setShowModal(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData("address", { method: "PUT", id: editingAddressId, body: formData });
            } else {
                await fetchData("address", { method: "POST", body: formData });
            }
            setShowModal(false);
            fetchAddresses(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        try {
            await fetchData("address", { method: "DELETE", id });
            fetchAddresses(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExportAddresses = () => {
        exportToCSV(addresses, "address");
    };

    const handleImportAddresses = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData("address", { method: "POST", body: row });
            }
            fetchAddresses();
            alert(`Imported ${rows.length} address(es).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    if (loading) return <div className="apartments-page">Loading address data...</div>;
    if (error) return <div className="apartments-page">Error fetching address data: {error}</div>;

    const q = search.trim().toLowerCase();
    const filteredAddresses = !q ? addresses : addresses.filter((item) =>
        Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
    );

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>
                    Address
                </h1>
                <SearchBar value={search} onChange={setSearch} placeholder="Search addresses..." />
                <span className="apartments-count">{filteredAddresses.length} addresses</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ Add Address</button>
                    <ExportImportMenu onExport={handleExportAddresses} onImport={handleImportAddresses} />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="apt-table">
                    <thead>
                        <tr>
                            <th>Address No.</th>
                            <th>District</th>
                            <th>Village</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAddresses.map((address) => (
                            <tr key={address.add_no}>
                                <td className="col-no">{address.add_no}</td>
                                <td className="col-name"><RowAvatar name={address.district} /></td>
                                <td>{address.village}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <RowActions
                                        onEdit={() => handleOpenEditModal(address)}
                                        onDelete={() => handleDeleteAddress(address.add_no)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredAddresses.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>No addresses found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Address" : "Add New Address"}</h2>
                        <form className="modal-form" onSubmit={handleSaveAddress}>
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

export default Address;
