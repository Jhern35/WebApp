const mongoose = require('mongoose');

const SystemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true},
    esp32Id: { type: String, required: true, unique: true },
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
        decision: Boolean,
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
            decision: Boolean,
            soilMoistureAD: Number,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('IrrigationSystemSchema', SystemSchema);