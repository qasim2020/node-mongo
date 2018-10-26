const axios = require('axios');
var req = {
  phone: 923098026395
};
var code = 8923
var textURL = `http://Lifetimesms.com/plain?username=famousfakir&password=${process.env.PASSWORD}!qasim&to=${req.phone}&from=letsHelp&message=${code}`
console.log(textURL);

axios.get(textURL)
  .then((response) => {
    console.log(response);
    if (/OK/g.test(response.data)) return console.log(code + 'sent !');
    return console.log('Code was not sent due to some problem');
  })
  .catch((error) => {
    console.log(error);
    return console.log('Some error happened while sending text message');
  });
