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
  },
  registered: {
    type: Boolean,
    required: true,
    default: false
  },
  tokens: [{
    access: {
      type: String,
    },
    token: {
      type: String,
    }
  }]
});

module.exports = {Friends};
