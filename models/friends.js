const mongoose = require('mongoose');

var Friends = mongoose.model('friends', {
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  phone: {
    type: Number,
    required: true,
    // TODO: validate only those phone numbers which are already added in my personal directory
  },
  withMeAt: {
    type: String,
    required: true
  },
  memorableOccasionWithMe: {
    type: String,
  },
  currentAddress: {
    type: String,
    required: true
  },
  availForHelp: {
    type: Boolean,
    default: false
  }
});

module.exports = {Friends};
