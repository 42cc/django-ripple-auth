/**
 * Ripple Client Configuration
 *
 */
var Options = {
	// Local domain
	//
	// Which domain should ripple-client consider native?
	domain: 'app.p2pay.com',

	// Rippled to connect
	server: {
		trace: true,
		trusted: true,
		local_signing: true,

		servers: [
			{host: 's-west.ripple.com', port: 443, secure: true},
			{host: 's-east.ripple.com', port: 443, secure: true}
		],

		connection_offset: 0,
		allow_partial_history: false
	},

	// The blobvault URL
	blobvault: 'https://id.p2pay.com',
	historyApi: 'https://history.ripple.com:7443/v1',

	// Configure bridges
	bridge: {
		// Outbound bridges
		out: {
			// Bitcoin outbound bridge
			// bitcoin: 'snapswap.us'
			'bitcoin': 'btc2ripple.com'
		}
	},

	mixpanel: {
		'token': '',
		'track': false
	},

	// Number of ledgers ahead of the current ledger index where a tx is valid
	tx_last_ledger: 3,

	// Set max transaction fee for network in drops of XRP
	max_tx_network_fee: 200000,

	// Default gateway max trust amount under 'simplfied' view
	// ie when advanced_feature_switch is false in trust/gateway page
	gateway_max_limit: 1000000000,

	// Default threshold in XRPs for fee on RT to show higher load status
	low_load_threshold: 0.012,

  // Challenge related stuff
  challenge_process_url: '/process_challenge/',

  // After login options
  redirect_url: '/projects',

	// Selectors
	login_btn: '#ripple-login',
	loader: '#login-loader'
};