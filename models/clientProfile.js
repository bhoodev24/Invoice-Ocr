const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ClientProfile = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  id: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  cif: {
    type: String,
    required: true
  },
  userNum: {
    type: Number
  },
  fee: {
    type: Number,
  },
  consumption: {
    type: Number
  },
  bankAccount: {
    type:String
  },
  license: {
    type:String
  },
  contactName: {
    type:String
  },
  phone: {
    type:String
  },
  mail: {
    type:String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Client = mongoose.model('client', ClientProfile);