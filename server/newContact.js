const {Contacts} = require('./../models/contacts');
const {Friends} = require('./../models/friends');
const {mongoose} = require('./../db/mongoose');

var newContact = (user) => {
  return new Promise((resolve,reject) => {
    var friend = new Friends(user);
    friend.save()
      .then(() => {
        resolve(friend.generateAuthToken());
      })
      .catch((e) => {
        reject(e);
      });
  });
}

module.exports = {newContact};
