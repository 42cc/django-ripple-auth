var NodeRSA = require('../imports/node-rsa');
var key = new NodeRSA();

// get challenge sign params for js file
var challenge = require('./challenge_sign_params.js').challenge;
var signature = require('./challenge_sign_params.js').signature;
var publicKey = require('./challenge_sign_params.js').publicKey;

// import public key
key.importKey(publicKey, 'pkcs8-public-pem');


// verify challenge sign
console.log(key.verify(challenge, signature, 'utf8', 'hex'));