import { useState, useEffect } from "react";

/** Fetch tableinfo rows for one tablename and pass them to setData */
export function getData(url, tablename, setData) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tablename }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load tableinfo");
      return res.json();
    })
    .then((data) => setData(Array.isArray(data) ? data : []))
    .catch((err) => {
      console.error(err);
      setData([]);
    });
}

/** Load form fields from tableinfo for a given tablename */
export function useTableInfo(tablename) {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (!tablename) return;
    getData("http://localhost:5000/tables", tablename, setFields);
  }, [tablename]);

  return fields;
}

export function emptyFormFromFields(fields) {
  return Object.fromEntries((fields || []).map((f) => [f.magac, ""]));
}

export function formFromRecord(fields, record) {
  const data = {};
  (fields || []).forEach((f) => {
    let value = record?.[f.magac] ?? "";
    if (f.type === "date" && value) {
      const d = new Date(value);
      value = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : value;
    }
    data[f.magac] = value;
  });
  return data;
}

/** Dynamic form inputs built from tableinfo formFields */
export function Register({ formFields, formData, onChange }) {
  if (!formFields?.length) return null;

  return (
    <>
      {formFields.map((field) => {
        const name = field.magac;
        const value = formData[name] ?? "";
        const placeholder = field.placeholder || field.label || "";

        if (name === "description" || field.type === "textarea") {
          return (
            <textarea
              key={field.key}
              name={name}
              placeholder={placeholder}
              rows={3}
              value={value}
              onChange={onChange}
            />
          );
        }

        // FK selects stay as number inputs (same as existing pages)
        let inputType = field.type || "text";
        if (field.type === "select") inputType = "number";
        if (name === "pass" || field.type === "password") inputType = "password";

        return (
          <input
            key={field.key}
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            step={inputType === "number" ? "any" : undefined}
            required={name !== "description"}
          />
        );
      })}
    </>
  );
}

/** Loads tableinfo for tablename, then renders Register */
export function Loads({ tablename, formData, onChange }) {
  const formFields = useTableInfo(tablename);

  if (!formFields.length) return <p>...nothing is loading</p>;

  return <Register formFields={formFields} formData={formData} onChange={onChange} />;
}

export default Register;
