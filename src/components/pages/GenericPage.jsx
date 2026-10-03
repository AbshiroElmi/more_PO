import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import "../css/Apartments.css";
import { SearchBar, ExportImportMenu, RowActions } from "../Common.jsx";
import { exportToCSV, parseCSV } from "../csvUtils.js";
import { Register, useTableInfo, emptyFormFromFields, formFromRecord } from "../Register.jsx";
import { fetchData } from "../api.js";

/** Centralized table configurations */
export const TABLE_CONFIGS = {
    apartments: {
        table: "appartments",
        pk: "app_no",
        title: "Apartments",
        addLabel: "Add Apartment",
        countLabel: "units",
        placeholder: "Search apartments...",
    },
    houses: {
        table: "houses",
        pk: "h_no",
        title: "Houses",
        addLabel: "Add House",
        countLabel: "houses",
        placeholder: "Search houses...",
    },
    accounts: {
        table: "accounts",
        pk: "acc_no",
        title: "Accounts",
        addLabel: "Add Account",
        countLabel: "accounts",
        placeholder: "Search accounts...",
        cellRenderer: (key, value) => {
            if (key === "balance")
                return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            return null;
        },
    },
    address: {
        table: "address",
        pk: "add_no",
        title: "Address",
        addLabel: "Add Address",
        countLabel: "addresses",
        placeholder: "Search addresses...",
    },
    billing: {
        table: "billing",
        pk: "bl_no",
        title: "Billing",
        addLabel: "Add Billing",
        countLabel: "records",
        placeholder: "Search billing records...",
        dateFields: ["bt_date"],
        cellRenderer: (key, value) => {
            if (key === "amount")
                return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            return null;
        },
    },
    people: {
        table: "people",
        pk: "p_no",
        title: "People",
        addLabel: "Add Person",
        countLabel: "people",
        placeholder: "Search people...",
    },
    receipts: {
        table: "receipts",
        pk: "r_no",
        title: "Receipts",
        addLabel: "Add Receipt",
        countLabel: "receipts",
        placeholder: "Search receipts...",
        dateFields: ["rt_date"],
    },
    renting: {
        table: "renting",
        pk: "rt_no",
        title: "Renting",
        addLabel: "Add Renting",
        countLabel: "records",
        placeholder: "Search renting records...",
        dateFields: ["rt_date"],
        cellRenderer: (key, value) => {
            if (key === "price" || key === "deposit")
                return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            return null;
        },
    },
    users: {
        table: "users",
        pk: "user_id",
        title: "Users",
        addLabel: "Add User",
        countLabel: "users",
        placeholder: "Search users...",
    },
};

const DEFAULT_PKS = {
    accounts: "acc_no",
    address: "add_no",
    appartments: "app_no",
    apartments: "app_no",
    billing: "bl_no",
    houses: "h_no",
    people: "p_no",
    receipts: "r_no",
    renting: "rt_no",
    users: "user_id",
};

function formatIsoDate(val) {
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        const d = new Date(val);
        return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : val;
    }
    return val;
}

