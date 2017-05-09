/**
 * OLD BLOB
 *
 * The old blob service that used to manage the user's private information.
 */
var BlobObj = function () {
	this.data = {};
	this.meta = {};
};


/**
 * Handles blob error
 * @param message - error message
 */
BlobObj.handleError = function(message) {
	toggleLoader();
	console.warn('Blob fail: ', message.toString());
	showNotification('ERROR: ' + message);
};


/**
 * Get blob data from blobvault using user key
 * @param username - username
 * @param password - password
 * @param key      - blob key
 * @param callback - callback function
 */
BlobObj.get = function(username, password, key, callback) {
	var backend = VaultBlobBackend;

	// generate key using to retrieve user data from blobvault or use key from argument
	var key = username ? sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(username + password)) : key;

	// try to get user data from blobvault
	try {
		backend.get(key, function (error, data) {

			if (error) {
				BlobObj.handleError(error);
				return false;
			}

			if (data) {
				callback(null, data);
			} else {
				BlobObj.handleError('Wallet not found (Username / Password is wrong)');
			}
		});
	} catch (error) {
		BlobObj.handleError(error);
	}
};


/**
 * Encode blob object data
 * @param username   - username
 * @param password   - password
 * @param blob       - blob
 * @returns {string} - encrypted blob data
 */
BlobObj.enc = function(username, password, blob) {
	var stored_keys = store.get('ripple_keys');
	var storedEncKey = stored_keys ? sjcl.decrypt(stored_keys.blob_key, stored_keys.blob_enc_key): null;
	var key = storedEncKey ? storedEncKey : '' + username.length + '|' + username + password;

	return btoa(sjcl.encrypt(key, JSON.stringify(blob.data), {
		iter: 1000,
		adata: JSON.stringify(blob.meta),
		ks: 256
	}));
};


/**
 * Update or set blob data
 * @param username - username
 * @param password - password
 * @param key      - blob key which would be updated
 * @param blob     - blob object
 * @param callback - callback function
 */
BlobObj.set = function(username, password, key, blob, callback) {
	// callback is optional
	if ('function' !== typeof callback) callback = function() {};

	var hash = username ? sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(username + password)) : key;
	var encData = BlobObj.enc(username, password, blob);

	VaultBlobBackend.set(hash, encData, callback);
};


/**
 * Decrypt blob data
 * @param username - username
 * @param password - password
 * @param data     - blob data
 * @returns {*}    - blob object with decrypted data
 */
BlobObj.decrypt = function (username, password, data) {
	/**
	 * Decrypt blob data
	 * @param priv
	 * @param ciphertext
	 * @returns {BlobObj}
	 */
	function decrypt(priv, ciphertext) {
		var blob = new BlobObj();
		blob.data = JSON.parse(sjcl.decrypt(priv, ciphertext));
		blob.meta = JSON.parse(decodeURIComponent(JSON.parse(ciphertext).adata));
		return blob;
	}

	try {
		var rippleKeys = store.get('ripple_keys');
		var storedEncKey = rippleKeys ? sjcl.decrypt(rippleKeys.blob_key, rippleKeys.blob_enc_key): null;
		var key = storedEncKey ? storedEncKey : '' + username.length + '|' + username + password;
		return decrypt(key, atob(data));
	} catch (e1) {
		console.log('Blob decryption failed with key: ', e1.toString());
		return false;
	}
};