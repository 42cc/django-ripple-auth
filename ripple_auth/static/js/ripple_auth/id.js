/**
 * Identity manager
 *
 * The id service is used for user identification and authorization.
 */
var Id = function () {};


// This object defines the minimum structure of the blob.
//
// This is used to ensure that the blob we get from the server has at least
// these fields and that they are of the right types.
Id.minimumBlob = {
	data: {
		contacts: [],
		preferred_issuer: {},
		preferred_second_issuer: {}
	},
	meta: []
};

// The default blob is the blob that a new user gets.
//
// Right now this is equal to the minimum blob, but we may define certain
// default values here in the future.
Id.defaultBlob = Id.minimumBlob;

/**
 * Reduce username to standardized form.
 *
 * Strips whitespace at beginning and end.
 */
Id.normalizeUsername = function (username) {
	username = '' + username;
	username = username.trim();
	return username;
};

/**
 * Reduce password to standardized form.
 *
 * Strips whitespace at beginning and end.
 */
Id.normalizePassword = function (password) {
	password = '' + password;
	password = password.trim();
	return password;
};


/**
 * ID init
 */
Id.prototype.init = function () {
	var self = this;

	// Initializing sjcl.random doesn't really belong here, but there is no other
	// good place for it yet.
	for (var i = 0; i < 8; i++) {
		sjcl.random.addEntropy(Math.random(), 32, 'Math.random()');
	}
};

/**
 * Actions after blob update
 */
Id.prototype.postBlobUpdate = function(blob) {
	var self = this;
	if (self.username && self.password) {
		BlobObj.set(
			self.username.toLowerCase(), self.password, null, blob, function() {}
		);
	}
};

/**
 * Set username to Id instance
 * @param username - username
 */
Id.prototype.setUsername = function (username) {
	this.username = username;
};

/**
 * Set password to Id instance
 * @param password - password
 */
Id.prototype.setPassword = function (password) {
	this.password = password;
};

/**
 * Save to local storage ripple keys
 * @param username - username
 * @param password - password
 */
Id.prototype.storeLogin = function (username, password) {
	if (!store.disabled) {
		if(!username && !password) {
				return
		}
		var blob_key = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(username + password));
		var	blob_enc_key = sjcl.encrypt(blob_key, '' + username.length + '|' + username + password);

		store.set('ripple_keys', {blob_key: blob_key, blob_enc_key: blob_enc_key});
	}
};

/**
 * Login into ripple
 * @param username - username
 * @param password - password
 * @param key      - key
 * @param callback - callback function
 */
Id.prototype.login = function (username, password, key, callback) {
	var self = this;

	// callback is optional
	if ('function' !== typeof callback) callback = function() {};
	self.init();

	username = username ? Id.normalizeUsername(username).toLowerCase() : username;
	password = Id.normalizePassword(password);

	BlobObj.get(username, password, key, function(err, data) {
		if (err) {
			callback(err);
			return;
		}

		var blob = BlobObj.decrypt(username.toLowerCase(), password, data);
		if (!blob) {
			// Unable to decrypt blob
			var msg = 'Unable to decrypt blob (Username / Password is wrong)';
			callback(new Error(msg));
			return;
		}

		// Ensure certain properties exist
		$.extend(true, blob, Id.minimumBlob);

		self.setUsername(username);
		self.setPassword(password);

		if (blob.data.account_id) {
			// Success
			callback(null, blob);
		} else {
			// Invalid blob
			callback(new Error('Blob format unrecognized!'), null);
		}
	});
};

/**
 * Logout from ripple
 */
Id.prototype.logout = function () {
	store.remove('ripple_keys');
};
