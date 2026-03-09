require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const IrrigationSystem = require("./models/IrrigationSystemSchema");

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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

app.use("/api/auth", require("./routes/auth"));

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn(`AUTH FAIL [${req.method} ${req.url}]: no token`);
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.warn(`AUTH FAIL [${req.method} ${req.url}]: ${err.message}`);
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: err.message });
});


// GET all systems owned by a user
app.get("/api/users/:userId/systems", authMiddleware, async (req, res) => {
  try {
    const systems = await IrrigationSystem.find({ owner: req.user.email });
    res.json(systems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch systems" });
  }
});


// Register a new irrigation system
app.post('/api/systems/register', authMiddleware, async (req, res) => {
  const { name, esp32Id, ipAddress } = req.body;
  const owner = req.user.email;

  if (!name || !esp32Id) {
    return res.status(400).json({ msg: "Missing required field" });
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


// ESP32 sends new sensor data
app.post("/api/systems/:esp32Id/data", async (req, res) => {
  const { esp32Id } = req.params;

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

    if (!system) {
      return res.status(404).json({ error: "System not found" });
    }

    const newEntry = {
      soilMoistureBC,
      PoP,
      PoP_time,
      QPF,
      QPF_time,
      decision,
      soilMoistureAD,
      timestamp: new Date(),
    };

    system.latestData = newEntry;

    system.dataHistory.push(newEntry);

    if (system.dataHistory.length > 20) {
      system.dataHistory = system.dataHistory.slice(-20);
    }

    await system.save();

    res.json({
      success: true,
      latestData: system.latestData,
      dataHistory: system.dataHistory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update system data" });
  }
});


// Delete all systems owned by a user
app.delete("/api/users/:userId/systems", authMiddleware, async (req, res) => {
  try {
    const result = await IrrigationSystem.deleteMany({ owner: req.user.email });
    console.log(`DELETE ALL for ${req.user.email}: removed ${result.deletedCount} documents`);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete systems" });
  }
});

// Delete a system
app.delete("/api/systems/:esp32Id", authMiddleware, async (req, res) => {
  try {
    const deleted = await IrrigationSystem.findOneAndDelete({ esp32Id: req.params.esp32Id });
    console.log(`DELETE ${req.params.esp32Id}: ${deleted ? "removed" : "NOT FOUND"}`);
    if (!deleted) return res.status(404).json({ error: "System not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete system" });
  }
});

// Fetch latest history for a specific system
app.get("/api/system/:esp32Id/data", authMiddleware, async (req, res) => {
  const { esp32Id } = req.params;

  try {
    const system = await IrrigationSystem.findOne({ esp32Id });

    if (!system) {
      return res.status(404).json({ error: "System not found" });
    }

    const recentData = system.dataHistory.slice(-20).reverse();

    res.json({
      system: system.name,
      recentData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch system data" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});