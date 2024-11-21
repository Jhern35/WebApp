const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 8000;

const valves = [
  { id: 1, name: "Hallway 78B - 18237"},
  { id: 2, name: "Entry 5 - 9982"},
  { id: 3, name: "Loading Dock Rear - 122344"},
  { id: 4, name: "Hallway 9C - 234"},
  { id: 5, name: "Vent 337AA - 3434"}
];

app.get("/valves", function (req, res) {
  res.json({ data: valves.map(v => ({...v, pressure: Math.floor(Math.random() * 1000)})) });
});





app.listen(PORT, function () {
  console.log(`Server is running on ${PORT}`);
});
