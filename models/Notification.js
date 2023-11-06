const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const NotificationSchema = new Schema({
  user_id: {
    type: String,
    ref: 'user'
    
  },
  msg_content: {
    type: String,
    // required: true
  },

  agency_id: {
    type: Schema.Types.ObjectId,
    ref: 'client'
  },
  status: {
    type: Boolean,
    default: false
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Note = mongoose.model('notifications', NotificationSchema);