import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SystemData from "./IrrigationSystemData";
import "./Dashboard.css";

function Dashboard() {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fetchAbortRef = useRef(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const userId = payload.email || "testuser@example.com";

  const signOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    fetch(`http://localhost:5000/api/users/${userId}/systems`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setSystems(Array.isArray(data) ? data : []))
      .catch((err) => { if (err.name !== "AbortError") console.error("Error fetching systems:", err); });

    return () => controller.abort();
  }, []);

  const addTestSystem = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const esp32Id = "TEST-" + Date.now();
      const maxNum = systems.reduce((max, s) => {
        const n = parseInt(s.name.replace("Test System ", ""), 10);
        return isNaN(n) ? max : Math.max(max, n);
      }, 0);
      const name = "Test System " + (maxNum + 1);

      const res = await fetch("http://localhost:5000/api/systems/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, esp32Id, ipAddress: "192.168.1.50" }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Add failed:", res.status, err);
        return;
      }

      const body = await res.json();
      setSystems((prev) => [...prev, body.system]);
    } catch (err) {
      console.error("Add error:", err);
    } finally {
      setAdding(false);
    }
  };

  const deleteSystem = async (esp32Id) => {
    fetchAbortRef.current?.abort();
    try {
      const res = await fetch(`http://localhost:5000/api/systems/${esp32Id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Delete failed:", res.status, err);
        return;
      }

      setSystems((prev) => prev.filter((s) => s.esp32Id !== esp32Id));
      if (selectedSystem === esp32Id) setSelectedSystem(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearAllSystems = async () => {
    if (clearing) return;
    setClearing(true);
    fetchAbortRef.current?.abort();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/systems`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const body = await res.json();
        console.error("Clear all failed:", res.status, body);
        return;
      }

      setSystems([]);
      setSelectedSystem(null);
    } catch (err) {
      console.error("Clear all error:", err);
    } finally {
      setClearing(false);
    }
  };

  const handleSystemClick = (esp32Id) => {
    setSelectedSystem((prev) => (prev === esp32Id ? null : esp32Id));
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <span className="dashboard-nav-title">Irrigation Monitor</span>
        <button className="signout-btn" onClick={signOut}>
          Sign Out
        </button>
      </nav>

      <div className="dashboard-body">
        <h2 className="section-title">My Systems</h2>

        <div className="dashboard-actions">
          <button className="add-system-btn" onClick={addTestSystem} disabled={adding}>
            {adding ? "Adding..." : "Add Test Irrigation System"}
          </button>

          {systems.length > 0 && (
            <button className="clear-all-btn" onClick={clearAllSystems} disabled={clearing}>
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>

        {systems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <div className="empty-state-text">No systems registered yet</div>
            <div className="empty-state-sub">Add a test system above to get started</div>
          </div>
        ) : (
          <div className="system-list">
            {systems.map((system) => (
              <div
                key={system.esp32Id}
                className={`system-item ${selectedSystem === system.esp32Id ? "selected" : ""}`}
              >
                <button
                  className="system-item-name"
                  onClick={() => handleSystemClick(system.esp32Id)}
                >
                  {system.name}
                </button>
                <button
                  className="system-item-delete"
                  title="Delete system"
                  onClick={() => deleteSystem(system.esp32Id)}
                >
                  ✕
                </button>
              </div>
            ))}
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
