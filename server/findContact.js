const {Contacts} = require('./../models/contacts');
const {mongoose} = require('./../db/mongoose');

var findContact = (a,b) => {
  return new Promise((resolve,reject) => {
    var enteredName = a.trim();
    var enteredPhone = b.trim();
    var phone = enteredPhone.replace(' ','').trim().slice(-7);

    var nameExpression = enteredName;
    var nrx = new RegExp(nameExpression, 'gi');

    var phoneExpression = phone;
    var prx = new RegExp(phoneExpression, 'gi');

    Contacts.find({
      'Name': nrx,
    }).then((user) => {
      if (!user.length) return reject('User is not in my contacts list');
      let obj = user.find((obj) => {
        let string = obj['Phone 1 - Value']+','+obj['Phone 2 - Value']+','+obj['Phone 3 - Value']+','+obj['Phone 4 - Value'];
        string = string.toString().replace(/:::/g,",").replace(/\s+/g,"").trim();
        array = string.split(',');
        return prx.test(string);
      });

      if (!obj) return reject('User is aval but no phone matched found');

      prx = new RegExp(phoneExpression, 'g');

      phone = array.find((el) => {
        return prx.test(el);
      });
      var result = {
        refId: obj._id.toHexString(),
        name: obj.Name,
        phone,
      };

      resolve(result);

    }).catch((e) => {
      return reject(e);
    });

  });

};

module.exports = {findContact};
