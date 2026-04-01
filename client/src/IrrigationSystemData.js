import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function displayValue(value) {
  if (value < 0) {
    return <span style={{ color: "orange" }}>Unavailable</span>;
  }
  return value;
}

function SystemData({ esp32Id }) {
  const [data, setData] = useState([]);
  const [systemName, setSystemName] = useState('');
  const navigate = useNavigate();
  const goToControl = (esp32Id) => {
    navigate(`/system/${esp32Id}/control`);
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/system/${esp32Id}/data`);
      const json = await res.json();
      setSystemName(json.system);
      setData(json.recentData);
    } catch (err) {
      console.error("Error fetching system data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [esp32Id]);

  return (
    <div>
      <h2>System: {systemName}</h2>
      {data.length === 0 ? (
        <>
        <p>No data available yet</p>
        <button
              className = "ctrl-btn"
              onClick = {() => goToControl(esp32Id)}
            >
              Control Panel</button>
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
                <th>Expected Rainfall</th>
                <th>Time Window for Expected Rainfall</th>
                <th>Decision</th>
                <th>Soil Moisture After</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td>{entry.soilMoistureBC}</td>
                  <td>{displayValue(entry.PoP)}</td>
                  <td>{displayValue(entry.PoP_time)}</td>
                  <td>{displayValue(entry.QPF)}</td>
                  <td>{displayValue(entry.QPF_time)}</td>
                  <td>{entry.decision ? "Irrigated" : "No Irrigatioin"}</td>
                  <td>{entry.soilMoistureAD}</td>
                </tr>
              ))}
              <td><button
                  className = "ctrl-btn"
                  onClick = {() => goToControl(esp32Id)}
                >
                  Control Panel</button>
                </td>
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
}

export default SystemData;
