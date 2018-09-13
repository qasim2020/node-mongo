const mongoose = require('mongoose');

var Abilities = mongoose.model('abilities', {
  refId: {
    type: String,
    required: true
  },
  englishSpeaking: {
    type: Boolean,
    default: false
  },
  letterWriting: {
    type: Boolean,
    default: false
  },
  bookARoom: {
    type: Boolean,
    default: false
  },
  localTourGuide: {
    type: Boolean,
    default: false
  },
  canFight: {
    type: Boolean,
    default: false
  },
  creditCard: {
    type: Boolean,
    default: false
  }
});

module.exports = {Abilities};
