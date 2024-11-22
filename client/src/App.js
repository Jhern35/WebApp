import React, { useState, useEffect } from "react";
import "./App.css";

const BaseURL = "http://localhost:8000";

function App() {
  const [ValvePressure, setValvePressure] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource(BaseURL + "/valves_push");

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      setValvePressure(data);
    };

    return () => {
      eventSource.close(); 
    };
  }, []);

  const getPressureClass = (pressure) => {
    if (pressure > 500) return "danger";
    if (pressure > 250) return "warning";
    return "good";
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Valve</th>
            <th>Pressure</th>
          </tr>
        </thead>
        <tbody>
          {ValvePressure.map((valve) => (
            <tr key={valve.id}>
              <td>{valve.name}</td>
              <td className={getPressureClass(valve.pressure)}>
                {valve.pressure}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


