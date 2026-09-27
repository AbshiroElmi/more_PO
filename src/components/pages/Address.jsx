import { useState, useEffect } from "react";
import "../css/Apartments.css"; // Reuse the same CSS for the table and modal layout
import { SearchBar, ExportImportMenu } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";

function Address() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        district: "", village: ""
    });

    const fetchAddresses = () => {
        fetch("http://localhost:5000/address")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
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
        setFormData({ district: "", village: "" });
        setShowModal(true);
    };

    const handleOpenEditModal = (address) => {
        setIsEditMode(true);
        setEditingAddressId(address.add_no);
        setFormData({ 
            district: address.district || "", 
            village: address.village || ""
        });
        setShowModal(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            const url = isEditMode 
                ? `http://localhost:5000/address/${editingAddressId}` 
                : "http://localhost:5000/address";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'add'} address`);
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
            const res = await fetch(`http://localhost:5000/address/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to delete address");
            }
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
                await fetch("http://localhost:5000/address", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(row)
                });
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
                                <td className="col-name">{address.district}</td>
                                <td>{address.village}</td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => handleOpenEditModal(address)}
                                        style={{ marginRight: '8px', padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteAddress(address.add_no)}
                                        style={{ padding: '4px 8px', cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Delete
                                    </button>
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
                            <input 
                                type="text" 
                                name="district" 
                                placeholder="District" 
                                value={formData.district} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <input 
                                type="text" 
                                name="village" 
                                placeholder="Village" 
                                value={formData.village} 
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

export default Address;
