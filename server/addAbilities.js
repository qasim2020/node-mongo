const {Abilities} = require('./../models/abilities');
const {mongoose} = require('./../db/mongoose');

var newAbilities = (req) => {
  return new Promise((resolve,reject) => {
    req.params.data.refId = req.user._id;
    var data = req.params.data;
    var abilities = new Abilities(data);

    abilities.save().then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });
};

var updateAbilities = (req) => {
  return new Promise((resolve,reject) => {
    Abilities.findOneAndUpdate({refId: req.user._id},{$set: req.params.data},{new: true})
    .then((data) => {
      resolve(data);
    })
    .catch((e) => {
      reject(e);
    })
  })
}

module.exports = {newAbilities,updateAbilities};
