// import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
// import ControlPanel from "../components/ControlPanel";
// import { fetchPersonas, addPersona } from "../utils/firebase";




const Dashboard: React.FC = () => {

  // const [data, setData] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   fetchPersonas().then(setData);
  // }, []);

  // const handleSave = async (rows: any[]) => {
  //   setLoading(true);
  //   for (const row of rows) await addPersona(row);
  //   setLoading(false);
  // };

  return (
    <div>
      <h1 className=" p-4">Personas</h1>
      <DataTable />
      {/* <ControlPanel onProcess={() => handleSave(data)} loading={loading} /> */}
    </div>
  );
};

export default Dashboard;
