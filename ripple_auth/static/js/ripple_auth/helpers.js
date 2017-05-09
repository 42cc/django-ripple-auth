/**
 * Check if user is logged in ripple
 */
function isLoggedIn() {
	var blobKey = store.get('ripple_keys').blob_key;
	var blobEncKey = store.get('ripple_keys').blob_enc_key;

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