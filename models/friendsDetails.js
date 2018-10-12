const mongoose = require('mongoose');

var FriendsDetails = mongoose.model('friends', {
  refId: {
    type: String,
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
  },
});

module.exports = {FriendsDetails};
