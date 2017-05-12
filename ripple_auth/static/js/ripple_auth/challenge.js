/**
 * Challenge processing (for browserify)
 * browserify assets/js/new_design/login/challenge.js > assets/js/new_design/login/challenge_bundle.js
 */
var NodeRSA = require('./libs/node-rsa');


window.Challenge = function () {};


/**
 * Process challenge
 */
window.Challenge.processChallenge = function(id, blob) {
	window.Challenge.getChallenge(id, blob);
};

/**
 * Get challenge from server
 */
window.Challenge.getChallenge = function(id, blob) {
	// get challenge
	$.get(Options.challenge_process_url, function(data) {
		console.log('Successfully get challenge');
		var challenge = data;

		// generate new key
		var key = new NodeRSA({b: 512}, {encryptionScheme: 'pkcs1'});
		var publicKey = key.exportKey('public');

		// sign challenge with private key
		var signature = key.sign(challenge, 'hex');

		// remove linebreaks from public key
		var pkey = publicKey.replace(/(\r\n|\n|\r)/gm, '');

		window.Challenge.returnChallenge(id, blob, challenge, signature, pkey)
	}).fail(function(data) {
		toggleLoader();
		console.log('Failed to get challenge: ' + data.responseText);
		showNotification('Failed to process challenge');

		// logout if challenge processing was failed
		id.logout();
		return false;
	});
};

/**
 * Return challenge to backend for further validation
 */
window.Challenge.returnChallenge = function(id, blob, challenge, signature, publicKey) {
	var csrftoken = $("[name=csrfmiddlewaretoken]").val();
	var payload = {
		csrfmiddlewaretoken: csrftoken,
		challenge: challenge,
		signature: signature,
		publicKey: publicKey,
		ripple_address: blob.data.account_id,
		username: id.username
  };

	// return challenge
	$.ajax({
    type: 'POST',
    url: Options.challenge_process_url,
    data: payload,
    success: function(data) {
      console.log('Successfully processed challenge');
      showNotification('Successfully logged in ripple');
      id.storeLogin(id.username, id.password);
			setTimeout(function() {
				// redirect after login
				Options.after_login_action();
				console.log('Login success');
			}, 1000);
    },
    dataType: 'text'
	}).fail(function(data) {
		toggleLoader();
		console.log('Failed to return challenge: ' + data.responseText);
		showNotification('Failed to process challenge');

		// logout if challenge processing was failed
		id.logout();
		return false;
	});
};