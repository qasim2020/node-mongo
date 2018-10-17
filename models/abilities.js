const mongoose = require('mongoose');

var Abilities = mongoose.model('abilities', {
  refId: {
    type: String,
    required: true,
    unique: true,
  },
  speakEnglish: {
    type: Boolean,
    default: false
  },
  writeLetter: {
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
  ForeignTourGuide: {
    type: Boolean,
    default: false
  },
  canFight: {
    type: Boolean,
    default: false
  },
  importExport: {
    type: Boolean,
    default: false
  },
  creditCard: {
    type: Boolean,
    default: false
  },
  pptx: {
    type: Boolean,
    default: false
  },
  cryptoCurrency: {
    type: Boolean,
    default: false
  },
  doctor: {
    type: Boolean,
    default: false
  },
  listen: {
    type: Boolean,
    default: false
  }
});

module.exports = {Abilities};
