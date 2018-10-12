const {mongoose} = require('./../db/mongoose');
const {Contacts} = require('./../models/contacts');


var authenticate = (req,res,next) => {
  var id = req.params.id;
  Contacts.findById(id).then((user) => {
    if (!user) return Promise.reject();
    req.user = user;
    console.log('authenticated');
    next();
  }).catch((e) => {
    res.status(401).send();
  });
}

module.exports = {authenticate};
