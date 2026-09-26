import { useState, useRef } from "react";

export const Common = ({ type, name, value, setVal, pl }) => {
  return (
    <div>
      <input
        type={type}
        name={name}
        placeholder={pl}
        value={value}
        onChange={(e) => setVal(e.target.value)}
      />
    </div>
  );
};

export const Btn = ({ text, setMethod }) => {
  return (
    <div>
      <button onClick={setMethod}>{text}</button>
    </div>
  );
};

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="search-box">
      <svg className="search-box-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-box-clear"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ─── Export / Import menu ───────────────────────────────────── */
export const ExportImportMenu = ({ onExport, onImport }) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    setOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImport) onImport(file);
    e.target.value = "";
  };

  return (
    <div className="menu-wrap">
      <button
        type="button"
        className="btn-menu"
        aria-label="More options"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <circle cx="10" cy="4" r="1.7" />
          <circle cx="10" cy="10" r="1.7" />
          <circle cx="10" cy="16" r="1.7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="menu-dropdown">
            <button
              type="button"
              className="menu-item"
              onClick={() => { setOpen(false); onExport(); }}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 15.5v.5a1 1 0 001 1h10a1 1 0 001-1v-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Export CSV
            </button>
            {onImport && (
              <button type="button" className="menu-item" onClick={handleImportClick}>
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13V3m0 0l-3.5 3.5M10 3l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 15.5v.5a1 1 0 001 1h10a1 1 0 001-1v-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Import CSV
              </button>
            )}
          </div>
        </>
      )}

      {onImport && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};

export const Table = ({ data }) => {
  if (!data || data.length === 0) return null;
const h = Object.keys(data)
  const head = Object.keys(data[0]);
  console.log("-------  -----",  h);

  return (
    <div>
      <table border="1">
        <thead>
          <tr>
            {head.map((head) => (
              <th key={head} style={{ textTransform: 'capitalize' }}>{head}</th>
            ))}
   
          </tr>
        </thead>
        <tbody>
          {data.map((user, i) => (
            <tr key={i}>
              <td>{user.name}</td>
              <td>{user.tell}</td>
              <td>{user.address}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Common;














// import { useState } from "react";
// import Common, { Btn, Table } from "./components/Common.jsx";

// function App() {
//   const [name, setName] = useState("");
//   const [tell, setTell] = useState("");
//   const [email, setEmail] = useState("");
//   const [address, setAddress] = useState("");
//   const [result, setResult] = useState([]);
//   const newPerson = { name, tell, address, email };
//   let save = () => {
//     if (!name && !tell && !address && !email) return;
//     setResult([...result, newPerson]);

//     // setName('') // setTell('') // setAddress('')  // setEmail(''
//   };
//   return (
//     <>
//       <div>
//         <Common
//           type="text"
//           value={name}
//           name="text1"
//           setVal={setName}
//           pl="Enter your name"
//         />
//         <br />
//         <Common
//           type="number"
//           value={tell}
//           name="text2"
//           setVal={setTell}
//           pl="Enter your Number"
//         />
//         <br />
//         <Common
//           type="number"
//           value={address}
//           name="text2"
//           setVal={setAddress}
//           pl="Enter your Address"
//         />
//         <br />
//         <Common
//           type="email"
//           value={email}
//           name="text3"
//           setVal={setEmail}
//           pl="Enter your Email"
//         />
//         <br />
//         <Btn text="save" setMethod={save} />
//         <br />

//         <Table data={result} />
//       </div>
//     </>
//   );
// }

// export default App;
