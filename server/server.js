require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const IrrigationSystem = require('./models/IrrigationSystemSchema');

const app = express();

console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("MONGO_URI:", process.env.MONGO_URI);

app.use(cors());
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

app.get('/api/system/:esp32Id/control_panel', async (req, res) => {
  const { esp32Id } = req.params;
  console.log("ControlPanel mounted");
  
  res.json({
    system: "Test System",
    recentData: []
  });

});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));