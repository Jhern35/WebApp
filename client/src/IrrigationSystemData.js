import React, { useEffect, useState } from "react";

function moistureClass(value) {
  if (value == null) return "";
  if (value < 30) return "moisture-low";
  if (value < 60) return "moisture-mid";
  return "moisture-good";
}

function SystemData({ esp32Id }) {
  const [systemData, setSystemData] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/system/${esp32Id}/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSystemData(data);
    } catch (err) {
      console.error("Error fetching system data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [esp32Id]);

  if (!systemData) {
    return <p style={{ color: "#aaa", padding: "1rem 0" }}>Loading system data…</p>;
  }

  const entries = systemData.recentData;

  return (
    <div>
      <div className="system-data-header">
        <h2 className="system-data-name">{systemData.system}</h2>
        <span className="system-data-count">
          {entries.length} reading{entries.length !== 1 ? "s" : ""}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="no-data-msg">No sensor data received yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Soil Before</th>
                <th>Rain Chance</th>
                <th>Forecast</th>
                <th>Decision</th>
                <th>Soil After</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className={moistureClass(entry.soilMoistureBC)}>
                    {entry.soilMoistureBC != null ? `${entry.soilMoistureBC}%` : "—"}
                  </td>
                  <td>
                    {entry.PoP != null
                      ? `${entry.PoP}%${entry.PoP_time ? ` / ${entry.PoP_time}h` : ""}`
                      : "—"}
                  </td>
                  <td>
                    {entry.QPF != null
                      ? `${entry.QPF} mm${entry.QPF_time ? ` / ${entry.QPF_time}h` : ""}`
                      : "—"}
                  </td>
                  <td>
                    {entry.decision
                      ? <span className="badge badge-watered">Watered</span>
                      : <span className="badge badge-skipped">Skipped</span>}
                  </td>
                  <td className={moistureClass(entry.soilMoistureAD)}>
                    {entry.soilMoistureAD != null ? `${entry.soilMoistureAD}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SystemData;
