const {Contacts} = require('./../models/contacts');
const {mongoose} = require('./../db/mongoose');

const _ = require('lodash');

var enteredName = 'Ali'.trim();
var enteredPhone = '03325825755';
var phone = enteredPhone.replace(' ','').trim().slice(-7);

var nameExpression = enteredName;
var nrx = new RegExp(nameExpression, 'gi');

var phoneExpression = phone;
var prx = new RegExp(phoneExpression, 'g');

Contacts.find({
  'Name': nrx,
}).then((user) => {
  if (!user.length) return console.log('Name not available');
  var array;
  let obj = user.find((obj) => {
    let string = obj['Phone 1 - Value']+','+obj['Phone 2 - Value']+','+obj['Phone 3 - Value']+','+obj['Phone 4 - Value'];
    string = string.toString().replace(/:::/g,",").replace(/:::\s+/g,"").trim();
    array = string.split(',');
    return prx.test(string);
  });

  prx = new RegExp(phoneExpression, 'g');

  phone = array.find((el) => {
    return prx.test(el);
  })

  if (!obj) return console.log('No phone and name match found');

  console.log(obj.Name, enteredPhone);

}).catch((e) => {
  console.log(e);
});
