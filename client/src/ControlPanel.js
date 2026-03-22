import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ControlPanel() {
    const { esp32Id } = useParams();
    const [systemName, setSystemName] = useState("");
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/system/${esp32Id}/control_panel`);
            const json = await res.json();
            setSystemName(json.system);
            setData(json.recentData);
        } catch (err) {
            console.error("Error fetching system data:", err);
        }
    };

    useEffect(() => {
        if (esp32Id) {
            fetchData();
        }
    }, [esp32Id]);

    return (
        <div>
            <h1>Control Panel</h1>
            <h2>System: {systemName}</h2>

            <h3>Recent Data:</h3>


        </div>
    )

}

export default ControlPanel;