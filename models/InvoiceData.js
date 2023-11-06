const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const InvoicedataSchema = new Schema({
  format: {
    type: String,
  },
  ProviderName: {
    type: String,
  },
  ProviderCIF: {
    type: String,
  },
  ClientName: {
    type: String,
  },
  ClientCIF: {
    type: String,
  },
  InvoiceDate: {
    type: String
  },
  InvoiceNumber: {
    type: String
  },
  TaxRate: {
    type: String
  },
  BaseAmount: {
    type: String
  },
  TaxAmount: {
    type: String,
  },
  TotalAmount: {
    type: String,
  },
  UserId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  ClientId: {
    type: Schema.Types.ObjectId,
    ref: 'client'
  },
  FileName: {
    type: String
  },
  downloadFlag: {
    type: Boolean,
    default: false
  },

  Date: {
    type:Date,
    default: Date.now
  }
});

module.exports = InvoiceData = mongoose.model('invoice', InvoicedataSchema);