require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const IrrigationSystem = require('./models/IrrigationSystemSchema');
const mqtt = require("mqtt");
//const { default: SystemData } = require("../client/src/IrrigationSystemData");

const app = express();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("MONGO_URI:", process.env.MONGO_URI);

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const mqttClient = mqtt.connect({
  host: "a858338d804742fc8fa976391931d0c1.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "Smart_Irrigation",
  password: "Senior_Design2026",
});

mqttClient.on("connect", () => {
  console.log("Connected to the MQTT broker");
})
mqttClient.on("error", err => console.log(err));

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is undefined. Check your .env file.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

app.use("/api/auth", require("./routes/auth"));

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: err.message });
});

app.get('/api/users/:email/systems', async (req, res) => {
  const systems = await IrrigationSystem.find({ owner: req.params.email });
  res.json(systems);
});

/* --------------------------  Registration of Irrigation System --------------------- */
app.post('/api/systems/register', async (req, res) => { 
  const { name, esp32Id, owner, ipAddress } = req.body;

  if (!name || !esp32Id || !owner) {
    return res.status(400).json()
  }

  try {
    const newSystem = new IrrigationSystem({
      name,
      esp32Id,
      owner,
      ipAddress,
      latestData: {}
    });

    await newSystem.save();
    res.status(201).json({ success: true, system: newSystem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register system" });
  }

});


/* --------------------- GET and POST for Data FROM ESP32 ---------------------- */
app.post('/api/system/:esp32Id/data', async (req, res) => {
  const {esp32Id } = req.params;

  console.log("POST hit for ESP32 ID:", esp32Id);
  console.log("Incoming body:", req.body);

  const {
    soilMoistureBC,
    PoP,
    PoP_time,
    QPF,
    QPF_time,
    decision,
    soilMoistureAD,
  } = req.body;

  try {
    const system = await IrrigationSystem.findOne({ esp32Id });
    console.log("Found system:", system);
    if (!system) return res.status(404).json({ error: "System not found" });

    const newEntry = {
      soilMoistureBC,
      PoP,
      PoP_time,
      QPF,
      QPF_time,
      decision,
      soilMoistureAD,
      timestamp: new Date()
    };

    system.latestData = newEntry;

    system.dataHistory.push(newEntry);
    if (system.dataHistory.length > 20) {
      system.dataHistory = system.dataHistory.slice(-20);
    }

    console.log("New entry:", newEntry);

    await system.save();
    console.log("Saved. DataHistory length:", system.dataHistory.length);

    res.json({ success: true, latestData: system.latestData, dataHistory: system.dataHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update system data" });
  }

});

app.get('/api/system/:esp32Id/data', async (req, res) => {
  const { esp32Id } = req.params;

  try {
    const system = await IrrigationSystem.findOne({ esp32Id });
    if (!system) return res.status(404).json({ error: "System not found" });

    const recentData = system.dataHistory.slice(-20).reverse();
    res.json({ system: system.name, recentData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch system data" });
  }

});

/* ---------------------------------- GET system and its name -------------------------- */
app.get('/api/system/:esp32Id/control_panel', async (req, res) => {
  try {
    const { esp32Id } = req.params;

    const system = await IrrigationSystem.findOne({ esp32Id });
    console.log("System from Db", system.settings);
    console.log("ControlPanel mounted");

    if (!system) {
      console.log("No system found for esp32Id:", esp32Id);
      return res.status(404).json({ error: "System not found" });
    }

    console.log("Requested esp32Id:", esp32Id);
    console.log("System found:", system.name);

    res.json({
      system: system.settings,
      name: system.name
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }

});

/* --------------------------------- PATCH settings into the database -------------------------- */
app.patch('/api/system/:esp32Id/control_panel', async (req, res) => {
 
  try {
    const system = await IrrigationSystem.findOne({ esp32Id: req.params.esp32Id });
    if (!system) {
      return res.status(404).json({ error: "System not found" });
    }

    system.settings = { ...system.settings, ...req.body };

    await system.save();
    res.json( {message: "Settings updated", system} );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
 console.log("PATCH body:", req.body);
});

app.patch('/api/fix-settings', async (req, res) => {
  try {
    const systems = await IrrigationSystem.find();

    for (const system of systems) {
      // If settings is missing, assign an empty object so defaults apply
      if (!system.settings) system.settings = {};
      await system.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Migration failed" });
  }
});

app.post('/api/system/:esp32Id/command', async (req, res) => {

  try {
    const { esp32Id } = req.params;
    const { command } = req.body;

    const topic = `system/${esp32Id}/control`;
    console.log("Button has been clicked");
    console.log("Topic:", topic);
    console.log("Command:", command);

    mqttClient.publish(topic, command);

    res.json({
      success: true,
      command
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send command" });
  }
  
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));