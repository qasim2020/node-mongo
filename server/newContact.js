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
        console.log(e);
        reject('You are already registered. Please go back and try to "Log In".');
      });
  });
}

module.exports = {newContact};
