const request = require('request');

// function getNum(url) {
//     return new Promise((resolve, reject) => {
//         request(url, function(error, response, body) {
//             if (error) {
//                 reject(error);
//             }
//             resolve(body);
//         });
//     })


// }
function getNum(url, options) {
    let option = {
        url: url,
        qs: options
    }
    return new Promise((resolve, reject) => {
        request.get(option, function(error, response, body) {
            if (error) {
                reject(error);
            }
            resolve(body);
        });
    })


}
module.exports = getNum;