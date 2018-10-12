const mongoose = require('mongoose');

var Contacts = mongoose.model('contacts',{
  Name: {
    type: String,
  },
  'Email 1 - Value': {
    type: String,
  },
  'Phone 1 - Type': {
    type: String,
  },
  'Phone 1 - Value': {
    type: String,
  },
  'Phone 2 - Value': {
    type: String,
  },
  'Phone 3 - Value': {
    type: String,
  },
  'Phone 4 - Value': {
    type: String
  }
});

module.exports = {Contacts};
