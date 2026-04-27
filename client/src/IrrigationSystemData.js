import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useCallback } from 'react';

function displayValue(value, units) {
  if (value < 0) {
    return <span style={{ color: "orange" }}>Unavailable</span>;
  }
  return `${value}${units}`;
}

function displayDecision(value) {
  if (value === "Manual_Override") return "User Override";
  if (value === "1" || value === 1 ) return "Irrigated";  
  if (value === "0" || value === 0)  return "No Irrigation";
  return "Unknown";
}

function SystemData({ esp32Id }) {
  const [data, setData] = useState([]);
  const [systemName, setSystemName] = useState('');
  const navigate = useNavigate();
  const goToControl = (esp32Id) => {
    navigate(`/system/${esp32Id}/control`);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/system/${esp32Id}/data`);
      const json = await res.json();
      setSystemName(json.system);
      setData(json.recentData);
    } catch (err) {
      console.error("Error fetching system data:", err);
    }
  }, [esp32Id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [esp32Id, fetchData]);

  return (
    <div>
      <h2>System: {systemName}</h2>
      {data.length === 0 ? (
        <>
        <p>No data available yet</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <button
                  className = "system-btn"
                  onClick = {() => goToControl(esp32Id)}
                >
                  Control Panel</button>
            </div>
          </>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
               <th>Timestamp</th>
                <th>Soil Moisture Before</th>
                <th>% Chance of Rain</th>
                <th>Time Window</th>
                <th>Expected Rainfall (mm)</th>
                <th>Time Window for Expected Rainfall</th>
                <th>Decision</th>
                <th>Soil Moisture After</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td>{entry.soilMoistureBC}%</td>
                  <td>{displayValue(entry.PoP, "%")}</td>
                  <td>{displayValue(entry.PoP_time, " hr(s)")} </td>
                  <td>{displayValue(entry.QPF, " (mm)")}</td>
                  <td>{displayValue(entry.QPF_time, " hr(s)")}</td>
                  <td>{displayDecision(entry.decision, "")}</td>
                  <td>{entry.soilMoistureAD}%</td>
                </tr>
              ))}
            </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <button
                  className = "system-btn"
                  onClick = {() => goToControl(esp32Id)}
                >
                  Control Panel</button>
              </div>
        </div>
      )}
    </div>
  );
}

export default SystemData;
