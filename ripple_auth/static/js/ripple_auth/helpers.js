/**
 * Check if user is logged in ripple
 */
function isLoggedIn() {
	var rippleKeys = store.get('ripple_keys');
	if (rippleKeys === 'undefined') {
		return false;
	}
	var blobKey = rippleKeys.blob_key;
	var blobEncKey = rippleKeys.blob_enc_key;
	return typeof blobKey !== 'undefined' && typeof blobEncKey !== 'undefined'
}


/**
 * Toggle loader visibility
 */
function toggleLoader() {
	var $loader = $(Options.loader);
	$loader.toggle();
}

/**
 * Show notification
 */
function showNotification(message) {
	Materialize.toast(message, 5000, 'small');
}