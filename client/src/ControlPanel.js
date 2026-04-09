import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ControlPanel() {
    const { esp32Id } = useParams();
    const [systemName, setSystemName] = useState("Unkown System");

    // Default state ensures no undefined values
    const [settingState, setSettingsState] = useState({
        sleepOptions: '3',
        autoIrrigation: true,
        moistureThreshold: 0.5,
        irrigationDuration: 2,
        moistureMin: 0.3,
        moistureMax: 1,
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
                sleepOptions: json.system?.settings?.sleepOptions ?? prev.sleepOptions,
                autoIrrigation: json.system?.settings?.autoIrrigation ?? prev.autoIrrigation,
                moistureThreshold: json.system?.settings?.moistureThreshold ?? prev.moistureThreshold,
                irrigationDuration: json.system?.settings?.irrigationDuration ?? prev.irrigationDuration,
            }));
        } catch (err) {
            console.error("Error fetching system data:", err);
        }
    };

    const [moistureInput, setMoistureInput] = useState("50");

    useEffect(() => {
        if (esp32Id) {
            fetchData();
        }
    }, [esp32Id]);

    useEffect(() => {
        setMoistureInput(
            Math.round(settingState.moistureThreshold * 100).toString()
        );
    }, [settingState.moistureThreshold]);

    const handleMoistureInput = (e) => {
        let valueStr = e.target.value;
        
        setMoistureInput(valueStr);

        let valueNum = parseFloat(valueStr);
        if (isNaN(valueNum)) return;

        valueNum = valueNum / 100;
        valueNum = Math.max(settingState.moistureMin, Math.min(valueNum, settingState.moistureMax));

        handleChange("moistureThreshold", valueNum);
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

    const manualIrrigation = async () => {
        try {

        } catch (err) {

        }
    }

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

    return (
        <div>
            <h1>Control Panel</h1>
            <h2>{systemName}</h2>

            <form>
                {/* For manual irrigation */}
                
                {/* Sleep Options Dropdown */}
                <label>Sleep Options:</label>
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

                {/* Auto Irrigation Toggle */}
                <label>Auto Irrigation:</label>
                <button
                    type="button"
                    onClick={() => handleChange('autoIrrigation', !settingState.autoIrrigation)}>
                    {settingState.autoIrrigation ? "ON" : "OFF"}
                </button>

                {/* Moisture Threshold Slider */}
                <label>Moisture Threshold (%):</label>
                <input
                    type="number"
                    value={moistureInput}
                    onChange={handleMoistureInput}
                    min={settingState.moistureMin * 100} 
                    max={settingState.moistureMax * 100} 
                />

                {/* Irrigation duration for system */}
                <label>System Irrigation Duration:</label>
                <select 
                    value={settingState.irrigationDuration}
                    onChange={(e) => handleDuration(e.target.value)}
                    >
                        <option value="1">1 min</option>
                        <option value="2">2 min</option>
                        <option value="3">3 min</option>
                        <option value="5">5 min</option>
                    </select>

            </form>
            <table>
                <tbody>
                    <tr>
                        <td><button 
                            type="button"
                            className='ctrl-btn'
                            onClick={ (saveSettings) }>Save Settings</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ControlPanel;