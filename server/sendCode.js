const axios = require('axios');


var sendCode = function(code,req) {
  return new Promise((resolve,reject) => {

    var textURL = `http://Lifetimesms.com/plain?username=famousfakir&password=1234!qasim&to=${req.user.phone}&from=letsHelp&message=${code}`
    console.log(textURL);
    resolve(code);
    // axios.get(textURL)
    //   .then((response) => {
    //     console.log(response);
    //     if (/OK/g.test(response.data)) return resolve(code);
    //     return reject('Code was not sent due to some problem. Please intimate Qasim.');
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     return reject('Some thing wrong with text api. Please intimate Qasim.');
    //   });
  })
}

var sendText = (text,phone) => {
  return new Promise((resolve,reject) => {
    if (phone === 923235168638) return resolve(true);
    var textURL = `http://Lifetimesms.com/plain?username=iram.riaz&password=${process.env.PASSWORD}&to=${phone}&from=letsHelp&message=${text}`
    console.log(textURL);
    resolve(true);
    // axios.get(textURL)
    //   .then((response) => {
    //     console.log(response.data);
    //     if (/OK/g.test(response.data)) return resolve(true);
    //     return reject(`Server Error: ${response.data}`);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     return reject(`Server Error: ${error}`);
    //   });
  })

}

module.exports = {sendCode, sendText};
