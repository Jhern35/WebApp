import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ControlPanel() {
    const { esp32Id } = useParams();
    const [systemName, setSystemName] = useState("Unkown System");
    const navigate = useNavigate();

    // Default state ensures no undefined values
    const [settingState, setSettingsState] = useState({
        sleepOptions: '3',
        autoIrrigation: true,
        irrigationDuration: 2,
        moistureMin: 0.3,
        moistureMax: 0.7,
    });

    const fetchData = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/system/${esp32Id}/control_panel`
            );
            const json = await res.json();

            console.log("Control panel respones:", json);
            // Set system name safely
            setSystemName(json.name);

            // Set settings safely with defaults
            setSettingsState(prev => ({
                ...prev,
                sleepOptions: json.system?.sleepOptions ?? prev.sleepOptions,
                autoIrrigation: json.system?.autoIrrigation ?? prev.autoIrrigation,
                moistureMin: json.system?.moistureMin ?? prev.moistureMin,
                moistureMax: json.system?.moistureMax ?? prev.moistureMax,
                irrigationDuration: json.system?.irrigationDuration ?? prev.irrigationDuration,
            }));
        } catch (err) {
            console.error("Error fetching system data:", err);
        }
    };

    const [moistureMax, setMoistureMaxInput] = useState("");
    const [moistureMin, setMoistureMinInput] = useState("");
    const [minErrorHandler, setMinError] = useState("");
    const [maxErrorHandler, setMaxError] = useState("");

    useEffect(() => {
        if (esp32Id) {
            fetchData();
        }
    }, [esp32Id]);

    useEffect(() => {
        setMoistureMaxInput(
            Math.round(settingState.moistureMax * 100).toString()
        );
    }, [settingState.moistureMax]);

    useEffect(() => {
        setMoistureMinInput(
            Math.round(settingState.moistureMin * 100).toString()
        );
    }, [settingState.moistureMin]);


    const validateMoistureMin = (min) => {
        if (isNaN(min)) return setMinError("Invalid number");
        if (min < 30) {
            setMinError("Moisture minimum must be 30% or above");
            return;
        }
        if (min >= 50) {
            setMinError("Moisture minimum cannot be more than 50");
            return;
        }
        handleChange("moistureMin", min/100);
        console.log("Lost focus, current value:", min);
        setMinError("");
        return;
    };

    const validateMoistureMax = (max) => {
        if (isNaN(max)) return setMaxError("Invalid number");
        if (max > 100) {
            setMaxError("Moisture maximum must be no more than 100%");
            return;
        }
        else if (max < 50) {
            setMaxError("Maximum moisture percentage cannot be less than 50");
            return;
        }
        handleChange("moistureMax", max/100);
        console.log("Lost focus, current value:", max);
        setMaxError("");
        return;
    };

    const handleMoistureMinInput = (e) => {
        let valueStr = e.target.value;
        let value = parseFloat(valueStr);
        setMoistureMinInput(value);
    };

    const handleMoistureMaxInput = (e) => {
        let valueStr = e.target.value;
        let value = parseFloat(valueStr);
        setMoistureMaxInput(value);
    };

    const handleDuration = (num) => {
        let value = parseFloat(num);
        handleChange("irrigationDuration", value);
    };

    const handleChange = (key, value) => {
        setSettingsState(prev => ({ 
            ...prev, 
            [key]: value
        }));
    };

    const manualIrrigation = async (command) => {
        try{
            await axios.post(`http://localhost:5000/api/system/${esp32Id}/command`, {
                command
            });
            console.log("POST sent");
        } catch (err) {
            console.log("Error:", err);
        }
    };

    const saveSettings = async () => {
        try {
            const res = await fetch (
                `http://localhost:5000/api/system/${esp32Id}/control_panel`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(settingState)
                }
            );

            const data = await res.json();
            console.log("Settings saved:", data);
            alert("Settings saved successfully!");
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save settings");
        }
    };

    const homePage = () => {
        navigate("/dashboard");
    };

    return (
        <div className="dashboard-page">
            <nav className="dashboard-nav">
                 <h1 className="dashboard-nav-title">Control Panel</h1>
                 <button className="signout-btn" onClick={homePage}>Back to Dashbaord</button>
            </nav>
            <h2 className="control-System-title">{systemName}:</h2>
            
            <div className="panel">
                 <form>
                {/* For manual irrigation */}
                <div className="sections">
                    <label> Manual Irrigation: </label>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => manualIrrigation("Pump_On")}>
                        Turn On
                    </button>

                    <button
                        type="button"
                        className="btn"
                        onClick={() => manualIrrigation("Pump_Off")}>
                        Turn Off
                    </button>
                </div>
                
                
                {/* Sleep Options Dropdown */}
                <div className="sections">
                    <label>Sleep Options: </label>
                <select
                    value={settingState.sleepOptions}
                    onChange={(e) => handleChange('sleepOptions', e.target.value)}
                >
                    <option value="1">1 hr</option>
                    <option value="3">3 hr</option>
                    <option value="6">6 hr</option>
                    <option value="12">12 hr</option>
                    <option value="24">24 hr</option>
                </select>
                </div>
                
                {/* Auto Irrigation Toggle */}
                <div className="sections">
                     <label>Auto Irrigation: </label>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => handleChange('autoIrrigation', !settingState.autoIrrigation)}>
                        {settingState.autoIrrigation ? "ON" : "OFF"}
                    </button>
                </div>
               

                {/* Moisture Threshold Slider */}
                <div className="sections">
                    <label>Moisture Thresholds (%): </label>
                    <div className="sections-threshold">
                        <label>Minimum Threshold: </label>
                        <input
                        type="number"
                        value={moistureMin}
                        onChange={handleMoistureMinInput}
                        onBlur={(e) => validateMoistureMin(e.target.value)}
                        placeholder="Min %" 
                        />
                        {minErrorHandler && (
                            <p style={{ color: "red" }}>{minErrorHandler}</p>
                        )}
                    </div>
                    
                    <div className="sections-threshold">
                        <label>Maximum Threshold: </label>
                        <input
                        type="number"
                        value={moistureMax}
                        onChange={handleMoistureMaxInput}
                        onBlur={(e) => validateMoistureMax(e.target.value)}
                        placeholder="Max %" 
                        />
                        {maxErrorHandler && (
                            <p style={{ color: "red" }}>{maxErrorHandler}</p>
                        )}
                    </div>
                </div>
                

                {/* Irrigation duration for system */}
                <div className="sections">
                    <label>System Irrigation Duration: </label>
                    <select 
                        value={settingState.irrigationDuration}
                        onChange={(e) => handleDuration(e.target.value)}
                        >
                            <option value="1">1 min</option>
                            <option value="2">2 min</option>
                            <option value="3">3 min</option>
                            <option value="5">5 min</option>
                    </select>
                </div>
            </form>
            <table>
                <tbody>
                    <tr>
                        <td><button 
                            type="button"
                            className='system-btn'
                            onClick={ (saveSettings) }>Save Settings</button></td>
                    </tr>
                </tbody>
            </table>
            </div>     
        </div>
    );
}

export default ControlPanel;