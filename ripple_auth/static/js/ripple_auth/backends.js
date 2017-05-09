/**
 * Blob backend - vault
 * @type {{name: string, get: VaultBlobBackend.get, set: VaultBlobBackend.set}}
 */
var VaultBlobBackend = {
	name: 'Payward',

	get: function (key, callback) {
		var url = Options.blobvault;
		if (url.indexOf('://') === -1) url = 'http://' + url;

		$.ajax({
			url: url + '/' + key,
			timeout: 8000
		})
				.success(function (data) {
					callback(null, data);
				})
				.error(function () {
					callback('Failed to get blob', null);
				});
	},

	set: function (key, value, callback) {
		var url = Options.blobvault;
		if (url.indexOf('://') === -1) url = 'http://' + url;

		$.post(url + '/' + key, { blob: value })
				.success(function (data) {
					callback(null, data);
				})
				.error(function () {
					callback('Failed to set/update blob', null);
				});
	}
};
