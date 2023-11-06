const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
  fname: {
    type: String,
    required: true
  },
  lname: {
    type: String,
    // required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    // required: true
  },
  cif: {
    type: String
  },
  iva: {
    type: String
  },
  irpf: {
    type: String
  },
  tax: {
    type: String
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
  // mail: {
  //   type:String
  // },
  anual: {
    type: String
  },
  mensual: {
    type: String
  },
  agency_id: {
    type: Schema.Types.ObjectId,
    ref: 'client'
  },
  consumption: {
    type: Number
  },
  fee: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('users', UserSchema);