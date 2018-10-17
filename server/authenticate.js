const {mongoose} = require('./../db/mongoose');
const {Friends} = require('./../models/friends');


var authenticate = (req,res,next) => {
  var inputToken = req.params.token;
  if (!inputToken) return res.status(401).send();
  Friends
    .findByToken(inputToken)
    .then((user) => {
      if (!user) return Promise.reject('No user');
      req.user = user;
      console.log('authenticated');
      next();
    })
    .catch((e) => {
      res.render('index.hbs');
    });
}

module.exports = {authenticate};
