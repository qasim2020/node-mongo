const mongoose = require('mongoose');

var jobsSchema = new mongoose.Schema({
  raisedBy: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    minlength: 3
  },
  discription: {
    type: String,
    minlength: 3,
    required: true,
  },
  abilityNeeded: {
    type: String,
    required: true,
  },
});

var Jobs = mongoose.model('Jobs',jobsSchema);

module.exports({Jobs});
