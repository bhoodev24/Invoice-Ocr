const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const AgencyBilling = new Schema({
  agency: {
    type: String
  },
  consumption: {
    type: Number,
  },
  fee: {
    type: Number,
  },
  period: {
    type: date,
    
  },
  
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Billing = mongoose.model('agencybilling', AgencyBilling);