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
