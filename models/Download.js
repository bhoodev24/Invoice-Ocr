const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DownloaddataSchema = new Schema({

  ClientId: {
    type: Schema.Types.ObjectId,
    ref: 'client'
  },
  InvoiceFiles: {
    type: String
  },
  cif: {
    type: String
  },
  name: {
    type: String
  },
  tax_amount: {
    type: String
  },
  base_amount: {
    type: String
  },
  total: {
    type: String
  },
  Date: {
    type:Date,
    default: Date.now
  }
});

module.exports = Download = mongoose.model('downloads', DownloaddataSchema);