const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {FriendsDetails} = require('./friendsDetails');

var FriendsSchema = new mongoose.Schema({
  refId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  phone: {
    type: String,
    required: true,
  },
  registered: {
    type: Boolean,
    required: true,
    default: false
  },
  requestRaised: {
    type: Boolean,
    required: true,
    default: false
  },
  phoneCode: {
    type: String,
    default: '',
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

FriendsSchema.methods.removeToken = function (token) {
  var user = this;

  return user.updateOne({
    $pull: {
      tokens: {token}
    }
  });
};

FriendsSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return user;
  });
};

FriendsSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

FriendsSchema.statics.findByCredentials = function (phone, password) {
  var User = this;
  var phoneRegExp = new RegExp(phone.slice(-10),'g');

  return User.findOne({phone: phoneRegExp}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      FriendsDetails.findOne({refId: user._id}).then((result) => {
        if (!result) return Promise.reject("refId didn't match in details");
        bcrypt.compare(password, result.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject('Password did not match');
          }
        });
      })

    });
  });
};

var Friends = mongoose.model('Friends', FriendsSchema);

module.exports = {Friends};
