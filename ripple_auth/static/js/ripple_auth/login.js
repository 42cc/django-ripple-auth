/**
 * Login via ripple
 *
 * Handles login form submit
 */
$(document).ready(function() {
	/**
   * Initialize login
	 */
	function init() {
		window.loading = false;

		// hide loader
		var $loader = $(Options.loader);
		$loader.hide();
	}

	/**
	 * Log in ripple using username/password
	 * @param username - username
	 * @param password - password
	 */
	function login(username, password) {
		window.loading = true;
		toggleLoader();

		var id = new Id();
		id.login(username, password, null, function (err, blob) {
			window.loading = false;

			if (err) {
				showNotification('Login failed due to: ' + err.message);
				toggleLoader();
				return;
			}
			id.postBlobUpdate(blob);
			console.log('Successfully logged in ripple');
			window.Challenge.processChallenge(id, blob);
		});
	}

	function loginHandler() {
		init();
		var $loginForm = $(this).closest('form');

		var username = $loginForm.find('input[name="username"]').val();
		var password = $loginForm.find('input[name="password"]').val();

		login(username, password);
	}

	$(Options.login_btn).on('click', loginHandler);
});