function GenericPage({ config: propConfig }) {
    const { pageName } = useParams();

    // Resolve config either from direct prop or URL param
    const resolvedConfig = propConfig || (pageName ? TABLE_CONFIGS[pageName.toLowerCase()] : null);

    const config = resolvedConfig || (pageName ? {
        table: pageName.toLowerCase(),
        pk: DEFAULT_PKS[pageName.toLowerCase()] || "id",
        title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
        addLabel: `Add ${pageName}`,
        countLabel: "records",
        placeholder: `Search ${pageName}...`,
    } : null);

    if (!config) {
        return <Navigate to="/dashboard" replace />;
    }

    const {
        table,
        pk,
        title,
        addLabel = `Add ${title}`,
        countLabel = "records",
        placeholder = `Search ${title.toLowerCase()}...`,
        dateFields = [],
        hiddenFields = [],
        cellRenderer,
    } = config;

    const formFields = useTableInfo(table);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({});

    const syntheticKeys = (dateFields || []).map((f) => `__fmt_${f}`);
    const allHiddenFields = ["formattedDate", ...syntheticKeys, ...(hiddenFields || [])];

    useEffect(() => {
        let isMounted = true;
        setSearch("");
        setLoading(true);
        setError(null);

        fetchData(table)
            .then((data) => {
                if (!isMounted) return;
                const formatted = (Array.isArray(data) ? data : []).map((item) => {
                    const extra = {};
                    (dateFields || []).forEach((field) => {
                        const d = new Date(item[field]);
                        extra[`__fmt_${field}`] = !isNaN(d.getTime())
                            ? d.toISOString().split("T")[0]
                            : "";
                    });
                    return { ...item, ...extra };
                });
                setRecords(formatted);
                setLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message);
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [table]);

    const refreshRecords = () => {
        fetchData(table)
            .then((data) => {
                const formatted = (Array.isArray(data) ? data : []).map((item) => {
                    const extra = {};
                    (dateFields || []).forEach((field) => {
                        const d = new Date(item[field]);
                        extra[`__fmt_${field}`] = !isNaN(d.getTime())
                            ? d.toISOString().split("T")[0]
                            : "";
                    });
                    return { ...item, ...extra };
                });
                setRecords(formatted);
                setError(null);
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData(emptyFormFromFields(formFields));
        setShowModal(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEditMode(true);
        setEditingId(record[pk]);
        const editRecord = { ...record };
        dateFields.forEach((field) => {
            editRecord[field] = record[`__fmt_${field}`] || record[field];
        });
        setFormData(formFromRecord(formFields, editRecord));
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await fetchData(table, { method: "PUT", id: editingId, body: formData });
            } else {
                await fetchData(table, { method: "POST", body: formData });
            }
            setShowModal(false);
            refreshRecords();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete this ${title.toLowerCase()} record?`)) return;
        try {
            await fetchData(table, { method: "DELETE", id });
            refreshRecords();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleExport = () => {
        exportToCSV(records, table, allHiddenFields);
    };

    const handleImport = async (file) => {
        const rows = parseCSV(await file.text());
        if (rows.length === 0) { alert("No rows found in CSV."); return; }
        try {
            for (const row of rows) {
                await fetchData(table, { method: "POST", body: row });
            }
            refreshRecords();
            alert(`Imported ${rows.length} record(s).`);
        } catch (err) {
            alert("Import failed: " + err.message);
        }
    };

    const q = search.trim().toLowerCase();
    const filtered = !q
        ? records
        : records.filter((item) =>
            Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(q))
        );

    const visibleKeys = filtered.length > 0
        ? Object.keys(filtered[0]).filter((k) => !allHiddenFields.includes(k))
        : [];

    const renderCell = (key, record) => {
        const value = record[key];
        if (cellRenderer) {
            const custom = cellRenderer(key, value, record);
            if (custom !== null && custom !== undefined) return custom;
        }
        if (dateFields.includes(key)) {
            return record[`__fmt_${key}`] ?? formatIsoDate(value);
        }
        return formatIsoDate(value);
    };

    return (
        <div className="apartments-page">
            <div className="apartments-header">
                <h1>{title}</h1>
                <SearchBar value={search} onChange={setSearch} placeholder={placeholder} />
                <span className="apartments-count">{loading ? "..." : `${filtered.length} ${countLabel}`}</span>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleOpenAddModal}>+ {addLabel}</button>
                    <ExportImportMenu onExport={handleExport} onImport={handleImport} />
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                        Loading {title.toLowerCase()}...
                    </div>
                ) : error ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#ef4444" }}>
                        Error: {error}
                    </div>
                ) : (
                    <table className="apt-table">
                        <thead>
                            <tr>
                                {visibleKeys.map((key) => (
                                    <th key={key}>{key.replace(/_/g, " ").toUpperCase()}</th>
                                ))}
                                {visibleKeys.length > 0 && (
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((record, index) => {
                                const rowId = record[pk] ?? index;
                                return (
                                    <tr key={rowId}>
                                        {visibleKeys.map((key) => (
                                            <td
                                                key={key}
                                                className={key === pk ? "col-no" : undefined}
                                            >
                                                {renderCell(key, record)}
                                            </td>
                                        ))}
                                        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                            <RowActions
                                                onEdit={() => handleOpenEditModal(record)}
                                                onDelete={() => handleDelete(record[pk])}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={visibleKeys.length + 1 || 1}
                                        style={{ textAlign: "center" }}
                                    >
                                        No {title.toLowerCase()} records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditMode ? `Edit ${title}` : `Add New ${title}`}</h2>
                        <form className="modal-form" onSubmit={handleSave}>
                            <Register
                                formFields={formFields}
                                formData={formData}
                                onChange={handleInputChange}
                            />
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {isEditMode ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GenericPage;
