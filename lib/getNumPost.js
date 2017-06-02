const request = require('request');

function getNumPost(url, options) {
    return new Promise((resolve, reject) => {
        request.post({ url: url, form: options }, function(err, httpResponse, body) {
            if (err) {
                reject(err);
            }
            resolve(body);
        })
    })


}
module.exports = getNumPost;