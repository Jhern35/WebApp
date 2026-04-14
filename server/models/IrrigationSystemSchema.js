const mongoose = require('mongoose');
const Settings = require('./Settings');

const SystemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true},
    esp32Id: { type: String, required: true, unique: true },
    settings: {
        sleepOptions: { type: String, default: '3' },
        autoIrrigation: { type: Boolean, default: true },
        moistureMin: { type: Number, default: 0.3 },
        moistureMax: { type: Number, default: 0.7},
        irrigationDuration: { type: Number, default: 2},
    }, 
    ipAddress: { type: String },
    latestData: { 
        soilMoistureBC: Number,
        PoP: Number,
        //Ovver what time are the chances of rain expected
        PoP_time: Number,
        //Amount of expected rainfall
        QPF: Number,
        //Over what time is the rainfall expected
        QPF_time: Number,
        decision: String,
        //If decicsion is true what is the new moisture %
        soilMoistureAD: Number,
        timestamp: { type: Date, default: Date.now }
    },

    dataHistory: [
        {
            soilMoistureBC: Number,
            PoP: Number,
            PoP_time: Number,
            QPF: Number,
            QPF_time: Number,
            decision: String,
            soilMoistureAD: Number,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('IrrigationSystemSchema', SystemSchema);
