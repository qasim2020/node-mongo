const mongoose = require('mongoose');

var jobsSchema = new mongoose.Schema({
  raisedBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    minlength: 3,
    default: 'pending',
  },
  request: {
    type: String,
    minlength: 3,
    required: true,
  },
  abilityNeeded: {
    type: String,
    required: true,
  },
  abilityNeededElaborated: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: String,
  },
  assignedJobCounter: {
    type: String,
    required: true,
  }
});

var Jobs = mongoose.model('Jobs',jobsSchema);

module.exports = {Jobs};
