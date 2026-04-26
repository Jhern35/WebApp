import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SystemData from "./IrrigationSystemData";

function Dashboard() {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    esp32Id: "",
    owner: ""
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const userId = payload.email;


  const signOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchSystems = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/systems`);
      const data = await res.json();
      setSystems(data);
    } catch (err) {
      console.error("Error fetching systems:", err);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/systems/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          owner: userId
        })
      });

      const data =  await res.json();

      if (res.ok) {
        alert("System registered!");
        setShowForm(false);
        setFormData({ name: "", esp32Id: ""});
        fetchSystems(); 
      } else {
        alert(data.error || "Failed to register");
      }
    } catch (err) {
      console.error(err);
      alert("Error registering system");
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  return (
    <div className="dashboard-page">

      <nav className="dashboard-nav">
        <span className="dashboard-nav-title">Irrigation Monitor</span>
        <button className="signout-btn" onClick={signOut}>Sign Out</button>
      </nav>

      <div className="dashboard-body">
        <h2 className="section-title">My Systems</h2>

        {systems.length === 0 ? (
          <div className="empty-state">No irrigation systems registered yet.
              <button 
                className="system-btn"
                onClick={() => setShowForm(!showForm)}
              >
                +
              </button>

              {showForm && (
                <div className="regular-form">
                  <input
                    type="text"
                    placeholder="System Name"
                    value={formData.name}
                    onChange={(e)=> setFormData({ ...formData, name: e.target.value })}
                  />

                  <input 
                    type="text"
                    placeholder="ESP32 ID"
                    value={formData.esp32Id}
                    onChange={(e) => setFormData({ ...formData, esp32Id: e.target.value })}
                  />
                  
                  <button onClick={handleRegister}>Submit</button>
                  </div>
              )}
          </div>
        ) : (
          <div className="system-list">
            {systems.map((system) => (
              <button
                key={system.esp32Id}
                className={`system-btn ${selectedSystem === system.esp32Id ? "selected" : ""}`}
                onClick={() => setSelectedSystem(system.esp32Id)}
              >
                {system.name}
              </button>
            ))} 
            <button 
                className="system-btn"
                onClick={() => setShowForm(!showForm)}
              >
                +
              </button>

              {showForm && (
                <div className="regular-form">
                  <input
                    type="text"
                    placeholder="System Name"
                    value={formData.name}
                    onChange={(e)=> setFormData({ ...formData, name: e.target.value })}
                  />

                  <input 
                    type="text"
                    placeholder="ESP32 ID"
                    value={formData.esp32Id}
                    onChange={(e) => setFormData({ ...formData, esp32Id: e.target.value })}
                  />
                  
                  <button onClick={handleRegister}>Submit</button>
                  </div>
              )}
          </div>
        )}
        {selectedSystem && (
          <div className="system-data-card">
            <SystemData esp32Id={selectedSystem} />
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
