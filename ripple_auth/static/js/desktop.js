/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var types = __webpack_require__(1);

	// Load app modules
	__webpack_require__(3);
	__webpack_require__(12);
	__webpack_require__(14);
	__webpack_require__(15);
	__webpack_require__(17);
	__webpack_require__(18);
	__webpack_require__(19);
	__webpack_require__(20);
	__webpack_require__(21);
	__webpack_require__(22);
	__webpack_require__(23);
	__webpack_require__(24);
	__webpack_require__(26);
	__webpack_require__(27);
	__webpack_require__(28);
	__webpack_require__(29);
	__webpack_require__(31);
	__webpack_require__(32);
	__webpack_require__(33);
	__webpack_require__(34);
	__webpack_require__(35);
	__webpack_require__(36);
	__webpack_require__(37);
	__webpack_require__(38);
	__webpack_require__(39);

	// Angular module dependencies
	var appDependencies = [
	  'ng',
	  'ngRoute',
	  // Controllers
	  'app',
	  'status',
	  // Services
	  'id',
	  'tracker',
	  // Directives
	  'charts',
	  'effects',
	  'events',
	  'fields',
	  'formatters',
	  'directives',
	  'validators',
	  'datalinks',
	  'errors',
	  // Filters
	  'filters',
	  'zipzap',
	  'challenge'
	];

	// Load tabs
	var tabdefs = [
	  __webpack_require__(40),
	  __webpack_require__(42),
	  __webpack_require__(87),
	  __webpack_require__(88),
	  __webpack_require__(89),
	  __webpack_require__(90),
	  __webpack_require__(91),
	  __webpack_require__(92),
	  __webpack_require__(93),
	  __webpack_require__(94),
	  __webpack_require__(95),
	  __webpack_require__(96),
	  __webpack_require__(97),
	  __webpack_require__(98)
	];

	// Prepare tab modules
	var tabs = tabdefs.map(function (Tab) {
	  var tab = new Tab();

	  if (tab.angular) {
	    var module = angular.module(tab.tabName, tab.angularDeps);
	    tab.angular(module);
	    appDependencies.push(tab.tabName);
	  }

	  return tab;
	});

	var app = angular.module('rp', appDependencies);

	// Global reference for debugging only (!)
	var rippleclient = window.rippleclient = {};
	rippleclient.app = app;
	rippleclient.types = types;

	app.run(['$rootScope', '$injector', '$compile', '$route', '$routeParams', '$location', '$cookies',
	         function ($rootScope, $injector, $compile, $route, $routeParams, $location, $cookies)
	{
	  // Global reference for debugging only (!)
	  if ("object" === typeof rippleclient) {
	    rippleclient.$scope = $rootScope;
	    rippleclient.version = $rootScope.version =
	      angular.element('#version').text();
	  }

	  // Helper for detecting empty object enumerations
	  $rootScope.isEmpty = function (obj) {
	    return angular.equals({},obj);
	  };

	  // if url has a + or %2b then replace with %20 and redirect
	  if (_.isArray($location.$$absUrl.match(/%2B|\+/gi)))
	    window.location = $location.$$absUrl.replace(/%2B|\+/gi, '%20');


	  var scope = $rootScope;
	  $rootScope.$route = $route;
	  $rootScope.$routeParams = $routeParams;
	  $('#main').data('$scope', scope);

	  // If using the old "amnt" parameter rename it "amount"
	  var amnt = $location.search().amnt;
	  if (amnt) {
	    $location.search("amnt", null);
	    $location.search("amount", amnt);
	  }

	  // Once the app controller has been instantiated
	  // XXX ST: I think this should be an event instead of a watch
	  scope.$watch("app_loaded", function on_app_loaded(oldval, newval) {
	    $('nav a').click(function() {
	      if (location.hash == this.hash) {
	        scope.$apply(function () {
	          $route.reload();
	        });
	      }
	    });
	  });
	}]);

	// Some backwards compatibility
	if (!Options.blobvault) {
	  Options.blobvault = Options.BLOBVAULT_SERVER;
	}

	// Logout if ripple_auth cookie doesn't exists
	if(Options.requiredRippleAuth &&
	  Options.logoutRedirectUrl &&
	  !window.localStorage.getItem('ripple_auth') &&
	  Options.logoutExclude.indexOf(window.location.pathname) == -1){
	  window.location = Options.logoutRedirectUrl;
	}


	if ("function" === typeof angular.resumeBootstrap) angular.resumeBootstrap();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Base58Utils = __webpack_require__(2);

	var RippleAddress = (function () {
	  function append_int(a, i) {
	    return [].concat(a, i >> 24, (i >> 16) & 0xff, (i >> 8) & 0xff, i & 0xff)
	  }

	  function firstHalfOfSHA512(bytes) {
	    return sjcl.bitArray.bitSlice(
	      sjcl.hash.sha512.hash(sjcl.codec.bytes.toBits(bytes)),
	      0, 256
	    );
	  }

	  function SHA256_RIPEMD160(bits) {
	    return sjcl.hash.ripemd160.hash(sjcl.hash.sha256.hash(bits));
	  }

	  return function (seed) {
	    this.seed = Base58Utils.decode_base_check(33, seed);

	    if (!this.seed) {
	      throw "Invalid seed."
	    }

	    this.getAddress = function (seq) {
	      seq = seq || 0;

	      var private_gen, public_gen, i = 0;
	      do {
	        private_gen = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(this.seed, i)));
	        i++;
	      } while (!sjcl.ecc.curves.c256.r.greaterEquals(private_gen));

	      public_gen = sjcl.ecc.curves.c256.G.mult(private_gen);

	      var sec;
	      i = 0;
	      do {
	        sec = sjcl.bn.fromBits(firstHalfOfSHA512(append_int(append_int(public_gen.toBytesCompressed(), seq), i)));
	        i++;
	      } while (!sjcl.ecc.curves.c256.r.greaterEquals(sec));

	      var pubKey = sjcl.ecc.curves.c256.G.mult(sec).toJac().add(public_gen).toAffine();

	      return Base58Utils.encode_base_check(0, sjcl.codec.bytes.fromBits(SHA256_RIPEMD160(sjcl.codec.bytes.toBits(pubKey.toBytesCompressed()))));
	    };
	  };
	})();

	exports.RippleAddress = RippleAddress;



/***/ },
/* 2 */
/***/ function(module, exports) {

	
	var Base58Utils = (function () {
	  var alphabets = {
	    'ripple':  "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz",
	    'bitcoin': "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	  };

	  var SHA256  = function (bytes) {
	    return sjcl.codec.bytes.fromBits(sjcl.hash.sha256.hash(sjcl.codec.bytes.toBits(bytes)));
	  };

	  return {
	    // --> input: big-endian array of bytes.
	    // <-- string at least as long as input.
	    encode_base: function (input, alphabetName) {
	      var alphabet = alphabets[alphabetName || 'ripple'],
	          base     = new sjcl.bn(alphabet.length),
	          bi       = sjcl.bn.fromBits(sjcl.codec.bytes.toBits(input)),
	          buffer   = [];

	      while (bi.greaterEquals(base)) {
	        var mod = bi.mod(base);
	        buffer.push(alphabet[mod.limbs[0]]);
	        bi = bi.div(base);
	      }
	      buffer.push(alphabet[bi.limbs[0]]);

	      // Convert leading zeros too.
	      for (var i = 0; i != input.length && !input[i]; i += 1) {
	        buffer.push(alphabet[0]);
	      }

	      return buffer.reverse().join("");
	    },

	    // --> input: String
	    // <-- array of bytes or undefined.
	    decode_base: function (input, alphabetName) {
	      var alphabet = alphabets[alphabetName || 'ripple'],
	          base     = new sjcl.bn(alphabet.length),
	          bi       = new sjcl.bn(0);

	      var i;
	      while (i != input.length && input[i] === alphabet[0]) {
	        i += 1;
	      }

	      for (i = 0; i != input.length; i += 1) {
	        var v = alphabet.indexOf(input[i]);

	        if (v < 0) {
	          return null;
	        }

	        bi = bi.mul(base).addM(v);
	      }

	      var bytes = sjcl.codec.bytes.fromBits(bi.toBits()).reverse();

	      // Remove leading zeros
	      while(bytes[bytes.length-1] === 0) {
	        bytes.pop();
	      }

	      // Add the right number of leading zeros
	      for (i = 0; input[i] === alphabet[0]; i++) {
	        bytes.push(0);
	      }

	      bytes.reverse();

	      return bytes;
	    },

	    // --> input: Array
	    // <-- String
	    encode_base_check: function (version, input, alphabet) {
	      var buffer  = [].concat(version, input);
	      var check   = SHA256(SHA256(buffer)).slice(0, 4);
	      return Base58Utils.encode_base([].concat(buffer, check), alphabet);
	    },

	    // --> input : String
	    // <-- NaN || BigInteger
	    decode_base_check: function (version, input, alphabet) {
	      var buffer = Base58Utils.decode_base(input, alphabet);

	      if (!buffer || buffer[0] !== version || buffer.length < 5) {
	        return NaN;
	      }

	      var computed = SHA256(SHA256(buffer.slice(0, -4))).slice(0, 4),
	          checksum = buffer.slice(-4);

	      var i;
	      for (i = 0; i != 4; i += 1)
	        if (computed[i] !== checksum[i])
	          return NaN;

	      return buffer.slice(1, -4);
	    }
	  };
	})();

	module.exports = Base58Utils;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * APP
	 *
	 * The app controller manages the global scope.
	 */

	var util = __webpack_require__(4),
	    events = __webpack_require__(8),
	    rewriter = __webpack_require__(9),
	    Amount = ripple.Amount;

	var module = angular.module('app', []);

	module.controller('AppCtrl', ['$rootScope', '$compile', 'rpId', 'rpNetwork',
	                              function ($scope, $compile, $id, $net)
	{
	  reset();

	  var account;

	  // Global reference for debugging only (!)
	  if ("object" === typeof rippleclient) {
	    rippleclient.id = $id;
	    rippleclient.net = $net;
	  }

	  function reset()
	  {
	    $scope.account = {};
	    $scope.lines = {};
	    $scope.offers = {};
	    $scope.events = [];
	    $scope.history = [];
	    $scope.balances = {};
	    $scope.loadState = [];
	  }

	  var myHandleAccountEvent;
	  var myHandleAccountEntry;

	  function handleAccountLoad(e, data)
	  {
	    var remote = $net.remote;

	    account = data.account;

	    reset();

	    remote.set_secret(data.account, data.secret);

	    var accountObj = remote.account(data.account);

	    // We need a reference to these functions after they're bound, so we can
	    // unregister them if the account is unloaded.
	    myHandleAccountEvent = handleAccountEvent;
	    myHandleAccountEntry = handleAccountEntry;

	    accountObj.on('transaction', myHandleAccountEvent);
	    accountObj.on('entry', function(data){
	      $scope.$apply(function () {
	        myHandleAccountEntry(data);
	      });
	    });

	    accountObj.entry(function (err, entry) {
	      if (err) {
	        $scope.loadState['account'] = true;
	      }
	    });

	    // Ripple credit lines
	    remote.request_account_lines(data.account)
	      .on('success', handleRippleLines)
	      .on('error', handleRippleLinesError).request();

	    // Transactions
	    remote.request_account_tx({
	      'account': data.account,
	      'ledger_index_min': -1,
	      'descending': true,
	      'limit': Options.transactions_per_page,
	      'count': true
	    })
	      .on('success', handleAccountTx)
	      .on('error', handleAccountTxError).request();

	    // Outstanding offers
	    remote.request_account_offers(data.account)
	      .on('success', handleOffers)
	      .on('error', handleOffersError).request();
	  }

	  function handleAccountUnload(e, data)
	  {
	    var remote = $net.remote;
	    var accountObj = remote.account(data.account);
	    accountObj.removeListener('transaction', myHandleAccountEvent);
	    accountObj.removeListener('entry', myHandleAccountEntry);
	  }

	  function handleRippleLines(data)
	  {
	    $scope.$apply(function () {
	      $scope.lines = {};

	      for (var n=0, l=data.lines.length; n<l; n++) {
	        var line = data.lines[n];

	        // XXX: This reinterpretation of the server response should be in the
	        //      library upstream.
	        line = $.extend({}, line, {
	          limit: ripple.Amount.from_json({value: line.limit, currency: line.currency, issuer: line.account}),
	          limit_peer: ripple.Amount.from_json({value: line.limit_peer, currency: line.currency, issuer: account}),
	          balance: ripple.Amount.from_json({value: line.balance, currency: line.currency, issuer: account})
	        });

	        $scope.lines[line.account+line.currency] = line;
	        updateRippleBalance(line.currency, line.account, line.balance);
	      }
	      console.log('lines updated:', $scope.lines);

	      $scope.loadState['lines'] = true;
	    });
	  }

	  function handleRippleLinesError(data)
	  {
	    $scope.$apply(function () {
	      $scope.loadState['lines'] = true;
	    });
	  }

	  function handleOffers(data)
	  {
	    $scope.$apply(function () {
	      data.offers.forEach(function (offerData) {
	        var offer = {
	          seq: +offerData.seq,
	          gets: ripple.Amount.from_json(offerData.taker_gets),
	          pays: ripple.Amount.from_json(offerData.taker_pays),
	          flags: offerData.flags
	        };

	        updateOffer(offer);
	      });
	      console.log('offers updated:', $scope.offers);

	      $scope.loadState['offers'] = true;
	    });
	  }

	  function handleOffersError(data)
	  {
	    $scope.$apply(function () {
	      $scope.loadState['offers'] = true;
	    });
	  }

	  function handleAccountEntry(data)
	  {
	    var remote = $net.remote;
	    $scope.account = data;

	    // XXX Shouldn't be using private methods
	    var server = remote._getServer();

	    // As per json wire format convention, real ledger entries are CamelCase,
	    // e.g. OwnerCount, additional convenience fields are lower case, e.g.
	    // reserve, max_spend.
	    var ownerCount  = $scope.account.OwnerCount || 0;
	    $scope.account.reserve_base = server.reserve(0);
	    $scope.account.reserve = server.reserve(ownerCount);
	    $scope.account.reserve_to_add_trust = server.reserve(ownerCount+1);
	    $scope.account.reserve_low_balance = $scope.account.reserve.product_human(2);

	    // Maximum amount user can spend
	    var bal = Amount.from_json(data.Balance);
	    $scope.account.max_spend = bal.subtract($scope.account.reserve);

	    $scope.loadState['account'] = true;
	  }

	  function handleAccountTx(data)
	  {
	    $scope.$apply(function () {
	      $scope.history_count = data.count;
	      $scope.tx_marker = data.marker;

	      if (data.transactions) {
	        data.transactions.reverse().forEach(function (e) {
	          processTxn(e.tx, e.meta, true);
	        });
	      }

	      $scope.loadState['transactions'] = true;
	    });
	  }
	  function handleAccountTxError(data)
	  {
	    $scope.$apply(function () {
	      $scope.loadState['transactions'] = true;
	    });
	  }

	  function handleAccountEvent(e)
	  {
	    $scope.$apply(function () {
	      processTxn(e.transaction, e.meta);
	    });
	  }

	  /**
	   * Process a transaction and add it to the history table.
	   */
	  function processTxn(tx, meta, is_historic)
	  {
	    var processedTxn = rewriter.processTxn(tx, meta, account);

	    if (processedTxn) {
	      var transaction = processedTxn.transaction;

	      // Update account
	      if (processedTxn.accountRoot) {
	        handleAccountEntry(processedTxn.accountRoot);
	      }

	      // Show status notification
	      if (processedTxn.tx_result === "tesSUCCESS" &&
	          transaction &&
	          !is_historic) {
	        $scope.$broadcast('$appTxNotification', transaction);
	      }

	      // Add to recent notifications
	      if (processedTxn.tx_result === "tesSUCCESS") {
	        $scope.events.unshift(processedTxn);
	      }

	      // Add to history
	      $scope.history.unshift(processedTxn);

	      // Update Ripple lines
	      if (processedTxn.effects && !is_historic) {
	        updateLines(processedTxn.effects);
	      }

	      // Update my offers
	      if (processedTxn.effects && !is_historic) {
	        // Iterate on each effect to find offers
	        processedTxn.effects.forEach(function (effect) {
	          // Only these types are offers
	          if (_.contains([
	            'offer_created',
	            'offer_funded',
	            'offer_partially_funded',
	            'offer_cancelled'], effect.type))
	          {
	            var offer = {
	              seq: +effect.seq,
	              gets: effect.gets,
	              pays: effect.pays,
	              deleted: effect.deleted,
	              flags: effect.flags
	            };

	            updateOffer(offer);
	          }
	        });
	      }
	    }
	  }

	  function updateOffer(offer)
	  {
	    if (offer.flags && offer.flags === ripple.Remote.flags.offer.Sell) {
	      offer.type = 'sell';
	      offer.first = offer.gets;
	      offer.second = offer.pays;
	    } else {
	      offer.type = 'buy';
	      offer.first = offer.pays;
	      offer.second = offer.gets;
	    }

	    if (!offer.deleted) {
	      $scope.offers[""+offer.seq] = offer;
	    } else {
	      delete $scope.offers[""+offer.seq];
	    }
	  }

	  function updateLines(effects)
	  {
	    if (!$.isArray(effects)) return;

	    $.each(effects, function () {
	      if (_.contains([
	        'trust_create_local',
	        'trust_create_remote',
	        'trust_change_local',
	        'trust_change_remote',
	        'trust_change_balance',
	        'trust_change_no_ripple'], this.type))
	      {
	        var effect = this,
	            line = {},
	            index = effect.counterparty + effect.currency;

	        line.currency = effect.currency;
	        line.account = effect.counterparty;
	        line.flags = effect.flags;
	        line.no_ripple = effect.noRipple;

	        if (effect.balance) {
	          line.balance = effect.balance;
	          updateRippleBalance(effect.currency,
	                                    effect.counterparty,
	                                    effect.balance);
	        }

	        if (effect.deleted) {
	          delete $scope.lines[index];
	          return;
	        }

	        if (effect.limit) {
	          line.limit = effect.limit;
	        }

	        if (effect.limit_peer) {
	          line.limit_peer = effect.limit_peer;
	        }

	        $scope.lines[index] = $.extend($scope.lines[index], line);
	      }
	    });
	  }

	  function updateRippleBalance(currency, new_account, new_balance)
	  {
	    // Ensure the balances entry exists first
	    if (!$scope.balances[currency]) {
	      $scope.balances[currency] = {components: {}, total: null};
	    }

	    var balance = $scope.balances[currency];

	    if (new_account) {
	      balance.components[new_account] = new_balance;
	    }

	    $(balance.components).sort(function(a,b){
	      return a.compareTo(b);
	    });

	    balance.total = null;
	    for (var counterparty in balance.components) {
	      var amount = balance.components[counterparty];
	      balance.total = balance.total ? balance.total.add(amount) : amount;
	    }
	  }

	  $scope.currencies_all = __webpack_require__(11);

	  $.extend(true,
	    $scope.currencies_all,
	    store.get('ripple_currencies_all') || {}
	  );

	  // Personalized default pair set
	  if (!store.disabled && !store.get('ripple_pairs_all')) {
	    store.set('ripple_pairs_all',__webpack_require__(10));
	  }

	  $scope.pairs_all = store.get('ripple_pairs_all')
	    ? store.get('ripple_pairs_all')
	    : __webpack_require__(10);

	  function compare(a, b) {
	    if (a.order < b.order) return 1;
	    if (a.order > b.order) return -1;
	    return 0;
	  }

	  // sort currencies and pairs by order
	  $scope.currencies_all.sort(compare);
	  $scope.pairs_all.sort(compare);

	  $scope.$watch('currencies_all', function(){
	    if (!store.disabled) {
	      store.set('ripple_currencies_all',$scope.currencies_all);
	    }
	  }, true);

	  $scope.$watch('pairs_all', function(){
	    if (!store.disabled) {
	      store.set('ripple_pairs_all',$scope.pairs_all);
	    }
	  }, true);

	  $scope.pairs = $scope.pairs_all.slice(1);

	  $scope.app_loaded = true;

	  // Moved this to the run block
	  // Nav links same page click fix
	  // $('nav a').click(function(){
	  //   if (location.hash == this.hash) {
	  //     location.href="#/";
	  //     location.href=this.href;
	  //   }
	  // });

	  $scope.$on('$idAccountLoad', function (e, data) {
	    // Server is connected
	    if ($scope.connected) {
	      handleAccountLoad(e, data);
	    }

	    // Server is not connected yet. Handle account load after server response.
	    $scope.$on('$netConnected', function(){
	      if ($.isEmptyObject($scope.account)) {
	        handleAccountLoad(e, data);
	      }
	    });
	  });

	  $scope.$on('$idAccountUnload', handleAccountUnload);

	  // XXX: The app also needs to handle updating its data when the connection is
	  //      lost and later re-established. (... or will the Ripple lib do that for us?)
	  var removeFirstConnectionListener =
	        $scope.$on('$netConnected', handleFirstConnection);
	  function handleFirstConnection() {
	    removeFirstConnectionListener();
	  }

	  $net.listenId($id);
	  $net.init();
	  $id.init();

	  // Testing hooks

	  this.reset                  =  reset;
	  this.handleAccountLoad      =  handleAccountLoad;
	  this.handleAccountUnload    =  handleAccountUnload;
	  this.handleRippleLines      =  handleRippleLines;
	  this.handleRippleLinesError =  handleRippleLinesError;
	  this.handleOffers           =  handleOffers;
	  this.handleOffersError      =  handleOffersError;
	  this.handleAccountEntry     =  handleAccountEntry;
	  this.handleAccountTx        =  handleAccountTx;
	  this.handleAccountTxError   =  handleAccountTxError;
	  this.handleAccountEvent     =  handleAccountEvent;
	  this.processTxn             =  processTxn;
	  this.updateOffer            =  updateOffer;
	  this.updateLines            =  updateLines;
	  this.updateRippleBalance    =  updateRippleBalance;
	  this.compare                =  compare;
	  this.handleFirstConnection  =  handleFirstConnection;
	}]);


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(6);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(7);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(5)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var pairs = __webpack_require__(10);

	/**
	 * Calculate executed order price
	 *
	 * @param effect
	 * @returns {*}
	 */
	var getPrice = function(effect){
	  var g = effect.got ? effect.got : effect.gets;
	  var p = effect.paid ? effect.paid : effect.pays;
	  var price;

	  _.find(pairs, function(pair){
	    if (pair.name == g.currency().to_human() + '/' + p.currency().to_human()) {
	      price = p.ratio_human(g);
	    }
	  });

	  if (!price) {
	    price = g.ratio_human(p)
	  }

	  return price;
	};

	/**
	 * Determine if the transaction is a "rippling" transaction based on effects
	 *
	 * @param effects
	 */
	var isRippling = function(effects){
	  if (
	    effects
	    && effects.length
	    && 2 === effects.length
	    && 'trust_change_balance' == effects[0].type
	    && 'trust_change_balance' == effects[1].type
	    && effects[0].currency == effects[1].currency
	    && !effects[0].amount.compareTo(effects[1].amount.negate())
	  ) {
	    return true;
	  }
	};

	/**
	 * Simple static class for processing server-side JSON.
	 */
	var JsonRewriter = module.exports = {
	  /**
	   * Filter affected nodes by type.
	   *
	   * If affectedNodes is not a valid set of nodes, returns an empty array.
	   */
	  filterAnodes: function (affectedNodes, type) {
	    if (!affectedNodes) return [];

	    return affectedNodes.filter(function (an) {
	      an = an.CreatedNode ? an.CreatedNode :
	          an.ModifiedNode ? an.ModifiedNode :
	          {};

	      return an.LedgerEntryType === type;
	    });
	  },

	  /**
	   * Returns resulting (new or modified) fields from an affected node.
	   */
	  getAnodeResult: function (an) {
	    an = an.CreatedNode ? an.CreatedNode :
	        an.ModifiedNode ? an.ModifiedNode :
	        {};

	    var fields = $.extend({}, an.NewFields, an.FinalFields);

	    return fields;
	  },

	  /**
	   * Takes a metadata affected node and returns a simpler JSON object.
	   *
	   * The resulting object looks like this:
	   *
	   *   {
	   *     // Type of diff, e.g. CreatedNode, ModifiedNode
	   *     diffType: 'CreatedNode'
	   *
	   *     // Type of node affected, e.g. RippleState, AccountRoot
	   *     entryType: 'RippleState',
	   *
	   *     // Index of the ledger this change occurred in
	   *     ledgerIndex: '01AB01AB...',
	   *
	   *     // Contains all fields with later versions taking precedence
	   *     //
	   *     // This is a shorthand for doing things like checking which account
	   *     // this affected without having to check the diffType.
	   *     fields: {...},
	   *
	   *     // Old fields (before the change)
	   *     fieldsPrev: {...},
	   *
	   *     // New fields (that have been added)
	   *     fieldsNew: {...},
	   *
	   *     // Changed fields
	   *     fieldsFinal: {...}
	   *   }
	   */
	  processAnode: function (an) {
	    var result = {};

	    ["CreatedNode", "ModifiedNode", "DeletedNode"].forEach(function (x) {
	      if (an[x]) result.diffType = x;
	    });

	    if (!result.diffType) return null;

	    an = an[result.diffType];

	    result.entryType = an.LedgerEntryType;
	    result.ledgerIndex = an.LedgerIndex;

	    result.fields = $.extend({}, an.PreviousFields, an.NewFields, an.FinalFields);
	    result.fieldsPrev = an.PreviousFields || {};
	    result.fieldsNew = an.NewFields || {};
	    result.fieldsFinal = an.FinalFields || {};

	    return result;
	  },

	  /**
	   * Convert transactions into a more useful (for our purposes) format.
	   *
	   * The main operation this function performs is to change the view on the
	   * transaction from a neutral view to a subjective view specific to our
	   * account.
	   *
	   * For example, rather than having a sender and receiver, the transaction has
	   * a counterparty and a flag whether it is incoming or outgoing.
	   *
	   * processTxn returns main purpose of transaction and side effects.
	   *
	   * Main purpose
	   *  Real transaction names
	   *  - Payment (sent/received/convert)
	   *  - TrustSet (trusting/trusted)
	   *  - OfferCreate (offernew)
	   *  - OfferCancel (offercancel)
	   *
	   *  Virtual transaction names
	   *  - Failed
	   *  - Rippling
	   *
	   * Side effects
	   *  - balance_change
	   *  - Trust (trust_create_local, trust_create_remote, trust_change_local,
	   *          trust_change_remote, trust_change_balance, trust_change_no_ripple)
	   *  - Offer (offer_created, offer_funded, offer_partially_funded,
	   *          offer_cancelled, offer_bought)
	   */
	  processTxn: function (tx, meta, account) {
	    var obj = {};

	    // Currency balances that have been affected by the transaction
	    var affected_currencies = [];

	    // Main transaction
	    if (tx.Account === account
	        || (tx.Destination && tx.Destination === account)
	        || (tx.LimitAmount && tx.LimitAmount.issuer === account)) {

	      var transaction = {};

	      if ('tesSUCCESS' === meta.TransactionResult) {
	        switch (tx.TransactionType) {
	          case 'Payment':
	            var amount = ripple.Amount.from_json(tx.Amount);

	            if (tx.Account === account) {
	              if (tx.Destination === account) {
	                transaction.type = 'convert';
	                transaction.spent = ripple.Amount.from_json(tx.SendMax);
	              }
	              else {
	                transaction.type = 'sent';
	                transaction.counterparty = tx.Destination;
	              }
	            }
	            else {
	              transaction.type = 'received';
	              transaction.counterparty = tx.Account;
	            }

	            transaction.amount = amount;
	            transaction.currency = amount.currency().to_json();
	            break;

	          case 'TrustSet':
	            transaction.type = tx.Account === account ? 'trusting' : 'trusted';
	            transaction.counterparty = tx.Account === account ? tx.LimitAmount.issuer : tx.Account;
	            transaction.amount = ripple.Amount.from_json(tx.LimitAmount);
	            transaction.currency = tx.LimitAmount.currency;
	            break;

	          case 'OfferCreate':
	            transaction.type = 'offernew';
	            transaction.pays = ripple.Amount.from_json(tx.TakerPays);
	            transaction.gets = ripple.Amount.from_json(tx.TakerGets);
	            transaction.sell = tx.Flags & ripple.Transaction.flags.OfferCreate.Sell;
	            break;

	          case 'OfferCancel':
	            transaction.type = 'offercancel';
	            break;

	          case 'AccountSet':
	            // Ignore empty accountset transactions. (Used to sync sequence numbers)
	            if (meta.AffectedNodes.length === 1 && _.size(meta.AffectedNodes[0].ModifiedNode.PreviousFields) === 2)
	              break;

	            transaction.type = 'accountset';
	            break;

	          default:
	            console.log('Unknown transaction type: "'+tx.TransactionType+'"', tx);
	        }

	        if (tx.Flags) {
	          transaction.flags = tx.Flags;
	        }
	      } else {
	        transaction.type = 'failed';
	      }

	      if (!$.isEmptyObject(transaction)) {
	        obj.transaction = transaction;
	      }
	    }

	    // Side effects
	    if ('tesSUCCESS' === meta.TransactionResult) {
	      meta.AffectedNodes.forEach(function (n) {
	        var node = JsonRewriter.processAnode(n);
	        var feeEff;
	        var effect = {};

	        // AccountRoot - Current account node
	        if (node.entryType === "AccountRoot" && node.fields.Account === account) {
	          obj.accountRoot = node.fields;

	          if (node.fieldsPrev.Balance) {
	            var balance = ripple.Amount.from_json(node.fields.Balance);

	            // Fee
	            if(tx.Account === account && tx.Fee) {
	              feeEff = {
	                type: "fee",
	                amount: ripple.Amount.from_json(tx.Fee).negate(),
	                balance: balance
	              };
	            }

	            // Updated XRP Balance
	            if (tx.Fee != node.fieldsPrev.Balance - node.fields.Balance) {
	              if (feeEff)
	                balance = balance.subtract(feeEff.amount);

	              effect.type = "balance_change";
	              effect.amount = balance.subtract(node.fieldsPrev.Balance);
	              effect.balance = balance;

	              // balance_changer is set to true if the transaction / effect has changed one of the account balances
	              obj.balance_changer = effect.balance_changer = true;
	              affected_currencies.push('XRP');
	            }
	          }
	        }

	        // RippleState - Ripple Lines
	        if (node.entryType === "RippleState"
	            && (node.fields.HighLimit.issuer === account || node.fields.LowLimit.issuer === account)) {

	          var high = node.fields.HighLimit;
	          var low = node.fields.LowLimit;

	          var which = high.issuer === account ? 'HighNoRipple' : 'LowNoRipple';

	          // New trust line
	          if (node.diffType === "CreatedNode") {
	            effect.limit = ripple.Amount.from_json(high.value > 0 ? high : low);
	            effect.limit_peer = ripple.Amount.from_json(high.value > 0 ? low : high);

	            if ((high.value > 0 && high.issuer === account)
	                || (low.value > 0 && low.issuer === account)) {
	              effect.type = "trust_create_local";
	            } else {
	              effect.type = "trust_create_remote";
	            }
	          }

	          // Modified trust line
	          else if (node.diffType === "ModifiedNode" || node.diffType === "DeletedNode") {
	            var highPrev = node.fieldsPrev.HighLimit;
	            var lowPrev = node.fieldsPrev.LowLimit;

	            // Trust Balance change
	            if (node.fieldsPrev.Balance) {
	              effect.type = "trust_change_balance";

	              var issuer =  node.fields.Balance.value > 0 || node.fieldsPrev.Balance.value > 0
	                  ? high.issuer : low.issuer;

	              effect.amount = high.issuer === account
	                  ? effect.amount = ripple.Amount.from_json(
	                  node.fieldsPrev.Balance.value
	                      + "/" + node.fieldsPrev.Balance.currency
	                      + "/" + issuer).subtract(node.fields.Balance)
	                  : effect.amount = ripple.Amount.from_json(
	                  node.fields.Balance.value
	                      + "/" + node.fields.Balance.currency
	                      + "/" + issuer).subtract(node.fieldsPrev.Balance);

	              obj.balance_changer = effect.balance_changer = true;
	              affected_currencies.push(high.currency.toUpperCase());
	            }

	            // Trust Limit change
	            else if (highPrev || lowPrev) {
	              if (high.issuer === account) {
	                effect.limit = ripple.Amount.from_json(high);
	                effect.limit_peer = ripple.Amount.from_json(low);
	              } else {
	                effect.limit = ripple.Amount.from_json(low);
	                effect.limit_peer = ripple.Amount.from_json(high);
	              }

	              if (highPrev) {
	                effect.prevLimit = ripple.Amount.from_json(highPrev);
	                effect.type = high.issuer === account ? "trust_change_local" : "trust_change_remote";
	              }
	              else if (lowPrev) {
	                effect.prevLimit = ripple.Amount.from_json(lowPrev);
	                effect.type = high.issuer === account ? "trust_change_remote" : "trust_change_local";
	              }
	            }

	            // Trust flag change (effect gets this type only if nothing else but flags has been changed)
	            else if (node.fieldsPrev.Flags) {
	              // Account set a noRipple flag
	              if (node.fields.Flags & ripple.Remote.flags.state[which] &&
	                  !(node.fieldsPrev.Flags & ripple.Remote.flags.state[which])) {
	                effect.type = "trust_change_no_ripple";
	              }

	              // Account removed the noRipple flag
	              else if (node.fieldsPrev.Flags & ripple.Remote.flags.state[which] &&
	                  !(node.fields.Flags & ripple.Remote.flags.state[which])) {
	                effect.type = "trust_change_no_ripple";
	              }

	              if (effect.type)
	                effect.flags = node.fields.Flags;
	            }
	          }

	          if (!$.isEmptyObject(effect)) {
	            effect.counterparty = high.issuer === account ? low.issuer : high.issuer;
	            effect.currency = high.currency;
	            effect.balance = high.issuer === account
	                ? ripple.Amount.from_json(node.fields.Balance).negate(true)
	                : ripple.Amount.from_json(node.fields.Balance);

	            if (obj.transaction && obj.transaction.type === "trust_change_balance") {
	              obj.transaction.balance = effect.balance;
	            }

	            // noRipple flag
	            if (node.fields.Flags & ripple.Remote.flags.state[which]) {
	              effect.noRipple = true;
	            }
	          }
	        }

	        // Offer
	        else if (node.entryType === "Offer") {

	          // For new and cancelled offers we use "fields"
	          var fieldSet = node.fields;

	          // Current account offer
	          if (node.fields.Account === account) {

	            // Partially funded offer [and deleted.. no more funds]
	            /* Offer has been partially funded and deleted (because of the luck of funds)
	             if the node is deleted and the TakerGets/TakerPays field has been changed */
	            if (node.diffType === "ModifiedNode" ||
	                (node.diffType === "DeletedNode"
	                    && node.fieldsPrev.TakerGets
	                    && !ripple.Amount.from_json(node.fieldsFinal.TakerGets).is_zero())) {
	              effect.type = 'offer_partially_funded';

	              if (node.diffType !== "DeletedNode") {
	                effect.remaining = ripple.Amount.from_json(node.fields.TakerGets);
	              }
	              else {
	                effect.cancelled = true;
	              }
	            }
	            else {
	              // New / Funded / Cancelled offer
	              effect.type = node.diffType === "CreatedNode"
	                  ? 'offer_created'
	                  : node.fieldsPrev.TakerPays
	                  ? 'offer_funded'
	                  : 'offer_cancelled';

	              // For funded offers we use "fieldsPrev".
	              if (effect.type === 'offer_funded')
	                fieldSet = node.fieldsPrev;

	              // We don't count cancelling an offer as a side effect if it's
	              // already the primary effect of the transaction.
	              if (effect.type === 'offer_cancelled' &&
	                  obj.transaction &&
	                  obj.transaction.type === "offercancel") {

	                // Fill in remaining information about offer
	                obj.transaction.gets = fieldSet.TakerGets;
	                obj.transaction.pays = fieldSet.TakerPays;
	              }
	            }

	            effect.seq = +node.fields.Sequence;
	          }

	          // Another account offer. We care about it only if our transaction changed the offer amount (we bought currency)
	          else if(tx.Account === account && !$.isEmptyObject(node.fieldsPrev) /* Offer is unfunded if node.fieldsPrev is empty */) {
	            effect.type = 'offer_bought';
	          }

	          if (effect.type) {
	            effect.gets = ripple.Amount.from_json(fieldSet.TakerGets);
	            effect.pays = ripple.Amount.from_json(fieldSet.TakerPays);

	            if ('offer_partially_funded' === effect.type || 'offer_bought' === effect.type) {
	              effect.got = ripple.Amount.from_json(node.fieldsPrev.TakerGets).subtract(node.fields.TakerGets);
	              effect.paid = ripple.Amount.from_json(node.fieldsPrev.TakerPays).subtract(node.fields.TakerPays);
	            }
	          }

	          if (effect.gets && effect.pays) {
	            effect.price = getPrice(effect);
	          }

	          // Flags
	          if (node.fields.Flags) {
	            effect.flags = node.fields.Flags;
	            effect.sell = node.fields.Flags & ripple.Remote.flags.offer.Sell;
	          }
	        }

	        if (!$.isEmptyObject(effect)) {
	          if (node.diffType === "DeletedNode") {
	            effect.deleted = true;
	          }

	          if (!obj.effects) obj.effects = [];
	          obj.effects.push(effect);
	        }

	        // Fee effect
	        if (feeEff) {
	          if (!obj.effects) obj.effects = [];
	          obj.effects.push(feeEff);
	        }
	      });
	    }

	    // Balance after the transaction
	    if (obj.accountRoot && obj.transaction && "undefined" === typeof obj.transaction.balance) {
	      obj.transaction.balance = ripple.Amount.from_json(obj.accountRoot.Balance);
	    }

	    if ($.isEmptyObject(obj))
	      return;

	    // If the transaction didn't wind up cancelling an offer
	    if (tx.TransactionType === 'OfferCancel' && obj.transaction &&
	      (!obj.transaction.gets || !obj.transaction.pays)) {
	      return;
	    }

	    // Rippling transaction
	    if (isRippling(obj.effects)) {
	      if (!obj.transaction) {
	        obj.transaction = {};
	      }
	      obj.transaction.type = 'rippling';
	    }

	    obj.tx_type = tx.TransactionType;
	    obj.tx_result = meta.TransactionResult;
	    obj.fee = tx.Fee;
	    obj.date = (tx.date + 0x386D4380) * 1000;
	    obj.hash = tx.hash;
	    obj.affected_currencies = affected_currencies ? affected_currencies : [];
	    obj.ledger_index = tx.ledger_index;

	    return obj;
	  }
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Ripple trading default currency pairs.
	 *
	 * This list is a bit arbitrary, but it's basically the Majors [1] from forex
	 * trading with some XRP pairs added.
	 *
	 * [1] http://en.wikipedia.org/wiki/Currency_pair#The_Majors
	 */
	module.exports = [
	  {name: 'BTC/XRP', order: 1},
	  {name: 'XRP/USD', order: 1},
	  {name: 'XRP/EUR', order: 1},
	  {name: 'XRP/JPY', order: 0},
	  {name: 'XRP/GBP', order: 0},
	  {name: 'XRP/AUD', order: 0},
	  {name: 'XRP/CHF', order: 0},
	  {name: 'XRP/CAD', order: 0},
	  {name: 'XRP/CNY', order: 0},
	  {name: 'BTC/USD', order: 0},
	  {name: 'BTC/EUR', order: 0},
	  {name: 'EUR/USD', order: 0},
	  {name: 'USD/JPY', order: 0},
	  {name: 'GBP/USD', order: 0},
	  {name: 'AUD/USD', order: 0},
	  {name: 'USD/CHF', order: 0}
	];


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Ripple default external currency list.
	 *
	 * These currencies are ranked by value of notes in circulation. Source:
	 *
	 * * http://goldnews.bullionvault.com/all_the_money_in_the_world_102720093
	 *   (A better source is welcome. Note: The US dollar was moved to the top.)
	 *
	 * Important: XRP must be the first entry in this list.
	 */
	module.exports = [
	  {value: 'XRP', name: 'XRP - Ripples', order: 5},
	  {value: 'USD', name: 'USD - US Dollar', order: 4},
	  {value: 'EUR', name: 'EUR - Euro', order: 3},
	  {value: 'BTC', name: 'BTC - Bitcoin', order: 2},
	  {value: 'LTC', name: 'LTC - Litecoin', order: 1},
	  {value: 'JPY', name: 'JPY - Japanese Yen', order: 0},
	  {value: 'CNY', name: 'CNY - Chinese Yuan', order: 0},
	  {value: 'INR', name: 'INR - Indian Rupee', order: 0},
	  {value: 'RUB', name: 'RUB - Russian Ruble', order: 0},
	  {value: 'GBP', name: 'GBP - British Pound', order: 0},
	  {value: 'CAD', name: 'CAD - Canadian Dollar', order: 0},
	  {value: 'BRL', name: 'BRL - Brazilian Real', order: 0},
	  {value: 'CHF', name: 'CHF - Swiss Franc', order: 0},
	  {value: 'DKK', name: 'DKK - Danish Krone', order: 0},
	  {value: 'NOK', name: 'NOK - Norwegian Krone', order: 0},
	  {value: 'SEK', name: 'SEK - Swedish Krona', order: 0},
	  {value: 'CZK', name: 'CZK - Czech Koruna', order: 0},
	  {value: 'PLN', name: 'PLN - Polish Zloty', order: 0},
	  {value: 'AUD', name: 'AUD - Australian Dollar', order: 0},
	  {value: 'MXN', name: 'MXN - Mexican Peso', order: 0},
	  {value: 'KRW', name: 'KRW - South Korean Won', order: 0},
	  {value: 'TWD', name: 'TWD - New Taiwan Dollar', order: 0},
	  {value: 'HKD', name: 'HKD - Hong Kong Dollar', order: 0},
	  {value: 'KES', name: 'KES - Kenyan Shilling', order: 0},
	  {value: 'AMD', name: 'AMD - Armenian Drams', order: 0},
	  {value: 'RUR', name: 'RUR - Russian Rubles', order: 0}
	];


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {/**
	 * STATUS
	 *
	 * The status controller manages the user box in the top right.
	 */

	var Amount = ripple.Amount;

	var module = angular.module('status', []);

	module.controller('StatusCtrl', ['$scope', '$element', '$compile', 'rpId',
	                                 function ($scope, el, $compile, $id)
	{
	  var queue = [];
	  var tickInterval = 4000;
	  var tickUpcoming = false;

	  // Activate #status panel
	  $scope.toggle_secondary = function () {
	    $scope.show_secondary = !$scope.show_secondary;
	  };

	  $scope.$watch('balances', function () {
	    $scope.orderedBalances = _.filter($scope.balances, function (balance) {
	      // XXX Maybe we should show zero balances if there is outgoing trust in
	      //     that currency.
	      return !balance.total.is_zero();
	    });
	    $scope.orderedBalances.sort(function(a,b){
	      return parseFloat(Math.abs(b.total.to_text())) - parseFloat(Math.abs(a.total.to_text()));
	    });

	    $scope.balance_count = $scope.orderedBalances.length;
	  }, true);

	  // Username
	  $scope.$watch('userCredentials', function(){
	    var username = $scope.userCredentials.username;
	    $scope.shortUsername = null;
	    if(username && username.length > 25) {
	      $scope.shortUsername = username.substring(0,24)+"...";
	    }
	  }, true);

	  $scope.logout = function () {
	    // logout() assumes that we are outside of an Angular $apply(), so we need
	    // to make sure that's actually the case otherwise we may get a
	    // "Error: $apply already in progress"
	    // XXX: Find out if there is a recommended/better way of doing this.
	    setImmediate(function () {
	      $id.logout();
	    });
	  };

	  $scope.$on('$netConnected', function (e) {
	    setConnectionStatus(true);
	  });

	  $scope.$on('$netDisconnected', function (e) {
	    setConnectionStatus(false);
	  });

	  /**
	   * Graphically display a network-related notifications.
	   *
	   * This function does no filtering - we assume that any transaction that makes
	   * it here is ready to be rendered by the notification area.
	   *
	   * @param {Object} e Angular event object
	   * @param {Object} tx Transaction info, returned from JsonRewriter#processTxn
	   */
	  $scope.$on('$appTxNotification', function (e, tx) {
	    var $localScope = $scope.$new();
	    $localScope.tx = tx;

	    var html = tplAccount($localScope);

	    if (html.length) {
	      var msg = $compile(html)($localScope);
	      enqueue(msg);
	    }
	  });

	  function setConnectionStatus(connected) {
	    $scope.connected = !!connected;
	    if (connected) {
	      notifyEl.find('.type-offline').remove();
	    } else {
	      notifyEl.append('<div class="notification active type-offline">OFFLINE</div>');
	    }
	  }

	  // A notification might have been queued already before the app was fully
	  // initialized. If so, we display it now.
	  if (queue.length) tick();

	  var notifyEl = $('<div>').attr('id', 'notification').insertAfter(el);

	  // Default to disconnected
	  setTimeout(function() {
	    setConnectionStatus($scope.connected);
	  }, 1000 * 3);

	  /**
	   * Add the status message to the queue.
	   */
	  function enqueue(msg)
	  {
	    queue.push(msg);
	    if (!tickUpcoming) {
	      setImmediate(tick);
	    }
	  }

	  /**
	   * Proceed to next notification.
	   */
	  var prevEl = null;
	  function tick()
	  {
	    if (prevEl) {
	      // Hide notification box
	      prevEl.removeClass('active');
	      var prevElRef = prevEl;
	      setTimeout(function () {
	        prevElRef.remove();
	      }, 1000);
	      prevEl = null;
	    }

	    tickUpcoming = false;
	    if (queue.length) {
	      // Ensure secondary currencies pulldown is closed
	      $scope.$apply(function() {
	        $scope.show_secondary = false;
	      });

	      // Show next status message
	      var next = queue.shift();

	      var el = $(next);
	      el.addClass('notification');
	      el.appendTo(notifyEl);
	      setImmediate(function () {
	        el.addClass('active');
	      });

	      prevEl = el;

	      tickUpcoming = true;
	      setTimeout(tick, tickInterval);
	    }
	  }

	  // Testing Hooks
	  this.setConnectionStatus = setConnectionStatus;
	  this.enqueue             = enqueue;
	  this.tick                = tick;
	}]);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(5).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate, __webpack_require__(13).clearImmediate))

/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * CHARTS
	 *
	 * Charts and data visualization directives go into this file.
	 */

	var module = angular.module('charts', []);

	/**
	 * Trust line graph. (Similar to small box plot.)
	 */
	module.directive('rpTrustLine', ['$filter', function($filter) {
	  function redraw(ctx, data) {
	    // Axis distance to left and right edges
	    var axisMargin = 30;
	    // Tick length away from axis
	    var tickLen    = 5;
	    // Thickness of bars
	    var barWidth   = 6;
	    // Offset for text below axis
	    var lowText    = 16;
	    // Offset for text above bar
	    var highText   = -10;

	    // Fetch size of canvas
	    var width      = ctx.canvas.width;
	    var height     = ctx.canvas.height;
	    var axisLen    = width - axisMargin * 2;
	    var axisY      = Math.floor(height/2);

	    // Clear canvas
	    ctx.clearRect(0, 0, width, height);

	    // Parse input data
	    var trust_l, trust_r, balance;
	    try {
	      trust_l = -data.limit_peer.to_number();
	      trust_r = data.limit.to_number();
	      balance = data.balance.to_number();
	    } catch (e) {
	      // In case of invalid input data we simply skip drawing the chart.
	      return;
	    }

	    // Calculate minimum and maximum logical point
	    var min        = Math.min(balance, trust_l);
	    var max        = Math.max(balance, trust_r);
	    var scale      = axisLen / (max - min);

	    ctx.lineWidth = 2;
	    ctx.strokeStyle = '#333';

	    // Draw balance
	    if (balance > 0) {
	      ctx.beginPath();
	      ctx.rect(f(0), axisY-barWidth, f(balance)-f(0), barWidth);
	      ctx.fillStyle = 'green';
	      ctx.fill();
	    } else {
	      ctx.beginPath();
	      ctx.rect(f(balance), axisY, f(0)-f(balance), barWidth);
	      ctx.fillStyle = balance === 0 ? 'black' : 'red';
	      ctx.fill();
	    }

	    ctx.beginPath();
	    // Draw axis
	    ctx.moveTo(f(trust_l), axisY);
	    ctx.lineTo(f(trust_r), axisY);
	    // Left end tick
	    ctx.moveTo(f(trust_l), axisY-tickLen);
	    ctx.lineTo(f(trust_l), axisY+tickLen);
	    // Right end tick
	    ctx.moveTo(f(trust_r), axisY-tickLen);
	    ctx.lineTo(f(trust_r), axisY+tickLen);
	    // Origin tick
	    ctx.moveTo(f(0),       axisY-tickLen);
	    ctx.lineTo(f(0),       axisY+tickLen);
	    ctx.stroke();

	    // Draw labels
	    var rpamount = $filter('rpamount');
	    var fmt = {rel_precision: 0};
	    ctx.font = "11px sans-serif";
	    ctx.textAlign = 'center';
	    ctx.fillText(rpamount(data.balance, fmt), f(balance), axisY+highText);
	    ctx.fillStyle = '#333';

	    var lAmount = rpamount(data.limit_peer, fmt);

	    if (0 !== trust_l)
	      lAmount = "-"+lAmount;

	    if (trust_l === trust_r && 0 === trust_l) {
	      lAmount = "0 / 0";
	    } else {
	      ctx.fillText(rpamount(data.limit, fmt), f(trust_r), axisY+lowText);
	    }

	    ctx.fillText(lAmount, f(trust_l), axisY+lowText);

	    // Convert a value to a pixel position
	    function f(val)
	    {
	      // Enforce limits
	      val = Math.min(val, max);
	      val = Math.max(val, min);
	      return Math.round((val - min) * scale + axisMargin);
	    }
	  }

	  return {
	    restrict: 'E',
	    template: '<canvas width="200" height="50">',
	    scope: {
	      data: '=rpLineData'
	    },
	    link: function(scope, elm, attrs) {
	      var ctx = elm.find('canvas')[0].getContext('2d');

	      redraw(ctx, scope.data);

	      scope.$watch('data', function () {
	        redraw(ctx, scope.data);
	      }, true);
	    }
	  };
	}]);


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * FIELDS
	 *
	 * Angular-powered input components go into this file.
	 */

	var webutil = __webpack_require__(16);

	var module = angular.module('fields', []);

	/**
	 * Combobox input element.
	 *
	 * Adds a autocomplete-like dropdown to an input element.
	 *
	 * @param {string} rpCombobox Pass a function that takes a string and returns
	 *   the matching autocompletions.
	 */
	module.directive('rpCombobox', [function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, el, attrs, ngModel) {
	      var keyCursor = -1;

	      el.wrap('<div class="rp-combobox">');
	      el.attr('autocomplete', 'off');
	      var cplEl = $('<ul class="completions"></ul>').hide();
	      el.parent().append(cplEl);

	      // Explicit select button
	      if (attrs.rpComboboxSelect) {
	        var selectEl = $('<div>').appendTo(el.parent());
	        selectEl.addClass('select');
	        selectEl.mousedown(function (e) {
	          e.preventDefault();
	        });
	        selectEl.click(function () {
	          var complFn = scope.$eval(attrs.rpCombobox);
	          if ("function" !== typeof complFn) {
	            complFn = webutil.queryFromOptions(complFn);
	          }
	          setCompletions(complFn());
	          if (cplEl.is(':visible')) {
	            el.blur();
	          } else {
	            setCompletions(complFn());
	            el.focus();
	          }
	        });
	      }

	      el.keydown(function (e) {
	        if (e.which === 38 || e.which === 40) { // UP/DOWN
	          if (!cplEl.children().length) {
	            updateCompletions();
	          }
	          e.preventDefault();

	          if (e.which === 38) keyCursor--;
	          else keyCursor++;

	          updateKeyCursor();
	        } else if (e.which === 13) { // ENTER
	          var curEl = cplEl.find('li.cursor');
	          if (cplEl.is(':visible')) {
	            e.preventDefault();
	          }
	          if (cplEl.find('li').length === 1) {
	            // Only one completion, we'll assume that's the one they want
	            selectCompletion(cplEl.find('li'));
	          } else if (curEl.length === 1) {
	            selectCompletion(curEl);
	          }
	        } else if (e.which === 27) { // ESC
	          setVisible(false);
	        }
	      });

	      // Listen for keyup events to enable binding
	      el.keyup(function(e) {
	        if (e.which >= 37 && e.which <= 40) return;
	        if (e.which === 13 || e.which === 27) return;

	        updateCompletions();
	      });

	      el.focus(function() {
	        keyCursor = -1;
	        triggerCompletions();
	      });

	      el.blur(function() {
	        setVisible(false);
	      });

	      cplEl.mousedown(function (e) {
	        e.preventDefault();
	      });

	      function setVisible(to) {
	        el.parent()[to ? 'addClass' : 'removeClass']('active');
	        cplEl[to ? 'fadeIn' : 'fadeOut']('fast');
	      }

	      function updateCompletions() {
	        var match = ngModel.$viewValue,
	            completions = [], re = null,
	            complFn;

	        complFn = scope.$eval(attrs.rpCombobox);

	        if ("function" !== typeof complFn) {
	          complFn = webutil.queryFromOptions(complFn);
	        }

	        if ("string" === typeof match && match.length) {
	          var escaped = webutil.escapeRegExp(match);
	          re = new RegExp('('+escaped+')', 'i');
	          completions = complFn(match, re);
	        }

	        // By fading out without updating the completions we get a smoother effect
	        if (!completions.length) {
	          setVisible(false);
	          return;
	        }

	        setCompletions(completions, re);
	        triggerCompletions();
	      }

	      function setCompletions(completions, re) {
	        cplEl.empty();
	        keyCursor = -1;
	        completions.forEach(function (val) {
	          val = escape(val);
	          if (re) val = val.replace(re, '<u>$1</u>');
	          var completion = $('<li>'+val+'</li>');
	          el.parent().find('.completions').append(completion);
	        });
	      }

	      function triggerCompletions() {
	        var cplEls = cplEl.children();
	        var visible = !!cplEls.length;
	        if (cplEls.length === 1 &&
	            cplEls.eq(0).text() === el.val()) {
	          visible = false;
	        }
	        setVisible(visible);
	      }

	      function updateKeyCursor() {
	        var opts = cplEl.find('li');
	        keyCursor = Math.max(keyCursor, 0);
	        keyCursor = Math.min(keyCursor, opts.length - 1);
	        opts.removeClass('cursor');
	        opts.eq(keyCursor).addClass('cursor');
	      }

	      function selectCompletion(liEl) {
	        var val = $(liEl).text();
	        scope.$apply(function () {
	          el.val(val);
	          ngModel.$setViewValue(val);
	          setVisible(false);
	        });
	      }

	      function escape(str) {
	        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	      }

	      cplEl.on('click', 'li', function () {
	        selectCompletion(this);
	      });
	    }
	  };
	}]);

	/**
	 * Datepicker
	 */
	module.directive('rpDatepicker', [function() {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function(scope, element, attr, ngModel) {
	      attr.$observe('rpDatepicker', function() {
	        var dp = $(element).datepicker();
	        dp.on('changeDate', function(e) {
	          scope.$apply(function () {
	            ngModel.$setViewValue(e.date.getMonth() ? e.date : new Date(e.date));
	          });
	        });
	        scope.$watch(attr.ngModel,function() {
	          var update = ngModel.$viewValue;

	          function falsy(v) {return v == '0' || v == 'false'; }

	          if (!falsy(attr.ignoreInvalidUpdate) &&
	               (update == null ||
	                 (update instanceof Date && isNaN(update.getYear())) )) {
	              return;
	            } else {
	              dp.datepicker('setValue', update)
	                .datepicker('update');
	            }
	        });
	      });
	    }
	  };
	}]);


/***/ },
/* 16 */
/***/ function(module, exports) {

	// returns the raw address after removing any parameters 
	exports.stripRippleAddress = function (addr)
	{
	  if(typeof(addr)=='string')
	  {
	    var index=addr.indexOf("?");
	    if(index>=0)
	    {
	      return(addr.slice(0,index));
	    }
	  }
	  return(addr);
	}
	//returns the destination tag of an address if there is one 
	exports.getDestTagFromAddress = function (addr)
	{
	  var index=addr.indexOf("?");
	  if(index>=0)
	  {
	    addr=addr.slice(index,addr.length);
	    index=addr.indexOf("dt=");
	    if(index>=0)
	    {
	      addr=addr.slice(index+3,addr.length);
	      index=addr.indexOf("&");
	      if(index>0) return( addr.slice(0,index) );
	      else return(addr);
	    }
	    index=addr.indexOf("d=");
	    if(index>=0)
	    {
	      addr=addr.slice(index+2,addr.length);
	      index=addr.indexOf("&");
	      if(index>0) return( addr.slice(0,index) );
	      else return(addr);
	    }
	  }
	  return(undefined);
	}

	exports.removeClassPrefix = function (el, group)
	{
	  var $el = $(el);
	  var classes = $el.attr("class");

	  if (!classes || !classes.length) return;

	  classes = classes.split(" ").map(function(item) {
	    return item.indexOf(group) === 0 ? "" : item;
	  });
	  $el.attr("class", classes.join(" "));
	};

	/**
	 * Error handler for jQuery.ajax requests.
	 *
	 * @example
	 *   $.get('http://acme.com/')
	 *    .success(...)
	 *    .error(webutil.getAjaxErrorHandler(callback, "Acme GET"));
	 */
	exports.getAjaxErrorHandler = function (callback, context)
	{
	  return function (request, type, errorThrown)
	  {
	    switch (type) {
	      case 'timeout':
	        message = "The request timed out.";
	        break;
	      case 'notmodified':
	        message = "The request was not modified but was not retrieved from the cache.";
	        break;
	      case 'parsererror':
	        message = "XML/Json format is bad.";
	        break;
	      default:
	        message = "HTTP Error (" + request.status + " " + request.statusText + ").";
	    }
	    callback(new Error(message));
	  };
	};

	exports.scrollToTop = function ()
	{
	  $("html, body").animate({ scrollTop: 0 }, "fast");
	};

	exports.findIssuer= function(lines, currency)
	{
	  var maxIssuer=null;
	  var maxLimit=0;

	  for (var n in lines) {
	    if (lines.hasOwnProperty(n)) {
	      if (lines[n].currency === currency) {
	        var limit = +lines[n].limit.to_text();
	        if (limit > maxLimit) {
	          maxLimit = limit;
	          maxIssuer = lines[n].account;
	        }
	      }
	    }
	  }
	  return maxIssuer;
	}

	exports.getContact = function (contacts,value)
	{
	  for (var i=0;i<contacts.length;i++) {
	    if (contacts[i].name === value || contacts[i].address === value) {
	      return contacts[i];
	    }
	  }

	  return false;
	};

	/**
	 * Given an address, return the contact name.
	 */
	exports.isContact = function (contacts, address) {
	  try {
	    for (var i = 0, l = contacts.length; i < l; i++) {
	      if (contacts[i].address === address) {
	        return contacts[i].name;
	      }
	    }
	  } catch (e) {}
	};

	/**
	 * Return the address of a contact.
	 *
	 * Pass in an address or a contact name and get an address back.
	 */
	exports.resolveContact = function (contacts, value)
	{
	  for (var i = 0, l = contacts.length; i < l; i++) {
	    if (contacts[i].name === value) {
	      return contacts[i].address;
	    }
	  }

	  if (ripple.UInt160.is_valid(value)) {
	    return ripple.UInt160.json_rewrite(value);
	  }

	  return '';
	};

	/**
	 * Given an address, return the contact name.
	 *
	 * If a contact is not found with the given address, simply return the address
	 * again.
	 */
	exports.unresolveContact = function (contacts, address)
	{
	  var contact;
	  return (contact = exports.isContact(contacts, address)) ? contact : address;
	};

	/**
	 * Creates a combobox query function out of a select options array.
	 *
	 * @param options {array} An array of select options like {name: '', value: ''}.
	 */
	exports.queryFromOptions = function (options)
	{
	  var opts = _.map(options, function (entry) {
	    if ("string" === typeof entry) {
	      return entry;
	    } else if ("object" === typeof entry) {
	      return entry.name;
	    } else {
	      return null;
	    }
	  });
	  return exports.queryFromArray(opts);
	};

	/**
	 * Creates a combobox query function out of a plain array of strings.
	 *
	 * @param options {array} An array of options, e.g. ['First choice', '2nd']
	 */
	exports.queryFromArray = function (options)
	{
	  return function (match, re) {
	    if (re instanceof RegExp) {
	      return options.filter(function (name) {
	        return "string" === typeof name
	          ? name.match(re)
	          : false;
	      });
	    } else return options;
	  };
	};

	/**
	 * Escapes a string for use as a literal inside of a regular expression.
	 *
	 * From: http://stackoverflow.com/questions/3446170
	 */
	exports.escapeRegExp = function (str)
	{
	  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	/**
	 * EFFECTS
	 *
	 * Angular-powered animation and visual effects directives go into this file.
	 */

	var module = angular.module('effects', []);

	/**
	 * Animate element creation
	 */
	module.directive('rpAnimate', function() {
	  return {
	    restrict: 'A',
	    link: function(scope, elm, attrs) {
	      if (attrs.rpAnimate !== "rp-animate" && !scope.$eval(attrs.rpAnimate)) return;
	      elm = jQuery(elm);
	      elm.hide();
	      elm.fadeIn(600);
	      elm.css('background-color', '#E2F5E4');
	      elm.addClass('rp-animate-during rp-animate');
	      elm.animate({
	        'background-color': '#fff'
	      }, {
	        duration: 600,
	        complete: function () {
	          elm.removeClass('rp-animate-during').addClass('rp-animate-after');
	        }
	      });
	    }
	  };
	});


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * VALIDATORS
	 *
	 * Form validation directives go into this file.
	 */

	var webutil = __webpack_require__(16),
	    Base = ripple.Base,
	    Amount = ripple.Amount;

	var module = angular.module('validators', []);

	/**
	 * Secret Account Key validator
	 */
	module.directive('rpMasterKey', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        if (value && !Base.decode_check(33, value)) {
	          ctrl.$setValidity('rpMasterKey', false);
	          return;
	        }

	        ctrl.$setValidity('rpMasterKey', true);
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpMasterKey', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Validate a payment destination.
	 *
	 * You can set this validator and one or more of the type attributes:
	 *
	 * - rp-dest-address - If set, allows Ripple addresses as destinations.
	 * - rp-dest-contact - If set, allows address book contacts.
	 * - rp-dest-bitcoin - If set, allows Bitcoin addresses as destinations.
	 * - rp-dest-email   - If set, allows federation/email addresses.
	 *
	 * If the input can be validly interpreted as one of these types, the validation
	 * will succeed.
	 */
	module.directive('rpDest', function () {
	  var emailRegex = /^\S+@\S+\.[^\s.]+$/;
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        var strippedValue = webutil.stripRippleAddress(value);
	        var address = ripple.UInt160.from_json(strippedValue);

	        ctrl.rpDestType = null;

	        if (attr.rpDestAddress && address.is_valid()) {
	          ctrl.rpDestType = "address";
	          ctrl.$setValidity('rpDest', true);
	          return value;
	        }

	        if (attr.rpDestContact && scope.userBlob &&
	            webutil.getContact(scope.userBlob.data.contacts,strippedValue)) {
	          ctrl.rpDestType = "contact";
	          ctrl.$setValidity('rpDest', true);
	          return value;
	        }

	        if (attr.rpDestBitcoin && !isNaN(Base.decode_check([0, 5], strippedValue, 'bitcoin'))) {
	          ctrl.rpDestType = "bitcoin";
	          ctrl.$setValidity('rpDest', true);
	          return value;
	        }

	        if (attr.rpDestEmail && emailRegex.test(strippedValue)) {
	          ctrl.rpDestType = "email";
	          ctrl.$setValidity('rpDest', true);
	          return value;
	        }

	        ctrl.$setValidity('rpDest', false);
	        return;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpDest', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Source and destination tags validator
	 *
	 * Integer in the range 0 to 2^32-1
	 */
	module.directive('rpStdt', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        if (!value || (!isNaN(parseFloat(value)) && isFinite(value) && value >= 0 && value < Math.pow(2,32) - 1)) {
	          ctrl.$setValidity('rpStdt', true);
	          return value;
	        } else {
	          ctrl.$setValidity('rpStdt', false);
	          return;
	        }
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpStdt', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	module.directive('rpNotMe', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        var contact = webutil.getContact(scope.userBlob.data.contacts,value);

	        if (value) {
	          if ((contact && contact.address === scope.userBlob.data.account_id) || scope.userBlob.data.account_id === value) {
	            ctrl.$setValidity('rpNotMe', false);
	            return;
	          }
	        }

	        ctrl.$setValidity('rpNotMe', true);
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpNotMe', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	module.directive('rpIssuer', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        if(!value){
	          ctrl.$setValidity('rpIssuer', false);
	          return;
	        }

	        var shortValue = value.slice(0, 3).toUpperCase();

	        if ( (shortValue==="XRP") || webutil.findIssuer(scope.lines,shortValue)) 
	        {
	          ctrl.$setValidity('rpIssuer', true);
	          return value;
	        } else {
	          ctrl.$setValidity('rpIssuer', false);
	          return;
	        }
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpIssuer', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Verify a set of inputs have the same value.
	 *
	 * For example you could use this as a password repeat validator.
	 *
	 * @example
	 *   <input name=password type=password rp-same-in-set="passwordSet">
	 *   <input name=password2 type=password rp-same-in-set="passwordSet">
	 */
	module.directive('rpSameInSet', [function() {
	  return {
	    require: 'ngModel',
	    link: function(scope, elm, attrs, ctrl) {
	      var set = scope.$eval(attrs.rpSameInSet);

	      function validator(value) {
	        var oldValue = value !== ctrl.$modelValue
	            ? ctrl.$modelValue
	            : (value !== ctrl.$viewValue ? ctrl.$viewValue : value);
	        if (value !== oldValue) {
	          set[oldValue] = (set[oldValue] || 1) - 1;
	          if (set[oldValue] === 0) {
	            delete set[oldValue];
	          }
	          if (value) {
	            set[value] = (set[value] || 0) + 1;
	          }
	        }
	        return value;
	      }

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.push(validator);

	      scope.$watch(
	          function() {
	            return _.size(set) === 1;
	          },
	          function(value){
	            ctrl.$setValidity('rpSameInSet', value);
	          }
	      );
	    }
	  }
	}]);

	/**
	 * Field uniqueness validator.
	 *
	 * @param {array=} rpUnique Array of strings which are disallowed values.
	 * @param {string=} rpUniqueField If set, rpUnique will be interpreted as an
	 *   array of objects and we compare the value with the field named
	 *   rpUniqueField inside of those objects.
	 * @param {string=} rpUniqueOrig You can set this to the original value to
	 *   ensure this value is always allowed.
	 *
	 * @example
	 *   <input ng-model="name" ng-unique="addressbook" ng-unique-field="name">
	 */
	module.directive('rpUnique', function() {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function ($scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        var pool = $scope.$eval(attr.rpUnique) || [];

	        if (attr.rpUniqueOrig && value === $scope.$eval(attr.rpUniqueOrig)) {
	          // Original value is always allowed
	          ctrl.$setValidity('rpUnique', true);
	        } else if (attr.rpUniqueField) {
	          for (var i = 0, l = pool.length; i < l; i++) {
	            if (pool[i][attr.rpUniqueField] === value) {
	              ctrl.$setValidity('rpUnique', false);
	              return;
	            }
	          }
	          ctrl.$setValidity('rpUnique', true);
	        } else {
	          ctrl.$setValidity('rpUnique', pool.indexOf(value) === -1);
	        }
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      $scope.$watch(attr.rpUnique, function () {
	        validator(ctrl.$viewValue);
	      }, true);
	    }
	  };
	});

	/**
	 * Password strength validator
	 */
	module.directive('rpStrongPassword', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(password) {
	        var score = 0;
	        var username = ""+scope.username;

	        if (!password) {
	          scope.strength = '';
	          return password;
	        }

	        // password < 6
	        if (password.length < 6 ) {
	          ctrl.$setValidity('rpStrongPassword', false);
	          scope.strength = 'weak';
	          return;
	        }

	        // password == user name
	        if (password.toLowerCase() === username.toLowerCase()) {
	          ctrl.$setValidity('rpStrongPassword', false);
	          scope.strength = 'weak';
	          return;
	        }

	        checkRepetition = function (pLen, str) {
	          var res = "";
	          for (var i = 0; i < str.length; i++ ) {
	            var repeated = true;

	            for (var j = 0; j < pLen && (j+i+pLen) < str.length; j++) {
	              repeated = repeated && (str.charAt(j+i) === str.charAt(j+i+pLen));
	            }
	            if (j<pLen) {
	              repeated = false;
	            }

	            if (repeated) {
	              i += pLen-1;
	              repeated = false;
	            } else {
	              res += str.charAt(i);
	            }
	          }
	          return res;
	        };

	        // password length
	        score += password.length * 4;
	        score += ( checkRepetition(1, password).length - password.length ) * 1;
	        score += ( checkRepetition(2, password).length - password.length ) * 1;
	        score += ( checkRepetition(3, password).length - password.length ) * 1;
	        score += ( checkRepetition(4, password).length - password.length ) * 1;

	        // password has 3 numbers
	        if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
	          score += 5;
	        }

	        // password has 2 symbols
	        if (password.match(/(.*[!,@,#,$,%,&,*,?,_,~].*[!,@,#,$,%,&,*,?,_,~])/)) {
	          score += 5;
	        }

	        // password has Upper and Lower chars
	        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)){
	          score += 10;
	        }

	        // password has number and chars
	        if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
	          score += 15;
	        }

	        //password has number and symbol
	        if (password.match(/([!,@,#,$,%,&,*,?,_,~])/) && password.match(/([0-9])/)) {
	          score += 15;
	        }

	        // password has char and symbol
	        if (password.match(/([!,@,#,$,%,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) {
	          score += 15;
	        }

	        // password is just a numbers or chars
	        if (password.match(/^\w+$/) || password.match(/^\d+$/) ) {
	          score -= 10;
	        }

	        // verifying 0 < score < 100
	        if (score < 0) { score = 0; }
	        if (score > 100) { score = 100; }

	        if (score < 34) {
	          ctrl.$setValidity('rpStrongPassword', false);
	          scope.strength = 'weak';
	          return;
	        }

	        ctrl.$setValidity('rpStrongPassword', true);

	        if (score < 68) {
	          scope.strength = 'medium';
	          return password;
	        }

	        scope.strength = 'strong';
	        return password;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpStrongPassword', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	module.directive('rpAmount', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        if (value && value.toString().indexOf(",") != -1) {
	          value = value.split(",").join("");
	        }

	        var test = /^(([0-9]*?\.\d+)|([1-9]\d*))$/.test(value);

	        if (test && value[0] == '.') {
	          value = '0' + value;
	        }

	        // check for valid amount
	        ctrl.$setValidity('rpAmount', test);

	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);
	    }
	  };
	});

	module.directive('rpAmountPositive', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      // We don't use parseAmount here, assuming that you also use rpAmount validator
	      var validator = function(value) {
	        // check for positive amount
	        ctrl.$setValidity('rpAmountPositive', value > 0);

	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);
	    }
	  };
	});

	module.directive('rpAmountXrpLimit', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      // We don't use parseAmount here, assuming that you also use rpAmount validator
	      var validator = function(value) {
	        var currency = attr.rpAmountXrpLimitCurrency;

	        // If XRP, ensure amount is less than 100 billion and is at least one drop
	        if (currency && currency.toLowerCase() === 'xrp') {
	          ctrl.$setValidity('rpAmountXrpLimit', value <= 100000000000 && value >= 0.000001);
	        } else {
	          ctrl.$setValidity('rpAmountXrpLimit', true);
	        }

	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpAmountXrpLimitCurrency', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Limit currencies to be entered
	 */
	module.directive('rpRestrictCurrencies', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        value = value.slice(0, 3).toUpperCase();

	        if (attr.rpRestrictCurrencies) {
	          ctrl.$setValidity('rpRestrictCurrencies',
	            attr.rpRestrictCurrencies.indexOf(value) != -1
	              ? true
	              : value == 'XRP'
	          );
	        }
	        else {
	          ctrl.$setValidity('rpRestrictCurrencies', true);
	        }

	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);
	    }
	  };
	});

	/**
	 * Port number validator
	 */
	module.directive('rpPortNumber', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        ctrl.$setValidity('rpPortNumber', (parseInt(value,10) == value && value >= 1 && value <= 65535));
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpPortNumber', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Hostname validator
	 * IPv4, IPv6 and hostname
	 */
	module.directive('rpHostname', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      function validate(str) {
	        var test = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-_]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
	        //var test = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
	        return test;
	      }

	      var validator = function(value) {
	        ctrl.$setValidity('rpHostname', validate(value));
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpHostname', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Used for currency selectors
	 */
	module.directive('rpNotXrp', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var validator = function(value) {
	        ctrl.$setValidity('rpNotXrp', !value || value.toLowerCase() !== 'xrp');
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpNotXrp', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});

	/**
	 * Email address validation
	 */
	module.directive('rpEmail', function () {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function (scope, elm, attr, ctrl) {
	      if (!ctrl) return;

	      var emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

	      var validator = function(value) {
	        ctrl.$setValidity('rpEmail', emailRegex.test(value));
	        return value;
	      };

	      ctrl.$formatters.push(validator);
	      ctrl.$parsers.unshift(validator);

	      attr.$observe('rpEmail', function() {
	        validator(ctrl.$viewValue);
	      });
	    }
	  };
	});



/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * EVENTS
	 *
	 * Angular-powered event handling directives go into this file.
	 */

	var module = angular.module('events', []);

	/**
	 * Handle ENTER key press.
	 */
	module.directive('ngEnter', function() {
	  return function(scope, elm, attrs) {
	    elm.bind('keypress', function(e) {
	      if (e.charCode === 13) scope.$apply(attrs.ngEnter);
	    });
	  };
	});


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * FORMATTERS
	 *
	 * Formatters are directives that simply display a value. Normally we do this
	 * via filters, however if the value needs HTML (rather than just text) it's
	 * better to use a directive.
	 */

	var webutil = __webpack_require__(16);

	var module = angular.module('formatters', ['domainalias']);

	module.directive('rpPrettyIssuer', ['rpDomainAlias',
	                                    function (aliasService) {
	  return {
	    restrict: 'EA',
	    scope: {
	      issuer: '=rpPrettyIssuer',
	      contacts: '=rpPrettyIssuerContacts'
	    },
	    template: '{{alias || name || issuer}}',
	    compile: function (element, attr, linker) {
	      return function (scope, element, attr) {
	        function update() {
	          if (!scope.issuer) {
	            scope.alias = attr.rpPrettyIssuerDefault ? attr.rpPrettyIssuerDefault : '???';
	            return;
	          }
	          var aliasPromise = aliasService.getAliasForAddress(scope.issuer);
	          scope.alias = null;
	          aliasPromise.then(function (result) {
	            scope.alias = result;
	          });

	          scope.name = null;
	          if (scope.contacts) {
	            scope.name = webutil.isContact(scope.contacts, scope.issuer);
	          }

	          if (!scope.name && attr.rpPrettyIssuerOrShort) {
	            scope.name = "" + scope.issuer.substring(0,7) + "…";
	          }
	        }

	        scope.$watch('issuer', update);
	        scope.$watch('contacts', update, true);
	        update();
	      };
	    }
	  };
	}]);

	module.directive('rpBindColorAmount', function () {
	  return {
	    restrict: 'A',
	    compile: function (element, attr, linker) {
	      return function (scope, element, attr) {
	        scope.$watch(attr.rpBindColorAmount, function(value){
	          if (value) {
	            var parts = value.split(".");
	            var decimalPart = parts[1].replace(/0(0+)$/, '0<span class="insig">$1</span>');

	            element[0].innerHTML = decimalPart.length > 0 ? parts[0] + "." + decimalPart : parts[0];
	          }
	        });
	      };
	    }
	  };
	});


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {/**
	 * DIRECTIVES
	 *
	 * Miscellaneous directives go in this file.
	 */

	var module = angular.module('directives', ['popup']);

	/**
	 * Inline edit
	 */
	module.directive('inlineEdit', function() {
	  var previewTemplate = '<span ng-hide="mode">{{model}}</span>';
	  var editTemplate = '<input ng-show="mode" ng-model="model" />';

	  return {
	    restrict: 'E',
	    scope: {
	      model: '=',
	      mode: '='
	    },
	    template: previewTemplate + editTemplate
	  };
	});

	/**
	 * Group of validation errors for a form field.
	 *
	 * @example
	 *   <input name=send_destination ng-model=recipient>
	 *   <div rp-errors=send_destination>
	 *     <div rp-error-on=required>This field is required.</div>
	 *     <div rp-error-valid>{{recipient}} is a valid destination.</div>
	 *   </div>
	 */
	var RP_ERRORS = 'rp-errors';
	module.directive('rpErrors', [function() {
	  return {
	    restrict: 'EA',
	    compile: function(el, attr, linker) {
	      var fieldName = attr.rpErrors || attr.on,
	        errs = {};

	      el.data(RP_ERRORS, errs);
	      return function(scope, el) {
	        var formController = el.inheritedData('$formController');
	        var formName = formController.$name,
	          selectedTransclude,
	          selectedElement,
	          selectedScope;

	        function updateErrorTransclude() {
	          var field = formController[fieldName];

	          if (!field) return;

	          var $error = field && field.$error;

	          if (selectedElement) {
	            selectedScope.$destroy();
	            selectedElement.remove();
	            selectedElement = selectedScope = null;
	          }

	          // Pristine fields should show neither success nor failure messages
	          if (field.$pristine) return;

	          // Find any error messages defined for current errors
	          selectedTransclude = false;
	          $.each(errs, function(validator, transclude) {
	            if (validator.length <= 1) return;
	            if ($error && $error[validator.slice(1)]) {
	              selectedTransclude = transclude;
	              return false;
	            }
	          });

	          // Show message for valid fields
	          if (!selectedTransclude && errs['+'] && field.$valid) {
	            selectedTransclude = errs['+'];
	          }

	          // Generic message for invalid fields when there is no specific msg
	          if (!selectedTransclude && errs['?'] && field.$invalid) {
	            selectedTransclude = errs['?'];
	          }

	          if (selectedTransclude) {
	            scope.$eval(attr.change);
	            selectedScope = scope.$new();
	            selectedTransclude(selectedScope, function(errElement) {
	              selectedElement = errElement;
	              el.append(errElement);
	            });
	          }
	        }

	        scope.$watch(formName + '.' + fieldName + '.$error', updateErrorTransclude, true);
	        scope.$watch(formName + '.' + fieldName + '.$pristine', updateErrorTransclude);
	      };
	    }
	  };
	}]);

	/**
	 * Error message for validator failure.
	 *
	 * Use this directive within a rp-errors block to show a message for a specific
	 * validation failing.
	 *
	 * @example
	 *   <div rp-errors=send_destination>
	 *     <div rp-error-on=required>This field is required.</div>
	 *   </div>
	 */
	module.directive('rpErrorOn', [function() {
	  return {
	    transclude: 'element',
	    priority: 500,
	    compile: function(element, attrs, transclude) {
	      var errs = element.inheritedData(RP_ERRORS);
	      if (!errs) return;
	      errs['!' + attrs.rpErrorOn] = transclude;
	    }
	  };
	}]);

	/**
	 * Message for no matched validator failures.
	 *
	 * Use this directive within a rp-errors block to show a message if the field is
	 * invalid, but there was no error message defined for any of the failing
	 * validators.
	 *
	 * @example
	 *   <div rp-errors=send_destination>
	 *     <div rp-error-on=required>This field is required.</div>
	 *     <div rp-error-unknown>Invalid value.</div>
	 *   </div>
	 */
	module.directive('rpErrorUnknown', [function() {
	  return {
	    transclude: 'element',
	    priority: 500,
	    compile: function(element, attrs, transclude) {
	      var errs = element.inheritedData(RP_ERRORS);
	      if (!errs) return;
	      errs['?'] = transclude;
	    }
	  };
	}]);

	/**
	 * Message for field valid.
	 *
	 * Use this directive within a rp-errors block to show a message if the field is
	 * valid.
	 */
	module.directive('rpErrorValid', [function() {
	  return {
	    transclude: 'element',
	    priority: 500,
	    compile: function(element, attrs, transclude) {
	      var errs = element.inheritedData(RP_ERRORS);
	      if (!errs) return;
	      errs['+'] = transclude;
	    }
	  };
	}]);

	module.directive('rpConfirm', ['rpPopup', function(popup) {
	  return {
	    restrict: 'E',
	    link: function postLink(scope, element, attrs) {
	      // Could have custom or bootstrap modal options here
	      var popupOptions = {};
	      element.find('a,button').click(function(e) {
	        e.preventDefault();

	        popup.confirm(attrs["title"], attrs["actionText"],
	          attrs["actionButtonText"], attrs["actionFunction"], attrs["actionButtonCss"],
	          attrs["cancelButtonText"], attrs["cancelFunction"], attrs["cancelButtonCss"],
	          scope, popupOptions);
	      });
	    }
	  };
	}]);

	module.directive('rpPopup', ['rpPopup', function(popup) {
	  return {
	    restrict: 'E',
	    link: function postLink(scope, element, attrs) {
	      element.find('a[rp-popup-link]').click(function(e) {
	        e.preventDefault();

	        popup.blank(
	          new XMLSerializer().serializeToString(element.find('[rp-popup-content]')[0]),
	          scope
	        );
	      });
	    }
	  };
	}]);

	/*
	 * Adds download functionality to an element.
	 */
	module.directive('rpDownload', [function() {
	  return {
	    restrict: 'A',
	    scope: {
	      data: '=rpDownload',
	      filename: '@rpDownloadFilename'
	    },
	    compile: function(element, attr, linker) {
	      return function(scope, element, attr) {
	        var trigger = element.find('[rp-download-trigger]');
	        if (!trigger.length) trigger = element;

	        if ("download" in document.createElement("a")) {
	          scope.$watch('data', function(data) {
	            trigger.attr('href', "data:text/plain," + data);
	          });
	          scope.$watch('filename', function(filename) {
	            trigger.attr('download', filename);
	          });
	        } else if (swfobject.hasFlashPlayerVersion("10.0.0")) {
	          element.css('position', 'relative');

	          setImmediate(function() {
	            var width = trigger.innerWidth();
	            var height = trigger.innerHeight();
	            var offsetTrigger = trigger.offset();
	            var offsetElement = element.offset();
	            var topOffset = offsetTrigger.top - offsetElement.top;
	            var leftOffset = offsetTrigger.left - offsetElement.left;
	            var dl = Downloadify.create(element[0], {
	              filename: function() {
	                return scope.filename;
	              },
	              data: function() {
	                return scope.data;
	              },
	              transparent: true,
	              swf: 'swf/downloadify.swf',
	              downloadImage: 'img/transparent_l.gif',
	              width: width,
	              height: height,
	              append: true
	            });

	            var id = dl.flashContainer.id;
	            $('#' + id).css({
	              position: 'absolute',
	              top: topOffset + 'px',
	              left: leftOffset + 'px'
	            });
	          });
	        } else {
	          // XXX Should provide some alternative or error
	        }
	      };
	    }
	  };
	}]);

	/**
	 * Tooltips
	 */
	module.directive('rpTooltip', [function() {
	  return function(scope, element, attr) {
	    attr.$observe('rpTooltip', function(value) {
	      // Title
	      var options = {'title': value};

	      // Placement
	      if (attr.rpTooltipPlacement)
	        options.placement = attr.rpTooltipPlacement;

	      $(element).tooltip('destroy');
	      $(element).tooltip(options);
	    });
	  };
	}]);

	/**
	 * Popovers
	 */
	module.directive('rpPopover', [function() {
	  return function(scope, element, attr) {
	    if (!attr.rpPopoverTrigger) attr.rpPopoverTrigger = 'click';

	    $(element).popover({
	      html: true,
	      placement: attr.rpPopoverPlacement,
	      title: attr.rpPopoverTitle,
	      trigger: attr.rpPopoverTrigger
	      // TODO also use rpPopoverContent attribute (there's a bug with this)
	    });

	    $('html').click(function() {
	      $(element).popover('hide');
	    });

	    $(element).click(function(event){
	      event.stopPropagation();
	    });
	  };
	}]);

	module.directive('rpAutofill', ['$parse', function($parse) {
	  return {
	    restrict: 'A',
	    require: '?ngModel',
	    link: function($scope, element, attr, ctrl) {
	      if (!ctrl) return;

	      $scope.$watch(attr.rpAutofill, function(value) {
	        if (value) {
	          // Normalize amount
	          if (attr.rpAutofillAmount || attr.rpAutofillCurrency) {
	            // 1 XRP will be interpreted as 1 XRP, not 1 base unit
	            if (value === ("" + parseInt(value, 10))) {
	              value = value + '.0';
	            }

	            var amount = ripple.Amount.from_json(value);
	            if (!amount.is_valid()) return;
	            if (attr.rpAutofillAmount) {
	              value = +amount.to_human({
	                group_sep: false
	              });
	            } else {
	              value = amount.currency().to_json();
	            }
	          }

	          element.val(value);
	          ctrl.$setViewValue(value);
	          $scope.$eval(attr.rpAutofillOn);
	        }
	      }, true);
	    }
	  };
	}]);

	module.directive('rpSelectEl', [function() {
	  return {
	    restrict: 'A',
	    scope: {
	      target: '@rpSelectEl'
	    },
	    link: function($scope, element, attr) {
	      element.click(function() {
	        var doc = document;
	        var text = doc.getElementById($scope.target);

	        if (doc.body.createTextRange) { // ms
	          var range = doc.body.createTextRange();
	          range.moveToElementText(text);
	          range.select();
	        } else if (window.getSelection) { // moz, opera, webkit
	          var selection = window.getSelection();
	          var srange = doc.createRange();
	          srange.selectNodeContents(text);
	          selection.removeAllRanges();
	          selection.addRange(srange);
	        }
	      });
	    }
	  };
	}]);

	module.directive('rpNoPropagate', [function() {
	  return {
	    restrict: 'A',
	    link: function($scope, element, attr) {
	      element.click(function(e) {
	        e.stopPropagation();
	      });
	    }
	  };
	}]);

	/**
	 * Spinner
	 */
	module.directive('rpSpinner', [function() {
	  return {
	    restrict: 'A',
	    link: function(scope, element, attr) {
	      var spinner = null;
	      attr.$observe('rpSpinner', function(value) {
	        element.removeClass('spinner');
	        if (spinner) {
	          spinner.stop();
	          spinner = null;
	        }

	        if (value > 0) {
	          element.addClass('spinner');
	          spinner = new Spinner({
	            lines: 9, // The number of lines to draw
	            length: 3, // The length of each line
	            width: 2, // The line thickness
	            radius: value, // The radius of the inner circle
	            className: 'spinnerInner'
	          }).spin(element[0]);
	        }
	      });
	    }
	  };
	}]);


	// Version 0.2.0
	// AngularJS simple file upload directive
	// this directive uses an iframe as a target
	// to enable the uploading of files without
	// losing focus in the ng-app.
	//
	// <div ng-app="app">
	//   <div ng-controller="mainCtrl">
	//    <form action="/uploads" ng-upload="results()">
	//      <input type="file" name="avatar"></input>
	//      <input type="submit" value="Upload"></input>
	//    </form>
	//  </div>
	// </div>
	//
	//  angular.module('app', ['ngUpload'])
	//    .controller('mainCtrl', function($scope) {
	//      $scope.results = function(content) {
	//        console.log(content);
	//      }
	//  });
	//
	//
	module.directive('ngUpload', function() {
	  return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {

	      // Options (just 1 for now)
	      // Each option should be prefixed with 'upload-Options-' or 'uploadOptions'
	      // {
	      //    // specify whether to enable the submit button when uploading forms
	      //    enableControls: bool
	      // }
	      var options = {};
	      options.enableControls = attrs['uploadOptionsEnableControls'];

	      // get scope function to execute on successful form upload
	      if (attrs['ngUpload']) {

	        element.attr("target", "upload_iframe");
	        element.attr("method", "post");

	        // Append a timestamp field to the url to prevent browser caching results
	        element.attr("action", element.attr("action") + "?_t=" + new Date().getTime());

	        element.attr("enctype", "multipart/form-data");
	        element.attr("encoding", "multipart/form-data");

	        // Retrieve the callback function
	        var fn = attrs['ngUpload'].split('(')[0];
	        var callbackFn = scope.$eval(fn);
	        if (callbackFn === null || callbackFn === undefined || !angular.isFunction(callbackFn)) {
	          var message = "The expression on the ngUpload directive does not point to a valid function.";
	          // console.error(message);
	          throw message + "\n";
	        }

	        // Helper function to create new iframe for each form submission
	        var addNewDisposableIframe = function(submitControl) {
	          // create a new iframe
	          var iframe = $("<iframe id='upload_iframe' name='upload_iframe' border='0' width='0' height='0' style='width: 0px; height: 0px; border: none; display: none' />");

	          // attach function to load event of the iframe
	          iframe.bind('load', function() {

	            // get content - requires jQuery
	            var content = iframe.contents().find('body').text();

	            // execute the upload response function in the active scope
	            scope.$apply(function() {
	              callbackFn(content, content !== "" /* upload completed */ );
	            });

	            // remove iframe
	            if (content !== "") // Fixes a bug in Google Chrome that dispose the iframe before content is ready.
	            setTimeout(function() {
	              iframe.remove();
	            }, 250);

	            //if (options.enableControls == null || !(options.enableControls.length >= 0))
	            submitControl.attr('disabled', null);
	            submitControl.attr('title', 'Click to start upload.');
	          });

	          // add the new iframe to application
	          element.parent().append(iframe);
	        };

	        // 1) get the upload submit control(s) on the form (submitters must be decorated with the 'ng-upload-submit' class)
	        // 2) attach a handler to the controls' click event
	        $('.upload-submit', element).click(

	        function() {

	          addNewDisposableIframe($(this) /* pass the submit control */ );

	          scope.$apply(function() {
	            callbackFn("Please wait...", false /* upload not completed */ );
	          });

	          //console.log(angular.toJson(options));

	          var enabled = true;
	          if (options.enableControls === null || options.enableControls === undefined || options.enableControls.length >= 0) {
	            // disable the submit control on click
	            $(this).attr('disabled', 'disabled');
	            enabled = false;
	          }

	          $(this).attr('title', (enabled ? '[ENABLED]: ' : '[DISABLED]: ') + 'Uploading, please wait...');

	          // submit the form
	          $(element).submit();
	        }).attr('title', 'Click to start upload.');
	      } else console.log("No callback function found on the ngUpload directive.");
	    }
	  };
	});

	/**
	 * Focus element on render
	 */
	module.directive('rpFocus', ['$timeout', function($timeout) {
	  return function($scope, element) {
	    $timeout(function(){
	      $scope.$watch(function () {return element.is(':visible')}, function(newValue) {
	        if (newValue === true)
	          element.focus();
	      })
	    })
	  }
	}]);

	module.directive('rpOffCanvasMenu', function() {
	  return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {
	      element.find('h2').click(function () {
	        element.parent().toggleClass('off-canvas-nav-expand');
	      });
	    }
	  };
	});

	module.directive('rpSnapper', ['rpId', function($id) {
	  return function($scope) {
	    // Initialize snapper only if user is logged in.
	    var watcher = $scope.$watch(function(){return $id.loginStatus}, function(){
	      var snapper;

	      if ($id.loginStatus) {
	        setImmediate(function(){
	          snapper = new Snap({
	            element: document.getElementById('wrapper'),
	            disable: 'right'
	          });

	          // Check
	          checkSize();

	          // Snapper toggle button
	          $('.snapper-toggle').click(function(){
	            snapper.state().state == 'closed' ? snapper.open('left') : snapper.close()
	          });

	          $('.mobile-nav').find('a').click(function(){
	            snapper.close();
	          });
	        });

	        // Activate if resized to mobile size
	        $(window).resize(function(){
	          checkSize();
	        });

	        var checkSize = function(){
	          // screen-sm-max
	          if ('object' === typeof snapper) {
	            if ($(window).width() > 991) {
	              snapper.close();
	              snapper.disable();
	            } else {
	              $('.mobile-nav').show();
	              snapper.enable();
	            }
	          }
	        };

	        // Remove watcher
	        watcher();
	      }
	    });
	  }
	}]);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 22 */
/***/ function(module, exports) {

	/**
	 * DATALINKS
	 *
	 * Data-centric links for things like transactions, accounts etc.
	 */

	var module = angular.module('datalinks', []);

	module.directive('rpLinkTx', ['$location', function ($location) {
	  return {
	    restrict: 'A',
	    link: function ($scope, element, attr) {
	      var url;
	      $scope.$watch(attr.rpLinkTx, function (hash) {
	        url = "/tx?id="+hash;
	      });
	      element.click(function () {
	        $scope.$apply(function () {
	          if (url) $location.url(url);
	        });
	      });
	    }
	  };
	}]);


/***/ },
/* 23 */
/***/ function(module, exports) {

	/**
	 * ERRORS
	 *
	 * Directives related to errors and error messages.
	 */

	var module = angular.module('errors', []);

	/**
	 * Trust line graph. (Similar to small box plot.)
	 */
	module.directive('rpTransactionStatus', function() {
	  return {
	    restrict: 'E',
	    template: '../../../../../templates/ripple_app/directives/transactionerror.html',
	    scope: {
	      engine_result: '@rpEngineResult',
	      engine_result_message: '@rpEngineResultMessage',
	      accepted: '@rpAccepted'
	    },
	    link: function(scope, elm, attrs) {
	    }
	  };
	});


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var module = angular.module('filters', []),
	    webutil = __webpack_require__(16),
	    Amount = ripple.Amount,
	    Base = ripple.Base;

	var iso4217 = __webpack_require__(25);

	/**
	 * Format a ripple.Amount.
	 *
	 * If the parameter is a number, the number is treated the relative
	 */
	module.filter('rpamount', function () {
	  return function (input, options) {
	    opts = jQuery.extend(true, {}, options);

	    if ("number" === typeof opts) {
	      opts = {
	        rel_min_precision: opts
	      };
	    } else if ("object" !== typeof opts) {
	      opts = {};
	    }

	    if (!input) return "n/a";

	    if (opts.xrp_human && input === ("" + parseInt(input, 10))) {
	      input = input + ".0";
	    }

	    var amount = Amount.from_json(input);
	    if (!amount.is_valid()) return "n/a";

	    // Currency default precision
	    var currency = iso4217[amount.currency().to_json()];
	    var cdp = ("undefined" !== typeof currency) ? currency[1] : 4;

	    // Certain formatting options are relative to the currency default precision
	    if ("number" === typeof opts.rel_precision) {
	      opts.precision = cdp + opts.rel_precision;
	    }
	    if ("number" === typeof opts.rel_min_precision) {
	      opts.min_precision = cdp + opts.rel_min_precision;
	    }

	    // If no precision is given, we'll default to max precision.
	    if ("number" !== typeof opts.precision) {
	      opts.precision = 16;
	    }

	    // But we will cut off after five significant decimals
	    if ("number" !== typeof opts.max_sig_digits) {
	      opts.max_sig_digits = 5;
	    }

	    var out = amount.to_human(opts);

	    // If amount is very small and only has zeros (ex. 0.0000), raise precision
	    // to make it useful.
	    if (out.length > 1 && 0 === +out && !opts.hard_precision) {
	      opts.precision = 20;

	      out = amount.to_human(opts);
	    }

	    return out;
	  };
	});

	/**
	 * Get the currency from an Amount.
	 */
	module.filter('rpcurrency', function () {
	  return function (input) {
	    if (!input) return "";

	    var amount = Amount.from_json(input);
	    return amount.currency().to_json();
	  };
	});

	/**
	 * Get the currency issuer.
	 */
	module.filter('rpissuer', function () {
	  return function (input) {
	    if (!input) return "";

	    var amount = Amount.from_json(input);
	    return amount.issuer().to_json();
	  };
	});

	/**
	 * Get the full currency name from an Amount.
	 */
	module.filter('rpcurrencyfull', ['$rootScope', function ($scope) {
	  return function (input) {
	    if (!input) return "";

	    var amount = Amount.from_json(input);
	    var currency = $.grep($scope.currencies_all, function(e){ return e.value == amount.currency().to_json(); })[0];

	    if (currency) {
	      return currency.name;
	    } else {
	      return amount.currency().to_json();
	    }
	  };
	}]);

	/**
	 * Calculate a ratio of two Amounts.
	 */
	module.filter('rpamountratio', function () {
	  return function (numerator, denominator) {
	    try {
	      return Amount.from_json(numerator).ratio_human(denominator);
	    } catch (err) {
	      return Amount.NaN();
	    }
	  };
	});

	/**
	 * Calculate the sum of two Amounts.
	 */
	module.filter('rpamountadd', function () {
	  return function (a, b) {
	    try {
	      b = Amount.from_json(b);
	      if (b.is_zero()) return a;
	      return Amount.from_json(a).add(b);
	    } catch (err) {
	      return Amount.NaN();
	    }
	  };
	});
	/**
	 * Calculate the difference of two Amounts.
	 */
	module.filter('rpamountsubtract', function () {
	  return function (a, b) {
	    try {
	      return Amount.from_json(a).subtract(b);
	    } catch (err) {
	      return Amount.NaN();
	    }
	  };
	});

	/**
	 * Angular filter for Moment.js.
	 *
	 * Displays a timestamp as "x minutes ago".
	 */
	module.filter('rpfromnow', function () {
	  return function (input) {
	    return moment(input).fromNow();
	  };
	});

	/**
	 * Show contact name or short address
	 */
	module.filter('rpcontactname', ['$rootScope', function ($scope) {
	  return function (address) {
	    address = address ? ""+address : "";

	    var contact = webutil.getContact($scope.userBlob.data.contacts, address);

	    if (!contact) {
	      return "" + address.substring(0,7) + "…";
	    }

	    return contact.name;
	  };
	}]);

	module.filter('rpcontactnamefull', ['$rootScope', function ($scope) {
	  return function (address) {
	    address = address ? ""+address : "";
	    var contact = webutil.getContact($scope.userBlob.data.contacts, address);

	    if (!contact) {
	      return "" + address;
	    }

	    return contact.name;
	  };
	}]);

	module.filter('rponlycontactname', ['$rootScope', function ($scope) {
	  return function (address) {
	    address = address ? ""+address : "";

	    var contact = webutil.getContact($scope.userBlob.data.contacts, address);

	    if (contact) {
	      return contact.name;
	    }
	  };
	}]);

	/**
	 * Masks a string like so: •••••.
	 *
	 * The number of the bullets will correspond to the length of the string.
	 */
	module.filter('rpmask', function () {
	  return function (pass) {
	    pass = ""+pass;
	    return Array(pass.length+1).join("•");
	  };
	});

	/**
	 * Crops a string to len characters
	 *
	 * The number of the bullets will correspond to the length of the string.
	 */
	module.filter('rptruncate', function () {
	  return function (str, len) {
	    return str ? str.slice(0, len) : '';
	  };
	});

	/**
	 * Format a file size.
	 *
	 * Based on code by aioobe @ StackOverflow.
	 * @see http://stackoverflow.com/questions/3758606
	 */
	module.filter('rpfilesize', function () {
	  function number_format( number, decimals, dec_point, thousands_sep ) {
	    // http://kevin.vanzonneveld.net
	    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +     bugfix by: Michael White (http://crestidg.com)
	    // +     bugfix by: Benjamin Lupton
	    // +     bugfix by: Allan Jensen (http://www.winternet.no)
	    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	    // *     example 1: number_format(1234.5678, 2, '.', '');
	    // *     returns 1: 1234.57

	    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
	    var d = dec_point === undefined ? "," : dec_point;
	    var t = thousands_sep === undefined ? "." : thousands_sep, s = n < 0 ? "-" : "";
	    var i = parseInt(n = Math.abs(+n || 0).toFixed(c), 10) + "", j = (j = i.length) > 3 ? j % 3 : 0;

	    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	  }

	  // SI (International System of Units)
	  // e.g. 1000 bytes = 1 kB
	  var unit = 1000;
	  var prefixes = "kMGTPE";
	  var common = "B";

	  // Binary system
	  // e.g. 1024 bytes = 1 KiB
	  //var unit = 1024
	  //var prefixes = "KMGTPE";
	  //var common = "iB";

	  return function (str) {
	    var bytes = +str;
	    if (bytes < unit) return bytes + " B";
	    var exp = Math.floor(Math.log(bytes) / Math.log(unit));
	    var pre = " "+prefixes[exp-1] + common;
	    return number_format(bytes / Math.pow(unit, exp), 2, '.', '')+pre;
	  };
	});

	/**
	 * Uppercase the first letter.
	 */
	module.filter('rpucfirst', function () {
	  return function (str) {
	    str = ""+str;
	    return str.charAt(0).toUpperCase() + str.slice(1);
	  };
	});

	/**
	 * Something similar to javascript for loop
	 *
	 * Usage
	 * Example1 : ng-repeat="n in [20] | rprange"
	 * Example2 : ng-repeat="n in [10, 35] | rprange"
	 */
	module.filter('rprange', function() {
	  return function(input) {
	    var lowBound, highBound;
	    switch (input.length) {
	      case 1:
	        lowBound = 0;
	        highBound = parseInt(input[0], 10) - 1;
	        break;
	      case 2:
	        lowBound = parseInt(input[0], 10);
	        highBound = parseInt(input[1], 10);
	        break;
	      default:
	        return input;
	    }
	    var result = [];
	    for (var i = lowBound; i <= highBound; i++)
	      result.push(i);
	    return result;
	  };
	});

	module.filter('rpaddressorigin', function() {
	  return function(recipient) {
	    return !isNaN(Base.decode_check([0, 5], recipient, 'bitcoin')) ? 'bitcoin' : 'ripple';
	  };
	});

	module.filter('rpheavynormalize', function () {
	  return function (value, maxLength) {
	    return String(value)
	      // Remove non-printable and non-ASCII characters
	      .replace(/[^ -~]/g, '')
	      // Enforce character limit
	      .substr(0, maxLength || 160)
	      // Remove leading whitespace
	      .replace(/^\s+/g, '')
	      // Remove trailing whitespace
	      .replace(/\s+$/g, '')
	      // Normalize all other whitespace
	      .replace(/\s+/g, ' ');
	  };
	});


/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = {
	  // Ripple Credits
	  "XRP":[0, 0],

	  // Official ISO-4217
	  "AFN":[971, 2],
	  "EUR":[978, 2],
	  "ALL":[8, 2],
	  "DZD":[12, 2],
	  "USD":[840, 2],
	  "AOA":[973, 2],
	  "XCD":[951, 2],
	  "ARS":[32, 2],
	  "AMD":[51, 2],
	  "AWG":[533, 2],
	  "AUD":[36, 2],
	  "AZN":[944, 2],
	  "BSD":[44, 2],
	  "BHD":[48, 3],
	  "BDT":[50, 2],
	  "BBD":[52, 2],
	  "BYR":[974, 0],
	  "BZD":[84, 2],
	  "XOF":[952, 0],
	  "BMD":[60, 2],
	  "BTN":[64, 2],
	  "INR":[356, 2],
	  "BOB":[68, 2],
	  "BOV":[984, 2],
	  "BAM":[977, 2],
	  "BWP":[72, 2],
	  "NOK":[578, 2],
	  "BRL":[986, 2],
	  "BND":[96, 2],
	  "BGN":[975, 2],
	  "BIF":[108, 0],
	  "KHR":[116, 2],
	  "XAF":[950, 0],
	  "CAD":[124, 2],
	  "CVE":[132, 2],
	  "KYD":[136, 2],
	  "CLF":[990, 0],
	  "CLP":[152, 0],
	  "CNY":[156, 2],
	  "COP":[170, 2],
	  "COU":[970, 2],
	  "KMF":[174, 0],
	  "CDF":[976, 2],
	  "NZD":[554, 2],
	  "CRC":[188, 2],
	  "HRK":[191, 2],
	  "CUC":[931, 2],
	  "CUP":[192, 2],
	  "ANG":[532, 2],
	  "CZK":[203, 2],
	  "DKK":[208, 2],
	  "DJF":[262, 0],
	  "DOP":[214, 2],
	  "EGP":[818, 2],
	  "SVC":[222, 2],
	  "ERN":[232, 2],
	  "ETB":[230, 2],
	  "FKP":[238, 2],
	  "FJD":[242, 2],
	  "XPF":[953, 0],
	  "GMD":[270, 2],
	  "GEL":[981, 2],
	  "GHS":[936, 2],
	  "GIP":[292, 2],
	  "GTQ":[320, 2],
	  "GBP":[826, 2],
	  "GNF":[324, 0],
	  "GYD":[328, 2],
	  "HTG":[332, 2],
	  "HNL":[340, 2],
	  "HKD":[344, 2],
	  "HUF":[348, 2],
	  "ISK":[352, 0],
	  "IDR":[360, 2],
	  "IRR":[364, 2],
	  "IQD":[368, 3],
	  "ILS":[376, 2],
	  "JMD":[388, 2],
	  "JPY":[392, 0],
	  "JOD":[400, 3],
	  "KZT":[398, 2],
	  "KES":[404, 2],
	  "KPW":[408, 2],
	  "KRW":[410, 0],
	  "KWD":[414, 3],
	  "KGS":[417, 2],
	  "LAK":[418, 2],
	  "LVL":[428, 2],
	  "LBP":[422, 2],
	  "LSL":[426, 2],
	  "ZAR":[710, 2],
	  "LRD":[430, 2],
	  "LYD":[434, 3],
	  "CHF":[756, 2],
	  "LTL":[440, 2],
	  "MOP":[446, 2],
	  "MKD":[807, 2],
	  "MGA":[969, 2],
	  "MWK":[454, 2],
	  "MYR":[458, 2],
	  "MVR":[462, 2],
	  "MRO":[478, 2],
	  "MUR":[480, 2],
	  "MXN":[484, 2],
	  "MXV":[979, 2],
	  "MDL":[498, 2],
	  "MNT":[496, 2],
	  "MAD":[504, 2],
	  "MZN":[943, 2],
	  "MMK":[104, 2],
	  "NAD":[516, 2],
	  "NPR":[524, 2],
	  "NIO":[558, 2],
	  "NGN":[566, 2],
	  "OMR":[512, 3],
	  "PKR":[586, 2],
	  "PAB":[590, 2],
	  "PGK":[598, 2],
	  "PYG":[600, 0],
	  "PEN":[604, 2],
	  "PHP":[608, 2],
	  "PLN":[985, 2],
	  "QAR":[634, 2],
	  "RON":[946, 2],
	  "RUB":[643, 2],
	  "RWF":[646, 0],
	  "SHP":[654, 2],
	  "WST":[882, 2],
	  "STD":[678, 2],
	  "SAR":[682, 2],
	  "RSD":[941, 2],
	  "SCR":[690, 2],
	  "SLL":[694, 2],
	  "SGD":[702, 2],
	  "SBD":[90, 2],
	  "SOS":[706, 2],
	  "SSP":[728, 2],
	  "LKR":[144, 2],
	  "SDG":[938, 2],
	  "SRD":[968, 2],
	  "SZL":[748, 2],
	  "SEK":[752, 2],
	  "CHE":[947, 2],
	  "CHW":[948, 2],
	  "SYP":[760, 2],
	  "TWD":[901, 2],
	  "TJS":[972, 2],
	  "TZS":[834, 2],
	  "THB":[764, 2],
	  "TOP":[776, 2],
	  "TTD":[780, 2],
	  "TND":[788, 3],
	  "TRY":[949, 2],
	  "TMT":[934, 2],
	  "UGX":[800, 0],
	  "UAH":[980, 2],
	  "AED":[784, 2],
	  "USN":[997, 2],
	  "USS":[998, 2],
	  "UYI":[940, 0],
	  "UYU":[858, 2],
	  "UZS":[860, 2],
	  "VUV":[548, 0],
	  "VEF":[937, 2],
	  "VND":[704, 0],
	  "YER":[886, 2],
	  "ZMK":[894, 2],
	  "ZWL":[932, 2]
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	var globals = angular.module('app.globals', []);

	/*
	We want to be able to inject mocks into tests with dependencies on these globals
	*/

	// deps/js/store.js
	globals.constant('store', store);
	// config.js
	globals.constant('Options', Options);


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ID (Old client)
	 *
	 * The id service is used for user identification and authorization.
	 */

	var util = __webpack_require__(4),
	    Base58Utils = __webpack_require__(2),
	    RippleAddress = __webpack_require__(1).RippleAddress;

	var module = angular.module('id', ['blob']);

	module.factory('rpId', ['$rootScope', '$location', '$route', '$routeParams', 'rpOldBlob',
	                        function($scope, $location, $route, $routeParams, $oldblob)
	{
	  /**
	   * Identity manager
	   *
	   * This class manages the encrypted blob and all user-specific state.
	   */
	  var Id = function ()
	  {
	    this.account = null;
	    this.loginStatus = false;

	    this.blobBackends = store.get('ripple_blobBackends')
	      ? store.get('ripple_blobBackends')
	      : ['vault', 'local'];
	  };

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
	    username = ""+username;
	    username = username.trim();
	    //we should display username with same capitalization as how they enter it in open wallet
	    // toLowerCase used in all blob requests
	    // username = username.toLowerCase();
	    return username;
	  };

	  /**
	   * Reduce password to standardized form.
	   *
	   * Strips whitespace at beginning and end.
	   */
	  Id.normalizePassword = function (password) {
	    password = ""+password;
	    password = password.trim();
	    return password;
	  };

	  Id.prototype.init = function ()
	  {
	    var self = this;

	    // Initializing sjcl.random doesn't really belong here, but there is no other
	    // good place for it yet.
	    for (var i = 0; i < 8; i++) {
	      sjcl.random.addEntropy(Math.random(), 32, "Math.random()");
	    }

	    $scope.blobBackendCollections = [
	      {name: 'Payward', 'value':'vault'},
	      {name: 'Payward, Local Browser', 'value':'vault,local'},
	      {name: 'Local Browser', 'value':'local'}
	    ];

	    var blobBackend = store.get('ripple_blobBackends')
	          ? $.grep($scope.blobBackendCollections, function(e){ return e.value == store.get('ripple_blobBackends'); })[0]
	        : $scope.blobBackendCollections[1];

	    $scope.blobBackendCollection = {something: blobBackend};

	    $scope.userBlob = Id.defaultBlob;
	    $scope.userCredentials = {};

	    $scope.$watch('userBlob',function(){
	      // XXX Maybe the blob service should handle this stuff?
	      $scope.$broadcast('$blobUpdate');

	      if (self.username && self.password) {
	        $oldblob.set(self.blobBackends,
	                  self.username.toLowerCase(), self.password,
	                  $scope.userBlob,function(){
	                    $scope.$broadcast('$blobSave');
	                  });
	      }
	    },true);

	    $scope.$on('$blobUpdate', function(){
	      // Account address
	      if (!$scope.address && $scope.userBlob.data.account_id) {
	        $scope.address = $scope.userBlob.data.account_id;
	      }
	    });

	    if (Options.persistent_auth && (!!store.get('ripple_auth') || !!store.get('ripple_keys'))) {
	      var auth = store.get('ripple_auth'),
	          blob_key = store.get('ripple_keys')? store.get('ripple_keys').blob_key : null,
	          username = auth? auth.username : '',
	          password = auth? auth.password : '';

	      // XXX This is technically not correct, since we don't know yet whether
	      //     the login will succeed. But we need to set it now, because the page
	      //     controller will likely query it long before we get a response from
	      //     the login system.
	      //
	      //     Probably not a big deal as persistent_auth is only used by
	      //     developers.
	      self.loginStatus = true;
	      this.login(username, password, blob_key, function (err) {
	        // XXX If there was a login error, we're now in a broken state.
	      });
	    }
	  };

	  Id.prototype.setUsername = function (username)
	  {
	    this.username = username;
	    $scope.userCredentials.username = username;
	    $scope.$broadcast('$idUserChange', {username: username});
	  };

	  Id.prototype.setPassword = function (password)
	  {
	    this.password = password;
	    $scope.userCredentials.password = password;
	  };

	  Id.prototype.setAccount = function (accId, accKey)
	  {
	    if (this.account !== null) {
	      $scope.$broadcast('$idAccountUnload', {account: accId});
	    }
	    this.account = accId;
	    $scope.userCredentials.account = accId;
	    $scope.userCredentials.master_seed = accKey;
	    $scope.$broadcast('$idAccountLoad', {account: accId, secret: accKey});
	  };

	  Id.prototype.isReturning = function ()
	  {
	    return !!store.get('ripple_known');
	  };

	  Id.prototype.isLoggedIn = function ()
	  {
	    return this.loginStatus;
	  };

	  Id.prototype.storeLogin = function (username, password)
	  {
	    if (Options.persistent_auth && !store.disabled) {
	      if(!username && !password){
	          return
	      }
	      var blob_key = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(username + password)),
	          blob_enc_key = sjcl.encrypt(blob_key, ""+username.length+'|'+username+password);

	      if(Options.ripple_auth_blob){
	        store.set('ripple_keys', {blob_key: blob_key, blob_enc_key: blob_enc_key});
	      }
	      else {
	        store.set('ripple_auth', {username: username, password: password});
	      }
	    }
	  };

	  Id.prototype.register = function (username, password, callback, masterkey)
	  {
	    var self = this;

	    // If Secret Account Key is not present, generate one
	    masterkey = !!masterkey
	      ? masterkey
	      : Base58Utils.encode_base_check(33, sjcl.codec.bytes.fromBits(sjcl.random.randomWords(4)));

	    // Callback is optional
	    if ("function" !== typeof callback) callback = $.noop;

	    // Blob data
	    username = Id.normalizeUsername(username);
	    password = Id.normalizePassword(password);

	    var data = {
	      data: {
	        master_seed: masterkey,
	        account_id: (new RippleAddress(masterkey)).getAddress(),
	        contacts: []
	      },
	      meta: {
	        created: (new Date()).toJSON(),
	        modified: (new Date()).toJSON()
	      }
	    };

	    // Add user to blob
	    $oldblob.set(self.blobBackends, username.toLowerCase(), password, data, function () {
	      $scope.userBlob = data;
	      self.setUsername(username);
	      self.setPassword(password);
	      self.setAccount(data.data.account_id, data.data.master_seed);
	      self.storeLogin(username, password);
	      self.loginStatus = true;
	      $scope.$broadcast('$blobUpdate');
	      store.set('ripple_known', true);
	      callback(data.data.master_seed);
	    });
	  };

	  Id.prototype.exists = function (username, password, callback)
	  {
	    var self = this;

	    username = Id.normalizeUsername(username);
	    password = Id.normalizePassword(password);

	    $oldblob.get(self.blobBackends, username.toLowerCase(), password, function (err, data) {
	      if (!err && data) {
	        callback(null, true);
	      } else {
	        callback(null, false);
	      }
	    });
	  };

	  Id.prototype.login = function (username, password, key, callback)
	  {
	    var self = this;

	    // Callback is optional
	    if ("function" !== typeof callback) callback = $.noop;
	    if (!$scope.userCredentials) {
	      self.init();
	    }

	    username = username? Id.normalizeUsername(username).toLowerCase() : username;
		password = Id.normalizePassword(password);

	    $oldblob.get(self.blobBackends, username, password, key, function (err, data) {
	      if (err) {
	        callback(err);
	        return;
	      }

	      var blob = $oldblob.decrypt(username.toLowerCase(), password, data);
	      if (!blob) {
	        // Unable to decrypt blob
	        var msg = 'Unable to decrypt blob (Username / Password is wrong)';
	        callback(new Error(msg));
	        return;
	      } else if (blob.old && !self.allowOldBlob) {
	        var oldBlobErr = new Error('Old blob format detected');
	        oldBlobErr.name = "OldBlobError";
	        callback(oldBlobErr);
	        return;
	      }

	      // Ensure certain properties exist
	      $.extend(true, blob, Id.minimumBlob);

	      $scope.userBlob = {
	        data: blob.data,
	        meta: blob.meta
	      };
	      self.setUsername(username);
	      self.setPassword(password);
	      self.setAccount(blob.data.account_id, blob.data.master_seed);
	      self.storeLogin(username, password);
	      self.loginStatus = true;
	      $scope.$broadcast('$blobUpdate');
	      store.set('ripple_known', true);

	      if (blob.data.account_id) {
	        // Success
	        callback(null);
	      } else {
	        // Invalid blob
	        callback(new Error("Blob format unrecognized!"));
	      }
	    });
	  };

	  Id.prototype.logout = function ()
	  {
	    store.remove('ripple_auth');
	    store.remove('ripple_keys');

	    // problem?
	    // reload will not work, as some pages are also available for guests.
	    // Logout will show the same page instead of showing login page.
	    // This line redirects user to root (login) page
	    var port = location.port.length > 0 ? ":" + location.port : "";
	    location.href = location.protocol + '//' + location.hostname  + port + location.pathname;
	  };

	  /**
	   * Go to an identity page.
	   *
	   * Redirects the user to a page where they can identify. This could be the
	   * login or register tab most likely.
	   */
	  Id.prototype.goId = function () {
	    if (!this.isLoggedIn()) {
	      if (_.size($routeParams)) {
	        var tab = $route.current.tabName;
	        $location.search('tab', tab);
	      }
	      if (this.isReturning()) {
	        $location.path('/login');
	      } else {
	        $location.path('/register');
	      }
	    }
	  };

	  return new Id();
	}]);




/***/ },
/* 28 */
/***/ function(module, exports) {

	/**
	 * Event tracker (analytics)
	 */

	var module = angular.module('tracker', []);

	module.factory('rpTracker', ['$rootScope', function ($scope) {
	  var track = function (event,properties) {
	    if (Options.mixpanel && Options.mixpanel.track) {
	      mixpanel.track(event,properties);
	    }
	  };

	  return {
	    track: track
	  };
	}]);


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {/**
	 * OLD BLOB (Old client)
	 *
	 * The old blob service that used to manage the user's private information.
	 */

	var webutil = __webpack_require__(16),
	    log = __webpack_require__(30);

	var module = angular.module('blob', []);

	module.factory('rpOldBlob', ['$rootScope', function ($scope)
	{
	  var BlobObj = function ()
	  {
	    this.data = {};
	    this.meta = {};
	  };

	  function processBackendsParam(backends)
	  {
	    if (!Array.isArray(backends)) {
	      backends = [backends];
	    }

	    backends = backends.map(function (backend) {
	      if ("string" === typeof backend) {
	        return BlobObj.backends[backend];
	      } else {
	        return backend;
	      }
	    });

	    return backends;
	  }

	  /**
	   * Attempts to retrieve the blob from the specified backend.
	   */
	  BlobObj.get = function(backends, user, pass, key, callback)
	  {
	    backends = processBackendsParam(backends);

	    var backend = backends.shift();

	    var key = user? sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(user + pass)) : key;
	    try {
	      backend.get(key, function (err, data) {
	        setImmediate(function () {
	          $scope.$apply(function () {
	            if (err) {
	              handleError(err, backend);
	              return;
	            }

	            if (data) {
	              callback(null, data);
	            } else {
	              handleError('Wallet not found (Username / Password is wrong)', backend);
	            }
	          });
	        });
	      });
	    } catch (err) {
	      handleError(err, backend);
	    }

	    function handleError(err, backend) {
	      console.warn("Backend failed:", backend.name, err.toString());
	      if ("string" === typeof err) {
	        err = new BlobError(err, backend.name);
	      } else if (!(err instanceof BlobError)) {
	        err = new BlobError(err.message, backend.name);
	      }
	      $scope.$broadcast('$blobError', err);
	      tryNext(err);
	    }

	    function tryNext(err) {
	      // Do we have more backends to try?
	      if (backends.length) {
	        BlobObj.get(backends, user, pass, callback);
	      } else {
	        callback(err);
	      }
	    }
	  };

	  BlobObj.enc = function(username,password,bl)
	  {
	    // filter out contacts before they are encrypted
	    if (typeof(bl.data.contacts) === 'object')
	      bl.data.contacts = angular.fromJson(angular.toJson(bl.data.contacts));

	    var stored_keys = store.get('ripple_keys'),
	        stored_enc_key = stored_keys? sjcl.decrypt(stored_keys.blob_key, stored_keys.blob_enc_key): null,
		    key =  stored_enc_key? stored_enc_key : ""+username.length+'|'+username+password;
	    return btoa(sjcl.encrypt(key, JSON.stringify(bl.data), {
	      iter: 1000,
	      adata: JSON.stringify(bl.meta),
	      ks: 256
	    }));
	  };

	  BlobObj.set = function(backends, username, password, key, bl, callback)
	  {
	    // Callback is optional
	    if ("function" !== typeof callback) callback = $.noop;

	    backends = processBackendsParam(backends);

	    var hash = username? sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(username + password)) : key;
	    var encData = BlobObj.enc(username, password, bl);

	    backends.forEach(function (backend) {
	      backend.set(hash, encData, callback);
	    });
	  };

	  BlobObj.decrypt = function (user, pass, data)
	  {
	    function decrypt(priv, ciphertext)
	    {
	      var blob = new BlobObj();
	      blob.data = JSON.parse(sjcl.decrypt(priv, ciphertext));
	      // TODO unescape is deprecated
	      blob.meta = JSON.parse(unescape(JSON.parse(ciphertext).adata));
	      return blob;
	    }

	    try {
	      // Try new-style key
	      var stored_keys = store.get('ripple_keys'),
	          stored_enc_key = stored_keys? sjcl.decrypt(stored_keys.blob_key, stored_keys.blob_enc_key): null,
		      key =  stored_enc_key? stored_enc_key : ""+user.length+'|'+user+pass;
	      return decrypt(key, atob(data));
	    } catch (e1) {
	      console.log("Blob decryption failed with new-style key:", e1.toString());
	      try {
	        // Try old style key
	        var key = user+pass;
	        var blob = decrypt(key, atob(data));
	        blob.old = true;
	        return blob;
	      } catch (e2) {
	        console.log("Blob decryption failed with old-style key:", e2.toString());
	        return false;
	      }
	    }
	  };

	  var VaultBlobBackend = {
	    name: "Payward",

	    get: function (key, callback) {
	      var url = Options.blobvault;

	      if (url.indexOf("://") === -1) url = "http://" + url;

	      $.ajax({
	        url: url + '/' + key,
	        timeout: 8000
	      })
	        .success(function (data) {
	          callback(null, data);
	        })
	        .error(webutil.getAjaxErrorHandler(callback, "BlobVault GET"));
	    },

	    set: function (key, value, callback) {
	      var url = Options.blobvault;

	      if (url.indexOf("://") === -1) url = "http://" + url;

	      $.post(url + '/' + key, { blob: value })
	        .success(function (data) {
	          callback(null, data);
	        })
	        .error(webutil.getAjaxErrorHandler(callback, "BlobVault SET"));
	    }
	  };

	  var LocalBlobBackend = {
	    name: "Local browser",

	    get: function (key, callback)
	    {
	      console.log('local get','ripple_blob_' + key);
	      var blob = store.get('ripple_blob_'+key);
	      // We use a timeout to simulate this function being asynchronous
	      callback(null, blob);
	    },

	    set: function (key, value, callback)
	    {
	      if (!store.disabled) {
	        store.set('ripple_blob_'+key, value);
	      }
	      callback();
	    }
	  };

	  BlobObj.backends = {
	    vault: VaultBlobBackend,
	    local: LocalBlobBackend
	  };

	  function BlobError(message, backend) {
	    this.name = "BlobError";
	    this.message = message || "";
	    this.backend = backend || "generic";
	  }

	  BlobError.prototype = Error.prototype;

	  BlobObj.BlobError = BlobError;

	  return BlobObj;
	}]);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 30 */
/***/ function(module, exports) {

	/**
	 * Print an exception for debug purposes.
	 *
	 * Includes some logic to try and log a stack in various browsers.
	 */
	exports.exception = function (exception) {
	  console.log("function" === typeof exception.getStack ? exception.getStack() : exception.stack);
	};



/***/ },
/* 31 */
/***/ function(module, exports) {

	/**
	 * NETWORK
	 *
	 * The network service is used to communicate with the Ripple network.
	 *
	 * It encapsulates a ripple.Remote instance.
	 */

	var module = angular.module('network', []);

	module.factory('rpNetwork', ['$rootScope', function($scope)
	{
	  /**
	   * Manage network state.
	   *
	   * This class is intended to manage the connection status to the
	   * Ripple network.
	   *
	   * Note that code in other places *is allowed* to call the Ripple
	   * library directly. This is not to be intended to be an abstraction
	   * layer on top of an abstraction layer.
	   */
	  var Network = function ()
	  {
	    this.remote = new ripple.Remote(Options.server, true);
	    this.remote.on('connected', this.handleConnect.bind(this));
	    this.remote.on('disconnected', this.handleDisconnect.bind(this));

	    this.connected = false;
	  };

	  Network.prototype.init = function ()
	  {
	    $scope.network = this;
	  };

	  /**
	   * Setup listeners for identity state.
	   *
	   * This function causes the network object to start listening to
	   * changes in the identity state and automatically subscribe to
	   * accounts accordingly.
	   */
	  Network.prototype.listenId = function (id)
	  {
	    var self = this;
	  };

	  Network.prototype.handleConnect = function (e)
	  {
	    var self = this;
	    $scope.$apply(function () {
	      self.connected = true;
	      $scope.connected = true;
	      $scope.$broadcast('$netConnected');
	    });
	  };

	  Network.prototype.handleDisconnect = function (e)
	  {
	    var self = this;
	    $scope.$apply(function () {
	      self.connected = false;
	      $scope.connected = false;
	      $scope.$broadcast('$netDisconnected');
	    });
	  };

	  return new Network();
	}]);



/***/ },
/* 32 */
/***/ function(module, exports) {

	/**
	 * BOOKS
	 *
	 * The books service is used to keep track of orderbooks.
	 */

	var module = angular.module('books', ['network']);
	var Amount = ripple.Amount;


	module.factory('rpBooks', ['rpNetwork', '$q', '$rootScope', '$filter', 'rpId',
	function(net, $q, $scope, $filter, $id) {
	  function loadBook(gets, pays, taker) {
	    return net.remote.book(gets.currency, gets.issuer,
	    pays.currency, pays.issuer,
	    taker);
	  }

	  function filterRedundantPrices(data, action, combine) {
	    var max_rows = Options.orderbook_max_rows || 100;

	    var price;
	    var lastprice;
	    var current;
	    var rpamount = $filter('rpamount');
	    var numerator;
	    var demoninator;
	    var newData = jQuery.extend(true, {}, data);

	    var rowCount = 0;
	    newData = _.values(_.compact(_.map(newData, function(d, i) {

	      // This check is redundant, but saves the CPU some work
	      if (rowCount > max_rows) return false;

	      // prefer taker_pays_funded & taker_gets_funded
	      if (d.hasOwnProperty('taker_gets_funded')) {
	        d.TakerGets = d.taker_gets_funded;
	        d.TakerPays = d.taker_pays_funded;
	      }

	      d.TakerGets = Amount.from_json(d.TakerGets);
	      d.TakerPays = Amount.from_json(d.TakerPays);

	      d.price = Amount.from_quality(d.BookDirectory, "1", "1");

	      if (action !== "asks") d.price = Amount.from_json("1/1/1").divide(d.price);

	      // Adjust for drops: The result would be a million times too large.
	      if (d[action === "asks" ? "TakerPays" : "TakerGets"].is_native())
	        d.price  = d.price.divide(Amount.from_json("1000000"));

	      // Adjust for drops: The result would be a million times too small.
	      if (d[action === "asks" ? "TakerGets" : "TakerPays"].is_native())
	        d.price  = d.price.multiply(Amount.from_json("1000000"));

	      var price = rpamount(d.price, {
	        rel_precision: 4,
	        rel_min_precision: 2
	      });

	      // Don't combine current user's orders.
	      if (d.Account == $id.account) {
	        d.my = true;
	      }

	      if (lastprice === price && !d.my) {
	        if (combine) {
	          newData[current].TakerPays = Amount.from_json(newData[current].TakerPays).add(d.TakerPays);
	          newData[current].TakerGets = Amount.from_json(newData[current].TakerGets).add(d.TakerGets);
	        }
	        d = false;
	      } else current = i;

	      if (!d.my)
	        lastprice = price;

	      if (d) rowCount++;

	      if (rowCount > max_rows) return false;

	      return d;
	    })));

	    var key = action === "asks" ? "TakerGets" : "TakerPays";
	    var sum;
	    _.each(newData, function (order, i) {
	      if (sum) sum = order.sum = sum.add(order[key]);
	      else sum = order.sum = order[key];
	    });

	    return newData;
	  }

	  return {
	    get: function(first, second, taker) {
	      var asks = loadBook(first, second, taker);
	      var bids = loadBook(second, first, taker);

	      var model = {
	        asks: filterRedundantPrices(asks.offersSync(), 'asks', true),
	        bids: filterRedundantPrices(bids.offersSync(), 'bids', true)
	      };

	      function handleAskModel(offers) {
	        $scope.$apply(function () {
	          model.asks = filterRedundantPrices(offers, 'asks', true);
	        });
	      }

	      function handleAskTrade(gets, pays) {
	        $scope.$apply(function () {
	          model.last_price = gets.ratio_human(pays);
	        });
	      }
	      asks.on('model', handleAskModel);
	      asks.on('trade', handleAskTrade);

	      function handleBidModel(offers) {
	        $scope.$apply(function () {
	          model.bids = filterRedundantPrices(offers, 'bids', true);
	        });
	      }

	      function handleBidTrade(gets, pays) {
	        $scope.$apply(function () {
	          model.last_price = pays.ratio_human(gets);
	        });
	      }
	      bids.on('model', handleBidModel);
	      bids.on('trade', handleBidTrade);

	      model.unsubscribe = function() {
	        asks.removeListener('model', handleAskModel);
	        asks.removeListener('trade', handleAskTrade);
	        bids.removeListener('model', handleBidModel);
	        bids.removeListener('trade', handleBidTrade);
	      };

	      return model;
	    }
	  };
	}]);


/***/ },
/* 33 */
/***/ function(module, exports) {

	/**
	 * TRANSACTIONS
	 *
	 * The transactions service is used to listen to all Ripple network
	 * transactions.
	 *
	 * This obviously won't scale, but it'll do long enough for us (or somebody
	 * else) to come up with something better.
	 */

	var module = angular.module('transactions', ['network']);

	module.factory('rpTransactions', ['$rootScope', 'rpNetwork',
	                                  function($scope, net) {
	  var listeners = [],
	      subscribed = false;

	  function subscribe() {
	    if (subscribed) return;
	    net.remote.request_subscribe("transactions").request();
	    subscribed = true;
	  }

	  function handleTransaction(msg) {
	    $scope.$apply(function () {
	      listeners.forEach(function (fn) {
	        fn(msg);
	      });
	    });
	  }

	  net.remote.on('net_transaction', handleTransaction);

	  return {
	    addListener: function (fn) {
	      listeners.push(fn);
	      subscribe();
	    },
	    removeListener: function (fn) {
	      var position = -1;
	      for (var i = 0, l = listeners.length; i < l; i++) {
	        if (listeners[i] === fn) {
	          position = i;
	        }
	      }
	      if (position < 0) return;
	      listeners.splice(position, 1);
	    }
	  };
	}]);


/***/ },
/* 34 */
/***/ function(module, exports) {

	/**
	 * LEDGER
	 *
	 * The ledger service is used to provide information that requires watching the
	 * entire ledger.
	 *
	 * This obviously won't scale, but it'll do long enough for us (or somebody
	 * else) to come up with something better.
	 */

	var module = angular.module('ledger', ['network', 'transactions']);

	module.factory('rpLedger', ['$q', '$rootScope', 'rpNetwork', 'rpTransactions',
	                            function($q, $rootScope, net, transactions)
	{

	  var offerPromise = $q.defer();
	  var tickerPromise = $q.defer();
	  var requested = false;

	  var ledger = {
	    offers: offerPromise.promise,
	    tickers: tickerPromise.promise,
	    getOrders: getOrders
	  };

	  function filterOrder(buyCurrency, sellCurrency, buyIssuer, sellIssuer,
	                       pays, gets) {
	    if (buyCurrency !== gets.currency || sellCurrency !== pays.currency) {
	      return false;
	    }

	    if (buyCurrency !== 'XRP' && buyIssuer && gets.issuer !== buyIssuer) {
	      return false;
	    }

	    if (sellCurrency !== 'XRP' && sellIssuer && pays.issuer !== sellIssuer) {
	      return false;
	    }

	    return true;
	  }

	  function getOrders(buyCurrency, sellCurrency, buyIssuer, sellIssuer) {
	    var obj = {
	      asks: [],
	      bids: []
	    };

	    if (!Array.isArray(ledger.offers)) return obj;

	    ledger.offers.forEach(function (node) {
	      var gets = rewriteAmount(node.TakerGets);
	      var pays = rewriteAmount(node.TakerPays);

	      if (filterOrder(buyCurrency, sellCurrency, buyIssuer, sellIssuer, pays, gets)) {
	        obj.asks.push({i: gets, o: pays});

	        // A bid can't also be an ask
	        return;
	      }

	      if (filterOrder(buyCurrency, sellCurrency, buyIssuer, sellIssuer, gets, pays)) {
	        obj.bids.push({i: pays, o: gets});
	      }
	    });

	    obj.asks.sort(function (a, b) {
	      var aRatio = a.o.amount.ratio_human(a.i.amount);
	      var bRatio = b.o.amount.ratio_human(b.i.amount);
	      return aRatio.compareTo(bRatio);
	    });

	    obj.bids.sort(function (a, b) {
	      var aRatio = a.o.amount.ratio_human(a.i.amount);
	      var bRatio = b.o.amount.ratio_human(b.i.amount);
	      return bRatio.compareTo(aRatio);
	    });

	    fillSum(obj.asks, 'i');
	    fillSum(obj.bids, 'i');

	    return obj;
	  }

	  function rewriteAmount(amountJson) {
	    var amount = ripple.Amount.from_json(amountJson);
	    return {
	      amount: amount,
	      // Pretty dirty hack, but to_text for native values gives 1m * value...
	      // In the future we will likely remove this field altogether (and use
	      // Amount class math instead), so it's ok.
	      num: +amount.to_human({group_sep: false}),
	      currency: amount.currency().to_json(),
	      issuer: amount.issuer().to_json()
	    };
	  }

	  /**
	   * Fill out the sum field in the bid or ask orders array.
	   */
	  function fillSum(array, field) {
	    var sum = null;
	    for (var i = 0, l = array.length; i<l; i++) {
	      if (sum === null) {
	        sum = array[i][field].amount;
	      } else {
	        sum = sum.add(array[i][field].amount);
	      }
	      array[i].sum = sum;
	    }
	  }

	  if(net.connected) {
	    doRequest();
	  }

	  net.on('connected', function(){
	    doRequest();
	  });

	  function doRequest()
	  {
	    if (requested) return;

	    net.remote.request_ledger("ledger_closed", "full")
	        .on('success', handleLedger)
	        .request();

	    transactions.addListener(handleTransaction);

	    requested = true;
	  }

	  function handleTransaction(msg)
	  {
	    // XXX: Update the ledger state using this transaction's metadata
	  }

	  function handleLedger(e)
	  {
	    $rootScope.$apply(function(){
	      var offers = e.ledger.accountState.filter(function (node) {
	        return node.LedgerEntryType === "Offer";
	      });

	      offerPromise.resolve(offers);
	      ledger.offers = offers;
	    });
	  }

	  return ledger;
	}]);


/***/ },
/* 35 */
/***/ function(module, exports) {

	/**
	 * POPUP
	 *
	 * The popup service is used to provide modals, alerts, and confirmation screens
	 */

	var module = angular.module('popup', []);

	module.factory('rpPopup', ['$http', '$compile',
	                           function ($http, $compile)
	{
	  var popupService = {};

	  // Get the popup
	  popupService.getPopup = function(create)
	  {
	    if (!popupService.popupElement && create)
	    {
	      popupService.popupElement = $( '<div class="modal fade"></div>' );
	      popupService.popupElement.appendTo( 'BODY' );
	    }

	    return popupService.popupElement;
	  };

	  popupService.compileAndRunPopup = function (popup, scope, options) {
	    $compile(popup)(scope);
	    popup.modal(options);
	  };

	  popupService.blank = function(content,scope) {
	    var popup = popupService.getPopup(true);

	    var html = '<div class="modal-dialog"><div class="modal-content">';
	    html += content;
	    html += '</div></div>';

	    popup.html(html);

	    popupService.compileAndRunPopup(popup, scope);
	  };

	  popupService.confirm = function(title, actionText, actionButtonText, actionFunction, actionButtonCss, cancelButtonText, cancelFunction, cancelButtonCss, scope, options) {
	    actionText = (actionText) ? actionText : "Are you sure?";
	    actionButtonText = (actionButtonText) ? actionButtonText : "Ok";
	    actionButtonCss = (actionButtonCss) ? actionButtonCss : "btn btn-info";
	    cancelButtonText = (cancelButtonText) ? cancelButtonText : "Cancel";
	    cancelButtonCss = (cancelButtonCss) ? cancelButtonCss : "";

	    var popup = popupService.getPopup(true);
	    var confirmHTML = '<div class="modal-dialog"><div class="modal-content">';

	    if (title) {
	      confirmHTML += "<div class=\"modal-header\"><h1>"+title+"</h1></div>";
	    }

	    confirmHTML += "<div class=\"modal-body\"><p class=\"question\">"+actionText+"</p>"
	        +    "<p class=\"actions\">";

	    if (cancelFunction) {
	      confirmHTML += "<a class=\"" + cancelButtonCss + " btn-cancel\" ng-click=\""+cancelFunction+"\">"+cancelButtonText+"</a>";
	    }
	    else {
	      confirmHTML += "<a class=\"" + cancelButtonCss + " btn-cancel\">"+cancelButtonText+"</a>";
	    }

	    if (actionFunction) {
	      confirmHTML += "<button class=\"" + actionButtonCss + " btn-cancel\" ng-click=\""+actionFunction+"\">"+actionButtonText+"</button>";
	    }
	    else {
	      confirmHTML += "<button class=\"" + actionButtonCss + " btn-cancel\">"+actionButtonText+"</button>";
	    }

	    confirmHTML += "</p></div></div></div>";

	    popup.html(confirmHTML);

	    if (!actionFunction) {
	      popup.find(".btn-primary").click(function () {
	        popupService.close();
	      });
	    }

	    if (!cancelFunction) {
	      popup.find(".btn-cancel").click(function () {
	        popupService.close();
	      });
	    }

	    popupService.compileAndRunPopup(popup, scope, options);
	  };

	  popupService.close = function()
	  {
	    var popup = popupService.getPopup();
	    if (popup) {
	      popup.modal('hide');
	    }
	  };

	  return popupService;
	}]);


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {/**
	 * RIPPLE.TXT
	 *
	 * The ripple.txt service looks up and caches ripple.txt files.
	 *
	 * These files are used to do DNS-based verifications autonomously on the
	 * client-side. Quite neat when you think about it and a decent solution until
	 * we have a network-internal nickname system.
	 */

	var module = angular.module('rippletxt', []);

	module.factory('rpRippleTxt', ['$q', '$rootScope',
	                               function ($q, $scope) {
	  var txts = {};

	  function get(domain) {
	    if (txts[domain]) {
	      return txts[domain];
	    } else {
	      var txtPromise = $q.defer();

	      txts[domain] = txtPromise;

	      var urls = [
	        'https://ripple.'+domain+'/ripple.txt',
	        'https://www.'+domain+'/ripple.txt',
	        'https://'+domain+'/ripple.txt'
	      ].reverse();
	      var next = function (xhr, status) {
	        if (!urls.length) {
	          txts[domain] = {};
	          txtPromise.reject(new Error("No ripple.txt found"));
	          return;
	        }
	        var url = urls.pop();
	        $.ajax({
	          url: url,
	          dataType: 'text',
	          success: function (data) {
	            $scope.$apply(function() {
	              var sections = parse(data);
	              txts[domain] = sections;
	              txtPromise.resolve(sections);
	            });
	          },
	          error: function (xhr, status) {
	            setImmediate(function () {
	              $scope.$apply(function () {
	                next(xhr, status);
	              });
	            });
	          }
	        });
	      };
	      next();

	      return txtPromise.promise;
	    }
	  }

	  function parse(txt) {
	    txt = txt.replace('\r\n', '\n');
	    txt = txt.replace('\r', '\n');
	    txt = txt.split('\n');

	    var currentSection = "", sections = {};
	    for (var i = 0, l = txt.length; i < l; i++) {
	      var line = txt[i];
	      if (!line.length || line[0] === '#') {
	        continue;
	      } else if (line[0] === '[' && line[line.length-1] === ']') {
	        currentSection = line.slice(1, line.length-1);
	        sections[currentSection] = [];
	      } else {
	        line = line.replace(/^\s+|\s+$/g, '');
	        if (sections[currentSection]) {
	          sections[currentSection].push(line);
	        }
	      }
	    }

	    return sections;
	  }

	  return {
	    get: get,
	    parse: parse
	  };
	}]);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 37 */
/***/ function(module, exports) {

	/**
	 * FEDERATION
	 *
	 * The federation service looks up and caches federation queries.
	 *
	 * These files are used to do DNS-based verifications autonomously on the
	 * client-side. Quite neat when you think about it and a decent solution until
	 * we have a network-internal nickname system.
	 */

	var module = angular.module('federation', []);

	module.factory('rpFederation', ['$q', '$rootScope', 'rpRippleTxt',
	                               function ($q, $scope, $txt) {
	  var txts = {};

	  function check_email(email) {
	    var federationPromise = $q.defer();

	    var tmp = email.split('@');
	    var domain = tmp.pop();
	    var user = tmp.join('@');

	    var txtPromise = $txt.get(domain);

	    if (txtPromise) {
	      if ("function" === typeof txtPromise.then) {
	        txtPromise.then(processTxt, handleNoTxt);
	      } else {
	        processTxt(txtPromise);
	      }
	    } else {
	      handleNoTxt();
	    }

	    return federationPromise.promise;

	    function handleNoTxt() {
	      federationPromise.reject({
	        result: "error",
	        error: "noRippleTxt",
	        error_message: "Ripple.txt not available for the requested domain."
	      });
	    }
	    function processTxt(txt) {
	      if (txt.federation_url) {
	        $.ajax({
	          url: txt.federation_url[0],
	          dataType: "json",
	          data: {
	            type: 'federation',
	            domain: domain,
	            destination: user,
	            // DEPRECATED "destination" is a more neutral name for this field
	            //   than "user"
	            user: user
	          },
	          error: function () {
	            $scope.$apply(function() {
	              federationPromise.reject({
	                result: "error",
	                error: "unavailable",
	                error_message: "Federation gateway did not respond."
	              });
	            });
	          },
	          success: function (data) {
	            $scope.$apply(function() {
	              if ("object" === typeof data &&
	                  "object" === typeof data.federation_json &&
	                  data.federation_json.type === "federation_record" &&
	                  (data.federation_json.user === user ||
	                   data.federation_json.destination === user) &&
	                  data.federation_json.domain === domain) {
	                federationPromise.resolve(data.federation_json);
	              } else if ("string" === typeof data.error) {
	                federationPromise.reject({
	                  result: "error",
	                  error: "remote",
	                  error_remote: data.error,
	                  error_message: data.error_message
	                    ? "Service error: " + data.error_message
	                    : "Unknown remote service error."
	                });
	              } else {
	                federationPromise.reject({
	                  result: "error",
	                  error: "unavailable",
	                  error_message: "Federation gateway's response was invalid."
	                });
	              }
	            });
	          }
	        });
	      } else {
	        federationPromise.reject({
	          result: "error",
	          error: "noFederation",
	          error_message: "Federation is not available on the requested domain."
	        });
	      }
	    }
	  }

	  return {
	    check_email: check_email
	  };
	}]);


/***/ },
/* 38 */
/***/ function(module, exports) {

	/**
	 * DOMAIN ALIAS
	 *
	 * The domain alias service resolves ripple address to domains.
	 *
	 * In the AccountRoot entry of any ripple account users can provide a reference
	 * to a domain they own. Ownership of the domain is verified via the ripple.txt
	 * magic file.
	 *
	 * This service provides both the lookup in the ledger and the subsequent
	 * verification via ripple.txt.
	 */

	var module = angular.module('domainalias', ['network', 'rippletxt']);

	module.factory('rpDomainAlias', ['$q', '$rootScope', 'rpNetwork', 'rpRippleTxt',
	                                 function ($q, $scope, net, txt)
	{
	  var aliases = {};

	  /**
	   * Validates a domain against an object parsed from ripple.txt data.
	   *
	   * @private
	   */
	  function validateDomain(domain, address, data)
	  {
	    // Validate domain
	    if (!data.domain ||
	        data.domain.length !== 1 ||
	        data.domain[0] !== domain) {
	      return false;
	    }

	    // Validate address
	    if (!data.accounts) {
	      return false;
	    }
	    for (var i = 0, l = data.accounts.length; i < l; i++) {
	      if (data.accounts[i] === address) {
	        return true;
	      }
	    }

	    return false;
	  }

	  function getAliasForAddress(address) {
	    if (aliases[address]) {
	      return aliases[address];
	    } else {
	      var aliasPromise = $q.defer();

	      net.remote.request_account_info(address)
	        .on('success', function (data) {
	          if (data.account_data.Domain) {
	            $scope.$apply(function () {
	              var domain = sjcl.codec.utf8String.fromBits(sjcl.codec.hex.toBits(data.account_data.Domain));
	              var txtData = txt.get(domain);
	              txtData.then(function (data) {
	                var valid = validateDomain(domain, address, data);
	                aliasPromise.resolve(valid ? domain : false);
	              }, function (error) {

	              });
	            });
	          }
	        })
	        .on('error', function () {})
	        .request();

	      aliases[address] = aliasPromise.promise;

	      return aliasPromise.promise;
	    }
	  }

	  return {
	    getAliasForAddress: getAliasForAddress
	  };
	}]);


/***/ },
/* 39 */
/***/ function(module, exports) {

	/**
	 * ZIPZAP
	 */

	var module = angular.module('zipzap', []);

	module.factory('rpZipzap', ['$rootScope', function($scope)
	{
	  var Zipzap = function ()
	  {
	    this.baseUrl = Options.zipzap.requester;
	    this.params = {
	      data: {}
	    };
	  };

	  Zipzap.prototype.register = function (rpAddress,fields)
	  {
	    this.params.action = 'signup';
	    this.params.type = 'POST';

	    this.params.data = {
	      "MerchantCustomerID": rpAddress,
	      "FirstName": fields.firstname,
	      "LastName": fields.lastname,
	      "Address": fields.address,
	      "City": fields.city,
	      "State": fields.state,
	      "PostalCode": fields.zipcode,
	      "CountryCode": fields.countrycode ? fields.countrycode.toUpperCase() : '',
	      "Phone": fields.phone,
	      "DateOfBirth": fields.dob,
	      "Email": fields.email,
	      "AcctType": "Multi",
	      "ComplianceAnswers": [{
	        "QuestionID": "80a06fff-284d-e311-8fba-0653b901631c",
	//        "QuestionID": "6f160854-8e48-e311-874f-1e35e7c25ebe",
	        "Answer": fields.ssn
	      }]
	    }
	  };

	  Zipzap.prototype.locate = function (query)
	  {
	    this.params.action = 'locate';
	    this.params.type = 'GET';
	    this.params.q = encodeURIComponent(encodeURIComponent(query));
	  };

	  Zipzap.prototype.request = function (callback)
	  {
	    console.log('request called');

	    var url = this.baseUrl + '?action=' + this.params.action;

	    if (this.params.q) {
	      url = url + '&q=' + this.params.q;
	    }

	    $.ajax({
	      'type': this.params.type,
	      'url': url,
	      'data': this.params.data,
	      'dataType' : 'json',
	      'success': function(data){
	        data = data ? data : {};

	        callback(data);
	        console.log('request response',data);
	      },
	      'error': function(err){
	        console.log('error',err);
	      }
	    });
	  };

	  return new Zipzap();
	}]);


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Tab = __webpack_require__(41).Tab;

	var RegisterTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(RegisterTab, Tab);

	RegisterTab.prototype.tabName = 'register';
	RegisterTab.prototype.pageMode = 'single';
	RegisterTab.prototype.parent = 'main';

	RegisterTab.prototype.angular = function (module) {
	  module.controller('RegisterCtrl', ['$scope', '$location', '$element', 'rpId', 'rpTracker',
	                                     function ($scope, $location, $element, $id, $rpTracker)
	  {
	    if ($id.loginStatus) {
	      $location.path('/balance');
	      return;
	    }

	    $scope.backendChange = function()
	    {
	      $id.blobBackends = $scope.blobBackendCollection.something.value.split(',');
	      if (!store.disabled) {
	        store.set('ripple_blobBackends', $id.blobBackends);
	      }
	    };

	    $scope.reset = function()
	    {
	      $scope.username = '';
	      $scope.password = '';
	      $scope.passwordSet = {};
	      $scope.password1 = '';
	      $scope.password2 = '';
	      $scope.master = '';
	      $scope.key = '';
	      $scope.mode = 'form';
	      $scope.showMasterKeyInput = false;
	      $scope.submitLoading = false;
	      $scope.track = true;

	      if ($scope.registerForm) $scope.registerForm.$setPristine(true);
	    };

	    $scope.register = function()
	    {
	      $id.register($scope.username, $scope.password1, function(key){
	        $scope.password = new Array($scope.password1.length+1).join("*");
	        $scope.keyOpen = key;
	        $scope.key = $scope.keyOpen[0] + new Array($scope.keyOpen.length).join("*");

	        $scope.mode = 'welcome';
	      }, $scope.masterkey);
	    };

	    var updateFormFields = function(){
	      var username;
	      var password1;
	      var password2;

	      username = $element.find('input[name="register_username"]').eq(0).val();
	      password1 = $element.find('input[name="register_password1"]').eq(0).val();
	      password2 = $element.find('input[name="register_password2"]').eq(0).val();

	      if ("string" === typeof username) {
	        $scope.registerForm.register_username.$setViewValue(username);
	      }
	      if ("string" === typeof password1) {
	        $scope.registerForm.register_password1.$setViewValue(password1);
	      }
	      if ("string" === typeof password2) {
	        $scope.registerForm.register_password2.$setViewValue(password2);
	      }
	    };

	    /**
	     * Registration cases
	     *
	     * -- CASE --                                                            -- ACTION --
	     * 1. username or/and password is/are missing ----------------------------- show error
	     * 2. passwords do not match ---------------------------------------------- show error
	     * 3. username and password passed the validation
	     *    3.1 master key is not present
	     *        3.1.1 account exists
	     *              3.1.1.1 and we can login ---------------------------------- login
	     *              3.1.1.2 and we can't login -------------------------------- show error
	     *        3.1.2 account doesn't exist ------------------------------------- register and generate master key
	     *    3.3 master key is present
	     *        3.3.1 account exists, but we can't login ------------------------ show error
	     *        3.3.2 account exists and it uses the same master key =----------- login
	     *        3.3.3 account exists, and it uses another master key
	     *              3.3.2.1 master key is valid ------------------------------- tell him about the situation, and let him decide what to do
	     *              3.3.2.2 master key is invalid ----------------------------- show error
	     *        3.3.3 account doesn't exist ------------------------------------- register with given master key
	     */

	    $scope.submitForm = function()
	    {
	      // Disable submit button
	      $scope.submitLoading = true;

	      updateFormFields();

	      var regInProgress;

	      $id.exists($scope.username, $scope.password1, function (error, exists) {
	        if (!regInProgress) {
	          if (!exists) {
	            regInProgress = true;

	            if (Options.mixpanel) {
	              // XXX You should never modify the Options object!!
	              Options.mixpanel.track = $scope.track;
	            }

	            if (!store.disabled) {
	              store.set('ripple_settings', JSON.stringify(Options));
	            }

	            $scope.register();
	          } else {
	            $id.login($scope.username, $scope.password1, null, function (error) {
	              $scope.submitLoading = false;
	              if (error) {
	                // There is a conflicting wallet, but we can't login to it
	                $scope.mode = 'loginerror';
	              } else if ($scope.masterkey &&
	                         $scope.masterkey != $scope.userCredentials.master_seed) {
	                $scope.mode = 'masterkeyerror';
	              } else {
	                $location.path('/balance');
	              }
	            });
	          }
	        }
	      });
	    };

	    $scope.goToBalance = function()
	    {
	      $scope.mode = 'form';
	      $scope.reset();

	      $rpTracker.track('Sign Up', {
	        'Used key': !!$scope.masterkey,
	        'Password strength': $scope.strength,
	        'Blob': $scope.blobBackendCollection.something.name,
	        'Showed secret key': !!$scope.showSecret,
	        'Showed password': !!$scope.showPassword
	      });

	      $location.path('/balance');
	    };

	    $scope.reset();
	  }]);
	};

	module.exports = RegisterTab;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4),
	    webutil = __webpack_require__(16),
	    log = __webpack_require__(30);

	var Tab = function (config)
	{
	};

	Tab.prototype.pageMode = 'default';

	Tab.prototype.mainMenu = 'none';

	/**
	 * AngularJS dependencies.
	 *
	 * List any controllers the tab uses here.
	 */
	Tab.prototype.angularDeps = [
	  // Directives
	  'charts',
	  'effects',
	  'events',
	  'fields',
	  'formatters',
	  'directives',
	  'validators',
	  'datalinks',
	  // Filters
	  'filters'
	];

	/**
	 * Other routes this tab should handle.
	 */
	Tab.prototype.aliases = [];

	exports.Tab = Tab;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var util = __webpack_require__(4);
	var Tab = __webpack_require__(41).Tab;

	var LoginTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(LoginTab, Tab);

	LoginTab.prototype.tabName = 'login';
	LoginTab.prototype.pageMode = 'single';
	LoginTab.prototype.parent = 'main';

	LoginTab.prototype.angular = function (module) {
	  module.controller('LoginCtrl', ['$scope', '$element', '$routeParams',
	                                  '$location', 'rpId', '$rootScope',
	                                  'rpPopup', '$timeout', 'rpTracker', 'getChallenge',
	                                  function ($scope, $element, $routeParams,
	                                            $location, $id, $rootScope,
	                                            popup, $timeout, $rpTracker, $challenge)
	  {
	    $scope.backendChange = function()
	    {
	      $id.blobBackends = $scope.blobBackendCollection.something.value.split(',');

	      if (!store.disabled) {
	        store.set('ripple_blobBackends', $id.blobBackends);
	      }
	    };

	    $scope.error = '';
	    $scope.username = '';
	    $scope.password = '';
	    $scope.loginForm && $scope.loginForm.$setPristine(true);
	    $scope.backendMessages = [];

	    // Autofill fix
	    $timeout(function(){
	      $scope.$apply(function () {
	        $scope.username = $element.find('input[name="login_username"]').val();
	        $scope.password = $element.find('input[name="login_password"]').val();
	      });
	    }, 1000);

	    $rootScope.$on("$blobError", function (e, err) {
	      console.log("BLOB ERROR", arguments);
	      $scope.backendMessages.push({'backend': err.backend, 'message': err.message});
	    });

	    var updateFormFields = function(){
	      var username;
	      var password;

	      // There are multiple login forms due to the Ripple URI login feature.
	      // But only one of them should be visible and that's the one we want.
	      username = $element.find('input[name="login_username"]:visible').eq(0).val();
	      password = $element.find('input[name="login_password"]:visible').eq(0).val();

	      if ("string" === typeof username) {
	        $scope.loginForm.login_username.$setViewValue(username);
	      }
	      if ("string" === typeof password) {
	        $scope.loginForm.login_password.$setViewValue(password);
	      }
	    };

	    // Issues #1024, #1060
	    $scope.$watch('username',function(){
	      $timeout(function(){
	        $scope.$apply(function () {
	         updateFormFields();
	        })
	      }, 50);
	    });

	    // Ok, now try to remove this line and then go write "a" for wallet name, and "a" for passphrase.
	    // "Open wallet" is still disabled hah? no worries, just enter anything else and it will be activated.
	    // Probably this is an AngularJS issue. Had no time to check it yet.
	    $scope.$watch('password');

	    $scope.submitForm = function()
	    {
	      if ($scope.ajax_loading) return;

	      $scope.backendMessages = [];

	      // Issue #36: Password managers may change the form values without
	      // triggering the events Angular.js listens for. So we simply force
	      // an update of Angular's model when the form is submitted.
	      updateFormFields();

	      setImmediate(function () {
	        $id.login($scope.username, $scope.password, null, function (err, blob) {
	          $scope.ajax_loading = false;

	          if (err) {
	            $scope.error = 'Login failed due to: ' + '\n' + err.message;

	            if (err.name === "OldBlobError") {
	              popup.confirm("Wallet Upgrade", "Ripple is upgrading the wallet encryption format. After the upgrade, only Ripple clients 0.2.24 or higher can access your wallet.<br><br>If you use other clients, please make sure they are upgraded to the current version.",
	                            "OK", "migrateConfirm()", null,
	                            "Abort login", null, null,
	                            $scope, {});

	              $scope.migrateConfirm = function () {
	                $id.allowOldBlob = true;
	                $scope.submitForm();
	              };
	            }

	            if (err.name !== "BlobError") {
	              $scope.backendMessages.push({'backend': "ID", 'message': err.message});
	            }

	            $rpTracker.track('Login', {
	              'Status': 'error',
	              'Message': err.message,
	              'Blob': $scope.blobBackendCollection.something.name
	            });

	            return;
	          }

	          $rpTracker.track('Login', {
	            'Status': 'success',
	            'Blob': $scope.blobBackendCollection.something.name
	          });

	          // Challenge processing after ripple auth
	          $challenge.requestChallenge()
	            .success(function (data) {
	              var challenge = data,
	                  NodeRSA = __webpack_require__(43);

	              // generate new key
	              var key = new NodeRSA({b: 512}, {encryptionScheme: 'pkcs1'}),
	                publicKey = key.exportKey('public');

	              // sign challenge with private key
	              var signature = key.sign(challenge, 'hex');

	              // remove linebreaks for public key
	              var pkey = publicKey.replace(/(\r\n|\n|\r)/gm, ''),
	                ripple_address = $scope.$parent.userBlob.data.account_id,
	                username = $scope.username;

	              $challenge.returnChallenge(challenge, signature, pkey, ripple_address, username)
	                .success(function (data) {
	                  if (redirectAfterLogin) {
	                    window.location.href = loginRedirectUrl;
	                  }
	                  $scope.status = 'Challenge sucessfully processed';
	                  console.log('Login success');
	                })
	                .error(function (data) {
	                  $scope.error = 'Failed to process challenge';
	                  console.log('Login failed');
	                });
	            });
	        });
	      });

	      $scope.ajax_loading = true;
	      $scope.error = '';
	      $scope.status = 'Fetching wallet...';
	    };
	  }]);

	  /**
	   * Focus on username input only if it's empty. Otherwise focus on password field
	   * This directive will not be used anywhere else, that's why it's here.
	   */
	  module.directive('rpFocusOnEmpty', ['$timeout', function($timeout) {
	    return function($scope, element) {
	      $timeout(function(){
	        $scope.$watch(function () {return element.is(':visible')}, function(newValue) {
	          if (newValue === true && !element.val())
	            element.focus();
	        })
	      }, 200)
	    }
	  }]);
	};



	module.exports = LoginTab;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * RSA library for Node.js
	 *
	 * Copyright (c) 2014 rzcoder
	 * All Rights Reserved.
	 *
	 * License BSD
	 */

	var rsa = __webpack_require__(48);
	var crypt = __webpack_require__(51);
	var ber = __webpack_require__(77).Ber;
	var _ = __webpack_require__(49);
	var utils = __webpack_require__(67);
	var schemes = __webpack_require__(68);
	var formats = __webpack_require__(84);

	module.exports = (function () {
	    var SUPPORTED_HASH_ALGORITHMS = {
	        node10: ['md4', 'md5', 'ripemd160', 'sha', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
	        node: ['md4', 'md5', 'ripemd160', 'sha', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
	        iojs: ['md4', 'md5', 'ripemd160', 'sha', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
	        browser: ['md5', 'ripemd160', 'sha1', 'sha256', 'sha512']
	    };

	    var DEFAULT_ENCRYPTION_SCHEME = 'pkcs1_oaep';
	    var DEFAULT_SIGNING_SCHEME = 'pkcs1';

	    var DEFAULT_EXPORT_FORMAT = 'private';
	    var EXPORT_FORMAT_ALIASES = {
	        'private': 'pkcs1-private-pem',
	        'private-der': 'pkcs1-private-der',
	        'public': 'pkcs8-public-pem',
	        'public-der': 'pkcs8-public-der'
	    };

	    /**
	     * @param key {string|buffer|object} Key in PEM format, or data for generate key {b: bits, e: exponent}
	     * @constructor
	     */
	    function NodeRSA(key, format, options) {
	        if (!(this instanceof NodeRSA)) {
	            return new NodeRSA(key, format, options);
	        }

	        if (_.isObject(format)) {
	            options = format;
	            format = undefined;
	        }

	        this.$options = {
	            signingScheme: DEFAULT_SIGNING_SCHEME,
	            signingSchemeOptions: {
	                hash: 'sha256',
	                saltLength: null
	            },
	            encryptionScheme: DEFAULT_ENCRYPTION_SCHEME,
	            encryptionSchemeOptions: {
	                hash: 'sha1',
	                label: null
	            },
	            environment: utils.detectEnvironment(),
	            rsaUtils: this
	        };
	        this.keyPair = new rsa.Key();
	        this.$cache = {};

	        if (Buffer.isBuffer(key) || _.isString(key)) {
	            this.importKey(key, format);
	        } else if (_.isObject(key)) {
	            this.generateKeyPair(key.b, key.e);
	        }

	        this.setOptions(options);
	    }

	    /**
	     * Set and validate options for key instance
	     * @param options
	     */
	    NodeRSA.prototype.setOptions = function (options) {
	        options = options || {};
	        if (options.environment) {
	            this.$options.environment = options.environment;
	        }

	        if (options.signingScheme) {
	            if (_.isString(options.signingScheme)) {
	                var signingScheme = options.signingScheme.toLowerCase().split('-');
	                if (signingScheme.length == 1) {
	                    if (_.indexOf(SUPPORTED_HASH_ALGORITHMS.node, signingScheme[0]) > -1) {
	                        this.$options.signingSchemeOptions = {
	                            hash: signingScheme[0]
	                        };
	                        this.$options.signingScheme = DEFAULT_SIGNING_SCHEME;
	                    } else {
	                        this.$options.signingScheme = signingScheme[0];
	                        this.$options.signingSchemeOptions = {
	                            hash: null
	                        };
	                    }
	                } else {
	                    this.$options.signingSchemeOptions = {
	                        hash: signingScheme[1]
	                    };
	                    this.$options.signingScheme = signingScheme[0];
	                }
	            } else if (_.isObject(options.signingScheme)) {
	                this.$options.signingScheme = options.signingScheme.scheme || DEFAULT_SIGNING_SCHEME;
	                this.$options.signingSchemeOptions = _.omit(options.signingScheme, 'scheme');
	            }

	            if (!schemes.isSignature(this.$options.signingScheme)) {
	                throw Error('Unsupported signing scheme');
	            }

	            if (this.$options.signingSchemeOptions.hash &&
	                _.indexOf(SUPPORTED_HASH_ALGORITHMS[this.$options.environment], this.$options.signingSchemeOptions.hash) == -1) {
	                throw Error('Unsupported hashing algorithm for ' + this.$options.environment + ' environment');
	            }
	        }

	        if (options.encryptionScheme) {
	            if (_.isString(options.encryptionScheme)) {
	                this.$options.encryptionScheme = options.encryptionScheme.toLowerCase();
	                this.$options.encryptionSchemeOptions = {};
	            } else if (_.isObject(options.encryptionScheme)) {
	                this.$options.encryptionScheme = options.encryptionScheme.scheme || DEFAULT_ENCRYPTION_SCHEME;
	                this.$options.encryptionSchemeOptions = _.omit(options.encryptionScheme, 'scheme');
	            }

	            if (!schemes.isEncryption(this.$options.encryptionScheme)) {
	                throw Error('Unsupported encryption scheme');
	            }

	            if (this.$options.encryptionSchemeOptions.hash &&
	                _.indexOf(SUPPORTED_HASH_ALGORITHMS[this.$options.environment], this.$options.encryptionSchemeOptions.hash) == -1) {
	                throw Error('Unsupported hashing algorithm for ' + this.$options.environment + ' environment');
	            }
	        }

	        this.keyPair.setOptions(this.$options);
	    };

	    /**
	     * Generate private/public keys pair
	     *
	     * @param bits {int} length key in bits. Default 2048.
	     * @param exp {int} public exponent. Default 65537.
	     * @returns {NodeRSA}
	     */
	    NodeRSA.prototype.generateKeyPair = function (bits, exp) {
	        bits = bits || 2048;
	        exp = exp || 65537;

	        if (bits % 8 !== 0) {
	            throw Error('Key size must be a multiple of 8.');
	        }

	        this.keyPair.generate(bits, exp.toString(16));
	        this.$cache = {};
	        return this;
	    };

	    /**
	     * Importing key
	     * @param keyData {string|buffer}
	     * @param format {string}
	     */
	    NodeRSA.prototype.importKey = function (keyData, format) {
	        if (!keyData) {
	            throw Error("Empty key given");
	        }

	        if (format) {
	            format = EXPORT_FORMAT_ALIASES[format] || format;
	        }

	        if (!formats.detectAndImport(this.keyPair, keyData, format) && format === undefined) {
	            throw Error("Key format must be specified");
	        }

	        this.$cache = {};
	    };

	    /**
	     * Exporting key
	     * @param format {string}
	     */
	    NodeRSA.prototype.exportKey = function (format) {
	        format = format || DEFAULT_EXPORT_FORMAT;
	        format = EXPORT_FORMAT_ALIASES[format] || format;

	        if (!this.$cache[format]) {
	            this.$cache[format] = formats.detectAndExport(this.keyPair, format);
	        }

	        return this.$cache[format];
	    };

	    /**
	     * Check if key pair contains private key
	     */
	    NodeRSA.prototype.isPrivate = function () {
	        return this.keyPair.isPrivate();
	    };

	    /**
	     * Check if key pair contains public key
	     * @param strict {boolean} - public key only, return false if have private exponent
	     */
	    NodeRSA.prototype.isPublic = function (strict) {
	        return this.keyPair.isPublic(strict);
	    };

	    /**
	     * Check if key pair doesn't contains any data
	     */
	    NodeRSA.prototype.isEmpty = function (strict) {
	        return !(this.keyPair.n || this.keyPair.e || this.keyPair.d);
	    };

	    /**
	     * Encrypting data method with public key
	     *
	     * @param buffer {string|number|object|array|Buffer} - data for encrypting. Object and array will convert to JSON string.
	     * @param encoding {string} - optional. Encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
	     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
	     * @returns {string|Buffer}
	     */
	    NodeRSA.prototype.encrypt = function (buffer, encoding, source_encoding) {
	        return this.$$encryptKey(false, buffer, encoding, source_encoding);
	    };

	    /**
	     * Decrypting data method with private key
	     *
	     * @param buffer {Buffer} - buffer for decrypting
	     * @param encoding - encoding for result string, can also take 'json' or 'buffer' for the automatic conversion of this type
	     * @returns {Buffer|object|string}
	     */
	    NodeRSA.prototype.decrypt = function (buffer, encoding) {
	        return this.$$decryptKey(false, buffer, encoding);
	    };

	    /**
	     * Encrypting data method with private key
	     *
	     * Parameters same as `encrypt` method
	     */
	    NodeRSA.prototype.encryptPrivate = function (buffer, encoding, source_encoding) {
	        return this.$$encryptKey(true, buffer, encoding, source_encoding);
	    };

	    /**
	     * Decrypting data method with public key
	     *
	     * Parameters same as `decrypt` method
	     */
	    NodeRSA.prototype.decryptPublic = function (buffer, encoding) {
	        return this.$$decryptKey(true, buffer, encoding);
	    };

	    /**
	     * Encrypting data method with custom key
	     */
	    NodeRSA.prototype.$$encryptKey = function (usePrivate, buffer, encoding, source_encoding) {
	        try {
	            var res = this.keyPair.encrypt(this.$getDataForEncrypt(buffer, source_encoding), usePrivate);

	            if (encoding == 'buffer' || !encoding) {
	                return res;
	            } else {
	                return res.toString(encoding);
	            }
	        } catch (e) {
	            throw Error('Error during encryption. Original error: ' + e);
	        }
	    };

	    /**
	     * Decrypting data method with custom key
	     */
	    NodeRSA.prototype.$$decryptKey = function (usePublic, buffer, encoding) {
	        try {
	            buffer = _.isString(buffer) ? new Buffer(buffer, 'base64') : buffer;
	            var res = this.keyPair.decrypt(buffer, usePublic);

	            if (res === null) {
	                throw Error('Key decrypt method returns null.');
	            }

	            return this.$getDecryptedData(res, encoding);
	        } catch (e) {
	            throw Error('Error during decryption (probably incorrect key). Original error: ' + e);
	        }
	    };

	    /**
	     *  Signing data
	     *
	     * @param buffer {string|number|object|array|Buffer} - data for signing. Object and array will convert to JSON string.
	     * @param encoding {string} - optional. Encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
	     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
	     * @returns {string|Buffer}
	     */
	    NodeRSA.prototype.sign = function (buffer, encoding, source_encoding) {
	        if (!this.isPrivate()) {
	            throw Error("It is not private key");
	        }

	        var res = this.keyPair.sign(this.$getDataForEncrypt(buffer, source_encoding));

	        if (encoding && encoding != 'buffer') {
	            res = res.toString(encoding);
	        }

	        return res;
	    };

	    /**
	     *  Verifying signed data
	     *
	     * @param buffer - signed data
	     * @param signature
	     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
	     * @param signature_encoding - optional. Encoding of given signature. May be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
	     * @returns {*}
	     */
	    NodeRSA.prototype.verify = function (buffer, signature, source_encoding, signature_encoding) {
	        if (!this.isPublic()) {
	            throw Error("It is not public key");
	        }
	        signature_encoding = (!signature_encoding || signature_encoding == 'buffer' ? null : signature_encoding);
	        return this.keyPair.verify(this.$getDataForEncrypt(buffer, source_encoding), signature, signature_encoding);
	    };

	    /**
	     * Returns key size in bits
	     * @returns {int}
	     */
	    NodeRSA.prototype.getKeySize = function () {
	        return this.keyPair.keySize;
	    };

	    /**
	     * Returns max message length in bytes (for 1 chunk) depending on current encryption scheme
	     * @returns {int}
	     */
	    NodeRSA.prototype.getMaxMessageSize = function () {
	        return this.keyPair.maxMessageLength;
	    };

	    /**
	     * Preparing given data for encrypting/signing. Just make new/return Buffer object.
	     *
	     * @param buffer {string|number|object|array|Buffer} - data for encrypting. Object and array will convert to JSON string.
	     * @param encoding {string} - optional. Encoding for given string. Default utf8.
	     * @returns {Buffer}
	     */
	    NodeRSA.prototype.$getDataForEncrypt = function (buffer, encoding) {
	        if (_.isString(buffer) || _.isNumber(buffer)) {
	            return new Buffer('' + buffer, encoding || 'utf8');
	        } else if (Buffer.isBuffer(buffer)) {
	            return buffer;
	        } else if (_.isObject(buffer)) {
	            return new Buffer(JSON.stringify(buffer));
	        } else {
	            throw Error("Unexpected data type");
	        }
	    };

	    /**
	     *
	     * @param buffer {Buffer} - decrypted data.
	     * @param encoding - optional. Encoding for result output. May be 'buffer', 'json' or any of Node.js Buffer supported encoding.
	     * @returns {*}
	     */
	    NodeRSA.prototype.$getDecryptedData = function (buffer, encoding) {
	        encoding = encoding || 'buffer';

	        if (encoding == 'buffer') {
	            return buffer;
	        } else if (encoding == 'json') {
	            return JSON.parse(buffer.toString());
	        } else {
	            return buffer.toString(encoding);
	        }
	    };

	    return NodeRSA;
	})();

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(45)
	var ieee754 = __webpack_require__(46)
	var isArray = __webpack_require__(47)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer, (function() { return this; }())))

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 46 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 47 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*
	 * RSA Encryption / Decryption with PKCS1 v2 Padding.
	 * 
	 * Copyright (c) 2003-2005  Tom Wu
	 * All Rights Reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
	 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
	 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
	 *
	 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
	 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
	 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
	 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
	 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 * In addition, the following condition applies:
	 *
	 * All redistributions must retain an intact copy of this copyright notice
	 * and disclaimer.
	 */

	/*
	 * Node.js adaptation
	 * long message support implementation
	 * signing/verifying
	 *
	 * 2014 rzcoder
	 */

	var _ = __webpack_require__(49);
	var crypt = __webpack_require__(51);
	var BigInteger = __webpack_require__(66);
	var utils = __webpack_require__(67);
	var schemes = __webpack_require__(68);
	var encryptEngines = __webpack_require__(72);

	exports.BigInteger = BigInteger;
	module.exports.Key = (function () {
	    /**
	     * RSA key constructor
	     *
	     * n - modulus
	     * e - publicExponent
	     * d - privateExponent
	     * p - prime1
	     * q - prime2
	     * dmp1 - exponent1 -- d mod (p1)
	     * dmq1 - exponent2 -- d mod (q-1)
	     * coeff - coefficient -- (inverse of q) mod p
	     */
	    function RSAKey() {
	        this.n = null;
	        this.e = 0;
	        this.d = null;
	        this.p = null;
	        this.q = null;
	        this.dmp1 = null;
	        this.dmq1 = null;
	        this.coeff = null;
	    }

	    RSAKey.prototype.setOptions = function (options) {
	        var signingSchemeProvider = schemes[options.signingScheme];
	        var encryptionSchemeProvider = schemes[options.encryptionScheme];

	        if (signingSchemeProvider === encryptionSchemeProvider) {
	            this.signingScheme = this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
	        } else {
	            this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
	            this.signingScheme = signingSchemeProvider.makeScheme(this, options);
	        }

	        this.encryptEngine = encryptEngines.getEngine(this, options);
	    };

	    /**
	     * Generate a new random private key B bits long, using public expt E
	     * @param B
	     * @param E
	     */
	    RSAKey.prototype.generate = function (B, E) {
	        var qs = B >> 1;
	        this.e = parseInt(E, 16);
	        var ee = new BigInteger(E, 16);
	        while (true) {
	            while (true) {
	                this.p = new BigInteger(B - qs, 1);
	                if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) === 0 && this.p.isProbablePrime(10))
	                    break;
	            }
	            while (true) {
	                this.q = new BigInteger(qs, 1);
	                if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) === 0 && this.q.isProbablePrime(10))
	                    break;
	            }
	            if (this.p.compareTo(this.q) <= 0) {
	                var t = this.p;
	                this.p = this.q;
	                this.q = t;
	            }
	            var p1 = this.p.subtract(BigInteger.ONE);
	            var q1 = this.q.subtract(BigInteger.ONE);
	            var phi = p1.multiply(q1);
	            if (phi.gcd(ee).compareTo(BigInteger.ONE) === 0) {
	                this.n = this.p.multiply(this.q);
	                this.d = ee.modInverse(phi);
	                this.dmp1 = this.d.mod(p1);
	                this.dmq1 = this.d.mod(q1);
	                this.coeff = this.q.modInverse(this.p);
	                break;
	            }
	        }
	        this.$$recalculateCache();
	    };

	    /**
	     * Set the private key fields N, e, d and CRT params from buffers
	     *
	     * @param N
	     * @param E
	     * @param D
	     * @param P
	     * @param Q
	     * @param DP
	     * @param DQ
	     * @param C
	     */
	    RSAKey.prototype.setPrivate = function (N, E, D, P, Q, DP, DQ, C) {
	        if (N && E && D && N.length > 0 && E.length > 0 && D.length > 0) {
	            this.n = new BigInteger(N);
	            this.e = utils.get32IntFromBuffer(E, 0);
	            this.d = new BigInteger(D);

	            if (P && Q && DP && DQ && C) {
	                this.p = new BigInteger(P);
	                this.q = new BigInteger(Q);
	                this.dmp1 = new BigInteger(DP);
	                this.dmq1 = new BigInteger(DQ);
	                this.coeff = new BigInteger(C);
	            } else {
	                // TODO: re-calculate any missing CRT params
	            }
	            this.$$recalculateCache();
	        } else
	            throw Error("Invalid RSA private key");
	    };

	    /**
	     * Set the public key fields N and e from hex strings
	     * @param N
	     * @param E
	     */
	    RSAKey.prototype.setPublic = function (N, E) {
	        if (N && E && N.length > 0 && E.length > 0) {
	            this.n = new BigInteger(N);
	            this.e = utils.get32IntFromBuffer(E, 0);
	            this.$$recalculateCache();
	        } else
	            throw Error("Invalid RSA public key");
	    };

	    /**
	     * private
	     * Perform raw private operation on "x": return x^d (mod n)
	     *
	     * @param x
	     * @returns {*}
	     */
	    RSAKey.prototype.$doPrivate = function (x) {
	        if (this.p || this.q) {
	            return x.modPow(this.d, this.n);
	        }

	        // TODO: re-calculate any missing CRT params
	        var xp = x.mod(this.p).modPow(this.dmp1, this.p);
	        var xq = x.mod(this.q).modPow(this.dmq1, this.q);

	        while (xp.compareTo(xq) < 0) {
	            xp = xp.add(this.p);
	        }
	        return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
	    };

	    /**
	     * private
	     * Perform raw public operation on "x": return x^e (mod n)
	     *
	     * @param x
	     * @returns {*}
	     */
	    RSAKey.prototype.$doPublic = function (x) {
	        return x.modPowInt(this.e, this.n);
	    };

	    /**
	     * Return the PKCS#1 RSA encryption of buffer
	     * @param buffer {Buffer}
	     * @returns {Buffer}
	     */
	    RSAKey.prototype.encrypt = function (buffer, usePrivate) {
	        var buffers = [];
	        var results = [];
	        var bufferSize = buffer.length;
	        var buffersCount = Math.ceil(bufferSize / this.maxMessageLength) || 1; // total buffers count for encrypt
	        var dividedSize = Math.ceil(bufferSize / buffersCount || 1); // each buffer size

	        if (buffersCount == 1) {
	            buffers.push(buffer);
	        } else {
	            for (var bufNum = 0; bufNum < buffersCount; bufNum++) {
	                buffers.push(buffer.slice(bufNum * dividedSize, (bufNum + 1) * dividedSize));
	            }
	        }

	        for (var i = 0; i < buffers.length; i++) {
	            results.push(this.encryptEngine.encrypt(buffers[i], usePrivate));
	        }

	        return Buffer.concat(results);
	    };

	    /**
	     * Return the PKCS#1 RSA decryption of buffer
	     * @param buffer {Buffer}
	     * @returns {Buffer}
	     */
	    RSAKey.prototype.decrypt = function (buffer, usePublic) {
	        if (buffer.length % this.encryptedDataLength > 0) {
	            throw Error('Incorrect data or key');
	        }

	        var result = [];
	        var offset = 0;
	        var length = 0;
	        var buffersCount = buffer.length / this.encryptedDataLength;

	        for (var i = 0; i < buffersCount; i++) {
	            offset = i * this.encryptedDataLength;
	            length = offset + this.encryptedDataLength;
	            result.push(this.encryptEngine.decrypt(buffer.slice(offset, Math.min(length, buffer.length)), usePublic));
	        }

	        return Buffer.concat(result);
	    };

	    RSAKey.prototype.sign = function (buffer) {
	        return this.signingScheme.sign.apply(this.signingScheme, arguments);
	    };

	    RSAKey.prototype.verify = function (buffer, signature, signature_encoding) {
	        return this.signingScheme.verify.apply(this.signingScheme, arguments);
	    };

	    /**
	     * Check if key pair contains private key
	     */
	    RSAKey.prototype.isPrivate = function () {
	        return this.n && this.e && this.d || false;
	    };

	    /**
	     * Check if key pair contains public key
	     * @param strict {boolean} - public key only, return false if have private exponent
	     */
	    RSAKey.prototype.isPublic = function (strict) {
	        return this.n && this.e && !(strict && this.d) || false;
	    };

	    Object.defineProperty(RSAKey.prototype, 'keySize', {
	        get: function () {
	            return this.cache.keyBitLength;
	        }
	    });

	    Object.defineProperty(RSAKey.prototype, 'encryptedDataLength', {
	        get: function () {
	            return this.cache.keyByteLength;
	        }
	    });

	    Object.defineProperty(RSAKey.prototype, 'maxMessageLength', {
	        get: function () {
	            return this.encryptionScheme.maxMessageLength();
	        }
	    });

	    /**
	     * Caching key data
	     */
	    RSAKey.prototype.$$recalculateCache = function () {
	        this.cache = this.cache || {};
	        // Bit & byte length
	        this.cache.keyBitLength = this.n.bitLength();
	        if (this.cache.keyBitLength % 2 == 1) {
	            this.cache.keyBitLength = this.cache.keyBitLength + 1;
	        }

	        this.cache.keyByteLength = (this.cache.keyBitLength + 6) >> 3;
	    };

	    return RSAKey;
	})();


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * lodash 3.3.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern -d -o ./index.js`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	;(function() {

	  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
	  var undefined;

	  /** Used as the semantic version number. */
	  var VERSION = '3.3.0';

	  /** Used to compose bitmasks for wrapper metadata. */
	  var BIND_FLAG = 1,
	      BIND_KEY_FLAG = 2,
	      CURRY_BOUND_FLAG = 4,
	      CURRY_FLAG = 8,
	      CURRY_RIGHT_FLAG = 16,
	      PARTIAL_FLAG = 32,
	      PARTIAL_RIGHT_FLAG = 64,
	      REARG_FLAG = 128,
	      ARY_FLAG = 256;

	  /** Used as default options for `_.trunc`. */
	  var DEFAULT_TRUNC_LENGTH = 30,
	      DEFAULT_TRUNC_OMISSION = '...';

	  /** Used to detect when a function becomes hot. */
	  var HOT_COUNT = 150,
	      HOT_SPAN = 16;

	  /** Used to indicate the type of lazy iteratees. */
	  var LAZY_FILTER_FLAG = 0,
	      LAZY_MAP_FLAG = 1,
	      LAZY_WHILE_FLAG = 2;

	  /** Used as the `TypeError` message for "Functions" methods. */
	  var FUNC_ERROR_TEXT = 'Expected a function';

	  /** Used as the internal argument placeholder. */
	  var PLACEHOLDER = '__lodash_placeholder__';

	  /** `Object#toString` result references. */
	  var argsTag = '[object Arguments]',
	      arrayTag = '[object Array]',
	      boolTag = '[object Boolean]',
	      dateTag = '[object Date]',
	      errorTag = '[object Error]',
	      funcTag = '[object Function]',
	      mapTag = '[object Map]',
	      numberTag = '[object Number]',
	      objectTag = '[object Object]',
	      regexpTag = '[object RegExp]',
	      setTag = '[object Set]',
	      stringTag = '[object String]',
	      weakMapTag = '[object WeakMap]';

	  var arrayBufferTag = '[object ArrayBuffer]',
	      float32Tag = '[object Float32Array]',
	      float64Tag = '[object Float64Array]',
	      int8Tag = '[object Int8Array]',
	      int16Tag = '[object Int16Array]',
	      int32Tag = '[object Int32Array]',
	      uint8Tag = '[object Uint8Array]',
	      uint8ClampedTag = '[object Uint8ClampedArray]',
	      uint16Tag = '[object Uint16Array]',
	      uint32Tag = '[object Uint32Array]';

	  /** Used to match empty string literals in compiled template source. */
	  var reEmptyStringLeading = /\b__p \+= '';/g,
	      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
	      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

	  /** Used to match HTML entities and HTML characters. */
	  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
	      reUnescapedHtml = /[&<>"'`]/g,
	      reHasEscapedHtml = RegExp(reEscapedHtml.source),
	      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

	  /** Used to match template delimiters. */
	  var reEscape = /<%-([\s\S]+?)%>/g,
	      reEvaluate = /<%([\s\S]+?)%>/g,
	      reInterpolate = /<%=([\s\S]+?)%>/g;

	  /**
	   * Used to match ES template delimiters.
	   * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-template-literal-lexical-components)
	   * for more details.
	   */
	  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

	  /** Used to match `RegExp` flags from their coerced string values. */
	  var reFlags = /\w*$/;

	  /** Used to detect named functions. */
	  var reFuncName = /^\s*function[ \n\r\t]+\w/;

	  /** Used to detect hexadecimal string values. */
	  var reHexPrefix = /^0[xX]/;

	  /** Used to detect host constructors (Safari > 5). */
	  var reHostCtor = /^\[object .+?Constructor\]$/;

	  /** Used to match latin-1 supplementary letters (excluding mathematical operators). */
	  var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;

	  /** Used to ensure capturing order of template delimiters. */
	  var reNoMatch = /($^)/;

	  /**
	   * Used to match `RegExp` special characters.
	   * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
	   * for more details.
	   */
	  var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
	      reHasRegExpChars = RegExp(reRegExpChars.source);

	  /** Used to detect functions containing a `this` reference. */
	  var reThis = /\bthis\b/;

	  /** Used to match unescaped characters in compiled string literals. */
	  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

	  /** Used to match words to create compound words. */
	  var reWords = (function() {
	    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
	        lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';

	    return RegExp(upper + '{2,}(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
	  }());

	  /** Used to detect and test for whitespace. */
	  var whitespace = (
	    // Basic whitespace characters.
	    ' \t\x0b\f\xa0\ufeff' +

	    // Line terminators.
	    '\n\r\u2028\u2029' +

	    // Unicode category "Zs" space separators.
	    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
	  );

	  /** Used to assign default `context` object properties. */
	  var contextProps = [
	    'Array', 'ArrayBuffer', 'Date', 'Error', 'Float32Array', 'Float64Array',
	    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Math', 'Number',
	    'Object', 'RegExp', 'Set', 'String', '_', 'clearTimeout', 'document',
	    'isFinite', 'parseInt', 'setTimeout', 'TypeError', 'Uint8Array',
	    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
	    'window', 'WinRTError'
	  ];

	  /** Used to make template sourceURLs easier to identify. */
	  var templateCounter = -1;

	  /** Used to identify `toStringTag` values of typed arrays. */
	  var typedArrayTags = {};
	  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	  typedArrayTags[uint32Tag] = true;
	  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	  /** Used to identify `toStringTag` values supported by `_.clone`. */
	  var cloneableTags = {};
	  cloneableTags[argsTag] = cloneableTags[arrayTag] =
	  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	  cloneableTags[dateTag] = cloneableTags[float32Tag] =
	  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	  cloneableTags[numberTag] = cloneableTags[objectTag] =
	  cloneableTags[regexpTag] = cloneableTags[stringTag] =
	  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	  cloneableTags[errorTag] = cloneableTags[funcTag] =
	  cloneableTags[mapTag] = cloneableTags[setTag] =
	  cloneableTags[weakMapTag] = false;

	  /** Used as an internal `_.debounce` options object by `_.throttle`. */
	  var debounceOptions = {
	    'leading': false,
	    'maxWait': 0,
	    'trailing': false
	  };

	  /** Used to map latin-1 supplementary letters to basic latin letters. */
	  var deburredLetters = {
	    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
	    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
	    '\xc7': 'C',  '\xe7': 'c',
	    '\xd0': 'D',  '\xf0': 'd',
	    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
	    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
	    '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
	    '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
	    '\xd1': 'N',  '\xf1': 'n',
	    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
	    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
	    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
	    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
	    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
	    '\xc6': 'Ae', '\xe6': 'ae',
	    '\xde': 'Th', '\xfe': 'th',
	    '\xdf': 'ss'
	  };

	  /** Used to map characters to HTML entities. */
	  var htmlEscapes = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#39;',
	    '`': '&#96;'
	  };

	  /** Used to map HTML entities to characters. */
	  var htmlUnescapes = {
	    '&amp;': '&',
	    '&lt;': '<',
	    '&gt;': '>',
	    '&quot;': '"',
	    '&#39;': "'",
	    '&#96;': '`'
	  };

	  /** Used to determine if values are of the language type `Object`. */
	  var objectTypes = {
	    'function': true,
	    'object': true
	  };

	  /** Used to escape characters for inclusion in compiled string literals. */
	  var stringEscapes = {
	    '\\': '\\',
	    "'": "'",
	    '\n': 'n',
	    '\r': 'r',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  /**
	   * Used as a reference to the global object.
	   *
	   * The `this` value is used if it is the global object to avoid Greasemonkey's
	   * restricted `window` object, otherwise the `window` object is used.
	   */
	  var root = (objectTypes[typeof window] && window !== (this && this.window)) ? window : this;

	  /** Detect free variable `exports`. */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	  /** Detect free variable `module`. */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

	  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
	  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
	    root = freeGlobal;
	  }

	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

	  /*--------------------------------------------------------------------------*/

	  /**
	   * The base implementation of `compareAscending` which compares values and
	   * sorts them in ascending order without guaranteeing a stable sort.
	   *
	   * @private
	   * @param {*} value The value to compare to `other`.
	   * @param {*} other The value to compare to `value`.
	   * @returns {number} Returns the sort order indicator for `value`.
	   */
	  function baseCompareAscending(value, other) {
	    if (value !== other) {
	      var valIsReflexive = value === value,
	          othIsReflexive = other === other;

	      if (value > other || !valIsReflexive || (typeof value == 'undefined' && othIsReflexive)) {
	        return 1;
	      }
	      if (value < other || !othIsReflexive || (typeof other == 'undefined' && valIsReflexive)) {
	        return -1;
	      }
	    }
	    return 0;
	  }

	  /**
	   * The base implementation of `_.indexOf` without support for binary searches.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {*} value The value to search for.
	   * @param {number} [fromIndex=0] The index to search from.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseIndexOf(array, value, fromIndex) {
	    if (value !== value) {
	      return indexOfNaN(array, fromIndex);
	    }
	    var index = (fromIndex || 0) - 1,
	        length = array.length;

	    while (++index < length) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * The base implementation of `_.isFunction` without support for environments
	   * with incorrect `typeof` results.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   */
	  function baseIsFunction(value) {
	    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
	    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
	    return typeof value == 'function' || false;
	  }

	  /**
	   * The base implementation of `_.sortBy` and `_.sortByAll` which uses `comparer`
	   * to define the sort order of `array` and replaces criteria objects with their
	   * corresponding values.
	   *
	   * @private
	   * @param {Array} array The array to sort.
	   * @param {Function} comparer The function to define sort order.
	   * @returns {Array} Returns `array`.
	   */
	  function baseSortBy(array, comparer) {
	    var length = array.length;

	    array.sort(comparer);
	    while (length--) {
	      array[length] = array[length].value;
	    }
	    return array;
	  }

	  /**
	   * Converts `value` to a string if it is not one. An empty string is returned
	   * for `null` or `undefined` values.
	   *
	   * @private
	   * @param {*} value The value to process.
	   * @returns {string} Returns the string.
	   */
	  function baseToString(value) {
	    if (typeof value == 'string') {
	      return value;
	    }
	    return value == null ? '' : (value + '');
	  }

	  /**
	   * Used by `_.max` and `_.min` as the default callback for string values.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {number} Returns the code unit of the first character of the string.
	   */
	  function charAtCallback(string) {
	    return string.charCodeAt(0);
	  }

	  /**
	   * Used by `_.trim` and `_.trimLeft` to get the index of the first character
	   * of `string` that is not found in `chars`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @param {string} chars The characters to find.
	   * @returns {number} Returns the index of the first character not found in `chars`.
	   */
	  function charsLeftIndex(string, chars) {
	    var index = -1,
	        length = string.length;

	    while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
	    return index;
	  }

	  /**
	   * Used by `_.trim` and `_.trimRight` to get the index of the last character
	   * of `string` that is not found in `chars`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @param {string} chars The characters to find.
	   * @returns {number} Returns the index of the last character not found in `chars`.
	   */
	  function charsRightIndex(string, chars) {
	    var index = string.length;

	    while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
	    return index;
	  }

	  /**
	   * Used by `_.sortBy` to compare transformed elements of a collection and stable
	   * sort them in ascending order.
	   *
	   * @private
	   * @param {Object} object The object to compare to `other`.
	   * @param {Object} other The object to compare to `object`.
	   * @returns {number} Returns the sort order indicator for `object`.
	   */
	  function compareAscending(object, other) {
	    return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
	  }

	  /**
	   * Used by `_.sortByAll` to compare multiple properties of each element
	   * in a collection and stable sort them in ascending order.
	   *
	   * @private
	   * @param {Object} object The object to compare to `other`.
	   * @param {Object} other The object to compare to `object`.
	   * @returns {number} Returns the sort order indicator for `object`.
	   */
	  function compareMultipleAscending(object, other) {
	    var index = -1,
	        objCriteria = object.criteria,
	        othCriteria = other.criteria,
	        length = objCriteria.length;

	    while (++index < length) {
	      var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
	      if (result) {
	        return result;
	      }
	    }
	    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	    // that causes it, under certain circumstances, to provide the same value for
	    // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	    // for more details.
	    //
	    // This also ensures a stable sort in V8 and other engines.
	    // See https://code.google.com/p/v8/issues/detail?id=90 for more details.
	    return object.index - other.index;
	  }

	  /**
	   * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.
	   *
	   * @private
	   * @param {string} letter The matched letter to deburr.
	   * @returns {string} Returns the deburred letter.
	   */
	  function deburrLetter(letter) {
	    return deburredLetters[letter];
	  }

	  /**
	   * Used by `_.escape` to convert characters to HTML entities.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeHtmlChar(chr) {
	    return htmlEscapes[chr];
	  }

	  /**
	   * Used by `_.template` to escape characters for inclusion in compiled
	   * string literals.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeStringChar(chr) {
	    return '\\' + stringEscapes[chr];
	  }

	  /**
	   * Gets the index at which the first occurrence of `NaN` is found in `array`.
	   * If `fromRight` is provided elements of `array` are iterated from right to left.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {number} [fromIndex] The index to search from.
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	   */
	  function indexOfNaN(array, fromIndex, fromRight) {
	    var length = array.length,
	        index = fromRight ? (fromIndex || length) : ((fromIndex || 0) - 1);

	    while ((fromRight ? index-- : ++index < length)) {
	      var other = array[index];
	      if (other !== other) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * Checks if `value` is object-like.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	   */
	  function isObjectLike(value) {
	    return (value && typeof value == 'object') || false;
	  }

	  /**
	   * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a
	   * character code is whitespace.
	   *
	   * @private
	   * @param {number} charCode The character code to inspect.
	   * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.
	   */
	  function isSpace(charCode) {
	    return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||
	      (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));
	  }

	  /**
	   * Replaces all `placeholder` elements in `array` with an internal placeholder
	   * and returns an array of their indexes.
	   *
	   * @private
	   * @param {Array} array The array to modify.
	   * @param {*} placeholder The placeholder to replace.
	   * @returns {Array} Returns the new array of placeholder indexes.
	   */
	  function replaceHolders(array, placeholder) {
	    var index = -1,
	        length = array.length,
	        resIndex = -1,
	        result = [];

	    while (++index < length) {
	      if (array[index] === placeholder) {
	        array[index] = PLACEHOLDER;
	        result[++resIndex] = index;
	      }
	    }
	    return result;
	  }

	  /**
	   * An implementation of `_.uniq` optimized for sorted arrays without support
	   * for callback shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {Function} [iteratee] The function invoked per iteration.
	   * @returns {Array} Returns the new duplicate-value-free array.
	   */
	  function sortedUniq(array, iteratee) {
	    var seen,
	        index = -1,
	        length = array.length,
	        resIndex = -1,
	        result = [];

	    while (++index < length) {
	      var value = array[index],
	          computed = iteratee ? iteratee(value, index, array) : value;

	      if (!index || seen !== computed) {
	        seen = computed;
	        result[++resIndex] = value;
	      }
	    }
	    return result;
	  }

	  /**
	   * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace
	   * character of `string`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {number} Returns the index of the first non-whitespace character.
	   */
	  function trimmedLeftIndex(string) {
	    var index = -1,
	        length = string.length;

	    while (++index < length && isSpace(string.charCodeAt(index))) {}
	    return index;
	  }

	  /**
	   * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace
	   * character of `string`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {number} Returns the index of the last non-whitespace character.
	   */
	  function trimmedRightIndex(string) {
	    var index = string.length;

	    while (index-- && isSpace(string.charCodeAt(index))) {}
	    return index;
	  }

	  /**
	   * Used by `_.unescape` to convert HTML entities to characters.
	   *
	   * @private
	   * @param {string} chr The matched character to unescape.
	   * @returns {string} Returns the unescaped character.
	   */
	  function unescapeHtmlChar(chr) {
	    return htmlUnescapes[chr];
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Create a new pristine `lodash` function using the given `context` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Utility
	   * @param {Object} [context=root] The context object.
	   * @returns {Function} Returns a new `lodash` function.
	   * @example
	   *
	   * _.mixin({ 'add': function(a, b) { return a + b; } });
	   *
	   * var lodash = _.runInContext();
	   * lodash.mixin({ 'sub': function(a, b) { return a - b; } });
	   *
	   * _.isFunction(_.add);
	   * // => true
	   * _.isFunction(_.sub);
	   * // => false
	   *
	   * lodash.isFunction(lodash.add);
	   * // => false
	   * lodash.isFunction(lodash.sub);
	   * // => true
	   *
	   * // using `context` to mock `Date#getTime` use in `_.now`
	   * var mock = _.runInContext({
	   *   'Date': function() {
	   *     return { 'getTime': getTimeMock };
	   *   }
	   * });
	   *
	   * // or creating a suped-up `defer` in Node.js
	   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
	   */
	  function runInContext(context) {
	    // Avoid issues with some ES3 environments that attempt to use values, named
	    // after built-in constructors like `Object`, for the creation of literals.
	    // ES5 clears this up by stating that literals must use built-in constructors.
	    // See https://es5.github.io/#x11.1.5 for more details.
	    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

	    /** Native constructor references. */
	    var Array = context.Array,
	        Date = context.Date,
	        Error = context.Error,
	        Function = context.Function,
	        Math = context.Math,
	        Number = context.Number,
	        Object = context.Object,
	        RegExp = context.RegExp,
	        String = context.String,
	        TypeError = context.TypeError;

	    /** Used for native method references. */
	    var arrayProto = Array.prototype,
	        objectProto = Object.prototype;

	    /** Used to detect DOM support. */
	    var document = (document = context.window) && document.document;

	    /** Used to resolve the decompiled source of functions. */
	    var fnToString = Function.prototype.toString;

	    /** Used to the length of n-tuples for `_.unzip`. */
	    var getLength = baseProperty('length');

	    /** Used to check objects for own properties. */
	    var hasOwnProperty = objectProto.hasOwnProperty;

	    /** Used to generate unique IDs. */
	    var idCounter = 0;

	    /**
	     * Used to resolve the `toStringTag` of values.
	     * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	     * for more details.
	     */
	    var objToString = objectProto.toString;

	    /** Used to restore the original `_` reference in `_.noConflict`. */
	    var oldDash = context._;

	    /** Used to detect if a method is native. */
	    var reNative = RegExp('^' +
	      escapeRegExp(objToString)
	      .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	    );

	    /** Native method references. */
	    var ArrayBuffer = isNative(ArrayBuffer = context.ArrayBuffer) && ArrayBuffer,
	        bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice,
	        ceil = Math.ceil,
	        clearTimeout = context.clearTimeout,
	        floor = Math.floor,
	        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
	        push = arrayProto.push,
	        propertyIsEnumerable = objectProto.propertyIsEnumerable,
	        Set = isNative(Set = context.Set) && Set,
	        setTimeout = context.setTimeout,
	        splice = arrayProto.splice,
	        Uint8Array = isNative(Uint8Array = context.Uint8Array) && Uint8Array,
	        WeakMap = isNative(WeakMap = context.WeakMap) && WeakMap;

	    /** Used to clone array buffers. */
	    var Float64Array = (function() {
	      // Safari 5 errors when using an array buffer to initialize a typed array
	      // where the array buffer's `byteLength` is not a multiple of the typed
	      // array's `BYTES_PER_ELEMENT`.
	      try {
	        var func = isNative(func = context.Float64Array) && func,
	            result = new func(new ArrayBuffer(10), 0, 1) && func;
	      } catch(e) {}
	      return result;
	    }());

	    /* Native method references for those with the same name as other `lodash` methods. */
	    var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
	        nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
	        nativeIsFinite = context.isFinite,
	        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
	        nativeMax = Math.max,
	        nativeMin = Math.min,
	        nativeNow = isNative(nativeNow = Date.now) && nativeNow,
	        nativeNumIsFinite = isNative(nativeNumIsFinite = Number.isFinite) && nativeNumIsFinite,
	        nativeParseInt = context.parseInt,
	        nativeRandom = Math.random;

	    /** Used as references for `-Infinity` and `Infinity`. */
	    var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
	        POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

	    /** Used as references for the maximum length and index of an array. */
	    var MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1,
	        MAX_ARRAY_INDEX =  MAX_ARRAY_LENGTH - 1,
	        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

	    /** Used as the size, in bytes, of each `Float64Array` element. */
	    var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;

	    /**
	     * Used as the maximum length of an array-like value.
	     * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	     * for more details.
	     */
	    var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

	    /** Used to store function metadata. */
	    var metaMap = WeakMap && new WeakMap;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object which wraps `value` to enable implicit chaining.
	     * Methods that operate on and return arrays, collections, and functions can
	     * be chained together. Methods that return a boolean or single value will
	     * automatically end the chain returning the unwrapped value. Explicit chaining
	     * may be enabled using `_.chain`. The execution of chained methods is lazy,
	     * that is, execution is deferred until `_#value` is implicitly or explicitly
	     * called.
	     *
	     * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
	     * fusion is an optimization that merges iteratees to avoid creating intermediate
	     * arrays and reduce the number of iteratee executions.
	     *
	     * Chaining is supported in custom builds as long as the `_#value` method is
	     * directly or indirectly included in the build.
	     *
	     * In addition to lodash methods, wrappers also have the following `Array` methods:
	     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
	     * and `unshift`
	     *
	     * The wrapper methods that support shortcut fusion are:
	     * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
	     * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
	     * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
	     * and `where`
	     *
	     * The chainable wrapper methods are:
	     * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
	     * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
	     * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defer`, `delay`,
	     * `difference`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `fill`,
	     * `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`, `forEach`,
	     * `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `functions`,
	     * `groupBy`, `indexBy`, `initial`, `intersection`, `invert`, `invoke`, `keys`,
	     * `keysIn`, `map`, `mapValues`, `matches`, `matchesProperty`, `memoize`, `merge`,
	     * `mixin`, `negate`, `noop`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
	     * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
	     * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `reverse`,
	     * `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`, `splice`, `spread`,
	     * `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `tap`, `throttle`,
	     * `thru`, `times`, `toArray`, `toPlainObject`, `transform`, `union`, `uniq`,
	     * `unshift`, `unzip`, `values`, `valuesIn`, `where`, `without`, `wrap`, `xor`,
	     * `zip`, and `zipObject`
	     *
	     * The wrapper methods that are **not** chainable by default are:
	     * `attempt`, `camelCase`, `capitalize`, `clone`, `cloneDeep`, `deburr`,
	     * `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`,
	     * `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`, `has`,
	     * `identity`, `includes`, `indexOf`, `isArguments`, `isArray`, `isBoolean`,
	     * `isDate`, `isElement`, `isEmpty`, `isEqual`, `isError`, `isFinite`,
	     * `isFunction`, `isMatch`, `isNative`, `isNaN`, `isNull`, `isNumber`,
	     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`,
	     * `isTypedArray`, `join`, `kebabCase`, `last`, `lastIndexOf`, `max`, `min`,
	     * `noConflict`, `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`,
	     * `random`, `reduce`, `reduceRight`, `repeat`, `result`, `runInContext`,
	     * `shift`, `size`, `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`,
	     * `startCase`, `startsWith`, `template`, `trim`, `trimLeft`, `trimRight`,
	     * `trunc`, `unescape`, `uniqueId`, `value`, and `words`
	     *
	     * The wrapper method `sample` will return a wrapped value when `n` is provided,
	     * otherwise an unwrapped value is returned.
	     *
	     * @name _
	     * @constructor
	     * @category Chain
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var wrapped = _([1, 2, 3]);
	     *
	     * // returns an unwrapped value
	     * wrapped.reduce(function(sum, n) {
	     *   return sum + n;
	     * });
	     * // => 6
	     *
	     * // returns a wrapped value
	     * var squares = wrapped.map(function(n) {
	     *   return n * n;
	     * });
	     *
	     * _.isArray(squares);
	     * // => false
	     *
	     * _.isArray(squares.value());
	     * // => true
	     */
	    function lodash(value) {
	      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
	        if (value instanceof LodashWrapper) {
	          return value;
	        }
	        if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
	          return wrapperClone(value);
	        }
	      }
	      return new LodashWrapper(value);
	    }

	    /**
	     * The function whose prototype all chaining wrappers inherit from.
	     *
	     * @private
	     */
	    function baseLodash() {
	      // No operation performed.
	    }

	    /**
	     * The base constructor for creating `lodash` wrapper objects.
	     *
	     * @private
	     * @param {*} value The value to wrap.
	     * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
	     * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
	     */
	    function LodashWrapper(value, chainAll, actions) {
	      this.__wrapped__ = value;
	      this.__actions__ = actions || [];
	      this.__chain__ = !!chainAll;
	    }

	    /**
	     * An object environment feature flags.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    var support = lodash.support = {};

	    (function(x) {

	      /**
	       * Detect if functions can be decompiled by `Function#toString`
	       * (all but Firefox OS certified apps, older Opera mobile browsers, and
	       * the PlayStation 3; forced `false` for Windows 8 apps).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

	      /**
	       * Detect if `Function#name` is supported (all but IE).
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      support.funcNames = typeof Function.name == 'string';

	      /**
	       * Detect if the DOM is supported.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      try {
	        support.dom = document.createDocumentFragment().nodeType === 11;
	      } catch(e) {
	        support.dom = false;
	      }

	      /**
	       * Detect if `arguments` object indexes are non-enumerable.
	       *
	       * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
	       * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
	       * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
	       * checks for indexes that exceed their function's formal parameters with
	       * associated values of `0`.
	       *
	       * @memberOf _.support
	       * @type boolean
	       */
	      try {
	        support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
	      } catch(e) {
	        support.nonEnumArgs = true;
	      }
	    }(0, 0));

	    /**
	     * By default, the template delimiters used by lodash are like those in
	     * embedded Ruby (ERB). Change the following template settings to use
	     * alternative delimiters.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    lodash.templateSettings = {

	      /**
	       * Used to detect `data` property values to be HTML-escaped.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'escape': reEscape,

	      /**
	       * Used to detect code to be evaluated.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'evaluate': reEvaluate,

	      /**
	       * Used to detect `data` property values to inject.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'interpolate': reInterpolate,

	      /**
	       * Used to reference the data object in the template text.
	       *
	       * @memberOf _.templateSettings
	       * @type string
	       */
	      'variable': '',

	      /**
	       * Used to import variables into the compiled template.
	       *
	       * @memberOf _.templateSettings
	       * @type Object
	       */
	      'imports': {

	        /**
	         * A reference to the `lodash` function.
	         *
	         * @memberOf _.templateSettings.imports
	         * @type Function
	         */
	        '_': lodash
	      }
	    };

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
	     *
	     * @private
	     * @param {*} value The value to wrap.
	     */
	    function LazyWrapper(value) {
	      this.__wrapped__ = value;
	      this.__actions__ = null;
	      this.__dir__ = 1;
	      this.__dropCount__ = 0;
	      this.__filtered__ = false;
	      this.__iteratees__ = null;
	      this.__takeCount__ = POSITIVE_INFINITY;
	      this.__views__ = null;
	    }

	    /**
	     * Creates a clone of the lazy wrapper object.
	     *
	     * @private
	     * @name clone
	     * @memberOf LazyWrapper
	     * @returns {Object} Returns the cloned `LazyWrapper` object.
	     */
	    function lazyClone() {
	      var actions = this.__actions__,
	          iteratees = this.__iteratees__,
	          views = this.__views__,
	          result = new LazyWrapper(this.__wrapped__);

	      result.__actions__ = actions ? arrayCopy(actions) : null;
	      result.__dir__ = this.__dir__;
	      result.__dropCount__ = this.__dropCount__;
	      result.__filtered__ = this.__filtered__;
	      result.__iteratees__ = iteratees ? arrayCopy(iteratees) : null;
	      result.__takeCount__ = this.__takeCount__;
	      result.__views__ = views ? arrayCopy(views) : null;
	      return result;
	    }

	    /**
	     * Reverses the direction of lazy iteration.
	     *
	     * @private
	     * @name reverse
	     * @memberOf LazyWrapper
	     * @returns {Object} Returns the new reversed `LazyWrapper` object.
	     */
	    function lazyReverse() {
	      if (this.__filtered__) {
	        var result = new LazyWrapper(this);
	        result.__dir__ = -1;
	        result.__filtered__ = true;
	      } else {
	        result = this.clone();
	        result.__dir__ *= -1;
	      }
	      return result;
	    }

	    /**
	     * Extracts the unwrapped value from its lazy wrapper.
	     *
	     * @private
	     * @name value
	     * @memberOf LazyWrapper
	     * @returns {*} Returns the unwrapped value.
	     */
	    function lazyValue() {
	      var array = this.__wrapped__.value();
	      if (!isArray(array)) {
	        return baseWrapperValue(array, this.__actions__);
	      }
	      var dir = this.__dir__,
	          isRight = dir < 0,
	          view = getView(0, array.length, this.__views__),
	          start = view.start,
	          end = view.end,
	          length = end - start,
	          dropCount = this.__dropCount__,
	          takeCount = nativeMin(length, this.__takeCount__),
	          index = isRight ? end : start - 1,
	          iteratees = this.__iteratees__,
	          iterLength = iteratees ? iteratees.length : 0,
	          resIndex = 0,
	          result = [];

	      outer:
	      while (length-- && resIndex < takeCount) {
	        index += dir;

	        var iterIndex = -1,
	            value = array[index];

	        while (++iterIndex < iterLength) {
	          var data = iteratees[iterIndex],
	              iteratee = data.iteratee,
	              computed = iteratee(value, index, array),
	              type = data.type;

	          if (type == LAZY_MAP_FLAG) {
	            value = computed;
	          } else if (!computed) {
	            if (type == LAZY_FILTER_FLAG) {
	              continue outer;
	            } else {
	              break outer;
	            }
	          }
	        }
	        if (dropCount) {
	          dropCount--;
	        } else {
	          result[resIndex++] = value;
	        }
	      }
	      return result;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a cache object to store key/value pairs.
	     *
	     * @private
	     * @static
	     * @name Cache
	     * @memberOf _.memoize
	     */
	    function MapCache() {
	      this.__data__ = {};
	    }

	    /**
	     * Removes `key` and its value from the cache.
	     *
	     * @private
	     * @name delete
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the value to remove.
	     * @returns {boolean} Returns `true` if the entry was removed successfully, else `false`.
	     */
	    function mapDelete(key) {
	      return this.has(key) && delete this.__data__[key];
	    }

	    /**
	     * Gets the cached value for `key`.
	     *
	     * @private
	     * @name get
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the value to get.
	     * @returns {*} Returns the cached value.
	     */
	    function mapGet(key) {
	      return key == '__proto__' ? undefined : this.__data__[key];
	    }

	    /**
	     * Checks if a cached value for `key` exists.
	     *
	     * @private
	     * @name has
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the entry to check.
	     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	     */
	    function mapHas(key) {
	      return key != '__proto__' && hasOwnProperty.call(this.__data__, key);
	    }

	    /**
	     * Adds `value` to `key` of the cache.
	     *
	     * @private
	     * @name set
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the value to cache.
	     * @param {*} value The value to cache.
	     * @returns {Object} Returns the cache object.
	     */
	    function mapSet(key, value) {
	      if (key != '__proto__') {
	        this.__data__[key] = value;
	      }
	      return this;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     *
	     * Creates a cache object to store unique values.
	     *
	     * @private
	     * @param {Array} [values] The values to cache.
	     */
	    function SetCache(values) {
	      var length = values ? values.length : 0;

	      this.data = { 'hash': nativeCreate(null), 'set': new Set };
	      while (length--) {
	        this.push(values[length]);
	      }
	    }

	    /**
	     * Checks if `value` is in `cache` mimicking the return signature of
	     * `_.indexOf` by returning `0` if the value is found, else `-1`.
	     *
	     * @private
	     * @param {Object} cache The cache to search.
	     * @param {*} value The value to search for.
	     * @returns {number} Returns `0` if `value` is found, else `-1`.
	     */
	    function cacheIndexOf(cache, value) {
	      var data = cache.data,
	          result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

	      return result ? 0 : -1;
	    }

	    /**
	     * Adds `value` to the cache.
	     *
	     * @private
	     * @name push
	     * @memberOf SetCache
	     * @param {*} value The value to cache.
	     */
	    function cachePush(value) {
	      var data = this.data;
	      if (typeof value == 'string' || isObject(value)) {
	        data.set.add(value);
	      } else {
	        data.hash[value] = true;
	      }
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Copies the values of `source` to `array`.
	     *
	     * @private
	     * @param {Array} source The array to copy values from.
	     * @param {Array} [array=[]] The array to copy values to.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayCopy(source, array) {
	      var index = -1,
	          length = source.length;

	      array || (array = Array(length));
	      while (++index < length) {
	        array[index] = source[index];
	      }
	      return array;
	    }

	    /**
	     * A specialized version of `_.forEach` for arrays without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayEach(array, iteratee) {
	      var index = -1,
	          length = array.length;

	      while (++index < length) {
	        if (iteratee(array[index], index, array) === false) {
	          break;
	        }
	      }
	      return array;
	    }

	    /**
	     * A specialized version of `_.forEachRight` for arrays without support for
	     * callback shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayEachRight(array, iteratee) {
	      var length = array.length;

	      while (length--) {
	        if (iteratee(array[length], length, array) === false) {
	          break;
	        }
	      }
	      return array;
	    }

	    /**
	     * A specialized version of `_.every` for arrays without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`.
	     */
	    function arrayEvery(array, predicate) {
	      var index = -1,
	          length = array.length;

	      while (++index < length) {
	        if (!predicate(array[index], index, array)) {
	          return false;
	        }
	      }
	      return true;
	    }

	    /**
	     * A specialized version of `_.filter` for arrays without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     */
	    function arrayFilter(array, predicate) {
	      var index = -1,
	          length = array.length,
	          resIndex = -1,
	          result = [];

	      while (++index < length) {
	        var value = array[index];
	        if (predicate(value, index, array)) {
	          result[++resIndex] = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `_.map` for arrays without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns the new mapped array.
	     */
	    function arrayMap(array, iteratee) {
	      var index = -1,
	          length = array.length,
	          result = Array(length);

	      while (++index < length) {
	        result[index] = iteratee(array[index], index, array);
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `_.max` for arrays without support for iteratees.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @returns {*} Returns the maximum value.
	     */
	    function arrayMax(array) {
	      var index = -1,
	          length = array.length,
	          result = NEGATIVE_INFINITY;

	      while (++index < length) {
	        var value = array[index];
	        if (value > result) {
	          result = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `_.min` for arrays without support for iteratees.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @returns {*} Returns the minimum value.
	     */
	    function arrayMin(array) {
	      var index = -1,
	          length = array.length,
	          result = POSITIVE_INFINITY;

	      while (++index < length) {
	        var value = array[index];
	        if (value < result) {
	          result = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `_.reduce` for arrays without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {boolean} [initFromArray] Specify using the first element of `array`
	     *  as the initial value.
	     * @returns {*} Returns the accumulated value.
	     */
	    function arrayReduce(array, iteratee, accumulator, initFromArray) {
	      var index = -1,
	          length = array.length;

	      if (initFromArray && length) {
	        accumulator = array[++index];
	      }
	      while (++index < length) {
	        accumulator = iteratee(accumulator, array[index], index, array);
	      }
	      return accumulator;
	    }

	    /**
	     * A specialized version of `_.reduceRight` for arrays without support for
	     * callback shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {boolean} [initFromArray] Specify using the last element of `array`
	     *  as the initial value.
	     * @returns {*} Returns the accumulated value.
	     */
	    function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
	      var length = array.length;
	      if (initFromArray && length) {
	        accumulator = array[--length];
	      }
	      while (length--) {
	        accumulator = iteratee(accumulator, array[length], length, array);
	      }
	      return accumulator;
	    }

	    /**
	     * A specialized version of `_.some` for arrays without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     */
	    function arraySome(array, predicate) {
	      var index = -1,
	          length = array.length;

	      while (++index < length) {
	        if (predicate(array[index], index, array)) {
	          return true;
	        }
	      }
	      return false;
	    }

	    /**
	     * Used by `_.defaults` to customize its `_.assign` use.
	     *
	     * @private
	     * @param {*} objectValue The destination object property value.
	     * @param {*} sourceValue The source object property value.
	     * @returns {*} Returns the value to assign to the destination object.
	     */
	    function assignDefaults(objectValue, sourceValue) {
	      return typeof objectValue == 'undefined' ? sourceValue : objectValue;
	    }

	    /**
	     * Used by `_.template` to customize its `_.assign` use.
	     *
	     * **Note:** This method is like `assignDefaults` except that it ignores
	     * inherited property values when checking if a property is `undefined`.
	     *
	     * @private
	     * @param {*} objectValue The destination object property value.
	     * @param {*} sourceValue The source object property value.
	     * @param {string} key The key associated with the object and source values.
	     * @param {Object} object The destination object.
	     * @returns {*} Returns the value to assign to the destination object.
	     */
	    function assignOwnDefaults(objectValue, sourceValue, key, object) {
	      return (typeof objectValue == 'undefined' || !hasOwnProperty.call(object, key))
	        ? sourceValue
	        : objectValue;
	    }

	    /**
	     * The base implementation of `_.assign` without support for argument juggling,
	     * multiple sources, and `this` binding `customizer` functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {Function} [customizer] The function to customize assigning values.
	     * @returns {Object} Returns the destination object.
	     */
	    function baseAssign(object, source, customizer) {
	      var props = keys(source);
	      if (!customizer) {
	        return baseCopy(source, object, props);
	      }
	      var index = -1,
	          length = props.length;

	      while (++index < length) {
	        var key = props[index],
	            value = object[key],
	            result = customizer(value, source[key], key, object, source);

	        if ((result === result ? result !== value : value === value) ||
	            (typeof value == 'undefined' && !(key in object))) {
	          object[key] = result;
	        }
	      }
	      return object;
	    }

	    /**
	     * The base implementation of `_.at` without support for strings and individual
	     * key arguments.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {number[]|string[]} [props] The property names or indexes of elements to pick.
	     * @returns {Array} Returns the new array of picked elements.
	     */
	    function baseAt(collection, props) {
	      var index = -1,
	          length = collection.length,
	          isArr = isLength(length),
	          propsLength = props.length,
	          result = Array(propsLength);

	      while(++index < propsLength) {
	        var key = props[index];
	        if (isArr) {
	          key = parseFloat(key);
	          result[index] = isIndex(key, length) ? collection[key] : undefined;
	        } else {
	          result[index] = collection[key];
	        }
	      }
	      return result;
	    }

	    /**
	     * Copies the properties of `source` to `object`.
	     *
	     * @private
	     * @param {Object} source The object to copy properties from.
	     * @param {Object} [object={}] The object to copy properties to.
	     * @param {Array} props The property names to copy.
	     * @returns {Object} Returns `object`.
	     */
	    function baseCopy(source, object, props) {
	      if (!props) {
	        props = object;
	        object = {};
	      }
	      var index = -1,
	          length = props.length;

	      while (++index < length) {
	        var key = props[index];
	        object[key] = source[key];
	      }
	      return object;
	    }

	    /**
	     * The base implementation of `_.bindAll` without support for individual
	     * method name arguments.
	     *
	     * @private
	     * @param {Object} object The object to bind and assign the bound methods to.
	     * @param {string[]} methodNames The object method names to bind.
	     * @returns {Object} Returns `object`.
	     */
	    function baseBindAll(object, methodNames) {
	      var index = -1,
	          length = methodNames.length;

	      while (++index < length) {
	        var key = methodNames[index];
	        object[key] = createWrapper(object[key], BIND_FLAG, object);
	      }
	      return object;
	    }

	    /**
	     * The base implementation of `_.callback` which supports specifying the
	     * number of arguments to provide to `func`.
	     *
	     * @private
	     * @param {*} [func=_.identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {number} [argCount] The number of arguments to provide to `func`.
	     * @returns {Function} Returns the callback.
	     */
	    function baseCallback(func, thisArg, argCount) {
	      var type = typeof func;
	      if (type == 'function') {
	        return (typeof thisArg != 'undefined' && isBindable(func))
	          ? bindCallback(func, thisArg, argCount)
	          : func;
	      }
	      if (func == null) {
	        return identity;
	      }
	      if (type == 'object') {
	        return baseMatches(func);
	      }
	      return typeof thisArg == 'undefined'
	        ? baseProperty(func + '')
	        : baseMatchesProperty(func + '', thisArg);
	    }

	    /**
	     * The base implementation of `_.clone` without support for argument juggling
	     * and `this` binding `customizer` functions.
	     *
	     * @private
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @param {Function} [customizer] The function to customize cloning values.
	     * @param {string} [key] The key of `value`.
	     * @param {Object} [object] The object `value` belongs to.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates clones with source counterparts.
	     * @returns {*} Returns the cloned value.
	     */
	    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
	      var result;
	      if (customizer) {
	        result = object ? customizer(value, key, object) : customizer(value);
	      }
	      if (typeof result != 'undefined') {
	        return result;
	      }
	      if (!isObject(value)) {
	        return value;
	      }
	      var isArr = isArray(value);
	      if (isArr) {
	        result = initCloneArray(value);
	        if (!isDeep) {
	          return arrayCopy(value, result);
	        }
	      } else {
	        var tag = objToString.call(value),
	            isFunc = tag == funcTag;

	        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	          result = initCloneObject(isFunc ? {} : value);
	          if (!isDeep) {
	            return baseCopy(value, result, keys(value));
	          }
	        } else {
	          return cloneableTags[tag]
	            ? initCloneByTag(value, tag, isDeep)
	            : (object ? value : {});
	        }
	      }
	      // Check for circular references and return corresponding clone.
	      stackA || (stackA = []);
	      stackB || (stackB = []);

	      var length = stackA.length;
	      while (length--) {
	        if (stackA[length] == value) {
	          return stackB[length];
	        }
	      }
	      // Add the source value to the stack of traversed objects and associate it with its clone.
	      stackA.push(value);
	      stackB.push(result);

	      // Recursively populate clone (susceptible to call stack limits).
	      (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	        result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.create` without support for assigning
	     * properties to the created object.
	     *
	     * @private
	     * @param {Object} prototype The object to inherit from.
	     * @returns {Object} Returns the new object.
	     */
	    var baseCreate = (function() {
	      function Object() {}
	      return function(prototype) {
	        if (isObject(prototype)) {
	          Object.prototype = prototype;
	          var result = new Object;
	          Object.prototype = null;
	        }
	        return result || context.Object();
	      };
	    }());

	    /**
	     * The base implementation of `_.delay` and `_.defer` which accepts an index
	     * of where to slice the arguments to provide to `func`.
	     *
	     * @private
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @param {Object} args The `arguments` object to slice and provide to `func`.
	     * @returns {number} Returns the timer id.
	     */
	    function baseDelay(func, wait, args, fromIndex) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return setTimeout(function() { func.apply(undefined, baseSlice(args, fromIndex)); }, wait);
	    }

	    /**
	     * The base implementation of `_.difference` which accepts a single array
	     * of values to exclude.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Array} values The values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     */
	    function baseDifference(array, values) {
	      var length = array ? array.length : 0,
	          result = [];

	      if (!length) {
	        return result;
	      }
	      var index = -1,
	          indexOf = getIndexOf(),
	          isCommon = indexOf == baseIndexOf,
	          cache = isCommon && values.length >= 200 && createCache(values),
	          valuesLength = values.length;

	      if (cache) {
	        indexOf = cacheIndexOf;
	        isCommon = false;
	        values = cache;
	      }
	      outer:
	      while (++index < length) {
	        var value = array[index];

	        if (isCommon && value === value) {
	          var valuesIndex = valuesLength;
	          while (valuesIndex--) {
	            if (values[valuesIndex] === value) {
	              continue outer;
	            }
	          }
	          result.push(value);
	        }
	        else if (indexOf(values, value) < 0) {
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.forEach` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array|Object|string} Returns `collection`.
	     */
	    function baseEach(collection, iteratee) {
	      var length = collection ? collection.length : 0;
	      if (!isLength(length)) {
	        return baseForOwn(collection, iteratee);
	      }
	      var index = -1,
	          iterable = toObject(collection);

	      while (++index < length) {
	        if (iteratee(iterable[index], index, iterable) === false) {
	          break;
	        }
	      }
	      return collection;
	    }

	    /**
	     * The base implementation of `_.forEachRight` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array|Object|string} Returns `collection`.
	     */
	    function baseEachRight(collection, iteratee) {
	      var length = collection ? collection.length : 0;
	      if (!isLength(length)) {
	        return baseForOwnRight(collection, iteratee);
	      }
	      var iterable = toObject(collection);
	      while (length--) {
	        if (iteratee(iterable[length], length, iterable) === false) {
	          break;
	        }
	      }
	      return collection;
	    }

	    /**
	     * The base implementation of `_.every` without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`
	     */
	    function baseEvery(collection, predicate) {
	      var result = true;
	      baseEach(collection, function(value, index, collection) {
	        result = !!predicate(value, index, collection);
	        return result;
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.fill` without an iteratee call guard.
	     *
	     * @private
	     * @param {Array} array The array to fill.
	     * @param {*} value The value to fill `array` with.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns `array`.
	     */
	    function baseFill(array, value, start, end) {
	      var length = array.length;

	      start = start == null ? 0 : (+start || 0);
	      if (start < 0) {
	        start = -start > length ? 0 : (length + start);
	      }
	      end = (typeof end == 'undefined' || end > length) ? length : (+end || 0);
	      if (end < 0) {
	        end += length;
	      }
	      length = start > end ? 0 : end >>> 0;
	      start >>>= 0;

	      while (start < length) {
	        array[start++] = value;
	      }
	      return array;
	    }

	    /**
	     * The base implementation of `_.filter` without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     */
	    function baseFilter(collection, predicate) {
	      var result = [];
	      baseEach(collection, function(value, index, collection) {
	        if (predicate(value, index, collection)) {
	          result.push(value);
	        }
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
	     * without support for callback shorthands and `this` binding, which iterates
	     * over `collection` using the provided `eachFunc`.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Function} predicate The function invoked per iteration.
	     * @param {Function} eachFunc The function to iterate over `collection`.
	     * @param {boolean} [retKey] Specify returning the key of the found element
	     *  instead of the element itself.
	     * @returns {*} Returns the found element or its key, else `undefined`.
	     */
	    function baseFind(collection, predicate, eachFunc, retKey) {
	      var result;
	      eachFunc(collection, function(value, key, collection) {
	        if (predicate(value, key, collection)) {
	          result = retKey ? key : value;
	          return false;
	        }
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.flatten` with added support for restricting
	     * flattening and specifying the start index.
	     *
	     * @private
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isDeep] Specify a deep flatten.
	     * @param {boolean} [isStrict] Restrict flattening to arrays and `arguments` objects.
	     * @param {number} [fromIndex=0] The index to start from.
	     * @returns {Array} Returns the new flattened array.
	     */
	    function baseFlatten(array, isDeep, isStrict, fromIndex) {
	      var index = (fromIndex || 0) - 1,
	          length = array.length,
	          resIndex = -1,
	          result = [];

	      while (++index < length) {
	        var value = array[index];

	        if (isObjectLike(value) && isLength(value.length) && (isArray(value) || isArguments(value))) {
	          if (isDeep) {
	            // Recursively flatten arrays (susceptible to call stack limits).
	            value = baseFlatten(value, isDeep, isStrict);
	          }
	          var valIndex = -1,
	              valLength = value.length;

	          result.length += valLength;
	          while (++valIndex < valLength) {
	            result[++resIndex] = value[valIndex];
	          }
	        } else if (!isStrict) {
	          result[++resIndex] = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `baseForIn` and `baseForOwn` which iterates
	     * over `object` properties returned by `keysFunc` invoking `iteratee` for
	     * each property. Iterator functions may exit iteration early by explicitly
	     * returning `false`.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @returns {Object} Returns `object`.
	     */
	    function baseFor(object, iteratee, keysFunc) {
	      var index = -1,
	          iterable = toObject(object),
	          props = keysFunc(object),
	          length = props.length;

	      while (++index < length) {
	        var key = props[index];
	        if (iteratee(iterable[key], key, iterable) === false) {
	          break;
	        }
	      }
	      return object;
	    }

	    /**
	     * This function is like `baseFor` except that it iterates over properties
	     * in the opposite order.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForRight(object, iteratee, keysFunc) {
	      var iterable = toObject(object),
	          props = keysFunc(object),
	          length = props.length;

	      while (length--) {
	        var key = props[length];
	        if (iteratee(iterable[key], key, iterable) === false) {
	          break;
	        }
	      }
	      return object;
	    }

	    /**
	     * The base implementation of `_.forIn` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForIn(object, iteratee) {
	      return baseFor(object, iteratee, keysIn);
	    }

	    /**
	     * The base implementation of `_.forOwn` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForOwn(object, iteratee) {
	      return baseFor(object, iteratee, keys);
	    }

	    /**
	     * The base implementation of `_.forOwnRight` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForOwnRight(object, iteratee) {
	      return baseForRight(object, iteratee, keys);
	    }

	    /**
	     * The base implementation of `_.functions` which creates an array of
	     * `object` function property names filtered from those provided.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Array} props The property names to filter.
	     * @returns {Array} Returns the new array of filtered property names.
	     */
	    function baseFunctions(object, props) {
	      var index = -1,
	          length = props.length,
	          resIndex = -1,
	          result = [];

	      while (++index < length) {
	        var key = props[index];
	        if (isFunction(object[key])) {
	          result[++resIndex] = key;
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.invoke` which requires additional arguments
	     * to be provided as an array of arguments rather than individually.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|string} methodName The name of the method to invoke or
	     *  the function invoked per iteration.
	     * @param {Array} [args] The arguments to invoke the method with.
	     * @returns {Array} Returns the array of results.
	     */
	    function baseInvoke(collection, methodName, args) {
	      var index = -1,
	          isFunc = typeof methodName == 'function',
	          length = collection ? collection.length : 0,
	          result = isLength(length) ? Array(length) : [];

	      baseEach(collection, function(value) {
	        var func = isFunc ? methodName : (value != null && value[methodName]);
	        result[++index] = func ? func.apply(value, args) : undefined;
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.isEqual` without support for `this` binding
	     * `customizer` functions.
	     *
	     * @private
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @param {Function} [customizer] The function to customize comparing values.
	     * @param {boolean} [isWhere] Specify performing partial comparisons.
	     * @param {Array} [stackA] Tracks traversed `value` objects.
	     * @param {Array} [stackB] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     */
	    function baseIsEqual(value, other, customizer, isWhere, stackA, stackB) {
	      // Exit early for identical values.
	      if (value === other) {
	        // Treat `+0` vs. `-0` as not equal.
	        return value !== 0 || (1 / value == 1 / other);
	      }
	      var valType = typeof value,
	          othType = typeof other;

	      // Exit early for unlike primitive values.
	      if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||
	          value == null || other == null) {
	        // Return `false` unless both values are `NaN`.
	        return value !== value && other !== other;
	      }
	      return baseIsEqualDeep(value, other, baseIsEqual, customizer, isWhere, stackA, stackB);
	    }

	    /**
	     * A specialized version of `baseIsEqual` for arrays and objects which performs
	     * deep comparisons and tracks traversed objects enabling objects with circular
	     * references to be compared.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Function} [customizer] The function to customize comparing objects.
	     * @param {boolean} [isWhere] Specify performing partial comparisons.
	     * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	     * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function baseIsEqualDeep(object, other, equalFunc, customizer, isWhere, stackA, stackB) {
	      var objIsArr = isArray(object),
	          othIsArr = isArray(other),
	          objTag = arrayTag,
	          othTag = arrayTag;

	      if (!objIsArr) {
	        objTag = objToString.call(object);
	        if (objTag == argsTag) {
	          objTag = objectTag;
	        } else if (objTag != objectTag) {
	          objIsArr = isTypedArray(object);
	        }
	      }
	      if (!othIsArr) {
	        othTag = objToString.call(other);
	        if (othTag == argsTag) {
	          othTag = objectTag;
	        } else if (othTag != objectTag) {
	          othIsArr = isTypedArray(other);
	        }
	      }
	      var objIsObj = objTag == objectTag,
	          othIsObj = othTag == objectTag,
	          isSameTag = objTag == othTag;

	      if (isSameTag && !(objIsArr || objIsObj)) {
	        return equalByTag(object, other, objTag);
	      }
	      var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	          othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	      if (valWrapped || othWrapped) {
	        return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isWhere, stackA, stackB);
	      }
	      if (!isSameTag) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      // For more information on detecting circular references see https://es5.github.io/#JO.
	      stackA || (stackA = []);
	      stackB || (stackB = []);

	      var length = stackA.length;
	      while (length--) {
	        if (stackA[length] == object) {
	          return stackB[length] == other;
	        }
	      }
	      // Add `object` and `other` to the stack of traversed objects.
	      stackA.push(object);
	      stackB.push(other);

	      var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isWhere, stackA, stackB);

	      stackA.pop();
	      stackB.pop();

	      return result;
	    }

	    /**
	     * The base implementation of `_.isMatch` without support for callback
	     * shorthands or `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Array} props The source property names to match.
	     * @param {Array} values The source values to match.
	     * @param {Array} strictCompareFlags Strict comparison flags for source values.
	     * @param {Function} [customizer] The function to customize comparing objects.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     */
	    function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
	      var length = props.length;
	      if (object == null) {
	        return !length;
	      }
	      var index = -1,
	          noCustomizer = !customizer;

	      while (++index < length) {
	        if ((noCustomizer && strictCompareFlags[index])
	              ? values[index] !== object[props[index]]
	              : !hasOwnProperty.call(object, props[index])
	            ) {
	          return false;
	        }
	      }
	      index = -1;
	      while (++index < length) {
	        var key = props[index];
	        if (noCustomizer && strictCompareFlags[index]) {
	          var result = hasOwnProperty.call(object, key);
	        } else {
	          var objValue = object[key],
	              srcValue = values[index];

	          result = customizer ? customizer(objValue, srcValue, key) : undefined;
	          if (typeof result == 'undefined') {
	            result = baseIsEqual(srcValue, objValue, customizer, true);
	          }
	        }
	        if (!result) {
	          return false;
	        }
	      }
	      return true;
	    }

	    /**
	     * The base implementation of `_.map` without support for callback shorthands
	     * or `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns the new mapped array.
	     */
	    function baseMap(collection, iteratee) {
	      var result = [];
	      baseEach(collection, function(value, key, collection) {
	        result.push(iteratee(value, key, collection));
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.matches` which does not clone `source`.
	     *
	     * @private
	     * @param {Object} source The object of property values to match.
	     * @returns {Function} Returns the new function.
	     */
	    function baseMatches(source) {
	      var props = keys(source),
	          length = props.length;

	      if (length == 1) {
	        var key = props[0],
	            value = source[key];

	        if (isStrictComparable(value)) {
	          return function(object) {
	            return object != null && object[key] === value && hasOwnProperty.call(object, key);
	          };
	        }
	      }
	      var values = Array(length),
	          strictCompareFlags = Array(length);

	      while (length--) {
	        value = source[props[length]];
	        values[length] = value;
	        strictCompareFlags[length] = isStrictComparable(value);
	      }
	      return function(object) {
	        return baseIsMatch(object, props, values, strictCompareFlags);
	      };
	    }

	    /**
	     * The base implementation of `_.matchesProperty` which does not coerce `key`
	     * to a string.
	     *
	     * @private
	     * @param {string} key The key of the property to get.
	     * @param {*} value The value to compare.
	     * @returns {Function} Returns the new function.
	     */
	    function baseMatchesProperty(key, value) {
	      if (isStrictComparable(value)) {
	        return function(object) {
	          return object != null && object[key] === value;
	        };
	      }
	      return function(object) {
	        return object != null && baseIsEqual(value, object[key], null, true);
	      };
	    }

	    /**
	     * The base implementation of `_.merge` without support for argument juggling,
	     * multiple sources, and `this` binding `customizer` functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {Function} [customizer] The function to customize merging properties.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates values with source counterparts.
	     * @returns {Object} Returns the destination object.
	     */
	    function baseMerge(object, source, customizer, stackA, stackB) {
	      if (!isObject(object)) {
	        return object;
	      }
	      var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
	      (isSrcArr ? arrayEach : baseForOwn)(source, function(srcValue, key, source) {
	        if (isObjectLike(srcValue)) {
	          stackA || (stackA = []);
	          stackB || (stackB = []);
	          return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
	        }
	        var value = object[key],
	            result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
	            isCommon = typeof result == 'undefined';

	        if (isCommon) {
	          result = srcValue;
	        }
	        if ((isSrcArr || typeof result != 'undefined') &&
	            (isCommon || (result === result ? result !== value : value === value))) {
	          object[key] = result;
	        }
	      });
	      return object;
	    }

	    /**
	     * A specialized version of `baseMerge` for arrays and objects which performs
	     * deep merges and tracks traversed objects enabling objects with circular
	     * references to be merged.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {string} key The key of the value to merge.
	     * @param {Function} mergeFunc The function to merge values.
	     * @param {Function} [customizer] The function to customize merging properties.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates values with source counterparts.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
	      var length = stackA.length,
	          srcValue = source[key];

	      while (length--) {
	        if (stackA[length] == srcValue) {
	          object[key] = stackB[length];
	          return;
	        }
	      }
	      var value = object[key],
	          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
	          isCommon = typeof result == 'undefined';

	      if (isCommon) {
	        result = srcValue;
	        if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
	          result = isArray(value)
	            ? value
	            : (value ? arrayCopy(value) : []);
	        }
	        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	          result = isArguments(value)
	            ? toPlainObject(value)
	            : (isPlainObject(value) ? value : {});
	        }
	        else {
	          isCommon = false;
	        }
	      }
	      // Add the source value to the stack of traversed objects and associate
	      // it with its merged value.
	      stackA.push(srcValue);
	      stackB.push(result);

	      if (isCommon) {
	        // Recursively merge objects and arrays (susceptible to call stack limits).
	        object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
	      } else if (result === result ? result !== value : value === value) {
	        object[key] = result;
	      }
	    }

	    /**
	     * The base implementation of `_.property` which does not coerce `key` to a string.
	     *
	     * @private
	     * @param {string} key The key of the property to get.
	     * @returns {Function} Returns the new function.
	     */
	    function baseProperty(key) {
	      return function(object) {
	        return object == null ? undefined : object[key];
	      };
	    }

	    /**
	     * The base implementation of `_.pullAt` without support for individual
	     * index arguments.
	     *
	     * @private
	     * @param {Array} array The array to modify.
	     * @param {number[]} indexes The indexes of elements to remove.
	     * @returns {Array} Returns the new array of removed elements.
	     */
	    function basePullAt(array, indexes) {
	      var length = indexes.length,
	          result = baseAt(array, indexes);

	      indexes.sort(baseCompareAscending);
	      while (length--) {
	        var index = parseFloat(indexes[length]);
	        if (index != previous && isIndex(index)) {
	          var previous = index;
	          splice.call(array, index, 1);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.random` without support for argument juggling
	     * and returning floating-point numbers.
	     *
	     * @private
	     * @param {number} min The minimum possible value.
	     * @param {number} max The maximum possible value.
	     * @returns {number} Returns the random number.
	     */
	    function baseRandom(min, max) {
	      return min + floor(nativeRandom() * (max - min + 1));
	    }

	    /**
	     * The base implementation of `_.reduce` and `_.reduceRight` without support
	     * for callback shorthands or `this` binding, which iterates over `collection`
	     * using the provided `eachFunc`.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {*} accumulator The initial value.
	     * @param {boolean} initFromCollection Specify using the first or last element
	     *  of `collection` as the initial value.
	     * @param {Function} eachFunc The function to iterate over `collection`.
	     * @returns {*} Returns the accumulated value.
	     */
	    function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
	      eachFunc(collection, function(value, index, collection) {
	        accumulator = initFromCollection
	          ? (initFromCollection = false, value)
	          : iteratee(accumulator, value, index, collection);
	      });
	      return accumulator;
	    }

	    /**
	     * The base implementation of `setData` without support for hot loop detection.
	     *
	     * @private
	     * @param {Function} func The function to associate metadata with.
	     * @param {*} data The metadata.
	     * @returns {Function} Returns `func`.
	     */
	    var baseSetData = !metaMap ? identity : function(func, data) {
	      metaMap.set(func, data);
	      return func;
	    };

	    /**
	     * The base implementation of `_.slice` without an iteratee call guard.
	     *
	     * @private
	     * @param {Array} array The array to slice.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function baseSlice(array, start, end) {
	      var index = -1,
	          length = array.length;

	      start = start == null ? 0 : (+start || 0);
	      if (start < 0) {
	        start = -start > length ? 0 : (length + start);
	      }
	      end = (typeof end == 'undefined' || end > length) ? length : (+end || 0);
	      if (end < 0) {
	        end += length;
	      }
	      length = start > end ? 0 : (end - start) >>> 0;
	      start >>>= 0;

	      var result = Array(length);
	      while (++index < length) {
	        result[index] = array[index + start];
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.some` without support for callback shorthands
	     * or `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     */
	    function baseSome(collection, predicate) {
	      var result;

	      baseEach(collection, function(value, index, collection) {
	        result = predicate(value, index, collection);
	        return !result;
	      });
	      return !!result;
	    }

	    /**
	     * The base implementation of `_.uniq` without support for callback shorthands
	     * and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Function} [iteratee] The function invoked per iteration.
	     * @returns {Array} Returns the new duplicate-value-free array.
	     */
	    function baseUniq(array, iteratee) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = array.length,
	          isCommon = indexOf == baseIndexOf,
	          isLarge = isCommon && length >= 200,
	          seen = isLarge && createCache(),
	          result = [];

	      if (seen) {
	        indexOf = cacheIndexOf;
	        isCommon = false;
	      } else {
	        isLarge = false;
	        seen = iteratee ? [] : result;
	      }
	      outer:
	      while (++index < length) {
	        var value = array[index],
	            computed = iteratee ? iteratee(value, index, array) : value;

	        if (isCommon && value === value) {
	          var seenIndex = seen.length;
	          while (seenIndex--) {
	            if (seen[seenIndex] === computed) {
	              continue outer;
	            }
	          }
	          if (iteratee) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	        else if (indexOf(seen, computed) < 0) {
	          if (iteratee || isLarge) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.values` and `_.valuesIn` which creates an
	     * array of `object` property values corresponding to the property names
	     * returned by `keysFunc`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array} props The property names to get values for.
	     * @returns {Object} Returns the array of property values.
	     */
	    function baseValues(object, props) {
	      var index = -1,
	          length = props.length,
	          result = Array(length);

	      while (++index < length) {
	        result[index] = object[props[index]];
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `wrapperValue` which returns the result of
	     * performing a sequence of actions on the unwrapped `value`, where each
	     * successive action is supplied the return value of the previous.
	     *
	     * @private
	     * @param {*} value The unwrapped value.
	     * @param {Array} actions Actions to peform to resolve the unwrapped value.
	     * @returns {*} Returns the resolved unwrapped value.
	     */
	    function baseWrapperValue(value, actions) {
	      var result = value;
	      if (result instanceof LazyWrapper) {
	        result = result.value();
	      }
	      var index = -1,
	          length = actions.length;

	      while (++index < length) {
	        var args = [result],
	            action = actions[index];

	        push.apply(args, action.args);
	        result = action.func.apply(action.thisArg, args);
	      }
	      return result;
	    }

	    /**
	     * Performs a binary search of `array` to determine the index at which `value`
	     * should be inserted into `array` in order to maintain its sort order.
	     *
	     * @private
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {boolean} [retHighest] Specify returning the highest, instead
	     *  of the lowest, index at which a value should be inserted into `array`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     */
	    function binaryIndex(array, value, retHighest) {
	      var low = 0,
	          high = array ? array.length : low;

	      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
	        while (low < high) {
	          var mid = (low + high) >>> 1,
	              computed = array[mid];

	          if (retHighest ? (computed <= value) : (computed < value)) {
	            low = mid + 1;
	          } else {
	            high = mid;
	          }
	        }
	        return high;
	      }
	      return binaryIndexBy(array, value, identity, retHighest);
	    }

	    /**
	     * This function is like `binaryIndex` except that it invokes `iteratee` for
	     * `value` and each element of `array` to compute their sort ranking. The
	     * iteratee is invoked with one argument; (value).
	     *
	     * @private
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {boolean} [retHighest] Specify returning the highest, instead
	     *  of the lowest, index at which a value should be inserted into `array`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     */
	    function binaryIndexBy(array, value, iteratee, retHighest) {
	      value = iteratee(value);

	      var low = 0,
	          high = array ? array.length : 0,
	          valIsNaN = value !== value,
	          valIsUndef = typeof value == 'undefined';

	      while (low < high) {
	        var mid = floor((low + high) / 2),
	            computed = iteratee(array[mid]),
	            isReflexive = computed === computed;

	        if (valIsNaN) {
	          var setLow = isReflexive || retHighest;
	        } else if (valIsUndef) {
	          setLow = isReflexive && (retHighest || typeof computed != 'undefined');
	        } else {
	          setLow = retHighest ? (computed <= value) : (computed < value);
	        }
	        if (setLow) {
	          low = mid + 1;
	        } else {
	          high = mid;
	        }
	      }
	      return nativeMin(high, MAX_ARRAY_INDEX);
	    }

	    /**
	     * A specialized version of `baseCallback` which only supports `this` binding
	     * and specifying the number of arguments to provide to `func`.
	     *
	     * @private
	     * @param {Function} func The function to bind.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {number} [argCount] The number of arguments to provide to `func`.
	     * @returns {Function} Returns the callback.
	     */
	    function bindCallback(func, thisArg, argCount) {
	      if (typeof func != 'function') {
	        return identity;
	      }
	      if (typeof thisArg == 'undefined') {
	        return func;
	      }
	      switch (argCount) {
	        case 1: return function(value) {
	          return func.call(thisArg, value);
	        };
	        case 3: return function(value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	        case 4: return function(accumulator, value, index, collection) {
	          return func.call(thisArg, accumulator, value, index, collection);
	        };
	        case 5: return function(value, other, key, object, source) {
	          return func.call(thisArg, value, other, key, object, source);
	        };
	      }
	      return function() {
	        return func.apply(thisArg, arguments);
	      };
	    }

	    /**
	     * Creates a clone of the given array buffer.
	     *
	     * @private
	     * @param {ArrayBuffer} buffer The array buffer to clone.
	     * @returns {ArrayBuffer} Returns the cloned array buffer.
	     */
	    function bufferClone(buffer) {
	      return bufferSlice.call(buffer, 0);
	    }
	    if (!bufferSlice) {
	      // PhantomJS has `ArrayBuffer` and `Uint8Array` but not `Float64Array`.
	      bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function(buffer) {
	        var byteLength = buffer.byteLength,
	            floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0,
	            offset = floatLength * FLOAT64_BYTES_PER_ELEMENT,
	            result = new ArrayBuffer(byteLength);

	        if (floatLength) {
	          var view = new Float64Array(result, 0, floatLength);
	          view.set(new Float64Array(buffer, 0, floatLength));
	        }
	        if (byteLength != offset) {
	          view = new Uint8Array(result, offset);
	          view.set(new Uint8Array(buffer, offset));
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates an array that is the composition of partially applied arguments,
	     * placeholders, and provided arguments into a single array of arguments.
	     *
	     * @private
	     * @param {Array|Object} args The provided arguments.
	     * @param {Array} partials The arguments to prepend to those provided.
	     * @param {Array} holders The `partials` placeholder indexes.
	     * @returns {Array} Returns the new array of composed arguments.
	     */
	    function composeArgs(args, partials, holders) {
	      var holdersLength = holders.length,
	          argsIndex = -1,
	          argsLength = nativeMax(args.length - holdersLength, 0),
	          leftIndex = -1,
	          leftLength = partials.length,
	          result = Array(argsLength + leftLength);

	      while (++leftIndex < leftLength) {
	        result[leftIndex] = partials[leftIndex];
	      }
	      while (++argsIndex < holdersLength) {
	        result[holders[argsIndex]] = args[argsIndex];
	      }
	      while (argsLength--) {
	        result[leftIndex++] = args[argsIndex++];
	      }
	      return result;
	    }

	    /**
	     * This function is like `composeArgs` except that the arguments composition
	     * is tailored for `_.partialRight`.
	     *
	     * @private
	     * @param {Array|Object} args The provided arguments.
	     * @param {Array} partials The arguments to append to those provided.
	     * @param {Array} holders The `partials` placeholder indexes.
	     * @returns {Array} Returns the new array of composed arguments.
	     */
	    function composeArgsRight(args, partials, holders) {
	      var holdersIndex = -1,
	          holdersLength = holders.length,
	          argsIndex = -1,
	          argsLength = nativeMax(args.length - holdersLength, 0),
	          rightIndex = -1,
	          rightLength = partials.length,
	          result = Array(argsLength + rightLength);

	      while (++argsIndex < argsLength) {
	        result[argsIndex] = args[argsIndex];
	      }
	      var pad = argsIndex;
	      while (++rightIndex < rightLength) {
	        result[pad + rightIndex] = partials[rightIndex];
	      }
	      while (++holdersIndex < holdersLength) {
	        result[pad + holders[holdersIndex]] = args[argsIndex++];
	      }
	      return result;
	    }

	    /**
	     * Creates a function that aggregates a collection, creating an accumulator
	     * object composed from the results of running each element in the collection
	     * through an iteratee.
	     *
	     * @private
	     * @param {Function} setter The function to set keys and values of the accumulator object.
	     * @param {Function} [initializer] The function to initialize the accumulator object.
	     * @returns {Function} Returns the new aggregator function.
	     */
	    function createAggregator(setter, initializer) {
	      return function(collection, iteratee, thisArg) {
	        var result = initializer ? initializer() : {};
	        iteratee = getCallback(iteratee, thisArg, 3);

	        if (isArray(collection)) {
	          var index = -1,
	              length = collection.length;

	          while (++index < length) {
	            var value = collection[index];
	            setter(result, value, iteratee(value, index, collection), collection);
	          }
	        } else {
	          baseEach(collection, function(value, key, collection) {
	            setter(result, value, iteratee(value, key, collection), collection);
	          });
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that assigns properties of source object(s) to a given
	     * destination object.
	     *
	     * @private
	     * @param {Function} assigner The function to assign values.
	     * @returns {Function} Returns the new assigner function.
	     */
	    function createAssigner(assigner) {
	      return function() {
	        var length = arguments.length,
	            object = arguments[0];

	        if (length < 2 || object == null) {
	          return object;
	        }
	        if (length > 3 && isIterateeCall(arguments[1], arguments[2], arguments[3])) {
	          length = 2;
	        }
	        // Juggle arguments.
	        if (length > 3 && typeof arguments[length - 2] == 'function') {
	          var customizer = bindCallback(arguments[--length - 1], arguments[length--], 5);
	        } else if (length > 2 && typeof arguments[length - 1] == 'function') {
	          customizer = arguments[--length];
	        }
	        var index = 0;
	        while (++index < length) {
	          var source = arguments[index];
	          if (source) {
	            assigner(object, source, customizer);
	          }
	        }
	        return object;
	      };
	    }

	    /**
	     * Creates a function that wraps `func` and invokes it with the `this`
	     * binding of `thisArg`.
	     *
	     * @private
	     * @param {Function} func The function to bind.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @returns {Function} Returns the new bound function.
	     */
	    function createBindWrapper(func, thisArg) {
	      var Ctor = createCtorWrapper(func);

	      function wrapper() {
	        return (this instanceof wrapper ? Ctor : func).apply(thisArg, arguments);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates a `Set` cache object to optimize linear searches of large arrays.
	     *
	     * @private
	     * @param {Array} [values] The values to cache.
	     * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
	     */
	    var createCache = !(nativeCreate && Set) ? constant(null) : function(values) {
	      return new SetCache(values);
	    };

	    /**
	     * Creates a function that produces compound words out of the words in a
	     * given string.
	     *
	     * @private
	     * @param {Function} callback The function to combine each word.
	     * @returns {Function} Returns the new compounder function.
	     */
	    function createCompounder(callback) {
	      return function(string) {
	        var index = -1,
	            array = words(deburr(string)),
	            length = array.length,
	            result = '';

	        while (++index < length) {
	          result = callback(result, array[index], index);
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that produces an instance of `Ctor` regardless of
	     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
	     *
	     * @private
	     * @param {Function} Ctor The constructor to wrap.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createCtorWrapper(Ctor) {
	      return function() {
	        var thisBinding = baseCreate(Ctor.prototype),
	            result = Ctor.apply(thisBinding, arguments);

	        // Mimic the constructor's `return` behavior.
	        // See https://es5.github.io/#x13.2.2 for more details.
	        return isObject(result) ? result : thisBinding;
	      };
	    }

	    /**
	     * Creates a function that gets the extremum value of a collection.
	     *
	     * @private
	     * @param {Function} arrayFunc The function to get the extremum value from an array.
	     * @param {boolean} [isMin] Specify returning the minimum, instead of the maximum,
	     *  extremum value.
	     * @returns {Function} Returns the new extremum function.
	     */
	    function createExtremum(arrayFunc, isMin) {
	      return function(collection, iteratee, thisArg) {
	        if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
	          iteratee = null;
	        }
	        var func = getCallback(),
	            noIteratee = iteratee == null;

	        if (!(func === baseCallback && noIteratee)) {
	          noIteratee = false;
	          iteratee = func(iteratee, thisArg, 3);
	        }
	        if (noIteratee) {
	          var isArr = isArray(collection);
	          if (!isArr && isString(collection)) {
	            iteratee = charAtCallback;
	          } else {
	            return arrayFunc(isArr ? collection : toIterable(collection));
	          }
	        }
	        return extremumBy(collection, iteratee, isMin);
	      };
	    }

	    /**
	     * Creates a function that wraps `func` and invokes it with optional `this`
	     * binding of, partial application, and currying.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to reference.
	     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to prepend to those provided to the new function.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
	     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
	      var isAry = bitmask & ARY_FLAG,
	          isBind = bitmask & BIND_FLAG,
	          isBindKey = bitmask & BIND_KEY_FLAG,
	          isCurry = bitmask & CURRY_FLAG,
	          isCurryBound = bitmask & CURRY_BOUND_FLAG,
	          isCurryRight = bitmask & CURRY_RIGHT_FLAG;

	      var Ctor = !isBindKey && createCtorWrapper(func),
	          key = func;

	      function wrapper() {
	        // Avoid `arguments` object use disqualifying optimizations by
	        // converting it to an array before providing it to other functions.
	        var length = arguments.length,
	            index = length,
	            args = Array(length);

	        while (index--) {
	          args[index] = arguments[index];
	        }
	        if (partials) {
	          args = composeArgs(args, partials, holders);
	        }
	        if (partialsRight) {
	          args = composeArgsRight(args, partialsRight, holdersRight);
	        }
	        if (isCurry || isCurryRight) {
	          var placeholder = wrapper.placeholder,
	              argsHolders = replaceHolders(args, placeholder);

	          length -= argsHolders.length;
	          if (length < arity) {
	            var newArgPos = argPos ? arrayCopy(argPos) : null,
	                newArity = nativeMax(arity - length, 0),
	                newsHolders = isCurry ? argsHolders : null,
	                newHoldersRight = isCurry ? null : argsHolders,
	                newPartials = isCurry ? args : null,
	                newPartialsRight = isCurry ? null : args;

	            bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
	            bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

	            if (!isCurryBound) {
	              bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
	            }
	            var result = createHybridWrapper(func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity);
	            result.placeholder = placeholder;
	            return result;
	          }
	        }
	        var thisBinding = isBind ? thisArg : this;
	        if (isBindKey) {
	          func = thisBinding[key];
	        }
	        if (argPos) {
	          args = reorder(args, argPos);
	        }
	        if (isAry && ary < args.length) {
	          args.length = ary;
	        }
	        return (this instanceof wrapper ? (Ctor || createCtorWrapper(func)) : func).apply(thisBinding, args);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates the pad required for `string` based on the given padding length.
	     * The `chars` string may be truncated if the number of padding characters
	     * exceeds the padding length.
	     *
	     * @private
	     * @param {string} string The string to create padding for.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the pad for `string`.
	     */
	    function createPad(string, length, chars) {
	      var strLength = string.length;
	      length = +length;

	      if (strLength >= length || !nativeIsFinite(length)) {
	        return '';
	      }
	      var padLength = length - strLength;
	      chars = chars == null ? ' ' : (chars + '');
	      return repeat(chars, ceil(padLength / chars.length)).slice(0, padLength);
	    }

	    /**
	     * Creates a function that wraps `func` and invokes it with the optional `this`
	     * binding of `thisArg` and the `partials` prepended to those provided to
	     * the wrapper.
	     *
	     * @private
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {Array} partials The arguments to prepend to those provided to the new function.
	     * @returns {Function} Returns the new bound function.
	     */
	    function createPartialWrapper(func, bitmask, thisArg, partials) {
	      var isBind = bitmask & BIND_FLAG,
	          Ctor = createCtorWrapper(func);

	      function wrapper() {
	        // Avoid `arguments` object use disqualifying optimizations by
	        // converting it to an array before providing it `func`.
	        var argsIndex = -1,
	            argsLength = arguments.length,
	            leftIndex = -1,
	            leftLength = partials.length,
	            args = Array(argsLength + leftLength);

	        while (++leftIndex < leftLength) {
	          args[leftIndex] = partials[leftIndex];
	        }
	        while (argsLength--) {
	          args[leftIndex++] = arguments[++argsIndex];
	        }
	        return (this instanceof wrapper ? Ctor : func).apply(isBind ? thisArg : this, args);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates a function that either curries or invokes `func` with optional
	     * `this` binding and partially applied arguments.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to reference.
	     * @param {number} bitmask The bitmask of flags.
	     *  The bitmask may be composed of the following flags:
	     *     1 - `_.bind`
	     *     2 - `_.bindKey`
	     *     4 - `_.curry` or `_.curryRight` of a bound function
	     *     8 - `_.curry`
	     *    16 - `_.curryRight`
	     *    32 - `_.partial`
	     *    64 - `_.partialRight`
	     *   128 - `_.rearg`
	     *   256 - `_.ary`
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to be partially applied.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
	      var isBindKey = bitmask & BIND_KEY_FLAG;
	      if (!isBindKey && typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var length = partials ? partials.length : 0;
	      if (!length) {
	        bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
	        partials = holders = null;
	      }
	      length -= (holders ? holders.length : 0);
	      if (bitmask & PARTIAL_RIGHT_FLAG) {
	        var partialsRight = partials,
	            holdersRight = holders;

	        partials = holders = null;
	      }
	      var data = !isBindKey && getData(func),
	          newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

	      if (data && data !== true) {
	        mergeData(newData, data);
	        bitmask = newData[1];
	        arity = newData[9];
	      }
	      newData[9] = arity == null
	        ? (isBindKey ? 0 : func.length)
	        : (nativeMax(arity - length, 0) || 0);

	      if (bitmask == BIND_FLAG) {
	        var result = createBindWrapper(newData[0], newData[2]);
	      } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
	        result = createPartialWrapper.apply(undefined, newData);
	      } else {
	        result = createHybridWrapper.apply(undefined, newData);
	      }
	      var setter = data ? baseSetData : setData;
	      return setter(result, newData);
	    }

	    /**
	     * A specialized version of `baseIsEqualDeep` for arrays with support for
	     * partial deep comparisons.
	     *
	     * @private
	     * @param {Array} array The array to compare.
	     * @param {Array} other The other array to compare.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Function} [customizer] The function to customize comparing arrays.
	     * @param {boolean} [isWhere] Specify performing partial comparisons.
	     * @param {Array} [stackA] Tracks traversed `value` objects.
	     * @param {Array} [stackB] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	     */
	    function equalArrays(array, other, equalFunc, customizer, isWhere, stackA, stackB) {
	      var index = -1,
	          arrLength = array.length,
	          othLength = other.length,
	          result = true;

	      if (arrLength != othLength && !(isWhere && othLength > arrLength)) {
	        return false;
	      }
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (result && ++index < arrLength) {
	        var arrValue = array[index],
	            othValue = other[index];

	        result = undefined;
	        if (customizer) {
	          result = isWhere
	            ? customizer(othValue, arrValue, index)
	            : customizer(arrValue, othValue, index);
	        }
	        if (typeof result == 'undefined') {
	          // Recursively compare arrays (susceptible to call stack limits).
	          if (isWhere) {
	            var othIndex = othLength;
	            while (othIndex--) {
	              othValue = other[othIndex];
	              result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);
	              if (result) {
	                break;
	              }
	            }
	          } else {
	            result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);
	          }
	        }
	      }
	      return !!result;
	    }

	    /**
	     * A specialized version of `baseIsEqualDeep` for comparing objects of
	     * the same `toStringTag`.
	     *
	     * **Note:** This function only supports comparing values with tags of
	     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	     *
	     * @private
	     * @param {Object} value The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {string} tag The `toStringTag` of the objects to compare.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function equalByTag(object, other, tag) {
	      switch (tag) {
	        case boolTag:
	        case dateTag:
	          // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	          return +object == +other;

	        case errorTag:
	          return object.name == other.name && object.message == other.message;

	        case numberTag:
	          // Treat `NaN` vs. `NaN` as equal.
	          return (object != +object)
	            ? other != +other
	            // But, treat `-0` vs. `+0` as not equal.
	            : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);

	        case regexpTag:
	        case stringTag:
	          // Coerce regexes to strings and treat strings primitives and string
	          // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	          return object == (other + '');
	      }
	      return false;
	    }

	    /**
	     * A specialized version of `baseIsEqualDeep` for objects with support for
	     * partial deep comparisons.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Function} [customizer] The function to customize comparing values.
	     * @param {boolean} [isWhere] Specify performing partial comparisons.
	     * @param {Array} [stackA] Tracks traversed `value` objects.
	     * @param {Array} [stackB] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function equalObjects(object, other, equalFunc, customizer, isWhere, stackA, stackB) {
	      var objProps = keys(object),
	          objLength = objProps.length,
	          othProps = keys(other),
	          othLength = othProps.length;

	      if (objLength != othLength && !isWhere) {
	        return false;
	      }
	      var hasCtor,
	          index = -1;

	      while (++index < objLength) {
	        var key = objProps[index],
	            result = hasOwnProperty.call(other, key);

	        if (result) {
	          var objValue = object[key],
	              othValue = other[key];

	          result = undefined;
	          if (customizer) {
	            result = isWhere
	              ? customizer(othValue, objValue, key)
	              : customizer(objValue, othValue, key);
	          }
	          if (typeof result == 'undefined') {
	            // Recursively compare objects (susceptible to call stack limits).
	            result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isWhere, stackA, stackB);
	          }
	        }
	        if (!result) {
	          return false;
	        }
	        hasCtor || (hasCtor = key == 'constructor');
	      }
	      if (!hasCtor) {
	        var objCtor = object.constructor,
	            othCtor = other.constructor;

	        // Non `Object` object instances with different constructors are not equal.
	        if (objCtor != othCtor && ('constructor' in object && 'constructor' in other) &&
	            !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	          return false;
	        }
	      }
	      return true;
	    }

	    /**
	     * Gets the extremum value of `collection` invoking `iteratee` for each value
	     * in `collection` to generate the criterion by which the value is ranked.
	     * The `iteratee` is invoked with three arguments; (value, index, collection).
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {boolean} [isMin] Specify returning the minimum, instead of the
	     *  maximum, extremum value.
	     * @returns {*} Returns the extremum value.
	     */
	    function extremumBy(collection, iteratee, isMin) {
	      var exValue = isMin ? POSITIVE_INFINITY : NEGATIVE_INFINITY,
	          computed = exValue,
	          result = computed;

	      baseEach(collection, function(value, index, collection) {
	        var current = iteratee(value, index, collection);
	        if ((isMin ? current < computed : current > computed) || (current === exValue && current === result)) {
	          computed = current;
	          result = value;
	        }
	      });
	      return result;
	    }

	    /**
	     * Gets the appropriate "callback" function. If the `_.callback` method is
	     * customized this function returns the custom method, otherwise it returns
	     * the `baseCallback` function. If arguments are provided the chosen function
	     * is invoked with them and its result is returned.
	     *
	     * @private
	     * @returns {Function} Returns the chosen function or its result.
	     */
	    function getCallback(func, thisArg, argCount) {
	      var result = lodash.callback || callback;
	      result = result === callback ? baseCallback : result;
	      return argCount ? result(func, thisArg, argCount) : result;
	    }

	    /**
	     * Gets metadata for `func`.
	     *
	     * @private
	     * @param {Function} func The function to query.
	     * @returns {*} Returns the metadata for `func`.
	     */
	    var getData = !metaMap ? noop : function(func) {
	      return metaMap.get(func);
	    };

	    /**
	     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
	     * customized this function returns the custom method, otherwise it returns
	     * the `baseIndexOf` function. If arguments are provided the chosen function
	     * is invoked with them and its result is returned.
	     *
	     * @private
	     * @returns {Function|number} Returns the chosen function or its result.
	     */
	    function getIndexOf(collection, target, fromIndex) {
	      var result = lodash.indexOf || indexOf;
	      result = result === indexOf ? baseIndexOf : result;
	      return collection ? result(collection, target, fromIndex) : result;
	    }

	    /**
	     * Gets the view, applying any `transforms` to the `start` and `end` positions.
	     *
	     * @private
	     * @param {number} start The start of the view.
	     * @param {number} end The end of the view.
	     * @param {Array} [transforms] The transformations to apply to the view.
	     * @returns {Object} Returns an object containing the `start` and `end`
	     *  positions of the view.
	     */
	    function getView(start, end, transforms) {
	      var index = -1,
	          length = transforms ? transforms.length : 0;

	      while (++index < length) {
	        var data = transforms[index],
	            size = data.size;

	        switch (data.type) {
	          case 'drop':      start += size; break;
	          case 'dropRight': end -= size; break;
	          case 'take':      end = nativeMin(end, start + size); break;
	          case 'takeRight': start = nativeMax(start, end - size); break;
	        }
	      }
	      return { 'start': start, 'end': end };
	    }

	    /**
	     * Initializes an array clone.
	     *
	     * @private
	     * @param {Array} array The array to clone.
	     * @returns {Array} Returns the initialized clone.
	     */
	    function initCloneArray(array) {
	      var length = array.length,
	          result = new array.constructor(length);

	      // Add array properties assigned by `RegExp#exec`.
	      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	        result.index = array.index;
	        result.input = array.input;
	      }
	      return result;
	    }

	    /**
	     * Initializes an object clone.
	     *
	     * @private
	     * @param {Object} object The object to clone.
	     * @returns {Object} Returns the initialized clone.
	     */
	    function initCloneObject(object) {
	      var Ctor = object.constructor;
	      if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
	        Ctor = Object;
	      }
	      return new Ctor;
	    }

	    /**
	     * Initializes an object clone based on its `toStringTag`.
	     *
	     * **Note:** This function only supports cloning values with tags of
	     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	     *
	     *
	     * @private
	     * @param {Object} object The object to clone.
	     * @param {string} tag The `toStringTag` of the object to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @returns {Object} Returns the initialized clone.
	     */
	    function initCloneByTag(object, tag, isDeep) {
	      var Ctor = object.constructor;
	      switch (tag) {
	        case arrayBufferTag:
	          return bufferClone(object);

	        case boolTag:
	        case dateTag:
	          return new Ctor(+object);

	        case float32Tag: case float64Tag:
	        case int8Tag: case int16Tag: case int32Tag:
	        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	          var buffer = object.buffer;
	          return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

	        case numberTag:
	        case stringTag:
	          return new Ctor(object);

	        case regexpTag:
	          var result = new Ctor(object.source, reFlags.exec(object));
	          result.lastIndex = object.lastIndex;
	      }
	      return result;
	    }

	    /**
	     * Checks if `func` is eligible for `this` binding.
	     *
	     * @private
	     * @param {Function} func The function to check.
	     * @returns {boolean} Returns `true` if `func` is eligible, else `false`.
	     */
	    function isBindable(func) {
	      var support = lodash.support,
	          result = !(support.funcNames ? func.name : support.funcDecomp);

	      if (!result) {
	        var source = fnToString.call(func);
	        if (!support.funcNames) {
	          result = !reFuncName.test(source);
	        }
	        if (!result) {
	          // Check if `func` references the `this` keyword and store the result.
	          result = reThis.test(source) || isNative(func);
	          baseSetData(func, result);
	        }
	      }
	      return result;
	    }

	    /**
	     * Checks if `value` is a valid array-like index.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	     */
	    function isIndex(value, length) {
	      value = +value;
	      length = length == null ? MAX_SAFE_INTEGER : length;
	      return value > -1 && value % 1 == 0 && value < length;
	    }

	    /**
	     * Checks if the provided arguments are from an iteratee call.
	     *
	     * @private
	     * @param {*} value The potential iteratee value argument.
	     * @param {*} index The potential iteratee index or key argument.
	     * @param {*} object The potential iteratee object argument.
	     * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	     */
	    function isIterateeCall(value, index, object) {
	      if (!isObject(object)) {
	        return false;
	      }
	      var type = typeof index;
	      if (type == 'number') {
	        var length = object.length,
	            prereq = isLength(length) && isIndex(index, length);
	      } else {
	        prereq = type == 'string' && index in object;
	      }
	      var other = object[index];
	      return prereq && (value === value ? value === other : other !== other);
	    }

	    /**
	     * Checks if `value` is a valid array-like length.
	     *
	     * **Note:** This function is based on ES `ToLength`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
	     * for more details.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	     */
	    function isLength(value) {
	      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	    }

	    /**
	     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` if suitable for strict
	     *  equality comparisons, else `false`.
	     */
	    function isStrictComparable(value) {
	      return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));
	    }

	    /**
	     * Merges the function metadata of `source` into `data`.
	     *
	     * Merging metadata reduces the number of wrappers required to invoke a function.
	     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
	     * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
	     * augment function arguments, making the order in which they are executed important,
	     * preventing the merging of metadata. However, we make an exception for a safe
	     * common case where curried functions have `_.ary` and or `_.rearg` applied.
	     *
	     * @private
	     * @param {Array} data The destination metadata.
	     * @param {Array} source The source metadata.
	     * @returns {Array} Returns `data`.
	     */
	    function mergeData(data, source) {
	      var bitmask = data[1],
	          srcBitmask = source[1],
	          newBitmask = bitmask | srcBitmask;

	      var arityFlags = ARY_FLAG | REARG_FLAG,
	          bindFlags = BIND_FLAG | BIND_KEY_FLAG,
	          comboFlags = arityFlags | bindFlags | CURRY_BOUND_FLAG | CURRY_RIGHT_FLAG;

	      var isAry = bitmask & ARY_FLAG && !(srcBitmask & ARY_FLAG),
	          isRearg = bitmask & REARG_FLAG && !(srcBitmask & REARG_FLAG),
	          argPos = (isRearg ? data : source)[7],
	          ary = (isAry ? data : source)[8];

	      var isCommon = !(bitmask >= REARG_FLAG && srcBitmask > bindFlags) &&
	        !(bitmask > bindFlags && srcBitmask >= REARG_FLAG);

	      var isCombo = (newBitmask >= arityFlags && newBitmask <= comboFlags) &&
	        (bitmask < REARG_FLAG || ((isRearg || isAry) && argPos.length <= ary));

	      // Exit early if metadata can't be merged.
	      if (!(isCommon || isCombo)) {
	        return data;
	      }
	      // Use source `thisArg` if available.
	      if (srcBitmask & BIND_FLAG) {
	        data[2] = source[2];
	        // Set when currying a bound function.
	        newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
	      }
	      // Compose partial arguments.
	      var value = source[3];
	      if (value) {
	        var partials = data[3];
	        data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
	        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
	      }
	      // Compose partial right arguments.
	      value = source[5];
	      if (value) {
	        partials = data[5];
	        data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
	        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
	      }
	      // Use source `argPos` if available.
	      value = source[7];
	      if (value) {
	        data[7] = arrayCopy(value);
	      }
	      // Use source `ary` if it's smaller.
	      if (srcBitmask & ARY_FLAG) {
	        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
	      }
	      // Use source `arity` if one is not provided.
	      if (data[9] == null) {
	        data[9] = source[9];
	      }
	      // Use source `func` and merge bitmasks.
	      data[0] = source[0];
	      data[1] = newBitmask;

	      return data;
	    }

	    /**
	     * A specialized version of `_.pick` that picks `object` properties specified
	     * by the `props` array.
	     *
	     * @private
	     * @param {Object} object The source object.
	     * @param {string[]} props The property names to pick.
	     * @returns {Object} Returns the new object.
	     */
	    function pickByArray(object, props) {
	      object = toObject(object);

	      var index = -1,
	          length = props.length,
	          result = {};

	      while (++index < length) {
	        var key = props[index];
	        if (key in object) {
	          result[key] = object[key];
	        }
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `_.pick` that picks `object` properties `predicate`
	     * returns truthy for.
	     *
	     * @private
	     * @param {Object} object The source object.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Object} Returns the new object.
	     */
	    function pickByCallback(object, predicate) {
	      var result = {};
	      baseForIn(object, function(value, key, object) {
	        if (predicate(value, key, object)) {
	          result[key] = value;
	        }
	      });
	      return result;
	    }

	    /**
	     * Reorder `array` according to the specified indexes where the element at
	     * the first index is assigned as the first element, the element at
	     * the second index is assigned as the second element, and so on.
	     *
	     * @private
	     * @param {Array} array The array to reorder.
	     * @param {Array} indexes The arranged array indexes.
	     * @returns {Array} Returns `array`.
	     */
	    function reorder(array, indexes) {
	      var arrLength = array.length,
	          length = nativeMin(indexes.length, arrLength),
	          oldArray = arrayCopy(array);

	      while (length--) {
	        var index = indexes[length];
	        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
	      }
	      return array;
	    }

	    /**
	     * Sets metadata for `func`.
	     *
	     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
	     * period of time, it will trip its breaker and transition to an identity function
	     * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
	     * for more details.
	     *
	     * @private
	     * @param {Function} func The function to associate metadata with.
	     * @param {*} data The metadata.
	     * @returns {Function} Returns `func`.
	     */
	    var setData = (function() {
	      var count = 0,
	          lastCalled = 0;

	      return function(key, value) {
	        var stamp = now(),
	            remaining = HOT_SPAN - (stamp - lastCalled);

	        lastCalled = stamp;
	        if (remaining > 0) {
	          if (++count >= HOT_COUNT) {
	            return key;
	          }
	        } else {
	          count = 0;
	        }
	        return baseSetData(key, value);
	      };
	    }());

	    /**
	     * A fallback implementation of `_.isPlainObject` which checks if `value`
	     * is an object created by the `Object` constructor or has a `[[Prototype]]`
	     * of `null`.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     */
	    function shimIsPlainObject(value) {
	      var Ctor,
	          support = lodash.support;

	      // Exit early for non `Object` objects.
	      if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
	          (!hasOwnProperty.call(value, 'constructor') &&
	            (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
	        return false;
	      }
	      // IE < 9 iterates inherited properties before own properties. If the first
	      // iterated property is an object's own property then there are no inherited
	      // enumerable properties.
	      var result;
	      // In most environments an object's own properties are iterated before
	      // its inherited properties. If the last iterated property is an object's
	      // own property then there are no inherited enumerable properties.
	      baseForIn(value, function(subValue, key) {
	        result = key;
	      });
	      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
	    }

	    /**
	     * A fallback implementation of `Object.keys` which creates an array of the
	     * own enumerable property names of `object`.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the array of property names.
	     */
	    function shimKeys(object) {
	      var props = keysIn(object),
	          propsLength = props.length,
	          length = propsLength && object.length,
	          support = lodash.support;

	      var allowIndexes = length && isLength(length) &&
	        (isArray(object) || (support.nonEnumArgs && isArguments(object)));

	      var index = -1,
	          result = [];

	      while (++index < propsLength) {
	        var key = props[index];
	        if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	          result.push(key);
	        }
	      }
	      return result;
	    }

	    /**
	     * Converts `value` to an array-like object if it is not one.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {Array|Object} Returns the array-like object.
	     */
	    function toIterable(value) {
	      if (value == null) {
	        return [];
	      }
	      if (!isLength(value.length)) {
	        return values(value);
	      }
	      return isObject(value) ? value : Object(value);
	    }

	    /**
	     * Converts `value` to an object if it is not one.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {Object} Returns the object.
	     */
	    function toObject(value) {
	      return isObject(value) ? value : Object(value);
	    }

	    /**
	     * Creates a clone of `wrapper`.
	     *
	     * @private
	     * @param {Object} wrapper The wrapper to clone.
	     * @returns {Object} Returns the cloned wrapper.
	     */
	    function wrapperClone(wrapper) {
	      return wrapper instanceof LazyWrapper
	        ? wrapper.clone()
	        : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates an array of elements split into groups the length of `size`.
	     * If `collection` can't be split evenly, the final chunk will be the remaining
	     * elements.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to process.
	     * @param {number} [size=1] The length of each chunk.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the new array containing chunks.
	     * @example
	     *
	     * _.chunk(['a', 'b', 'c', 'd'], 2);
	     * // => [['a', 'b'], ['c', 'd']]
	     *
	     * _.chunk(['a', 'b', 'c', 'd'], 3);
	     * // => [['a', 'b', 'c'], ['d']]
	     */
	    function chunk(array, size, guard) {
	      if (guard ? isIterateeCall(array, size, guard) : size == null) {
	        size = 1;
	      } else {
	        size = nativeMax(+size || 1, 1);
	      }
	      var index = 0,
	          length = array ? array.length : 0,
	          resIndex = -1,
	          result = Array(ceil(length / size));

	      while (index < length) {
	        result[++resIndex] = baseSlice(array, index, (index += size));
	      }
	      return result;
	    }

	    /**
	     * Creates an array with all falsey values removed. The values `false`, `null`,
	     * `0`, `""`, `undefined`, and `NaN` are falsey.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to compact.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.compact([0, 1, false, 2, '', 3]);
	     * // => [1, 2, 3]
	     */
	    function compact(array) {
	      var index = -1,
	          length = array ? array.length : 0,
	          resIndex = -1,
	          result = [];

	      while (++index < length) {
	        var value = array[index];
	        if (value) {
	          result[++resIndex] = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates an array excluding all values of the provided arrays using
	     * `SameValueZero` for equality comparisons.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {...Array} [values] The arrays of values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.difference([1, 2, 3], [4, 2]);
	     * // => [1, 3]
	     */
	    function difference() {
	      var index = -1,
	          length = arguments.length;

	      while (++index < length) {
	        var value = arguments[index];
	        if (isArray(value) || isArguments(value)) {
	          break;
	        }
	      }
	      return baseDifference(value, baseFlatten(arguments, false, true, ++index));
	    }

	    /**
	     * Creates a slice of `array` with `n` elements dropped from the beginning.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to drop.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.drop([1, 2, 3]);
	     * // => [2, 3]
	     *
	     * _.drop([1, 2, 3], 2);
	     * // => [3]
	     *
	     * _.drop([1, 2, 3], 5);
	     * // => []
	     *
	     * _.drop([1, 2, 3], 0);
	     * // => [1, 2, 3]
	     */
	    function drop(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      return baseSlice(array, n < 0 ? 0 : n);
	    }

	    /**
	     * Creates a slice of `array` with `n` elements dropped from the end.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to drop.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropRight([1, 2, 3]);
	     * // => [1, 2]
	     *
	     * _.dropRight([1, 2, 3], 2);
	     * // => [1]
	     *
	     * _.dropRight([1, 2, 3], 5);
	     * // => []
	     *
	     * _.dropRight([1, 2, 3], 0);
	     * // => [1, 2, 3]
	     */
	    function dropRight(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      n = length - (+n || 0);
	      return baseSlice(array, 0, n < 0 ? 0 : n);
	    }

	    /**
	     * Creates a slice of `array` excluding elements dropped from the end.
	     * Elements are dropped until `predicate` returns falsey. The predicate is
	     * bound to `thisArg` and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that match the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropRightWhile([1, 2, 3], function(n) {
	     *   return n > 1;
	     * });
	     * // => [1]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.dropRightWhile(users, { 'user': pebbles, 'active': false }), 'user');
	     * // => ['barney', 'fred']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.dropRightWhile(users, 'active', false), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.dropRightWhile(users, 'active'), 'user');
	     * // => ['barney', 'fred', 'pebbles']
	     */
	    function dropRightWhile(array, predicate, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      predicate = getCallback(predicate, thisArg, 3);
	      while (length-- && predicate(array[length], length, array)) {}
	      return baseSlice(array, 0, length + 1);
	    }

	    /**
	     * Creates a slice of `array` excluding elements dropped from the beginning.
	     * Elements are dropped until `predicate` returns falsey. The predicate is
	     * bound to `thisArg` and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropWhile([1, 2, 3], function(n) {
	     *   return n < 3;
	     * });
	     * // => [3]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.dropWhile(users, { 'user': 'barney', 'active': false }), 'user');
	     * // => ['fred', 'pebbles']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.dropWhile(users, 'active', false), 'user');
	     * // => ['pebbles']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.dropWhile(users, 'active'), 'user');
	     * // => ['barney', 'fred', 'pebbles']
	     */
	    function dropWhile(array, predicate, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      var index = -1;
	      predicate = getCallback(predicate, thisArg, 3);
	      while (++index < length && predicate(array[index], index, array)) {}
	      return baseSlice(array, index);
	    }

	    /**
	     * Fills elements of `array` with `value` from `start` up to, but not
	     * including, `end`.
	     *
	     * **Note:** This method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to fill.
	     * @param {*} value The value to fill `array` with.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns `array`.
	     */
	    function fill(array, value, start, end) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
	        start = 0;
	        end = length;
	      }
	      return baseFill(array, value, start, end);
	    }

	    /**
	     * This method is like `_.find` except that it returns the index of the first
	     * element `predicate` returns truthy for, instead of the element itself.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * _.findIndex(users, function(chr) {
	     *   return chr.user == 'barney';
	     * });
	     * // => 0
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findIndex(users, { 'user': 'fred', 'active': false });
	     * // => 1
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findIndex(users, 'active', false);
	     * // => 0
	     *
	     * // using the `_.property` callback shorthand
	     * _.findIndex(users, 'active');
	     * // => 2
	     */
	    function findIndex(array, predicate, thisArg) {
	      var index = -1,
	          length = array ? array.length : 0;

	      predicate = getCallback(predicate, thisArg, 3);
	      while (++index < length) {
	        if (predicate(array[index], index, array)) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * This method is like `_.findIndex` except that it iterates over elements
	     * of `collection` from right to left.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * _.findLastIndex(users, function(chr) {
	     *   return chr.user == 'pebbles';
	     * });
	     * // => 2
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findLastIndex(users, { user': 'barney', 'active': true });
	     * // => 0
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findLastIndex(users, 'active', false);
	     * // => 1
	     *
	     * // using the `_.property` callback shorthand
	     * _.findLastIndex(users, 'active');
	     * // => 0
	     */
	    function findLastIndex(array, predicate, thisArg) {
	      var length = array ? array.length : 0;
	      predicate = getCallback(predicate, thisArg, 3);
	      while (length--) {
	        if (predicate(array[length], length, array)) {
	          return length;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Gets the first element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @alias head
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {*} Returns the first element of `array`.
	     * @example
	     *
	     * _.first([1, 2, 3]);
	     * // => 1
	     *
	     * _.first([]);
	     * // => undefined
	     */
	    function first(array) {
	      return array ? array[0] : undefined;
	    }

	    /**
	     * Flattens a nested array. If `isDeep` is `true` the array is recursively
	     * flattened, otherwise it is only flattened a single level.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isDeep] Specify a deep flatten.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * _.flatten([1, [2, 3, [4]]]);
	     * // => [1, 2, 3, [4]];
	     *
	     * // using `isDeep`
	     * _.flatten([1, [2, 3, [4]]], true);
	     * // => [1, 2, 3, 4];
	     */
	    function flatten(array, isDeep, guard) {
	      var length = array ? array.length : 0;
	      if (guard && isIterateeCall(array, isDeep, guard)) {
	        isDeep = false;
	      }
	      return length ? baseFlatten(array, isDeep) : [];
	    }

	    /**
	     * Recursively flattens a nested array.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to recursively flatten.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * _.flattenDeep([1, [2, 3, [4]]]);
	     * // => [1, 2, 3, 4];
	     */
	    function flattenDeep(array) {
	      var length = array ? array.length : 0;
	      return length ? baseFlatten(array, true) : [];
	    }

	    /**
	     * Gets the index at which the first occurrence of `value` is found in `array`
	     * using `SameValueZero` for equality comparisons. If `fromIndex` is negative,
	     * it is used as the offset from the end of `array`. If `array` is sorted
	     * providing `true` for `fromIndex` performs a faster binary search.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
	     *  to perform a binary search on a sorted array.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.indexOf([1, 2, 1, 2], 2);
	     * // => 2
	     *
	     * // using `fromIndex`
	     * _.indexOf([1, 2, 1, 2], 2, 2);
	     * // => 3
	     *
	     * // performing a binary search
	     * _.indexOf([1, 1, 2, 2], 2, true);
	     * // => 2
	     */
	    function indexOf(array, value, fromIndex) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return -1;
	      }
	      if (typeof fromIndex == 'number') {
	        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
	      } else if (fromIndex) {
	        var index = binaryIndex(array, value),
	            other = array[index];

	        return (value === value ? value === other : other !== other) ? index : -1;
	      }
	      return baseIndexOf(array, value, fromIndex);
	    }

	    /**
	     * Gets all but the last element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.initial([1, 2, 3]);
	     * // => [1, 2]
	     */
	    function initial(array) {
	      return dropRight(array, 1);
	    }

	    /**
	     * Creates an array of unique values in all provided arrays using `SameValueZero`
	     * for equality comparisons.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of shared values.
	     * @example
	     * _.intersection([1, 2], [4, 2], [2, 1]);
	     * // => [2]
	     */
	    function intersection() {
	      var args = [],
	          argsIndex = -1,
	          argsLength = arguments.length,
	          caches = [],
	          indexOf = getIndexOf(),
	          isCommon = indexOf == baseIndexOf;

	      while (++argsIndex < argsLength) {
	        var value = arguments[argsIndex];
	        if (isArray(value) || isArguments(value)) {
	          args.push(value);
	          caches.push(isCommon && value.length >= 120 && createCache(argsIndex && value));
	        }
	      }
	      argsLength = args.length;
	      var array = args[0],
	          index = -1,
	          length = array ? array.length : 0,
	          result = [],
	          seen = caches[0];

	      outer:
	      while (++index < length) {
	        value = array[index];
	        if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value)) < 0) {
	          argsIndex = argsLength;
	          while (--argsIndex) {
	            var cache = caches[argsIndex];
	            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
	              continue outer;
	            }
	          }
	          if (seen) {
	            seen.push(value);
	          }
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * Gets the last element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {*} Returns the last element of `array`.
	     * @example
	     *
	     * _.last([1, 2, 3]);
	     * // => 3
	     */
	    function last(array) {
	      var length = array ? array.length : 0;
	      return length ? array[length - 1] : undefined;
	    }

	    /**
	     * This method is like `_.indexOf` except that it iterates over elements of
	     * `array` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {boolean|number} [fromIndex=array.length-1] The index to search from
	     *  or `true` to perform a binary search on a sorted array.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.lastIndexOf([1, 2, 1, 2], 2);
	     * // => 3
	     *
	     * // using `fromIndex`
	     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
	     * // => 1
	     *
	     * // performing a binary search
	     * _.lastIndexOf([1, 1, 2, 2], 2, true);
	     * // => 3
	     */
	    function lastIndexOf(array, value, fromIndex) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return -1;
	      }
	      var index = length;
	      if (typeof fromIndex == 'number') {
	        index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;
	      } else if (fromIndex) {
	        index = binaryIndex(array, value, true) - 1;
	        var other = array[index];
	        return (value === value ? value === other : other !== other) ? index : -1;
	      }
	      if (value !== value) {
	        return indexOfNaN(array, index, true);
	      }
	      while (index--) {
	        if (array[index] === value) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Removes all provided values from `array` using `SameValueZero` for equality
	     * comparisons.
	     *
	     * **Notes:**
	     *  - Unlike `_.without`, this method mutates `array`.
	     *  - `SameValueZero` comparisons are like strict equality comparisons, e.g. `===`,
	     *    except that `NaN` matches `NaN`. See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     *    for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {...*} [values] The values to remove.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3, 1, 2, 3];
	     *
	     * _.pull(array, 2, 3);
	     * console.log(array);
	     * // => [1, 1]
	     */
	    function pull() {
	      var array = arguments[0];
	      if (!(array && array.length)) {
	        return array;
	      }
	      var index = 0,
	          indexOf = getIndexOf(),
	          length = arguments.length;

	      while (++index < length) {
	        var fromIndex = 0,
	            value = arguments[index];

	        while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {
	          splice.call(array, fromIndex, 1);
	        }
	      }
	      return array;
	    }

	    /**
	     * Removes elements from `array` corresponding to the given indexes and returns
	     * an array of the removed elements. Indexes may be specified as an array of
	     * indexes or as individual arguments.
	     *
	     * **Note:** Unlike `_.at`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {...(number|number[])} [indexes] The indexes of elements to remove,
	     *  specified as individual indexes or arrays of indexes.
	     * @returns {Array} Returns the new array of removed elements.
	     * @example
	     *
	     * var array = [5, 10, 15, 20];
	     * var evens = _.pullAt(array, 1, 3);
	     *
	     * console.log(array);
	     * // => [5, 15]
	     *
	     * console.log(evens);
	     * // => [10, 20]
	     */
	    function pullAt(array) {
	      return basePullAt(array || [], baseFlatten(arguments, false, false, 1));
	    }

	    /**
	     * Removes all elements from `array` that `predicate` returns truthy for
	     * and returns an array of the removed elements. The predicate is bound to
	     * `thisArg` and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * **Note:** Unlike `_.filter`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the new array of removed elements.
	     * @example
	     *
	     * var array = [1, 2, 3, 4];
	     * var evens = _.remove(array, function(n) {
	     *   return n % 2 == 0;
	     * });
	     *
	     * console.log(array);
	     * // => [1, 3]
	     *
	     * console.log(evens);
	     * // => [2, 4]
	     */
	    function remove(array, predicate, thisArg) {
	      var index = -1,
	          length = array ? array.length : 0,
	          result = [];

	      predicate = getCallback(predicate, thisArg, 3);
	      while (++index < length) {
	        var value = array[index];
	        if (predicate(value, index, array)) {
	          result.push(value);
	          splice.call(array, index--, 1);
	          length--;
	        }
	      }
	      return result;
	    }

	    /**
	     * Gets all but the first element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @alias tail
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.rest([1, 2, 3]);
	     * // => [2, 3]
	     */
	    function rest(array) {
	      return drop(array, 1);
	    }

	    /**
	     * Creates a slice of `array` from `start` up to, but not including, `end`.
	     *
	     * **Note:** This function is used instead of `Array#slice` to support node
	     * lists in IE < 9 and to ensure dense arrays are returned.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to slice.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function slice(array, start, end) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
	        start = 0;
	        end = length;
	      }
	      return baseSlice(array, start, end);
	    }

	    /**
	     * Uses a binary search to determine the lowest index at which `value` should
	     * be inserted into `array` in order to maintain its sort order. If an iteratee
	     * function is provided it is invoked for `value` and each element of `array`
	     * to compute their sort ranking. The iteratee is bound to `thisArg` and
	     * invoked with one argument; (value).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedIndex([30, 50], 40);
	     * // => 1
	     *
	     * _.sortedIndex([4, 4, 5, 5], 5);
	     * // => 2
	     *
	     * var dict = { 'data': { 'thirty': 30, 'forty': 40, 'fifty': 50 } };
	     *
	     * // using an iteratee function
	     * _.sortedIndex(['thirty', 'fifty'], 'forty', function(word) {
	     *   return this.data[word];
	     * }, dict);
	     * // => 1
	     *
	     * // using the `_.property` callback shorthand
	     * _.sortedIndex([{ 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
	     * // => 1
	     */
	    function sortedIndex(array, value, iteratee, thisArg) {
	      var func = getCallback(iteratee);
	      return (func === baseCallback && iteratee == null)
	        ? binaryIndex(array, value)
	        : binaryIndexBy(array, value, func(iteratee, thisArg, 1));
	    }

	    /**
	     * This method is like `_.sortedIndex` except that it returns the highest
	     * index at which `value` should be inserted into `array` in order to
	     * maintain its sort order.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedLastIndex([4, 4, 5, 5], 5);
	     * // => 4
	     */
	    function sortedLastIndex(array, value, iteratee, thisArg) {
	      var func = getCallback(iteratee);
	      return (func === baseCallback && iteratee == null)
	        ? binaryIndex(array, value, true)
	        : binaryIndexBy(array, value, func(iteratee, thisArg, 1), true);
	    }

	    /**
	     * Creates a slice of `array` with `n` elements taken from the beginning.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to take.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.take([1, 2, 3]);
	     * // => [1]
	     *
	     * _.take([1, 2, 3], 2);
	     * // => [1, 2]
	     *
	     * _.take([1, 2, 3], 5);
	     * // => [1, 2, 3]
	     *
	     * _.take([1, 2, 3], 0);
	     * // => []
	     */
	    function take(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      return baseSlice(array, 0, n < 0 ? 0 : n);
	    }

	    /**
	     * Creates a slice of `array` with `n` elements taken from the end.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to take.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeRight([1, 2, 3]);
	     * // => [3]
	     *
	     * _.takeRight([1, 2, 3], 2);
	     * // => [2, 3]
	     *
	     * _.takeRight([1, 2, 3], 5);
	     * // => [1, 2, 3]
	     *
	     * _.takeRight([1, 2, 3], 0);
	     * // => []
	     */
	    function takeRight(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      n = length - (+n || 0);
	      return baseSlice(array, n < 0 ? 0 : n);
	    }

	    /**
	     * Creates a slice of `array` with elements taken from the end. Elements are
	     * taken until `predicate` returns falsey. The predicate is bound to `thisArg`
	     * and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeRightWhile([1, 2, 3], function(n) {
	     *   return n > 1;
	     * });
	     * // => [2, 3]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.takeRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
	     * // => ['pebbles']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.takeRightWhile(users, 'active', false), 'user');
	     * // => ['fred', 'pebbles']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.takeRightWhile(users, 'active'), 'user');
	     * // => []
	     */
	    function takeRightWhile(array, predicate, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      predicate = getCallback(predicate, thisArg, 3);
	      while (length-- && predicate(array[length], length, array)) {}
	      return baseSlice(array, length + 1);
	    }

	    /**
	     * Creates a slice of `array` with elements taken from the beginning. Elements
	     * are taken until `predicate` returns falsey. The predicate is bound to
	     * `thisArg` and invoked with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeWhile([1, 2, 3], function(n) {
	     *   return n < 3;
	     * });
	     * // => [1, 2]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false},
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.takeWhile(users, { 'user': 'barney', 'active': false }), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.takeWhile(users, 'active', false), 'user');
	     * // => ['barney', 'fred']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.takeWhile(users, 'active'), 'user');
	     * // => []
	     */
	    function takeWhile(array, predicate, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      var index = -1;
	      predicate = getCallback(predicate, thisArg, 3);
	      while (++index < length && predicate(array[index], index, array)) {}
	      return baseSlice(array, 0, index);
	    }

	    /**
	     * Creates an array of unique values, in order, of the provided arrays using
	     * `SameValueZero` for equality comparisons.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of combined values.
	     * @example
	     *
	     * _.union([1, 2], [4, 2], [2, 1]);
	     * // => [1, 2, 4]
	     */
	    function union() {
	      return baseUniq(baseFlatten(arguments, false, true));
	    }

	    /**
	     * Creates a duplicate-value-free version of an array using `SameValueZero`
	     * for equality comparisons. Providing `true` for `isSorted` performs a faster
	     * search algorithm for sorted arrays. If an iteratee function is provided it
	     * is invoked for each value in the array to generate the criterion by which
	     * uniqueness is computed. The `iteratee` is bound to `thisArg` and invoked
	     * with three arguments; (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @alias unique
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {boolean} [isSorted] Specify the array is sorted.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new duplicate-value-free array.
	     * @example
	     *
	     * _.uniq([1, 2, 1]);
	     * // => [1, 2]
	     *
	     * // using `isSorted`
	     * _.uniq([1, 1, 2], true);
	     * // => [1, 2]
	     *
	     * // using an iteratee function
	     * _.uniq([1, 2.5, 1.5, 2], function(n) {
	     *   return this.floor(n);
	     * }, Math);
	     * // => [1, 2.5]
	     *
	     * // using the `_.property` callback shorthand
	     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }, { 'x': 2 }]
	     */
	    function uniq(array, isSorted, iteratee, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (isSorted != null && typeof isSorted != 'boolean') {
	        thisArg = iteratee;
	        iteratee = isIterateeCall(array, isSorted, thisArg) ? null : isSorted;
	        isSorted = false;
	      }
	      var func = getCallback();
	      if (!(func === baseCallback && iteratee == null)) {
	        iteratee = func(iteratee, thisArg, 3);
	      }
	      return (isSorted && getIndexOf() == baseIndexOf)
	        ? sortedUniq(array, iteratee)
	        : baseUniq(array, iteratee);
	    }

	    /**
	     * This method is like `_.zip` except that it accepts an array of grouped
	     * elements and creates an array regrouping the elements to their pre-`_.zip`
	     * configuration.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array of grouped elements to process.
	     * @returns {Array} Returns the new array of regrouped elements.
	     * @example
	     *
	     * var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
	     * // => [['fred', 30, true], ['barney', 40, false]]
	     *
	     * _.unzip(zipped);
	     * // => [['fred', 'barney'], [30, 40], [true, false]]
	     */
	    function unzip(array) {
	      var index = -1,
	          length = (array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0,
	          result = Array(length);

	      while (++index < length) {
	        result[index] = arrayMap(array, baseProperty(index));
	      }
	      return result;
	    }

	    /**
	     * Creates an array excluding all provided values using `SameValueZero` for
	     * equality comparisons.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to filter.
	     * @param {...*} [values] The values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.without([1, 2, 1, 3], 1, 2);
	     * // => [3]
	     */
	    function without(array) {
	      return baseDifference(array, baseSlice(arguments, 1));
	    }

	    /**
	     * Creates an array that is the symmetric difference of the provided arrays.
	     * See [Wikipedia](https://en.wikipedia.org/wiki/Symmetric_difference) for
	     * more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of values.
	     * @example
	     *
	     * _.xor([1, 2], [4, 2]);
	     * // => [1, 4]
	     */
	    function xor() {
	      var index = -1,
	          length = arguments.length;

	      while (++index < length) {
	        var array = arguments[index];
	        if (isArray(array) || isArguments(array)) {
	          var result = result
	            ? baseDifference(result, array).concat(baseDifference(array, result))
	            : array;
	        }
	      }
	      return result ? baseUniq(result) : [];
	    }

	    /**
	     * Creates an array of grouped elements, the first of which contains the first
	     * elements of the given arrays, the second of which contains the second elements
	     * of the given arrays, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to process.
	     * @returns {Array} Returns the new array of grouped elements.
	     * @example
	     *
	     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
	     * // => [['fred', 30, true], ['barney', 40, false]]
	     */
	    function zip() {
	      var length = arguments.length,
	          array = Array(length);

	      while (length--) {
	        array[length] = arguments[length];
	      }
	      return unzip(array);
	    }

	    /**
	     * Creates an object composed from arrays of property names and values. Provide
	     * either a single two dimensional array, e.g. `[[key1, value1], [key2, value2]]`
	     * or two arrays, one of property names and one of corresponding values.
	     *
	     * @static
	     * @memberOf _
	     * @alias object
	     * @category Array
	     * @param {Array} props The property names.
	     * @param {Array} [values=[]] The property values.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * _.zipObject(['fred', 'barney'], [30, 40]);
	     * // => { 'fred': 30, 'barney': 40 }
	     */
	    function zipObject(props, values) {
	      var index = -1,
	          length = props ? props.length : 0,
	          result = {};

	      if (length && !values && !isArray(props[0])) {
	        values = [];
	      }
	      while (++index < length) {
	        var key = props[index];
	        if (values) {
	          result[key] = values[index];
	        } else if (key) {
	          result[key[0]] = key[1];
	        }
	      }
	      return result;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object that wraps `value` with explicit method
	     * chaining enabled.
	     *
	     * @static
	     * @memberOf _
	     * @category Chain
	     * @param {*} value The value to wrap.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36 },
	     *   { 'user': 'fred',    'age': 40 },
	     *   { 'user': 'pebbles', 'age': 1 }
	     * ];
	     *
	     * var youngest = _.chain(users)
	     *   .sortBy('age')
	     *   .map(function(chr) {
	     *     return chr.user + ' is ' + chr.age;
	     *   })
	     *   .first()
	     *   .value();
	     * // => 'pebbles is 1'
	     */
	    function chain(value) {
	      var result = lodash(value);
	      result.__chain__ = true;
	      return result;
	    }

	    /**
	     * This method invokes `interceptor` and returns `value`. The interceptor is
	     * bound to `thisArg` and invoked with one argument; (value). The purpose of
	     * this method is to "tap into" a method chain in order to perform operations
	     * on intermediate results within the chain.
	     *
	     * @static
	     * @memberOf _
	     * @category Chain
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @param {*} [thisArg] The `this` binding of `interceptor`.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * _([1, 2, 3])
	     *  .tap(function(array) {
	     *    array.pop();
	     *  })
	     *  .reverse()
	     *  .value();
	     * // => [2, 1]
	     */
	    function tap(value, interceptor, thisArg) {
	      interceptor.call(thisArg, value);
	      return value;
	    }

	    /**
	     * This method is like `_.tap` except that it returns the result of `interceptor`.
	     *
	     * @static
	     * @memberOf _
	     * @category Chain
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @param {*} [thisArg] The `this` binding of `interceptor`.
	     * @returns {*} Returns the result of `interceptor`.
	     * @example
	     *
	     * _([1, 2, 3])
	     *  .last()
	     *  .thru(function(value) {
	     *    return [value];
	     *  })
	     *  .value();
	     * // => [3]
	     */
	    function thru(value, interceptor, thisArg) {
	      return interceptor.call(thisArg, value);
	    }

	    /**
	     * Enables explicit method chaining on the wrapper object.
	     *
	     * @name chain
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * // without explicit chaining
	     * _(users).first();
	     * // => { 'user': 'barney', 'age': 36 }
	     *
	     * // with explicit chaining
	     * _(users).chain()
	     *   .first()
	     *   .pick('user')
	     *   .value();
	     * // => { 'user': 'barney' }
	     */
	    function wrapperChain() {
	      return chain(this);
	    }

	    /**
	     * Executes the chained sequence and returns the wrapped result.
	     *
	     * @name commit
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2];
	     * var wrapper = _(array).push(3);
	     *
	     * console.log(array);
	     * // => [1, 2]
	     *
	     * wrapper = wrapper.commit();
	     * console.log(array);
	     * // => [1, 2, 3]
	     *
	     * wrapper.last();
	     * // => 3
	     *
	     * console.log(array);
	     * // => [1, 2, 3]
	     */
	    function wrapperCommit() {
	      return new LodashWrapper(this.value(), this.__chain__);
	    }

	    /**
	     * Creates a clone of the chained sequence planting `value` as the wrapped value.
	     *
	     * @name plant
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2];
	     * var wrapper = _(array).map(function(value) {
	     *   return Math.pow(value, 2);
	     * });
	     *
	     * var other = [3, 4];
	     * var otherWrapper = wrapper.plant(other);
	     *
	     * otherWrapper.value();
	     * // => [9, 16]
	     *
	     * wrapper.value();
	     * // => [1, 4]
	     */
	    function wrapperPlant(value) {
	      var result,
	          parent = this;

	      while (parent instanceof baseLodash) {
	        var clone = wrapperClone(parent);
	        if (result) {
	          previous.__wrapped__ = clone;
	        } else {
	          result = clone;
	        }
	        var previous = clone;
	        parent = parent.__wrapped__;
	      }
	      previous.__wrapped__ = value;
	      return result;
	    }

	    /**
	     * Reverses the wrapped array so the first element becomes the last, the
	     * second element becomes the second to last, and so on.
	     *
	     * **Note:** This method mutates the wrapped array.
	     *
	     * @name reverse
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new reversed `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2, 3];
	     *
	     * _(array).reverse().value()
	     * // => [3, 2, 1]
	     *
	     * console.log(array);
	     * // => [3, 2, 1]
	     */
	    function wrapperReverse() {
	      var value = this.__wrapped__;
	      if (value instanceof LazyWrapper) {
	        if (this.__actions__.length) {
	          value = new LazyWrapper(this);
	        }
	        return new LodashWrapper(value.reverse(), this.__chain__);
	      }
	      return this.thru(function(value) {
	        return value.reverse();
	      });
	    }

	    /**
	     * Produces the result of coercing the unwrapped value to a string.
	     *
	     * @name toString
	     * @memberOf _
	     * @category Chain
	     * @returns {string} Returns the coerced string value.
	     * @example
	     *
	     * _([1, 2, 3]).toString();
	     * // => '1,2,3'
	     */
	    function wrapperToString() {
	      return (this.value() + '');
	    }

	    /**
	     * Executes the chained sequence to extract the unwrapped value.
	     *
	     * @name value
	     * @memberOf _
	     * @alias run, toJSON, valueOf
	     * @category Chain
	     * @returns {*} Returns the resolved unwrapped value.
	     * @example
	     *
	     * _([1, 2, 3]).value();
	     * // => [1, 2, 3]
	     */
	    function wrapperValue() {
	      return baseWrapperValue(this.__wrapped__, this.__actions__);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates an array of elements corresponding to the given keys, or indexes,
	     * of `collection`. Keys may be specified as individual arguments or as arrays
	     * of keys.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {...(number|number[]|string|string[])} [props] The property names
	     *  or indexes of elements to pick, specified individually or in arrays.
	     * @returns {Array} Returns the new array of picked elements.
	     * @example
	     *
	     * _.at(['a', 'b', 'c'], [0, 2]);
	     * // => ['a', 'c']
	     *
	     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
	     * // => ['fred', 'pebbles']
	     */
	    function at(collection) {
	      var length = collection ? collection.length : 0;
	      if (isLength(length)) {
	        collection = toIterable(collection);
	      }
	      return baseAt(collection, baseFlatten(arguments, false, false, 1));
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through `iteratee`. The corresponding value
	     * of each key is the number of times the key was returned by `iteratee`.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(n) {
	     *   return Math.floor(n);
	     * });
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(n) {
	     *   return this.floor(n);
	     * }, Math);
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy(['one', 'two', 'three'], 'length');
	     * // => { '3': 2, '5': 1 }
	     */
	    var countBy = createAggregator(function(result, value, key) {
	      hasOwnProperty.call(result, key) ? ++result[key] : (result[key] = 1);
	    });

	    /**
	     * Checks if `predicate` returns truthy for **all** elements of `collection`.
	     * The predicate is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias all
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`.
	     * @example
	     *
	     * _.every([true, 1, null, 'yes'], Boolean);
	     * // => false
	     *
	     * var users = [
	     *   { 'user': 'barney', 'active': false },
	     *   { 'user': 'fred',   'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.every(users, { 'user': 'barney', 'active': false });
	     * // => false
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.every(users, 'active', false);
	     * // => true
	     *
	     * // using the `_.property` callback shorthand
	     * _.every(users, 'active');
	     * // => false
	     */
	    function every(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arrayEvery : baseEvery;
	      if (typeof predicate != 'function' || typeof thisArg != 'undefined') {
	        predicate = getCallback(predicate, thisArg, 3);
	      }
	      return func(collection, predicate);
	    }

	    /**
	     * Iterates over elements of `collection`, returning an array of all elements
	     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
	     * invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias select
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the new filtered array.
	     * @example
	     *
	     * _.filter([4, 5, 6], function(n) {
	     *   return n % 2 == 0;
	     * });
	     * // => [4, 6]
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.filter(users, 'active', false), 'user');
	     * // => ['fred']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.filter(users, 'active'), 'user');
	     * // => ['barney']
	     */
	    function filter(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arrayFilter : baseFilter;
	      predicate = getCallback(predicate, thisArg, 3);
	      return func(collection, predicate);
	    }

	    /**
	     * Iterates over elements of `collection`, returning the first element
	     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
	     * invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias detect
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36, 'active': true },
	     *   { 'user': 'fred',    'age': 40, 'active': false },
	     *   { 'user': 'pebbles', 'age': 1,  'active': true }
	     * ];
	     *
	     * _.result(_.find(users, function(chr) {
	     *   return chr.age < 40;
	     * }), 'user');
	     * // => 'barney'
	     *
	     * // using the `_.matches` callback shorthand
	     * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
	     * // => 'pebbles'
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.result(_.find(users, 'active', false), 'user');
	     * // => 'fred'
	     *
	     * // using the `_.property` callback shorthand
	     * _.result(_.find(users, 'active'), 'user');
	     * // => 'barney'
	     */
	    function find(collection, predicate, thisArg) {
	      if (isArray(collection)) {
	        var index = findIndex(collection, predicate, thisArg);
	        return index > -1 ? collection[index] : undefined;
	      }
	      predicate = getCallback(predicate, thisArg, 3);
	      return baseFind(collection, predicate, baseEach);
	    }

	    /**
	     * This method is like `_.find` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * _.findLast([1, 2, 3, 4], function(n) {
	     *   return n % 2 == 1;
	     * });
	     * // => 3
	     */
	    function findLast(collection, predicate, thisArg) {
	      predicate = getCallback(predicate, thisArg, 3);
	      return baseFind(collection, predicate, baseEachRight);
	    }

	    /**
	     * Performs a deep comparison between each element in `collection` and the
	     * source object, returning the first element that has equivalent property
	     * values.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. For comparing a single
	     * own or inherited property value see `_.matchesProperty`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Object} source The object of property values to match.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * _.result(_.findWhere(users, { 'age': 36, 'active': true }), 'user');
	     * // => 'barney'
	     *
	     * _.result(_.findWhere(users, { 'age': 40, 'active': false }), 'user');
	     * // => 'fred'
	     */
	    function findWhere(collection, source) {
	      return find(collection, baseMatches(source));
	    }

	    /**
	     * Iterates over elements of `collection` invoking `iteratee` for each element.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection). Iterator functions may exit iteration early
	     * by explicitly returning `false`.
	     *
	     * **Note:** As with other "Collections" methods, objects with a `length` property
	     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	     * may be used for object iteration.
	     *
	     * @static
	     * @memberOf _
	     * @alias each
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2]).forEach(function(n) {
	     *   console.log(n);
	     * }).value();
	     * // => logs each value from left to right and returns the array
	     *
	     * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
	     *   console.log(n, key);
	     * });
	     * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
	     */
	    function forEach(collection, iteratee, thisArg) {
	      return (typeof iteratee == 'function' && typeof thisArg == 'undefined' && isArray(collection))
	        ? arrayEach(collection, iteratee)
	        : baseEach(collection, bindCallback(iteratee, thisArg, 3));
	    }

	    /**
	     * This method is like `_.forEach` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias eachRight
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2]).forEachRight(function(n) {
	     *   console.log(n);
	     * }).join(',');
	     * // => logs each value from right to left and returns the array
	     */
	    function forEachRight(collection, iteratee, thisArg) {
	      return (typeof iteratee == 'function' && typeof thisArg == 'undefined' && isArray(collection))
	        ? arrayEachRight(collection, iteratee)
	        : baseEachRight(collection, bindCallback(iteratee, thisArg, 3));
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through `iteratee`. The corresponding value
	     * of each key is an array of the elements responsible for generating the key.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(n) {
	     *   return Math.floor(n);
	     * });
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(n) {
	     *   return this.floor(n);
	     * }, Math);
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * // using the `_.property` callback shorthand
	     * _.groupBy(['one', 'two', 'three'], 'length');
	     * // => { '3': ['one', 'two'], '5': ['three'] }
	     */
	    var groupBy = createAggregator(function(result, value, key) {
	      if (hasOwnProperty.call(result, key)) {
	        result[key].push(value);
	      } else {
	        result[key] = [value];
	      }
	    });

	    /**
	     * Checks if `value` is in `collection` using `SameValueZero` for equality
	     * comparisons. If `fromIndex` is negative, it is used as the offset from
	     * the end of `collection`.
	     *
	     * **Note:** `SameValueZero` comparisons are like strict equality comparisons,
	     * e.g. `===`, except that `NaN` matches `NaN`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @alias contains, include
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {*} target The value to search for.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @returns {boolean} Returns `true` if a matching element is found, else `false`.
	     * @example
	     *
	     * _.includes([1, 2, 3], 1);
	     * // => true
	     *
	     * _.includes([1, 2, 3], 1, 2);
	     * // => false
	     *
	     * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
	     * // => true
	     *
	     * _.includes('pebbles', 'eb');
	     * // => true
	     */
	    function includes(collection, target, fromIndex) {
	      var length = collection ? collection.length : 0;
	      if (!isLength(length)) {
	        collection = values(collection);
	        length = collection.length;
	      }
	      if (!length) {
	        return false;
	      }
	      if (typeof fromIndex == 'number') {
	        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
	      } else {
	        fromIndex = 0;
	      }
	      return (typeof collection == 'string' || !isArray(collection) && isString(collection))
	        ? (fromIndex < length && collection.indexOf(target, fromIndex) > -1)
	        : (getIndexOf(collection, target, fromIndex) > -1);
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through `iteratee`. The corresponding value
	     * of each key is the last element responsible for generating the key. The
	     * iteratee function is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * var keyData = [
	     *   { 'dir': 'left', 'code': 97 },
	     *   { 'dir': 'right', 'code': 100 }
	     * ];
	     *
	     * _.indexBy(keyData, 'dir');
	     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(keyData, function(object) {
	     *   return String.fromCharCode(object.code);
	     * });
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(keyData, function(object) {
	     *   return this.fromCharCode(object.code);
	     * }, String);
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     */
	    var indexBy = createAggregator(function(result, value, key) {
	      result[key] = value;
	    });

	    /**
	     * Invokes the method named by `methodName` on each element in `collection`,
	     * returning an array of the results of each invoked method. Any additional
	     * arguments are provided to each invoked method. If `methodName` is a function
	     * it is invoked for, and `this` bound to, each element in `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|string} methodName The name of the method to invoke or
	     *  the function invoked per iteration.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {Array} Returns the array of results.
	     * @example
	     *
	     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
	     * // => [[1, 5, 7], [1, 2, 3]]
	     *
	     * _.invoke([123, 456], String.prototype.split, '');
	     * // => [['1', '2', '3'], ['4', '5', '6']]
	     */
	    function invoke(collection, methodName) {
	      return baseInvoke(collection, methodName, baseSlice(arguments, 2));
	    }

	    /**
	     * Creates an array of values by running each element in `collection` through
	     * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * Many lodash methods are guarded to work as interatees for methods like
	     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	     *
	     * The guarded methods are:
	     * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`, `drop`,
	     * `dropRight`, `fill`, `flatten`, `invert`, `max`, `min`, `parseInt`, `slice`,
	     * `sortBy`, `take`, `takeRight`, `template`, `trim`, `trimLeft`, `trimRight`,
	     * `trunc`, `random`, `range`, `sample`, `uniq`, and `words`
	     *
	     * @static
	     * @memberOf _
	     * @alias collect
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     *  create a `_.property` or `_.matches` style callback respectively.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new mapped array.
	     * @example
	     *
	     * function timesThree(n) {
	     *   return n * 3;
	     * }
	     *
	     * _.map([1, 2], timesThree);
	     * // => [3, 6]
	     *
	     * _.map({ 'a': 1, 'b': 2 }, timesThree);
	     * // => [3, 6] (iteration order is not guaranteed)
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * // using the `_.property` callback shorthand
	     * _.map(users, 'user');
	     * // => ['barney', 'fred']
	     */
	    function map(collection, iteratee, thisArg) {
	      var func = isArray(collection) ? arrayMap : baseMap;
	      iteratee = getCallback(iteratee, thisArg, 3);
	      return func(collection, iteratee);
	    }

	    /**
	     * Gets the maximum value of `collection`. If `collection` is empty or falsey
	     * `-Infinity` is returned. If an iteratee function is provided it is invoked
	     * for each value in `collection` to generate the criterion by which the value
	     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments; (value, index, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the maximum value.
	     * @example
	     *
	     * _.max([4, 2, 8, 6]);
	     * // => 8
	     *
	     * _.max([]);
	     * // => -Infinity
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.max(users, function(chr) {
	     *   return chr.age;
	     * });
	     * // => { 'user': 'fred', 'age': 40 };
	     *
	     * // using the `_.property` callback shorthand
	     * _.max(users, 'age');
	     * // => { 'user': 'fred', 'age': 40 };
	     */
	    var max = createExtremum(arrayMax);

	    /**
	     * Gets the minimum value of `collection`. If `collection` is empty or falsey
	     * `Infinity` is returned. If an iteratee function is provided it is invoked
	     * for each value in `collection` to generate the criterion by which the value
	     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments; (value, index, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the minimum value.
	     * @example
	     *
	     * _.min([4, 2, 8, 6]);
	     * // => 2
	     *
	     * _.min([]);
	     * // => Infinity
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.min(users, function(chr) {
	     *   return chr.age;
	     * });
	     * // => { 'user': 'barney', 'age': 36 };
	     *
	     * // using the `_.property` callback shorthand
	     * _.min(users, 'age');
	     * // => { 'user': 'barney', 'age': 36 };
	     */
	    var min = createExtremum(arrayMin, true);

	    /**
	     * Creates an array of elements split into two groups, the first of which
	     * contains elements `predicate` returns truthy for, while the second of which
	     * contains elements `predicate` returns falsey for. The predicate is bound
	     * to `thisArg` and invoked with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the array of grouped elements.
	     * @example
	     *
	     * _.partition([1, 2, 3], function(n) {
	     *   return n % 2;
	     * });
	     * // => [[1, 3], [2]]
	     *
	     * _.partition([1.2, 2.3, 3.4], function(n) {
	     *   return this.floor(n) % 2;
	     * }, Math);
	     * // => [[1, 3], [2]]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36, 'active': false },
	     *   { 'user': 'fred',    'age': 40, 'active': true },
	     *   { 'user': 'pebbles', 'age': 1,  'active': false }
	     * ];
	     *
	     * var mapper = function(array) {
	     *   return _.pluck(array, 'user');
	     * };
	     *
	     * // using the `_.matches` callback shorthand
	     * _.map(_.partition(users, { 'age': 1, 'active': false }), mapper);
	     * // => [['pebbles'], ['barney', 'fred']]
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.map(_.partition(users, 'active', false), mapper);
	     * // => [['barney', 'pebbles'], ['fred']]
	     *
	     * // using the `_.property` callback shorthand
	     * _.map(_.partition(users, 'active'), mapper);
	     * // => [['fred'], ['barney', 'pebbles']]
	     */
	    var partition = createAggregator(function(result, value, key) {
	      result[key ? 0 : 1].push(value);
	    }, function() { return [[], []]; });

	    /**
	     * Gets the value of `key` from all elements in `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {string} key The key of the property to pluck.
	     * @returns {Array} Returns the property values.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.pluck(users, 'user');
	     * // => ['barney', 'fred']
	     *
	     * var userIndex = _.indexBy(users, 'user');
	     * _.pluck(userIndex, 'age');
	     * // => [36, 40] (iteration order is not guaranteed)
	     */
	    function pluck(collection, key) {
	      return map(collection, baseProperty(key));
	    }

	    /**
	     * Reduces `collection` to a value which is the accumulated result of running
	     * each element in `collection` through `iteratee`, where each successive
	     * invocation is supplied the return value of the previous. If `accumulator`
	     * is not provided the first element of `collection` is used as the initial
	     * value. The `iteratee` is bound to `thisArg`and invoked with four arguments;
	     * (accumulator, value, index|key, collection).
	     *
	     * Many lodash methods are guarded to work as interatees for methods like
	     * `_.reduce`, `_.reduceRight`, and `_.transform`.
	     *
	     * The guarded methods are:
	     * `assign`, `defaults`, `merge`, and `sortAllBy`
	     *
	     * @static
	     * @memberOf _
	     * @alias foldl, inject
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * _.reduce([1, 2], function(sum, n) {
	     *   return sum + n;
	     * });
	     * // => 3
	     *
	     * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
	     *   result[key] = n * 3;
	     *   return result;
	     * }, {});
	     * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
	     */
	    function reduce(collection, iteratee, accumulator, thisArg) {
	      var func = isArray(collection) ? arrayReduce : baseReduce;
	      return func(collection, getCallback(iteratee, thisArg, 4), accumulator, arguments.length < 3, baseEach);
	    }

	    /**
	     * This method is like `_.reduce` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias foldr
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var array = [[0, 1], [2, 3], [4, 5]];
	     *
	     * _.reduceRight(array, function(flattened, other) {
	     *   return flattened.concat(other);
	     * }, []);
	     * // => [4, 5, 2, 3, 0, 1]
	     */
	    function reduceRight(collection, iteratee, accumulator, thisArg) {
	      var func = isArray(collection) ? arrayReduceRight : baseReduce;
	      return func(collection, getCallback(iteratee, thisArg, 4), accumulator, arguments.length < 3, baseEachRight);
	    }

	    /**
	     * The opposite of `_.filter`; this method returns the elements of `collection`
	     * that `predicate` does **not** return truthy for.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the new filtered array.
	     * @example
	     *
	     * _.reject([1, 2, 3, 4], function(n) {
	     *   return n % 2 == 0;
	     * });
	     * // => [1, 3]
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': false },
	     *   { 'user': 'fred',   'age': 40, 'active': true }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.reject(users, 'active', false), 'user');
	     * // => ['fred']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.reject(users, 'active'), 'user');
	     * // => ['barney']
	     */
	    function reject(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arrayFilter : baseFilter;
	      predicate = getCallback(predicate, thisArg, 3);
	      return func(collection, function(value, index, collection) {
	        return !predicate(value, index, collection);
	      });
	    }

	    /**
	     * Gets a random element or `n` random elements from a collection.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to sample.
	     * @param {number} [n] The number of elements to sample.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {*} Returns the random sample(s).
	     * @example
	     *
	     * _.sample([1, 2, 3, 4]);
	     * // => 2
	     *
	     * _.sample([1, 2, 3, 4], 2);
	     * // => [3, 1]
	     */
	    function sample(collection, n, guard) {
	      if (guard ? isIterateeCall(collection, n, guard) : n == null) {
	        collection = toIterable(collection);
	        var length = collection.length;
	        return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
	      }
	      var result = shuffle(collection);
	      result.length = nativeMin(n < 0 ? 0 : (+n || 0), result.length);
	      return result;
	    }

	    /**
	     * Creates an array of shuffled values, using a version of the Fisher-Yates
	     * shuffle. See [Wikipedia](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to shuffle.
	     * @returns {Array} Returns the new shuffled array.
	     * @example
	     *
	     * _.shuffle([1, 2, 3, 4]);
	     * // => [4, 1, 3, 2]
	     */
	    function shuffle(collection) {
	      collection = toIterable(collection);

	      var index = -1,
	          length = collection.length,
	          result = Array(length);

	      while (++index < length) {
	        var rand = baseRandom(0, index);
	        if (index != rand) {
	          result[index] = result[rand];
	        }
	        result[rand] = collection[index];
	      }
	      return result;
	    }

	    /**
	     * Gets the size of `collection` by returning `collection.length` for
	     * array-like values or the number of own enumerable properties for objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to inspect.
	     * @returns {number} Returns the size of `collection`.
	     * @example
	     *
	     * _.size([1, 2, 3]);
	     * // => 3
	     *
	     * _.size({ 'a': 1, 'b': 2 });
	     * // => 2
	     *
	     * _.size('pebbles');
	     * // => 7
	     */
	    function size(collection) {
	      var length = collection ? collection.length : 0;
	      return isLength(length) ? length : keys(collection).length;
	    }

	    /**
	     * Checks if `predicate` returns truthy for **any** element of `collection`.
	     * The function returns as soon as it finds a passing value and does not iterate
	     * over the entire collection. The predicate is bound to `thisArg` and invoked
	     * with three arguments; (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias any
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     * @example
	     *
	     * _.some([null, 0, 'yes', false], Boolean);
	     * // => true
	     *
	     * var users = [
	     *   { 'user': 'barney', 'active': true },
	     *   { 'user': 'fred',   'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.some(users, { user': 'barney', 'active': false });
	     * // => false
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.some(users, 'active', false);
	     * // => true
	     *
	     * // using the `_.property` callback shorthand
	     * _.some(users, 'active');
	     * // => true
	     */
	    function some(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arraySome : baseSome;
	      if (typeof predicate != 'function' || typeof thisArg != 'undefined') {
	        predicate = getCallback(predicate, thisArg, 3);
	      }
	      return func(collection, predicate);
	    }

	    /**
	     * Creates an array of elements, sorted in ascending order by the results of
	     * running each element in a collection through `iteratee`. This method performs
	     * a stable sort, that is, it preserves the original sort order of equal elements.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments;
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Array|Function|Object|string} [iteratee=_.identity] The function
	     *  invoked per iteration. If a property name or an object is provided it is
	     *  used to create a `_.property` or `_.matches` style callback respectively.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * _.sortBy([1, 2, 3], function(n) {
	     *   return Math.sin(n);
	     * });
	     * // => [3, 1, 2]
	     *
	     * _.sortBy([1, 2, 3], function(n) {
	     *   return this.sin(n);
	     * }, Math);
	     * // => [3, 1, 2]
	     *
	     * var users = [
	     *   { 'user': 'fred' },
	     *   { 'user': 'pebbles' },
	     *   { 'user': 'barney' }
	     * ];
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.sortBy(users, 'user'), 'user');
	     * // => ['barney', 'fred', 'pebbles']
	     */
	    function sortBy(collection, iteratee, thisArg) {
	      var index = -1,
	          length = collection ? collection.length : 0,
	          result = isLength(length) ? Array(length) : [];

	      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
	        iteratee = null;
	      }
	      iteratee = getCallback(iteratee, thisArg, 3);
	      baseEach(collection, function(value, key, collection) {
	        result[++index] = { 'criteria': iteratee(value, key, collection), 'index': index, 'value': value };
	      });
	      return baseSortBy(result, compareAscending);
	    }

	    /**
	     * This method is like `_.sortBy` except that it sorts by property names
	     * instead of an iteratee function.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {...(string|string[])} props The property names to sort by,
	     *  specified as individual property names or arrays of property names.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 },
	     *   { 'user': 'barney', 'age': 26 },
	     *   { 'user': 'fred',   'age': 30 }
	     * ];
	     *
	     * _.map(_.sortByAll(users, ['user', 'age']), _.values);
	     * // => [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
	     */
	    function sortByAll(collection) {
	      var args = arguments;
	      if (args.length > 3 && isIterateeCall(args[1], args[2], args[3])) {
	        args = [collection, args[1]];
	      }
	      var index = -1,
	          length = collection ? collection.length : 0,
	          props = baseFlatten(args, false, false, 1),
	          result = isLength(length) ? Array(length) : [];

	      baseEach(collection, function(value) {
	        var length = props.length,
	            criteria = Array(length);

	        while (length--) {
	          criteria[length] = value == null ? undefined : value[props[length]];
	        }
	        result[++index] = { 'criteria': criteria, 'index': index, 'value': value };
	      });
	      return baseSortBy(result, compareMultipleAscending);
	    }

	    /**
	     * Performs a deep comparison between each element in `collection` and the
	     * source object, returning an array of all elements that have equivalent
	     * property values.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. For comparing a single
	     * own or inherited property value see `_.matchesProperty`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Object} source The object of property values to match.
	     * @returns {Array} Returns the new filtered array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': false, 'pets': ['hoppy'] },
	     *   { 'user': 'fred',   'age': 40, 'active': true, 'pets': ['baby puss', 'dino'] }
	     * ];
	     *
	     * _.pluck(_.where(users, { 'age': 36, 'active': false }), 'user');
	     * // => ['barney']
	     *
	     * _.pluck(_.where(users, { 'pets': ['dino'] }), 'user');
	     * // => ['fred']
	     */
	    function where(collection, source) {
	      return filter(collection, baseMatches(source));
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Gets the number of milliseconds that have elapsed since the Unix epoch
	     * (1 January 1970 00:00:00 UTC).
	     *
	     * @static
	     * @memberOf _
	     * @category Date
	     * @example
	     *
	     * _.defer(function(stamp) {
	     *   console.log(_.now() - stamp);
	     * }, _.now());
	     * // => logs the number of milliseconds it took for the deferred function to be invoked
	     */
	    var now = nativeNow || function() {
	      return new Date().getTime();
	    };

	    /*------------------------------------------------------------------------*/

	    /**
	     * The opposite of `_.before`; this method creates a function that invokes
	     * `func` once it is called `n` or more times.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {number} n The number of calls before `func` is invoked.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var saves = ['profile', 'settings'];
	     *
	     * var done = _.after(saves.length, function() {
	     *   console.log('done saving!');
	     * });
	     *
	     * _.forEach(saves, function(type) {
	     *   asyncSave({ 'type': type, 'complete': done });
	     * });
	     * // => logs 'done saving!' after the two async saves have completed
	     */
	    function after(n, func) {
	      if (typeof func != 'function') {
	        if (typeof n == 'function') {
	          var temp = n;
	          n = func;
	          func = temp;
	        } else {
	          throw new TypeError(FUNC_ERROR_TEXT);
	        }
	      }
	      n = nativeIsFinite(n = +n) ? n : 0;
	      return function() {
	        if (--n < 1) {
	          return func.apply(this, arguments);
	        }
	      };
	    }

	    /**
	     * Creates a function that accepts up to `n` arguments ignoring any
	     * additional arguments.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to cap arguments for.
	     * @param {number} [n=func.length] The arity cap.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
	     * // => [6, 8, 10]
	     */
	    function ary(func, n, guard) {
	      if (guard && isIterateeCall(func, n, guard)) {
	        n = null;
	      }
	      n = (func && n == null) ? func.length : nativeMax(+n || 0, 0);
	      return createWrapper(func, ARY_FLAG, null, null, null, null, n);
	    }

	    /**
	     * Creates a function that invokes `func`, with the `this` binding and arguments
	     * of the created function, while it is called less than `n` times. Subsequent
	     * calls to the created function return the result of the last `func` invocation.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {number} n The number of calls at which `func` is no longer invoked.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * jQuery('#add').on('click', _.before(5, addContactToList));
	     * // => allows adding up to 4 contacts to the list
	     */
	    function before(n, func) {
	      var result;
	      if (typeof func != 'function') {
	        if (typeof n == 'function') {
	          var temp = n;
	          n = func;
	          func = temp;
	        } else {
	          throw new TypeError(FUNC_ERROR_TEXT);
	        }
	      }
	      return function() {
	        if (--n > 0) {
	          result = func.apply(this, arguments);
	        } else {
	          func = null;
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that invokes `func` with the `this` binding of `thisArg`
	     * and prepends any additional `_.bind` arguments to those provided to the
	     * bound function.
	     *
	     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
	     * may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** Unlike native `Function#bind` this method does not set the `length`
	     * property of bound functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to bind.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {...*} [args] The arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var greet = function(greeting, punctuation) {
	     *   return greeting + ' ' + this.user + punctuation;
	     * };
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * var bound = _.bind(greet, object, 'hi');
	     * bound('!');
	     * // => 'hi fred!'
	     *
	     * // using placeholders
	     * var bound = _.bind(greet, object, _, '!');
	     * bound('hi');
	     * // => 'hi fred!'
	     */
	    function bind(func, thisArg) {
	      var bitmask = BIND_FLAG;
	      if (arguments.length > 2) {
	        var partials = baseSlice(arguments, 2),
	            holders = replaceHolders(partials, bind.placeholder);

	        bitmask |= PARTIAL_FLAG;
	      }
	      return createWrapper(func, bitmask, thisArg, partials, holders);
	    }

	    /**
	     * Binds methods of an object to the object itself, overwriting the existing
	     * method. Method names may be specified as individual arguments or as arrays
	     * of method names. If no method names are provided all enumerable function
	     * properties, own and inherited, of `object` are bound.
	     *
	     * **Note:** This method does not set the `length` property of bound functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Object} object The object to bind and assign the bound methods to.
	     * @param {...(string|string[])} [methodNames] The object method names to bind,
	     *  specified as individual method names or arrays of method names.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'onClick': function() {
	     *     console.log('clicked ' + this.label);
	     *   }
	     * };
	     *
	     * _.bindAll(view);
	     * jQuery('#docs').on('click', view.onClick);
	     * // => logs 'clicked docs' when the element is clicked
	     */
	    function bindAll(object) {
	      return baseBindAll(object,
	        arguments.length > 1
	          ? baseFlatten(arguments, false, false, 1)
	          : functions(object)
	      );
	    }

	    /**
	     * Creates a function that invokes the method at `object[key]` and prepends
	     * any additional `_.bindKey` arguments to those provided to the bound function.
	     *
	     * This method differs from `_.bind` by allowing bound functions to reference
	     * methods that may be redefined or don't yet exist.
	     * See [Peter Michaux's article](http://michaux.ca/articles/lazy-function-definition-pattern)
	     * for more details.
	     *
	     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Object} object The object the method belongs to.
	     * @param {string} key The key of the method.
	     * @param {...*} [args] The arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var object = {
	     *   'user': 'fred',
	     *   'greet': function(greeting, punctuation) {
	     *     return greeting + ' ' + this.user + punctuation;
	     *   }
	     * };
	     *
	     * var bound = _.bindKey(object, 'greet', 'hi');
	     * bound('!');
	     * // => 'hi fred!'
	     *
	     * object.greet = function(greeting, punctuation) {
	     *   return greeting + 'ya ' + this.user + punctuation;
	     * };
	     *
	     * bound('!');
	     * // => 'hiya fred!'
	     *
	     * // using placeholders
	     * var bound = _.bindKey(object, 'greet', _, '!');
	     * bound('hi');
	     * // => 'hiya fred!'
	     */
	    function bindKey(object, key) {
	      var bitmask = BIND_FLAG | BIND_KEY_FLAG;
	      if (arguments.length > 2) {
	        var partials = baseSlice(arguments, 2),
	            holders = replaceHolders(partials, bindKey.placeholder);

	        bitmask |= PARTIAL_FLAG;
	      }
	      return createWrapper(key, bitmask, object, partials, holders);
	    }

	    /**
	     * Creates a function that accepts one or more arguments of `func` that when
	     * called either invokes `func` returning its result, if all `func` arguments
	     * have been provided, or returns a function that accepts one or more of the
	     * remaining `func` arguments, and so on. The arity of `func` may be specified
	     * if `func.length` is not sufficient.
	     *
	     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
	     * may be used as a placeholder for provided arguments.
	     *
	     * **Note:** This method does not set the `length` property of curried functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var abc = function(a, b, c) {
	     *   return [a, b, c];
	     * };
	     *
	     * var curried = _.curry(abc);
	     *
	     * curried(1)(2)(3);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2)(3);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2, 3);
	     * // => [1, 2, 3]
	     *
	     * // using placeholders
	     * curried(1)(_, 3)(2);
	     * // => [1, 2, 3]
	     */
	    function curry(func, arity, guard) {
	      if (guard && isIterateeCall(func, arity, guard)) {
	        arity = null;
	      }
	      var result = createWrapper(func, CURRY_FLAG, null, null, null, null, null, arity);
	      result.placeholder = curry.placeholder;
	      return result;
	    }

	    /**
	     * This method is like `_.curry` except that arguments are applied to `func`
	     * in the manner of `_.partialRight` instead of `_.partial`.
	     *
	     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for provided arguments.
	     *
	     * **Note:** This method does not set the `length` property of curried functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var abc = function(a, b, c) {
	     *   return [a, b, c];
	     * };
	     *
	     * var curried = _.curryRight(abc);
	     *
	     * curried(3)(2)(1);
	     * // => [1, 2, 3]
	     *
	     * curried(2, 3)(1);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2, 3);
	     * // => [1, 2, 3]
	     *
	     * // using placeholders
	     * curried(3)(1, _)(2);
	     * // => [1, 2, 3]
	     */
	    function curryRight(func, arity, guard) {
	      if (guard && isIterateeCall(func, arity, guard)) {
	        arity = null;
	      }
	      var result = createWrapper(func, CURRY_RIGHT_FLAG, null, null, null, null, null, arity);
	      result.placeholder = curryRight.placeholder;
	      return result;
	    }

	    /**
	     * Creates a function that delays invoking `func` until after `wait` milliseconds
	     * have elapsed since the last time it was invoked. The created function comes
	     * with a `cancel` method to cancel delayed invocations. Provide an options
	     * object to indicate that `func` should be invoked on the leading and/or
	     * trailing edge of the `wait` timeout. Subsequent calls to the debounced
	     * function return the result of the last `func` invocation.
	     *
	     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
	     * on the trailing edge of the timeout only if the the debounced function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
	     * for details over the differences between `_.debounce` and `_.throttle`.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to debounce.
	     * @param {number} wait The number of milliseconds to delay.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=false] Specify invoking on the leading
	     *  edge of the timeout.
	     * @param {number} [options.maxWait] The maximum time `func` is allowed to be
	     *  delayed before it is invoked.
	     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
	     *  edge of the timeout.
	     * @returns {Function} Returns the new debounced function.
	     * @example
	     *
	     * // avoid costly calculations while the window size is in flux
	     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	     *
	     * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
	     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
	     *   'leading': true,
	     *   'trailing': false
	     * }));
	     *
	     * // ensure `batchLog` is invoked once after 1 second of debounced calls
	     * var source = new EventSource('/stream');
	     * jQuery(source).on('message', _.debounce(batchLog, 250, {
	     *   'maxWait': 1000
	     * }));
	     *
	     * // cancel a debounced call
	     * var todoChanges = _.debounce(batchLog, 1000);
	     * Object.observe(models.todo, todoChanges);
	     *
	     * Object.observe(models, function(changes) {
	     *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
	     *     todoChanges.cancel();
	     *   }
	     * }, ['delete']);
	     *
	     * // ...at some point `models.todo` is changed
	     * models.todo.completed = true;
	     *
	     * // ...before 1 second has passed `models.todo` is deleted
	     * // which cancels the debounced `todoChanges` call
	     * delete models.todo;
	     */
	    function debounce(func, wait, options) {
	      var args,
	          maxTimeoutId,
	          result,
	          stamp,
	          thisArg,
	          timeoutId,
	          trailingCall,
	          lastCalled = 0,
	          maxWait = false,
	          trailing = true;

	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      wait = wait < 0 ? 0 : wait;
	      if (options === true) {
	        var leading = true;
	        trailing = false;
	      } else if (isObject(options)) {
	        leading = options.leading;
	        maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
	        trailing = 'trailing' in options ? options.trailing : trailing;
	      }

	      function cancel() {
	        if (timeoutId) {
	          clearTimeout(timeoutId);
	        }
	        if (maxTimeoutId) {
	          clearTimeout(maxTimeoutId);
	        }
	        maxTimeoutId = timeoutId = trailingCall = undefined;
	      }

	      function delayed() {
	        var remaining = wait - (now() - stamp);
	        if (remaining <= 0 || remaining > wait) {
	          if (maxTimeoutId) {
	            clearTimeout(maxTimeoutId);
	          }
	          var isCalled = trailingCall;
	          maxTimeoutId = timeoutId = trailingCall = undefined;
	          if (isCalled) {
	            lastCalled = now();
	            result = func.apply(thisArg, args);
	            if (!timeoutId && !maxTimeoutId) {
	              args = thisArg = null;
	            }
	          }
	        } else {
	          timeoutId = setTimeout(delayed, remaining);
	        }
	      }

	      function maxDelayed() {
	        if (timeoutId) {
	          clearTimeout(timeoutId);
	        }
	        maxTimeoutId = timeoutId = trailingCall = undefined;
	        if (trailing || (maxWait !== wait)) {
	          lastCalled = now();
	          result = func.apply(thisArg, args);
	          if (!timeoutId && !maxTimeoutId) {
	            args = thisArg = null;
	          }
	        }
	      }

	      function debounced() {
	        args = arguments;
	        stamp = now();
	        thisArg = this;
	        trailingCall = trailing && (timeoutId || !leading);

	        if (maxWait === false) {
	          var leadingCall = leading && !timeoutId;
	        } else {
	          if (!maxTimeoutId && !leading) {
	            lastCalled = stamp;
	          }
	          var remaining = maxWait - (stamp - lastCalled),
	              isCalled = remaining <= 0 || remaining > maxWait;

	          if (isCalled) {
	            if (maxTimeoutId) {
	              maxTimeoutId = clearTimeout(maxTimeoutId);
	            }
	            lastCalled = stamp;
	            result = func.apply(thisArg, args);
	          }
	          else if (!maxTimeoutId) {
	            maxTimeoutId = setTimeout(maxDelayed, remaining);
	          }
	        }
	        if (isCalled && timeoutId) {
	          timeoutId = clearTimeout(timeoutId);
	        }
	        else if (!timeoutId && wait !== maxWait) {
	          timeoutId = setTimeout(delayed, wait);
	        }
	        if (leadingCall) {
	          isCalled = true;
	          result = func.apply(thisArg, args);
	        }
	        if (isCalled && !timeoutId && !maxTimeoutId) {
	          args = thisArg = null;
	        }
	        return result;
	      }
	      debounced.cancel = cancel;
	      return debounced;
	    }

	    /**
	     * Defers invoking the `func` until the current call stack has cleared. Any
	     * additional arguments are provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to defer.
	     * @param {...*} [args] The arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.defer(function(text) {
	     *   console.log(text);
	     * }, 'deferred');
	     * // logs 'deferred' after one or more milliseconds
	     */
	    function defer(func) {
	      return baseDelay(func, 1, arguments, 1);
	    }

	    /**
	     * Invokes `func` after `wait` milliseconds. Any additional arguments are
	     * provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @param {...*} [args] The arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.delay(function(text) {
	     *   console.log(text);
	     * }, 1000, 'later');
	     * // => logs 'later' after one second
	     */
	    function delay(func, wait) {
	      return baseDelay(func, wait, arguments, 2);
	    }

	    /**
	     * Creates a function that returns the result of invoking the provided
	     * functions with the `this` binding of the created function, where each
	     * successive invocation is supplied the return value of the previous.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {...Function} [funcs] Functions to invoke.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function add(x, y) {
	     *   return x + y;
	     * }
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var addSquare = _.flow(add, square);
	     * addSquare(1, 2);
	     * // => 9
	     */
	    function flow() {
	      var funcs = arguments,
	          length = funcs.length;

	      if (!length) {
	        return function() { return arguments[0]; };
	      }
	      if (!arrayEvery(funcs, baseIsFunction)) {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function() {
	        var index = 0,
	            result = funcs[index].apply(this, arguments);

	        while (++index < length) {
	          result = funcs[index].call(this, result);
	        }
	        return result;
	      };
	    }

	    /**
	     * This method is like `_.flow` except that it creates a function that
	     * invokes the provided functions from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias backflow, compose
	     * @category Function
	     * @param {...Function} [funcs] Functions to invoke.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function add(x, y) {
	     *   return x + y;
	     * }
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var addSquare = _.flowRight(square, add);
	     * addSquare(1, 2);
	     * // => 9
	     */
	    function flowRight() {
	      var funcs = arguments,
	          fromIndex = funcs.length - 1;

	      if (fromIndex < 0) {
	        return function() { return arguments[0]; };
	      }
	      if (!arrayEvery(funcs, baseIsFunction)) {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function() {
	        var index = fromIndex,
	            result = funcs[index].apply(this, arguments);

	        while (index--) {
	          result = funcs[index].call(this, result);
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that memoizes the result of `func`. If `resolver` is
	     * provided it determines the cache key for storing the result based on the
	     * arguments provided to the memoized function. By default, the first argument
	     * provided to the memoized function is coerced to a string and used as the
	     * cache key. The `func` is invoked with the `this` binding of the memoized
	     * function.
	     *
	     * **Note:** The cache is exposed as the `cache` property on the memoized
	     * function. Its creation may be customized by replacing the `_.memoize.Cache`
	     * constructor with one whose instances implement the ES `Map` method interface
	     * of `get`, `has`, and `set`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-properties-of-the-map-prototype-object)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to have its output memoized.
	     * @param {Function} [resolver] The function to resolve the cache key.
	     * @returns {Function} Returns the new memoizing function.
	     * @example
	     *
	     * var upperCase = _.memoize(function(string) {
	     *   return string.toUpperCase();
	     * });
	     *
	     * upperCase('fred');
	     * // => 'FRED'
	     *
	     * // modifying the result cache
	     * upperCase.cache.set('fred', 'BARNEY');
	     * upperCase('fred');
	     * // => 'BARNEY'
	     *
	     * // replacing `_.memoize.Cache`
	     * var object = { 'user': 'fred' };
	     * var other = { 'user': 'barney' };
	     * var identity = _.memoize(_.identity);
	     *
	     * identity(object);
	     * // => { 'user': 'fred' }
	     * identity(other);
	     * // => { 'user': 'fred' }
	     *
	     * _.memoize.Cache = WeakMap;
	     * var identity = _.memoize(_.identity);
	     *
	     * identity(object);
	     * // => { 'user': 'fred' }
	     * identity(other);
	     * // => { 'user': 'barney' }
	     */
	    function memoize(func, resolver) {
	      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var memoized = function() {
	        var cache = memoized.cache,
	            key = resolver ? resolver.apply(this, arguments) : arguments[0];

	        if (cache.has(key)) {
	          return cache.get(key);
	        }
	        var result = func.apply(this, arguments);
	        cache.set(key, result);
	        return result;
	      };
	      memoized.cache = new memoize.Cache;
	      return memoized;
	    }

	    /**
	     * Creates a function that negates the result of the predicate `func`. The
	     * `func` predicate is invoked with the `this` binding and arguments of the
	     * created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} predicate The predicate to negate.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function isEven(n) {
	     *   return n % 2 == 0;
	     * }
	     *
	     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
	     * // => [1, 3, 5]
	     */
	    function negate(predicate) {
	      if (typeof predicate != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function() {
	        return !predicate.apply(this, arguments);
	      };
	    }

	    /**
	     * Creates a function that is restricted to invoking `func` once. Repeat calls
	     * to the function return the value of the first call. The `func` is invoked
	     * with the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var initialize = _.once(createApplication);
	     * initialize();
	     * initialize();
	     * // `initialize` invokes `createApplication` once
	     */
	    function once(func) {
	      return before(func, 2);
	    }

	    /**
	     * Creates a function that invokes `func` with `partial` arguments prepended
	     * to those provided to the new function. This method is like `_.bind` except
	     * it does **not** alter the `this` binding.
	     *
	     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** This method does not set the `length` property of partially
	     * applied functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [args] The arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var greet = function(greeting, name) {
	     *   return greeting + ' ' + name;
	     * };
	     *
	     * var sayHelloTo = _.partial(greet, 'hello');
	     * sayHelloTo('fred');
	     * // => 'hello fred'
	     *
	     * // using placeholders
	     * var greetFred = _.partial(greet, _, 'fred');
	     * greetFred('hi');
	     * // => 'hi fred'
	     */
	    function partial(func) {
	      var partials = baseSlice(arguments, 1),
	          holders = replaceHolders(partials, partial.placeholder);

	      return createWrapper(func, PARTIAL_FLAG, null, partials, holders);
	    }

	    /**
	     * This method is like `_.partial` except that partially applied arguments
	     * are appended to those provided to the new function.
	     *
	     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** This method does not set the `length` property of partially
	     * applied functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [args] The arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var greet = function(greeting, name) {
	     *   return greeting + ' ' + name;
	     * };
	     *
	     * var greetFred = _.partialRight(greet, 'fred');
	     * greetFred('hi');
	     * // => 'hi fred'
	     *
	     * // using placeholders
	     * var sayHelloTo = _.partialRight(greet, 'hello', _);
	     * sayHelloTo('fred');
	     * // => 'hello fred'
	     */
	    function partialRight(func) {
	      var partials = baseSlice(arguments, 1),
	          holders = replaceHolders(partials, partialRight.placeholder);

	      return createWrapper(func, PARTIAL_RIGHT_FLAG, null, partials, holders);
	    }

	    /**
	     * Creates a function that invokes `func` with arguments arranged according
	     * to the specified indexes where the argument value at the first index is
	     * provided as the first argument, the argument value at the second index is
	     * provided as the second argument, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to rearrange arguments for.
	     * @param {...(number|number[])} indexes The arranged argument indexes,
	     *  specified as individual indexes or arrays of indexes.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var rearged = _.rearg(function(a, b, c) {
	     *   return [a, b, c];
	     * }, 2, 0, 1);
	     *
	     * rearged('b', 'c', 'a')
	     * // => ['a', 'b', 'c']
	     *
	     * var map = _.rearg(_.map, [1, 0]);
	     * map(function(n) {
	     *   return n * 3;
	     * }, [1, 2, 3]);
	     * // => [3, 6, 9]
	     */
	    function rearg(func) {
	      var indexes = baseFlatten(arguments, false, false, 1);
	      return createWrapper(func, REARG_FLAG, null, null, null, indexes);
	    }

	    /**
	     * Creates a function that invokes `func` with the `this` binding of the
	     * created function and the array of arguments provided to the created
	     * function much like [Function#apply](http://es5.github.io/#x15.3.4.3).
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to spread arguments over.
	     * @returns {*} Returns the new function.
	     * @example
	     *
	     * var spread = _.spread(function(who, what) {
	     *   return who + ' says ' + what;
	     * });
	     *
	     * spread(['Fred', 'hello']);
	     * // => 'Fred says hello'
	     *
	     * // with a Promise
	     * var numbers = Promise.all([
	     *   Promise.resolve(40),
	     *   Promise.resolve(36)
	     * ]);
	     *
	     * numbers.then(_.spread(function(x, y) {
	     *   return x + y;
	     * }));
	     * // => a Promise of 76
	     */
	    function spread(func) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function(array) {
	        return func.apply(this, array);
	      };
	    }

	    /**
	     * Creates a function that only invokes `func` at most once per every `wait`
	     * milliseconds. The created function comes with a `cancel` method to cancel
	     * delayed invocations. Provide an options object to indicate that `func`
	     * should be invoked on the leading and/or trailing edge of the `wait` timeout.
	     * Subsequent calls to the throttled function return the result of the last
	     * `func` call.
	     *
	     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
	     * on the trailing edge of the timeout only if the the throttled function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
	     * for details over the differences between `_.throttle` and `_.debounce`.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to throttle.
	     * @param {number} wait The number of milliseconds to throttle invocations to.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=true] Specify invoking on the leading
	     *  edge of the timeout.
	     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
	     *  edge of the timeout.
	     * @returns {Function} Returns the new throttled function.
	     * @example
	     *
	     * // avoid excessively updating the position while scrolling
	     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	     *
	     * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
	     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
	     *   'trailing': false
	     * }));
	     *
	     * // cancel a trailing throttled call
	     * jQuery(window).on('popstate', throttled.cancel);
	     */
	    function throttle(func, wait, options) {
	      var leading = true,
	          trailing = true;

	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      if (options === false) {
	        leading = false;
	      } else if (isObject(options)) {
	        leading = 'leading' in options ? !!options.leading : leading;
	        trailing = 'trailing' in options ? !!options.trailing : trailing;
	      }
	      debounceOptions.leading = leading;
	      debounceOptions.maxWait = +wait;
	      debounceOptions.trailing = trailing;
	      return debounce(func, wait, debounceOptions);
	    }

	    /**
	     * Creates a function that provides `value` to the wrapper function as its
	     * first argument. Any additional arguments provided to the function are
	     * appended to those provided to the wrapper function. The wrapper is invoked
	     * with the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {*} value The value to wrap.
	     * @param {Function} wrapper The wrapper function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var p = _.wrap(_.escape, function(func, text) {
	     *   return '<p>' + func(text) + '</p>';
	     * });
	     *
	     * p('fred, barney, & pebbles');
	     * // => '<p>fred, barney, &amp; pebbles</p>'
	     */
	    function wrap(value, wrapper) {
	      wrapper = wrapper == null ? identity : wrapper;
	      return createWrapper(wrapper, PARTIAL_FLAG, null, [value], []);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
	     * otherwise they are assigned by reference. If `customizer` is provided it is
	     * invoked to produce the cloned values. If `customizer` returns `undefined`
	     * cloning is handled by the method instead. The `customizer` is bound to
	     * `thisArg` and invoked with two argument; (value [, index|key, object]).
	     *
	     * **Note:** This method is loosely based on the structured clone algorithm.
	     * The enumerable properties of `arguments` objects and objects created by
	     * constructors other than `Object` are cloned to plain `Object` objects. An
	     * empty object is returned for uncloneable values such as functions, DOM nodes,
	     * Maps, Sets, and WeakMaps. See the [HTML5 specification](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @param {Function} [customizer] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {*} Returns the cloned value.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * var shallow = _.clone(users);
	     * shallow[0] === users[0];
	     * // => true
	     *
	     * var deep = _.clone(users, true);
	     * deep[0] === users[0];
	     * // => false
	     *
	     * // using a customizer callback
	     * var el = _.clone(document.body, function(value) {
	     *   if (_.isElement(value)) {
	     *     return value.cloneNode(false);
	     *   }
	     * });
	     *
	     * el === document.body
	     * // => false
	     * el.nodeName
	     * // => BODY
	     * el.childNodes.length;
	     * // => 0
	     */
	    function clone(value, isDeep, customizer, thisArg) {
	      if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
	        isDeep = false;
	      }
	      else if (typeof isDeep == 'function') {
	        thisArg = customizer;
	        customizer = isDeep;
	        isDeep = false;
	      }
	      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
	      return baseClone(value, isDeep, customizer);
	    }

	    /**
	     * Creates a deep clone of `value`. If `customizer` is provided it is invoked
	     * to produce the cloned values. If `customizer` returns `undefined` cloning
	     * is handled by the method instead. The `customizer` is bound to `thisArg`
	     * and invoked with two argument; (value [, index|key, object]).
	     *
	     * **Note:** This method is loosely based on the structured clone algorithm.
	     * The enumerable properties of `arguments` objects and objects created by
	     * constructors other than `Object` are cloned to plain `Object` objects. An
	     * empty object is returned for uncloneable values such as functions, DOM nodes,
	     * Maps, Sets, and WeakMaps. See the [HTML5 specification](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to deep clone.
	     * @param {Function} [customizer] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {*} Returns the deep cloned value.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * var deep = _.cloneDeep(users);
	     * deep[0] === users[0];
	     * // => false
	     *
	     * // using a customizer callback
	     * var el = _.cloneDeep(document.body, function(value) {
	     *   if (_.isElement(value)) {
	     *     return value.cloneNode(true);
	     *   }
	     * });
	     *
	     * el === document.body
	     * // => false
	     * el.nodeName
	     * // => BODY
	     * el.childNodes.length;
	     * // => 20
	     */
	    function cloneDeep(value, customizer, thisArg) {
	      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
	      return baseClone(value, true, customizer);
	    }

	    /**
	     * Checks if `value` is classified as an `arguments` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isArguments(function() { return arguments; }());
	     * // => true
	     *
	     * _.isArguments([1, 2, 3]);
	     * // => false
	     */
	    function isArguments(value) {
	      var length = isObjectLike(value) ? value.length : undefined;
	      return (isLength(length) && objToString.call(value) == argsTag) || false;
	    }

	    /**
	     * Checks if `value` is classified as an `Array` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isArray([1, 2, 3]);
	     * // => true
	     *
	     * _.isArray(function() { return arguments; }());
	     * // => false
	     */
	    var isArray = nativeIsArray || function(value) {
	      return (isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag) || false;
	    };

	    /**
	     * Checks if `value` is classified as a boolean primitive or object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isBoolean(false);
	     * // => true
	     *
	     * _.isBoolean(null);
	     * // => false
	     */
	    function isBoolean(value) {
	      return (value === true || value === false || isObjectLike(value) && objToString.call(value) == boolTag) || false;
	    }

	    /**
	     * Checks if `value` is classified as a `Date` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isDate(new Date);
	     * // => true
	     *
	     * _.isDate('Mon April 23 2012');
	     * // => false
	     */
	    function isDate(value) {
	      return (isObjectLike(value) && objToString.call(value) == dateTag) || false;
	    }

	    /**
	     * Checks if `value` is a DOM element.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
	     * @example
	     *
	     * _.isElement(document.body);
	     * // => true
	     *
	     * _.isElement('<body>');
	     * // => false
	     */
	    function isElement(value) {
	      return (value && value.nodeType === 1 && isObjectLike(value) &&
	        objToString.call(value).indexOf('Element') > -1) || false;
	    }
	    // Fallback for environments without DOM support.
	    if (!support.dom) {
	      isElement = function(value) {
	        return (value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value)) || false;
	      };
	    }

	    /**
	     * Checks if a value is empty. A value is considered empty unless it is an
	     * `arguments` object, array, string, or jQuery-like collection with a length
	     * greater than `0` or an object with own enumerable properties.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {Array|Object|string} value The value to inspect.
	     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	     * @example
	     *
	     * _.isEmpty(null);
	     * // => true
	     *
	     * _.isEmpty(true);
	     * // => true
	     *
	     * _.isEmpty(1);
	     * // => true
	     *
	     * _.isEmpty([1, 2, 3]);
	     * // => false
	     *
	     * _.isEmpty({ 'a': 1 });
	     * // => false
	     */
	    function isEmpty(value) {
	      if (value == null) {
	        return true;
	      }
	      var length = value.length;
	      if (isLength(length) && (isArray(value) || isString(value) || isArguments(value) ||
	          (isObjectLike(value) && isFunction(value.splice)))) {
	        return !length;
	      }
	      return !keys(value).length;
	    }

	    /**
	     * Performs a deep comparison between two values to determine if they are
	     * equivalent. If `customizer` is provided it is invoked to compare values.
	     * If `customizer` returns `undefined` comparisons are handled by the method
	     * instead. The `customizer` is bound to `thisArg` and invoked with three
	     * arguments; (value, other [, index|key]).
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. Functions and DOM nodes
	     * are **not** supported. Provide a customizer function to extend support
	     * for comparing other values.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @param {Function} [customizer] The function to customize comparing values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     * var other = { 'user': 'fred' };
	     *
	     * object == other;
	     * // => false
	     *
	     * _.isEqual(object, other);
	     * // => true
	     *
	     * // using a customizer callback
	     * var array = ['hello', 'goodbye'];
	     * var other = ['hi', 'goodbye'];
	     *
	     * _.isEqual(array, other, function(value, other) {
	     *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
	     *     return true;
	     *   }
	     * });
	     * // => true
	     */
	    function isEqual(value, other, customizer, thisArg) {
	      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 3);
	      if (!customizer && isStrictComparable(value) && isStrictComparable(other)) {
	        return value === other;
	      }
	      var result = customizer ? customizer(value, other) : undefined;
	      return typeof result == 'undefined' ? baseIsEqual(value, other, customizer) : !!result;
	    }

	    /**
	     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
	     * `SyntaxError`, `TypeError`, or `URIError` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
	     * @example
	     *
	     * _.isError(new Error);
	     * // => true
	     *
	     * _.isError(Error);
	     * // => false
	     */
	    function isError(value) {
	      return (isObjectLike(value) && typeof value.message == 'string' && objToString.call(value) == errorTag) || false;
	    }

	    /**
	     * Checks if `value` is a finite primitive number.
	     *
	     * **Note:** This method is based on ES `Number.isFinite`. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
	     * @example
	     *
	     * _.isFinite(10);
	     * // => true
	     *
	     * _.isFinite('10');
	     * // => false
	     *
	     * _.isFinite(true);
	     * // => false
	     *
	     * _.isFinite(Object(10));
	     * // => false
	     *
	     * _.isFinite(Infinity);
	     * // => false
	     */
	    var isFinite = nativeNumIsFinite || function(value) {
	      return typeof value == 'number' && nativeIsFinite(value);
	    };

	    /**
	     * Checks if `value` is classified as a `Function` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isFunction(_);
	     * // => true
	     *
	     * _.isFunction(/abc/);
	     * // => false
	     */
	    var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {
	      // The use of `Object#toString` avoids issues with the `typeof` operator
	      // in older versions of Chrome and Safari which return 'function' for regexes
	      // and Safari 8 equivalents which return 'object' for typed array constructors.
	      return objToString.call(value) == funcTag;
	    };

	    /**
	     * Checks if `value` is the language type of `Object`.
	     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	     *
	     * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	     * @example
	     *
	     * _.isObject({});
	     * // => true
	     *
	     * _.isObject([1, 2, 3]);
	     * // => true
	     *
	     * _.isObject(1);
	     * // => false
	     */
	    function isObject(value) {
	      // Avoid a V8 JIT bug in Chrome 19-20.
	      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	      var type = typeof value;
	      return type == 'function' || (value && type == 'object') || false;
	    }

	    /**
	     * Performs a deep comparison between `object` and `source` to determine if
	     * `object` contains equivalent property values. If `customizer` is provided
	     * it is invoked to compare values. If `customizer` returns `undefined`
	     * comparisons are handled by the method instead. The `customizer` is bound
	     * to `thisArg` and invoked with three arguments; (value, other, index|key).
	     *
	     * **Note:** This method supports comparing properties of arrays, booleans,
	     * `Date` objects, numbers, `Object` objects, regexes, and strings. Functions
	     * and DOM nodes are **not** supported. Provide a customizer function to extend
	     * support for comparing other values.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property values to match.
	     * @param {Function} [customizer] The function to customize comparing values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': 40 };
	     *
	     * _.isMatch(object, { 'age': 40 });
	     * // => true
	     *
	     * _.isMatch(object, { 'age': 36 });
	     * // => false
	     *
	     * // using a customizer callback
	     * var object = { 'greeting': 'hello' };
	     * var source = { 'greeting': 'hi' };
	     *
	     * _.isMatch(object, source, function(value, other) {
	     *   return _.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/) || undefined;
	     * });
	     * // => true
	     */
	    function isMatch(object, source, customizer, thisArg) {
	      var props = keys(source),
	          length = props.length;

	      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 3);
	      if (!customizer && length == 1) {
	        var key = props[0],
	            value = source[key];

	        if (isStrictComparable(value)) {
	          return object != null && value === object[key] && hasOwnProperty.call(object, key);
	        }
	      }
	      var values = Array(length),
	          strictCompareFlags = Array(length);

	      while (length--) {
	        value = values[length] = source[props[length]];
	        strictCompareFlags[length] = isStrictComparable(value);
	      }
	      return baseIsMatch(object, props, values, strictCompareFlags, customizer);
	    }

	    /**
	     * Checks if `value` is `NaN`.
	     *
	     * **Note:** This method is not the same as native `isNaN` which returns `true`
	     * for `undefined` and other non-numeric values. See the [ES5 spec](https://es5.github.io/#x15.1.2.4)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	     * @example
	     *
	     * _.isNaN(NaN);
	     * // => true
	     *
	     * _.isNaN(new Number(NaN));
	     * // => true
	     *
	     * isNaN(undefined);
	     * // => true
	     *
	     * _.isNaN(undefined);
	     * // => false
	     */
	    function isNaN(value) {
	      // An `NaN` primitive is the only value that is not equal to itself.
	      // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
	      return isNumber(value) && value != +value;
	    }

	    /**
	     * Checks if `value` is a native function.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	     * @example
	     *
	     * _.isNative(Array.prototype.push);
	     * // => true
	     *
	     * _.isNative(_);
	     * // => false
	     */
	    function isNative(value) {
	      if (value == null) {
	        return false;
	      }
	      if (objToString.call(value) == funcTag) {
	        return reNative.test(fnToString.call(value));
	      }
	      return (isObjectLike(value) && reHostCtor.test(value)) || false;
	    }

	    /**
	     * Checks if `value` is `null`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
	     * @example
	     *
	     * _.isNull(null);
	     * // => true
	     *
	     * _.isNull(void 0);
	     * // => false
	     */
	    function isNull(value) {
	      return value === null;
	    }

	    /**
	     * Checks if `value` is classified as a `Number` primitive or object.
	     *
	     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
	     * as numbers, use the `_.isFinite` method.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isNumber(8.4);
	     * // => true
	     *
	     * _.isNumber(NaN);
	     * // => true
	     *
	     * _.isNumber('8.4');
	     * // => false
	     */
	    function isNumber(value) {
	      return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag) || false;
	    }

	    /**
	     * Checks if `value` is a plain object, that is, an object created by the
	     * `Object` constructor or one with a `[[Prototype]]` of `null`.
	     *
	     * **Note:** This method assumes objects created by the `Object` constructor
	     * have no inherited enumerable properties.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     * }
	     *
	     * _.isPlainObject(new Foo);
	     * // => false
	     *
	     * _.isPlainObject([1, 2, 3]);
	     * // => false
	     *
	     * _.isPlainObject({ 'x': 0, 'y': 0 });
	     * // => true
	     *
	     * _.isPlainObject(Object.create(null));
	     * // => true
	     */
	    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
	      if (!(value && objToString.call(value) == objectTag)) {
	        return false;
	      }
	      var valueOf = value.valueOf,
	          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

	      return objProto
	        ? (value == objProto || getPrototypeOf(value) == objProto)
	        : shimIsPlainObject(value);
	    };

	    /**
	     * Checks if `value` is classified as a `RegExp` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isRegExp(/abc/);
	     * // => true
	     *
	     * _.isRegExp('/abc/');
	     * // => false
	     */
	    function isRegExp(value) {
	      return (isObjectLike(value) && objToString.call(value) == regexpTag) || false;
	    }

	    /**
	     * Checks if `value` is classified as a `String` primitive or object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isString('abc');
	     * // => true
	     *
	     * _.isString(1);
	     * // => false
	     */
	    function isString(value) {
	      return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag) || false;
	    }

	    /**
	     * Checks if `value` is classified as a typed array.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isTypedArray(new Uint8Array);
	     * // => true
	     *
	     * _.isTypedArray([]);
	     * // => false
	     */
	    function isTypedArray(value) {
	      return (isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)]) || false;
	    }

	    /**
	     * Checks if `value` is `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	     * @example
	     *
	     * _.isUndefined(void 0);
	     * // => true
	     *
	     * _.isUndefined(null);
	     * // => false
	     */
	    function isUndefined(value) {
	      return typeof value == 'undefined';
	    }

	    /**
	     * Converts `value` to an array.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {Array} Returns the converted array.
	     * @example
	     *
	     * (function() {
	     *   return _.toArray(arguments).slice(1);
	     * }(1, 2, 3));
	     * // => [2, 3]
	     */
	    function toArray(value) {
	      var length = value ? value.length : 0;
	      if (!isLength(length)) {
	        return values(value);
	      }
	      if (!length) {
	        return [];
	      }
	      return arrayCopy(value);
	    }

	    /**
	     * Converts `value` to a plain object flattening inherited enumerable
	     * properties of `value` to own properties of the plain object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {Object} Returns the converted plain object.
	     * @example
	     *
	     * function Foo() {
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.assign({ 'a': 1 }, new Foo);
	     * // => { 'a': 1, 'b': 2 }
	     *
	     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	     * // => { 'a': 1, 'b': 2, 'c': 3 }
	     */
	    function toPlainObject(value) {
	      return baseCopy(value, keysIn(value));
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object. Subsequent sources overwrite property assignments of previous sources.
	     * If `customizer` is provided it is invoked to produce the assigned values.
	     * The `customizer` is bound to `thisArg` and invoked with five arguments;
	     * (objectValue, sourceValue, key, object, source).
	     *
	     * @static
	     * @memberOf _
	     * @alias extend
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @param {Function} [customizer] The function to customize assigning values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	     * // => { 'user': 'fred', 'age': 40 }
	     *
	     * // using a customizer callback
	     * var defaults = _.partialRight(_.assign, function(value, other) {
	     *   return typeof value == 'undefined' ? other : value;
	     * });
	     *
	     * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	     * // => { 'user': 'barney', 'age': 36 }
	     */
	    var assign = createAssigner(baseAssign);

	    /**
	     * Creates an object that inherits from the given `prototype` object. If a
	     * `properties` object is provided its own enumerable properties are assigned
	     * to the created object.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} prototype The object to inherit from.
	     * @param {Object} [properties] The properties to assign to the object.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * function Circle() {
	     *   Shape.call(this);
	     * }
	     *
	     * Circle.prototype = _.create(Shape.prototype, {
	     *   'constructor': Circle
	     * });
	     *
	     * var circle = new Circle;
	     * circle instanceof Circle;
	     * // => true
	     *
	     * circle instanceof Shape;
	     * // => true
	     */
	    function create(prototype, properties, guard) {
	      var result = baseCreate(prototype);
	      if (guard && isIterateeCall(prototype, properties, guard)) {
	        properties = null;
	      }
	      return properties ? baseCopy(properties, result, keys(properties)) : result;
	    }

	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object for all destination properties that resolve to `undefined`. Once a
	     * property is set, additional defaults of the same property are ignored.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	     * // => { 'user': 'barney', 'age': 36 }
	     */
	    function defaults(object) {
	      if (object == null) {
	        return object;
	      }
	      var args = arrayCopy(arguments);
	      args.push(assignDefaults);
	      return assign.apply(undefined, args);
	    }

	    /**
	     * This method is like `_.findIndex` except that it returns the key of the
	     * first element `predicate` returns truthy for, instead of the element itself.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
	     * @example
	     *
	     * var users = {
	     *   'barney':  { 'age': 36, 'active': true },
	     *   'fred':    { 'age': 40, 'active': false },
	     *   'pebbles': { 'age': 1,  'active': true }
	     * };
	     *
	     * _.findKey(users, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => 'barney' (iteration order is not guaranteed)
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findKey(users, { 'age': 1, 'active': true });
	     * // => 'pebbles'
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findKey(users, 'active', false);
	     * // => 'fred'
	     *
	     * // using the `_.property` callback shorthand
	     * _.findKey(users, 'active');
	     * // => 'barney'
	     */
	    function findKey(object, predicate, thisArg) {
	      predicate = getCallback(predicate, thisArg, 3);
	      return baseFind(object, predicate, baseForOwn, true);
	    }

	    /**
	     * This method is like `_.findKey` except that it iterates over elements of
	     * a collection in the opposite order.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
	     * @example
	     *
	     * var users = {
	     *   'barney':  { 'age': 36, 'active': true },
	     *   'fred':    { 'age': 40, 'active': false },
	     *   'pebbles': { 'age': 1,  'active': true }
	     * };
	     *
	     * _.findLastKey(users, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => returns `pebbles` assuming `_.findKey` returns `barney`
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findLastKey(users, { 'age': 36, 'active': true });
	     * // => 'barney'
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findLastKey(users, 'active', false);
	     * // => 'fred'
	     *
	     * // using the `_.property` callback shorthand
	     * _.findLastKey(users, 'active');
	     * // => 'pebbles'
	     */
	    function findLastKey(object, predicate, thisArg) {
	      predicate = getCallback(predicate, thisArg, 3);
	      return baseFind(object, predicate, baseForOwnRight, true);
	    }

	    /**
	     * Iterates over own and inherited enumerable properties of an object invoking
	     * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked
	     * with three arguments; (value, key, object). Iterator functions may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forIn(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)
	     */
	    function forIn(object, iteratee, thisArg) {
	      if (typeof iteratee != 'function' || typeof thisArg != 'undefined') {
	        iteratee = bindCallback(iteratee, thisArg, 3);
	      }
	      return baseFor(object, iteratee, keysIn);
	    }

	    /**
	     * This method is like `_.forIn` except that it iterates over properties of
	     * `object` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forInRight(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'c', 'b', and 'a' assuming `_.forIn ` logs 'a', 'b', and 'c'
	     */
	    function forInRight(object, iteratee, thisArg) {
	      iteratee = bindCallback(iteratee, thisArg, 3);
	      return baseForRight(object, iteratee, keysIn);
	    }

	    /**
	     * Iterates over own enumerable properties of an object invoking `iteratee`
	     * for each property. The `iteratee` is bound to `thisArg` and invoked with
	     * three arguments; (value, key, object). Iterator functions may exit iteration
	     * early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forOwn(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'a' and 'b' (iteration order is not guaranteed)
	     */
	    function forOwn(object, iteratee, thisArg) {
	      if (typeof iteratee != 'function' || typeof thisArg != 'undefined') {
	        iteratee = bindCallback(iteratee, thisArg, 3);
	      }
	      return baseForOwn(object, iteratee);
	    }

	    /**
	     * This method is like `_.forOwn` except that it iterates over properties of
	     * `object` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forOwnRight(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'b' and 'a' assuming `_.forOwn` logs 'a' and 'b'
	     */
	    function forOwnRight(object, iteratee, thisArg) {
	      iteratee = bindCallback(iteratee, thisArg, 3);
	      return baseForRight(object, iteratee, keys);
	    }

	    /**
	     * Creates an array of function property names from all enumerable properties,
	     * own and inherited, of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @alias methods
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the new array of property names.
	     * @example
	     *
	     * _.functions(_);
	     * // => ['after', 'ary', 'assign', ...]
	     */
	    function functions(object) {
	      return baseFunctions(object, keysIn(object));
	    }

	    /**
	     * Checks if `key` exists as a direct property of `object` instead of an
	     * inherited property.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @param {string} key The key to check.
	     * @returns {boolean} Returns `true` if `key` is a direct property, else `false`.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2, 'c': 3 };
	     *
	     * _.has(object, 'b');
	     * // => true
	     */
	    function has(object, key) {
	      return object ? hasOwnProperty.call(object, key) : false;
	    }

	    /**
	     * Creates an object composed of the inverted keys and values of `object`.
	     * If `object` contains duplicate values, subsequent values overwrite property
	     * assignments of previous values unless `multiValue` is `true`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to invert.
	     * @param {boolean} [multiValue] Allow multiple values per key.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Object} Returns the new inverted object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2, 'c': 1 };
	     *
	     * _.invert(object);
	     * // => { '1': 'c', '2': 'b' }
	     *
	     * // with `multiValue`
	     * _.invert(object, true);
	     * // => { '1': ['a', 'c'], '2': ['b'] }
	     */
	    function invert(object, multiValue, guard) {
	      if (guard && isIterateeCall(object, multiValue, guard)) {
	        multiValue = null;
	      }
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = {};

	      while (++index < length) {
	        var key = props[index],
	            value = object[key];

	        if (multiValue) {
	          if (hasOwnProperty.call(result, value)) {
	            result[value].push(key);
	          } else {
	            result[value] = [key];
	          }
	        }
	        else {
	          result[value] = key;
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates an array of the own enumerable property names of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects. See the
	     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the array of property names.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.keys(new Foo);
	     * // => ['a', 'b'] (iteration order is not guaranteed)
	     *
	     * _.keys('hi');
	     * // => ['0', '1']
	     */
	    var keys = !nativeKeys ? shimKeys : function(object) {
	      if (object) {
	        var Ctor = object.constructor,
	            length = object.length;
	      }
	      if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	         (typeof object != 'function' && (length && isLength(length)))) {
	        return shimKeys(object);
	      }
	      return isObject(object) ? nativeKeys(object) : [];
	    };

	    /**
	     * Creates an array of the own and inherited enumerable property names of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the array of property names.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.keysIn(new Foo);
	     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	     */
	    function keysIn(object) {
	      if (object == null) {
	        return [];
	      }
	      if (!isObject(object)) {
	        object = Object(object);
	      }
	      var length = object.length;
	      length = (length && isLength(length) &&
	        (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

	      var Ctor = object.constructor,
	          index = -1,
	          isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	          result = Array(length),
	          skipIndexes = length > 0;

	      while (++index < length) {
	        result[index] = (index + '');
	      }
	      for (var key in object) {
	        if (!(skipIndexes && isIndex(key, length)) &&
	            !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	          result.push(key);
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates an object with the same keys as `object` and values generated by
	     * running each own enumerable property of `object` through `iteratee`. The
	     * iteratee function is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the new mapped object.
	     * @example
	     *
	     * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
	     *   return n * 3;
	     * });
	     * // => { 'a': 3, 'b': 6 }
	     *
	     * var users = {
	     *   'fred':    { 'user': 'fred',    'age': 40 },
	     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	     * };
	     *
	     * // using the `_.property` callback shorthand
	     * _.mapValues(users, 'age');
	     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	     */
	    function mapValues(object, iteratee, thisArg) {
	      var result = {};
	      iteratee = getCallback(iteratee, thisArg, 3);

	      baseForOwn(object, function(value, key, object) {
	        result[key] = iteratee(value, key, object);
	      });
	      return result;
	    }

	    /**
	     * Recursively merges own enumerable properties of the source object(s), that
	     * don't resolve to `undefined` into the destination object. Subsequent sources
	     * overwrite property assignments of previous sources. If `customizer` is
	     * provided it is invoked to produce the merged values of the destination and
	     * source properties. If `customizer` returns `undefined` merging is handled
	     * by the method instead. The `customizer` is bound to `thisArg` and invoked
	     * with five arguments; (objectValue, sourceValue, key, object, source).
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @param {Function} [customizer] The function to customize merging properties.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var users = {
	     *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
	     * };
	     *
	     * var ages = {
	     *   'data': [{ 'age': 36 }, { 'age': 40 }]
	     * };
	     *
	     * _.merge(users, ages);
	     * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
	     *
	     * // using a customizer callback
	     * var object = {
	     *   'fruits': ['apple'],
	     *   'vegetables': ['beet']
	     * };
	     *
	     * var other = {
	     *   'fruits': ['banana'],
	     *   'vegetables': ['carrot']
	     * };
	     *
	     * _.merge(object, other, function(a, b) {
	     *   if (_.isArray(a)) {
	     *     return a.concat(b);
	     *   }
	     * });
	     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
	     */
	    var merge = createAssigner(baseMerge);

	    /**
	     * The opposite of `_.pick`; this method creates an object composed of the
	     * own and inherited enumerable properties of `object` that are not omitted.
	     * Property names may be specified as individual arguments or as arrays of
	     * property names. If `predicate` is provided it is invoked for each property
	     * of `object` omitting the properties `predicate` returns truthy for. The
	     * predicate is bound to `thisArg` and invoked with three arguments;
	     * (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {Function|...(string|string[])} [predicate] The function invoked per
	     *  iteration or property names to omit, specified as individual property
	     *  names or arrays of property names.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': 40 };
	     *
	     * _.omit(object, 'age');
	     * // => { 'user': 'fred' }
	     *
	     * _.omit(object, _.isNumber);
	     * // => { 'user': 'fred' }
	     */
	    function omit(object, predicate, thisArg) {
	      if (object == null) {
	        return {};
	      }
	      if (typeof predicate != 'function') {
	        var props = arrayMap(baseFlatten(arguments, false, false, 1), String);
	        return pickByArray(object, baseDifference(keysIn(object), props));
	      }
	      predicate = bindCallback(predicate, thisArg, 3);
	      return pickByCallback(object, function(value, key, object) {
	        return !predicate(value, key, object);
	      });
	    }

	    /**
	     * Creates a two dimensional array of the key-value pairs for `object`,
	     * e.g. `[[key1, value1], [key2, value2]]`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the new array of key-value pairs.
	     * @example
	     *
	     * _.pairs({ 'barney': 36, 'fred': 40 });
	     * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
	     */
	    function pairs(object) {
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = Array(length);

	      while (++index < length) {
	        var key = props[index];
	        result[index] = [key, object[key]];
	      }
	      return result;
	    }

	    /**
	     * Creates an object composed of the picked `object` properties. Property
	     * names may be specified as individual arguments or as arrays of property
	     * names. If `predicate` is provided it is invoked for each property of `object`
	     * picking the properties `predicate` returns truthy for. The predicate is
	     * bound to `thisArg` and invoked with three arguments; (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {Function|...(string|string[])} [predicate] The function invoked per
	     *  iteration or property names to pick, specified as individual property
	     *  names or arrays of property names.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': 40 };
	     *
	     * _.pick(object, 'user');
	     * // => { 'user': 'fred' }
	     *
	     * _.pick(object, _.isString);
	     * // => { 'user': 'fred' }
	     */
	    function pick(object, predicate, thisArg) {
	      if (object == null) {
	        return {};
	      }
	      return typeof predicate == 'function'
	        ? pickByCallback(object, bindCallback(predicate, thisArg, 3))
	        : pickByArray(object, baseFlatten(arguments, false, false, 1));
	    }

	    /**
	     * Resolves the value of property `key` on `object`. If the value of `key` is
	     * a function it is invoked with the `this` binding of `object` and its result
	     * is returned, else the property value is returned. If the property value is
	     * `undefined` the `defaultValue` is used in its place.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {string} key The key of the property to resolve.
	     * @param {*} [defaultValue] The value returned if the property value
	     *  resolves to `undefined`.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': _.constant(40) };
	     *
	     * _.result(object, 'user');
	     * // => 'fred'
	     *
	     * _.result(object, 'age');
	     * // => 40
	     *
	     * _.result(object, 'status', 'busy');
	     * // => 'busy'
	     *
	     * _.result(object, 'status', _.constant('busy'));
	     * // => 'busy'
	     */
	    function result(object, key, defaultValue) {
	      var value = object == null ? undefined : object[key];
	      if (typeof value == 'undefined') {
	        value = defaultValue;
	      }
	      return isFunction(value) ? value.call(object) : value;
	    }

	    /**
	     * An alternative to `_.reduce`; this method transforms `object` to a new
	     * `accumulator` object which is the result of running each of its own enumerable
	     * properties through `iteratee`, with each invocation potentially mutating
	     * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
	     * with four arguments; (accumulator, value, key, object). Iterator functions
	     * may exit iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Array|Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The custom accumulator value.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * _.transform([2, 3, 4], function(result, n) {
	     *   result.push(n *= n);
	     *   return n % 2 == 0;
	     * });
	     * // => [4, 9]
	     *
	     * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {
	     *   result[key] = n * 3;
	     * });
	     * // => { 'a': 3, 'b': 6 }
	     */
	    function transform(object, iteratee, accumulator, thisArg) {
	      var isArr = isArray(object) || isTypedArray(object);
	      iteratee = getCallback(iteratee, thisArg, 4);

	      if (accumulator == null) {
	        if (isArr || isObject(object)) {
	          var Ctor = object.constructor;
	          if (isArr) {
	            accumulator = isArray(object) ? new Ctor : [];
	          } else {
	            accumulator = baseCreate(isFunction(Ctor) && Ctor.prototype);
	          }
	        } else {
	          accumulator = {};
	        }
	      }
	      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
	        return iteratee(accumulator, value, index, object);
	      });
	      return accumulator;
	    }

	    /**
	     * Creates an array of the own enumerable property values of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property values.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.values(new Foo);
	     * // => [1, 2] (iteration order is not guaranteed)
	     *
	     * _.values('hi');
	     * // => ['h', 'i']
	     */
	    function values(object) {
	      return baseValues(object, keys(object));
	    }

	    /**
	     * Creates an array of the own and inherited enumerable property values
	     * of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property values.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.valuesIn(new Foo);
	     * // => [1, 2, 3] (iteration order is not guaranteed)
	     */
	    function valuesIn(object) {
	      return baseValues(object, keysIn(object));
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Checks if `n` is between `start` and up to but not including, `end`. If
	     * `end` is not specified it defaults to `start` with `start` becoming `0`.
	     *
	     * @static
	     * @memberOf _
	     * @category Number
	     * @param {number} n The number to check.
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @returns {boolean} Returns `true` if `n` is in the range, else `false`.
	     * @example
	     *
	     * _.inRange(3, 2, 4);
	     * // => true
	     *
	     * _.inRange(4, 8);
	     * // => true
	     *
	     * _.inRange(4, 2);
	     * // => false
	     *
	     * _.inRange(2, 2);
	     * // => false
	     *
	     * _.inRange(1.2, 2);
	     * // => true
	     *
	     * _.inRange(5.2, 4);
	     * // => false
	     */
	    function inRange(value, start, end) {
	      start = +start || 0;
	      if (typeof end === 'undefined') {
	        end = start;
	        start = 0;
	      } else {
	        end = +end || 0;
	      }
	      return value >= start && value < end;
	    }

	    /**
	     * Produces a random number between `min` and `max` (inclusive). If only one
	     * argument is provided a number between `0` and the given number is returned.
	     * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
	     * number is returned instead of an integer.
	     *
	     * @static
	     * @memberOf _
	     * @category Number
	     * @param {number} [min=0] The minimum possible value.
	     * @param {number} [max=1] The maximum possible value.
	     * @param {boolean} [floating] Specify returning a floating-point number.
	     * @returns {number} Returns the random number.
	     * @example
	     *
	     * _.random(0, 5);
	     * // => an integer between 0 and 5
	     *
	     * _.random(5);
	     * // => also an integer between 0 and 5
	     *
	     * _.random(5, true);
	     * // => a floating-point number between 0 and 5
	     *
	     * _.random(1.2, 5.2);
	     * // => a floating-point number between 1.2 and 5.2
	     */
	    function random(min, max, floating) {
	      if (floating && isIterateeCall(min, max, floating)) {
	        max = floating = null;
	      }
	      var noMin = min == null,
	          noMax = max == null;

	      if (floating == null) {
	        if (noMax && typeof min == 'boolean') {
	          floating = min;
	          min = 1;
	        }
	        else if (typeof max == 'boolean') {
	          floating = max;
	          noMax = true;
	        }
	      }
	      if (noMin && noMax) {
	        max = 1;
	        noMax = false;
	      }
	      min = +min || 0;
	      if (noMax) {
	        max = min;
	        min = 0;
	      } else {
	        max = +max || 0;
	      }
	      if (floating || min % 1 || max % 1) {
	        var rand = nativeRandom();
	        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
	      }
	      return baseRandom(min, max);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Converts `string` to camel case.
	     * See [Wikipedia](https://en.wikipedia.org/wiki/CamelCase) for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the camel cased string.
	     * @example
	     *
	     * _.camelCase('Foo Bar');
	     * // => 'fooBar'
	     *
	     * _.camelCase('--foo-bar');
	     * // => 'fooBar'
	     *
	     * _.camelCase('__foo_bar__');
	     * // => 'fooBar'
	     */
	    var camelCase = createCompounder(function(result, word, index) {
	      word = word.toLowerCase();
	      return result + (index ? (word.charAt(0).toUpperCase() + word.slice(1)) : word);
	    });

	    /**
	     * Capitalizes the first character of `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to capitalize.
	     * @returns {string} Returns the capitalized string.
	     * @example
	     *
	     * _.capitalize('fred');
	     * // => 'Fred'
	     */
	    function capitalize(string) {
	      string = baseToString(string);
	      return string && (string.charAt(0).toUpperCase() + string.slice(1));
	    }

	    /**
	     * Deburrs `string` by converting latin-1 supplementary letters to basic latin letters.
	     * See [Wikipedia](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to deburr.
	     * @returns {string} Returns the deburred string.
	     * @example
	     *
	     * _.deburr('déjà vu');
	     * // => 'deja vu'
	     */
	    function deburr(string) {
	      string = baseToString(string);
	      return string && string.replace(reLatin1, deburrLetter);
	    }

	    /**
	     * Checks if `string` ends with the given target string.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to search.
	     * @param {string} [target] The string to search for.
	     * @param {number} [position=string.length] The position to search from.
	     * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.
	     * @example
	     *
	     * _.endsWith('abc', 'c');
	     * // => true
	     *
	     * _.endsWith('abc', 'b');
	     * // => false
	     *
	     * _.endsWith('abc', 'b', 2);
	     * // => true
	     */
	    function endsWith(string, target, position) {
	      string = baseToString(string);
	      target = (target + '');

	      var length = string.length;
	      position = (typeof position == 'undefined' ? length : nativeMin(position < 0 ? 0 : (+position || 0), length)) - target.length;
	      return position >= 0 && string.indexOf(target, position) == position;
	    }

	    /**
	     * Converts the characters "&", "<", ">", '"', "'", and '`', in `string` to
	     * their corresponding HTML entities.
	     *
	     * **Note:** No other characters are escaped. To escape additional characters
	     * use a third-party library like [_he_](https://mths.be/he).
	     *
	     * Though the ">" character is escaped for symmetry, characters like
	     * ">" and "/" don't require escaping in HTML and have no special meaning
	     * unless they're part of a tag or unquoted attribute value.
	     * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
	     * (under "semi-related fun fact") for more details.
	     *
	     * Backticks are escaped because in Internet Explorer < 9, they can break out
	     * of attribute values or HTML comments. See [#102](https://html5sec.org/#102),
	     * [#108](https://html5sec.org/#108), and [#133](https://html5sec.org/#133) of
	     * the [HTML5 Security Cheatsheet](https://html5sec.org/) for more details.
	     *
	     * When working with HTML you should always quote attribute values to reduce
	     * XSS vectors. See [Ryan Grove's article](http://wonko.com/post/html-escaping)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escape('fred, barney, & pebbles');
	     * // => 'fred, barney, &amp; pebbles'
	     */
	    function escape(string) {
	      // Reset `lastIndex` because in IE < 9 `String#replace` does not.
	      string = baseToString(string);
	      return (string && reHasUnescapedHtml.test(string))
	        ? string.replace(reUnescapedHtml, escapeHtmlChar)
	        : string;
	    }

	    /**
	     * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
	     * "+", "(", ")", "[", "]", "{" and "}" in `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escapeRegExp('[lodash](https://lodash.com/)');
	     * // => '\[lodash\]\(https://lodash\.com/\)'
	     */
	    function escapeRegExp(string) {
	      string = baseToString(string);
	      return (string && reHasRegExpChars.test(string))
	        ? string.replace(reRegExpChars, '\\$&')
	        : string;
	    }

	    /**
	     * Converts `string` to kebab case.
	     * See [Wikipedia](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles) for
	     * more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the kebab cased string.
	     * @example
	     *
	     * _.kebabCase('Foo Bar');
	     * // => 'foo-bar'
	     *
	     * _.kebabCase('fooBar');
	     * // => 'foo-bar'
	     *
	     * _.kebabCase('__foo_bar__');
	     * // => 'foo-bar'
	     */
	    var kebabCase = createCompounder(function(result, word, index) {
	      return result + (index ? '-' : '') + word.toLowerCase();
	    });

	    /**
	     * Pads `string` on the left and right sides if it is shorter then the given
	     * padding length. The `chars` string may be truncated if the number of padding
	     * characters can't be evenly divided by the padding length.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.pad('abc', 8);
	     * // => '  abc   '
	     *
	     * _.pad('abc', 8, '_-');
	     * // => '_-abc_-_'
	     *
	     * _.pad('abc', 3);
	     * // => 'abc'
	     */
	    function pad(string, length, chars) {
	      string = baseToString(string);
	      length = +length;

	      var strLength = string.length;
	      if (strLength >= length || !nativeIsFinite(length)) {
	        return string;
	      }
	      var mid = (length - strLength) / 2,
	          leftLength = floor(mid),
	          rightLength = ceil(mid);

	      chars = createPad('', rightLength, chars);
	      return chars.slice(0, leftLength) + string + chars;
	    }

	    /**
	     * Pads `string` on the left side if it is shorter then the given padding
	     * length. The `chars` string may be truncated if the number of padding
	     * characters exceeds the padding length.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.padLeft('abc', 6);
	     * // => '   abc'
	     *
	     * _.padLeft('abc', 6, '_-');
	     * // => '_-_abc'
	     *
	     * _.padLeft('abc', 3);
	     * // => 'abc'
	     */
	    function padLeft(string, length, chars) {
	      string = baseToString(string);
	      return string && (createPad(string, length, chars) + string);
	    }

	    /**
	     * Pads `string` on the right side if it is shorter then the given padding
	     * length. The `chars` string may be truncated if the number of padding
	     * characters exceeds the padding length.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.padRight('abc', 6);
	     * // => 'abc   '
	     *
	     * _.padRight('abc', 6, '_-');
	     * // => 'abc_-_'
	     *
	     * _.padRight('abc', 3);
	     * // => 'abc'
	     */
	    function padRight(string, length, chars) {
	      string = baseToString(string);
	      return string && (string + createPad(string, length, chars));
	    }

	    /**
	     * Converts `string` to an integer of the specified radix. If `radix` is
	     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a hexadecimal,
	     * in which case a `radix` of `16` is used.
	     *
	     * **Note:** This method aligns with the ES5 implementation of `parseInt`.
	     * See the [ES5 spec](https://es5.github.io/#E) for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} string The string to convert.
	     * @param {number} [radix] The radix to interpret `value` by.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {number} Returns the converted integer.
	     * @example
	     *
	     * _.parseInt('08');
	     * // => 8
	     *
	     * _.map(['6', '08', '10'], _.parseInt);
	     * // => [6, 8, 10]
	     */
	    function parseInt(string, radix, guard) {
	      if (guard && isIterateeCall(string, radix, guard)) {
	        radix = 0;
	      }
	      return nativeParseInt(string, radix);
	    }
	    // Fallback for environments with pre-ES5 implementations.
	    if (nativeParseInt(whitespace + '08') != 8) {
	      parseInt = function(string, radix, guard) {
	        // Firefox < 21 and Opera < 15 follow ES3 for `parseInt`.
	        // Chrome fails to trim leading <BOM> whitespace characters.
	        // See https://code.google.com/p/v8/issues/detail?id=3109 for more details.
	        if (guard ? isIterateeCall(string, radix, guard) : radix == null) {
	          radix = 0;
	        } else if (radix) {
	          radix = +radix;
	        }
	        string = trim(string);
	        return nativeParseInt(string, radix || (reHexPrefix.test(string) ? 16 : 10));
	      };
	    }

	    /**
	     * Repeats the given string `n` times.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to repeat.
	     * @param {number} [n=0] The number of times to repeat the string.
	     * @returns {string} Returns the repeated string.
	     * @example
	     *
	     * _.repeat('*', 3);
	     * // => '***'
	     *
	     * _.repeat('abc', 2);
	     * // => 'abcabc'
	     *
	     * _.repeat('abc', 0);
	     * // => ''
	     */
	    function repeat(string, n) {
	      var result = '';
	      string = baseToString(string);
	      n = +n;
	      if (n < 1 || !string || !nativeIsFinite(n)) {
	        return result;
	      }
	      // Leverage the exponentiation by squaring algorithm for a faster repeat.
	      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
	      do {
	        if (n % 2) {
	          result += string;
	        }
	        n = floor(n / 2);
	        string += string;
	      } while (n);

	      return result;
	    }

	    /**
	     * Converts `string` to snake case.
	     * See [Wikipedia](https://en.wikipedia.org/wiki/Snake_case) for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the snake cased string.
	     * @example
	     *
	     * _.snakeCase('Foo Bar');
	     * // => 'foo_bar'
	     *
	     * _.snakeCase('fooBar');
	     * // => 'foo_bar'
	     *
	     * _.snakeCase('--foo-bar');
	     * // => 'foo_bar'
	     */
	    var snakeCase = createCompounder(function(result, word, index) {
	      return result + (index ? '_' : '') + word.toLowerCase();
	    });

	    /**
	     * Converts `string` to start case.
	     * See [Wikipedia](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the start cased string.
	     * @example
	     *
	     * _.startCase('--foo-bar');
	     * // => 'Foo Bar'
	     *
	     * _.startCase('fooBar');
	     * // => 'Foo Bar'
	     *
	     * _.startCase('__foo_bar__');
	     * // => 'Foo Bar'
	     */
	    var startCase = createCompounder(function(result, word, index) {
	      return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));
	    });

	    /**
	     * Checks if `string` starts with the given target string.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to search.
	     * @param {string} [target] The string to search for.
	     * @param {number} [position=0] The position to search from.
	     * @returns {boolean} Returns `true` if `string` starts with `target`, else `false`.
	     * @example
	     *
	     * _.startsWith('abc', 'a');
	     * // => true
	     *
	     * _.startsWith('abc', 'b');
	     * // => false
	     *
	     * _.startsWith('abc', 'b', 1);
	     * // => true
	     */
	    function startsWith(string, target, position) {
	      string = baseToString(string);
	      position = position == null ? 0 : nativeMin(position < 0 ? 0 : (+position || 0), string.length);
	      return string.lastIndexOf(target, position) == position;
	    }

	    /**
	     * Creates a compiled template function that can interpolate data properties
	     * in "interpolate" delimiters, HTML-escape interpolated data properties in
	     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
	     * properties may be accessed as free variables in the template. If a setting
	     * object is provided it takes precedence over `_.templateSettings` values.
	     *
	     * **Note:** In the development build `_.template` utilizes sourceURLs for easier debugging.
	     * See the [HTML5 Rocks article on sourcemaps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
	     * for more details.
	     *
	     * For more information on precompiling templates see
	     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
	     *
	     * For more information on Chrome extension sandboxes see
	     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The template string.
	     * @param {Object} [options] The options object.
	     * @param {RegExp} [options.escape] The HTML "escape" delimiter.
	     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
	     * @param {Object} [options.imports] An object to import into the template as free variables.
	     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
	     * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.
	     * @param {string} [options.variable] The data object variable name.
	     * @param- {Object} [otherOptions] Enables the legacy `options` param signature.
	     * @returns {Function} Returns the compiled template function.
	     * @example
	     *
	     * // using the "interpolate" delimiter to create a compiled template
	     * var compiled = _.template('hello <%= user %>!');
	     * compiled({ 'user': 'fred' });
	     * // => 'hello fred!'
	     *
	     * // using the HTML "escape" delimiter to escape data property values
	     * var compiled = _.template('<b><%- value %></b>');
	     * compiled({ 'value': '<script>' });
	     * // => '<b>&lt;script&gt;</b>'
	     *
	     * // using the "evaluate" delimiter to execute JavaScript and generate HTML
	     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
	     * compiled({ 'users': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the internal `print` function in "evaluate" delimiters
	     * var compiled = _.template('<% print("hello " + user); %>!');
	     * compiled({ 'user': 'barney' });
	     * // => 'hello barney!'
	     *
	     * // using the ES delimiter as an alternative to the default "interpolate" delimiter
	     * var compiled = _.template('hello ${ user }!');
	     * compiled({ 'user': 'pebbles' });
	     * // => 'hello pebbles!'
	     *
	     * // using custom template delimiters
	     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
	     * var compiled = _.template('hello {{ user }}!');
	     * compiled({ 'user': 'mustache' });
	     * // => 'hello mustache!'
	     *
	     * // using backslashes to treat delimiters as plain text
	     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
	     * compiled({ 'value': 'ignored' });
	     * // => '<%- value %>'
	     *
	     * // using the `imports` option to import `jQuery` as `jq`
	     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
	     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
	     * compiled({ 'users': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the `sourceURL` option to specify a custom sourceURL for the template
	     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
	     * compiled(data);
	     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
	     *
	     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
	     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
	     * compiled.source;
	     * // => function(data) {
	     *   var __t, __p = '';
	     *   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
	     *   return __p;
	     * }
	     *
	     * // using the `source` property to inline compiled templates for meaningful
	     * // line numbers in error messages and a stack trace
	     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
	     *   var JST = {\
	     *     "main": ' + _.template(mainText).source + '\
	     *   };\
	     * ');
	     */
	    function template(string, options, otherOptions) {
	      // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)
	      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
	      var settings = lodash.templateSettings;

	      if (otherOptions && isIterateeCall(string, options, otherOptions)) {
	        options = otherOptions = null;
	      }
	      string = baseToString(string);
	      options = baseAssign(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);

	      var imports = baseAssign(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),
	          importsKeys = keys(imports),
	          importsValues = baseValues(imports, importsKeys);

	      var isEscaping,
	          isEvaluating,
	          index = 0,
	          interpolate = options.interpolate || reNoMatch,
	          source = "__p += '";

	      // Compile the regexp to match each delimiter.
	      var reDelimiters = RegExp(
	        (options.escape || reNoMatch).source + '|' +
	        interpolate.source + '|' +
	        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
	        (options.evaluate || reNoMatch).source + '|$'
	      , 'g');

	      // Use a sourceURL for easier debugging.
	      var sourceURL = '//# sourceURL=' +
	        ('sourceURL' in options
	          ? options.sourceURL
	          : ('lodash.templateSources[' + (++templateCounter) + ']')
	        ) + '\n';

	      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
	        interpolateValue || (interpolateValue = esTemplateValue);

	        // Escape characters that can't be included in string literals.
	        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

	        // Replace delimiters with snippets.
	        if (escapeValue) {
	          isEscaping = true;
	          source += "' +\n__e(" + escapeValue + ") +\n'";
	        }
	        if (evaluateValue) {
	          isEvaluating = true;
	          source += "';\n" + evaluateValue + ";\n__p += '";
	        }
	        if (interpolateValue) {
	          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
	        }
	        index = offset + match.length;

	        // The JS engine embedded in Adobe products requires returning the `match`
	        // string in order to produce the correct `offset` value.
	        return match;
	      });

	      source += "';\n";

	      // If `variable` is not specified wrap a with-statement around the generated
	      // code to add the data object to the top of the scope chain.
	      var variable = options.variable;
	      if (!variable) {
	        source = 'with (obj) {\n' + source + '\n}\n';
	      }
	      // Cleanup code by stripping empty strings.
	      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
	        .replace(reEmptyStringMiddle, '$1')
	        .replace(reEmptyStringTrailing, '$1;');

	      // Frame code as the function body.
	      source = 'function(' + (variable || 'obj') + ') {\n' +
	        (variable
	          ? ''
	          : 'obj || (obj = {});\n'
	        ) +
	        "var __t, __p = ''" +
	        (isEscaping
	           ? ', __e = _.escape'
	           : ''
	        ) +
	        (isEvaluating
	          ? ', __j = Array.prototype.join;\n' +
	            "function print() { __p += __j.call(arguments, '') }\n"
	          : ';\n'
	        ) +
	        source +
	        'return __p\n}';

	      var result = attempt(function() {
	        return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);
	      });

	      // Provide the compiled function's source by its `toString` method or
	      // the `source` property as a convenience for inlining compiled templates.
	      result.source = source;
	      if (isError(result)) {
	        throw result;
	      }
	      return result;
	    }

	    /**
	     * Removes leading and trailing whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trim('  abc  ');
	     * // => 'abc'
	     *
	     * _.trim('-_-abc-_-', '_-');
	     * // => 'abc'
	     *
	     * _.map(['  foo  ', '  bar  '], _.trim);
	     * // => ['foo', 'bar]
	     */
	    function trim(string, chars, guard) {
	      var value = string;
	      string = baseToString(string);
	      if (!string) {
	        return string;
	      }
	      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
	        return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
	      }
	      chars = (chars + '');
	      return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
	    }

	    /**
	     * Removes leading whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trimLeft('  abc  ');
	     * // => 'abc  '
	     *
	     * _.trimLeft('-_-abc-_-', '_-');
	     * // => 'abc-_-'
	     */
	    function trimLeft(string, chars, guard) {
	      var value = string;
	      string = baseToString(string);
	      if (!string) {
	        return string;
	      }
	      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
	        return string.slice(trimmedLeftIndex(string));
	      }
	      return string.slice(charsLeftIndex(string, (chars + '')));
	    }

	    /**
	     * Removes trailing whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trimRight('  abc  ');
	     * // => '  abc'
	     *
	     * _.trimRight('-_-abc-_-', '_-');
	     * // => '-_-abc'
	     */
	    function trimRight(string, chars, guard) {
	      var value = string;
	      string = baseToString(string);
	      if (!string) {
	        return string;
	      }
	      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
	        return string.slice(0, trimmedRightIndex(string) + 1);
	      }
	      return string.slice(0, charsRightIndex(string, (chars + '')) + 1);
	    }

	    /**
	     * Truncates `string` if it is longer than the given maximum string length.
	     * The last characters of the truncated string are replaced with the omission
	     * string which defaults to "...".
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to truncate.
	     * @param {Object|number} [options] The options object or maximum string length.
	     * @param {number} [options.length=30] The maximum string length.
	     * @param {string} [options.omission='...'] The string to indicate text is omitted.
	     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the truncated string.
	     * @example
	     *
	     * _.trunc('hi-diddly-ho there, neighborino');
	     * // => 'hi-diddly-ho there, neighbo...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', 24);
	     * // => 'hi-diddly-ho there, n...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', {
	     *   'length': 24,
	     *   'separator': ' '
	     * });
	     * // => 'hi-diddly-ho there,...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', {
	     *   'length': 24,
	     *   'separator': /,? +/
	     * });
	     * //=> 'hi-diddly-ho there...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', {
	     *   'omission': ' [...]'
	     * });
	     * // => 'hi-diddly-ho there, neig [...]'
	     */
	    function trunc(string, options, guard) {
	      if (guard && isIterateeCall(string, options, guard)) {
	        options = null;
	      }
	      var length = DEFAULT_TRUNC_LENGTH,
	          omission = DEFAULT_TRUNC_OMISSION;

	      if (options != null) {
	        if (isObject(options)) {
	          var separator = 'separator' in options ? options.separator : separator;
	          length = 'length' in options ? +options.length || 0 : length;
	          omission = 'omission' in options ? baseToString(options.omission) : omission;
	        } else {
	          length = +options || 0;
	        }
	      }
	      string = baseToString(string);
	      if (length >= string.length) {
	        return string;
	      }
	      var end = length - omission.length;
	      if (end < 1) {
	        return omission;
	      }
	      var result = string.slice(0, end);
	      if (separator == null) {
	        return result + omission;
	      }
	      if (isRegExp(separator)) {
	        if (string.slice(end).search(separator)) {
	          var match,
	              newEnd,
	              substring = string.slice(0, end);

	          if (!separator.global) {
	            separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');
	          }
	          separator.lastIndex = 0;
	          while ((match = separator.exec(substring))) {
	            newEnd = match.index;
	          }
	          result = result.slice(0, newEnd == null ? end : newEnd);
	        }
	      } else if (string.indexOf(separator, end) != end) {
	        var index = result.lastIndexOf(separator);
	        if (index > -1) {
	          result = result.slice(0, index);
	        }
	      }
	      return result + omission;
	    }

	    /**
	     * The inverse of `_.escape`; this method converts the HTML entities
	     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their
	     * corresponding characters.
	     *
	     * **Note:** No other HTML entities are unescaped. To unescape additional HTML
	     * entities use a third-party library like [_he_](https://mths.be/he).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to unescape.
	     * @returns {string} Returns the unescaped string.
	     * @example
	     *
	     * _.unescape('fred, barney, &amp; pebbles');
	     * // => 'fred, barney, & pebbles'
	     */
	    function unescape(string) {
	      string = baseToString(string);
	      return (string && reHasEscapedHtml.test(string))
	        ? string.replace(reEscapedHtml, unescapeHtmlChar)
	        : string;
	    }

	    /**
	     * Splits `string` into an array of its words.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to inspect.
	     * @param {RegExp|string} [pattern] The pattern to match words.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the words of `string`.
	     * @example
	     *
	     * _.words('fred, barney, & pebbles');
	     * // => ['fred', 'barney', 'pebbles']
	     *
	     * _.words('fred, barney, & pebbles', /[^, ]+/g);
	     * // => ['fred', 'barney', '&', 'pebbles']
	     */
	    function words(string, pattern, guard) {
	      if (guard && isIterateeCall(string, pattern, guard)) {
	        pattern = null;
	      }
	      string = baseToString(string);
	      return string.match(pattern || reWords) || [];
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Attempts to invoke `func`, returning either the result or the caught error
	     * object. Any additional arguments are provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {*} func The function to attempt.
	     * @returns {*} Returns the `func` result or error object.
	     * @example
	     *
	     * // avoid throwing errors for invalid selectors
	     * var elements = _.attempt(function(selector) {
	     *   return document.querySelectorAll(selector);
	     * }, '>_>');
	     *
	     * if (_.isError(elements)) {
	     *   elements = [];
	     * }
	     */
	    function attempt() {
	      var length = arguments.length,
	          func = arguments[0];

	      try {
	        var args = Array(length ? length - 1 : 0);
	        while (--length > 0) {
	          args[length - 1] = arguments[length];
	        }
	        return func.apply(undefined, args);
	      } catch(e) {
	        return isError(e) ? e : new Error(e);
	      }
	    }

	    /**
	     * Creates a function that invokes `func` with the `this` binding of `thisArg`
	     * and arguments of the created function. If `func` is a property name the
	     * created callback returns the property value for a given element. If `func`
	     * is an object the created callback returns `true` for elements that contain
	     * the equivalent object properties, otherwise it returns `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias iteratee
	     * @category Utility
	     * @param {*} [func=_.identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the callback.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * // wrap to create custom callback shorthands
	     * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
	     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
	     *   if (!match) {
	     *     return callback(func, thisArg);
	     *   }
	     *   return function(object) {
	     *     return match[2] == 'gt'
	     *       ? object[match[1]] > match[3]
	     *       : object[match[1]] < match[3];
	     *   };
	     * });
	     *
	     * _.filter(users, 'age__gt36');
	     * // => [{ 'user': 'fred', 'age': 40 }]
	     */
	    function callback(func, thisArg, guard) {
	      if (guard && isIterateeCall(func, thisArg, guard)) {
	        thisArg = null;
	      }
	      return isObjectLike(func)
	        ? matches(func)
	        : baseCallback(func, thisArg);
	    }

	    /**
	     * Creates a function that returns `value`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {*} value The value to return from the new function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     * var getter = _.constant(object);
	     *
	     * getter() === object;
	     * // => true
	     */
	    function constant(value) {
	      return function() {
	        return value;
	      };
	    }

	    /**
	     * This method returns the first argument provided to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {*} value Any value.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * _.identity(object) === object;
	     * // => true
	     */
	    function identity(value) {
	      return value;
	    }

	    /**
	     * Creates a function which performs a deep comparison between a given object
	     * and `source`, returning `true` if the given object has equivalent property
	     * values, else `false`.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. For comparing a single
	     * own or inherited property value see `_.matchesProperty`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Object} source The object of property values to match.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * _.filter(users, _.matches({ 'age': 40, 'active': false }));
	     * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
	     */
	    function matches(source) {
	      return baseMatches(baseClone(source, true));
	    }

	    /**
	     * Creates a function which compares the property value of `key` on a given
	     * object to `value`.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {string} key The key of the property to get.
	     * @param {*} value The value to compare.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' },
	     *   { 'user': 'pebbles' }
	     * ];
	     *
	     * _.find(users, _.matchesProperty('user', 'fred'));
	     * // => { 'user': 'fred', 'age': 40 }
	     */
	    function matchesProperty(key, value) {
	      return baseMatchesProperty(key + '', baseClone(value, true));
	    }

	    /**
	     * Adds all own enumerable function properties of a source object to the
	     * destination object. If `object` is a function then methods are added to
	     * its prototype as well.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Function|Object} [object=this] object The destination object.
	     * @param {Object} source The object of functions to add.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.chain=true] Specify whether the functions added
	     *  are chainable.
	     * @returns {Function|Object} Returns `object`.
	     * @example
	     *
	     * function vowels(string) {
	     *   return _.filter(string, function(v) {
	     *     return /[aeiou]/i.test(v);
	     *   });
	     * }
	     *
	     * // use `_.runInContext` to avoid potential conflicts (esp. in Node.js)
	     * var _ = require('lodash').runInContext();
	     *
	     * _.mixin({ 'vowels': vowels });
	     * _.vowels('fred');
	     * // => ['e']
	     *
	     * _('fred').vowels().value();
	     * // => ['e']
	     *
	     * _.mixin({ 'vowels': vowels }, { 'chain': false });
	     * _('fred').vowels();
	     * // => ['e']
	     */
	    function mixin(object, source, options) {
	      if (options == null) {
	        var isObj = isObject(source),
	            props = isObj && keys(source),
	            methodNames = props && props.length && baseFunctions(source, props);

	        if (!(methodNames ? methodNames.length : isObj)) {
	          methodNames = false;
	          options = source;
	          source = object;
	          object = this;
	        }
	      }
	      if (!methodNames) {
	        methodNames = baseFunctions(source, keys(source));
	      }
	      var chain = true,
	          index = -1,
	          isFunc = isFunction(object),
	          length = methodNames.length;

	      if (options === false) {
	        chain = false;
	      } else if (isObject(options) && 'chain' in options) {
	        chain = options.chain;
	      }
	      while (++index < length) {
	        var methodName = methodNames[index],
	            func = source[methodName];

	        object[methodName] = func;
	        if (isFunc) {
	          object.prototype[methodName] = (function(func) {
	            return function() {
	              var chainAll = this.__chain__;
	              if (chain || chainAll) {
	                var result = object(this.__wrapped__);
	                (result.__actions__ = arrayCopy(this.__actions__)).push({ 'func': func, 'args': arguments, 'thisArg': object });
	                result.__chain__ = chainAll;
	                return result;
	              }
	              var args = [this.value()];
	              push.apply(args, arguments);
	              return func.apply(object, args);
	            };
	          }(func));
	        }
	      }
	      return object;
	    }

	    /**
	     * Reverts the `_` variable to its previous value and returns a reference to
	     * the `lodash` function.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @returns {Function} Returns the `lodash` function.
	     * @example
	     *
	     * var lodash = _.noConflict();
	     */
	    function noConflict() {
	      context._ = oldDash;
	      return this;
	    }

	    /**
	     * A no-operation function which returns `undefined` regardless of the
	     * arguments it receives.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * _.noop(object) === undefined;
	     * // => true
	     */
	    function noop() {
	      // No operation performed.
	    }

	    /**
	     * Creates a function which returns the property value of `key` on a given object.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {string} key The key of the property to get.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'fred' },
	     *   { 'user': 'barney' }
	     * ];
	     *
	     * var getName = _.property('user');
	     *
	     * _.map(users, getName);
	     * // => ['fred', barney']
	     *
	     * _.pluck(_.sortBy(users, getName), 'user');
	     * // => ['barney', 'fred']
	     */
	    function property(key) {
	      return baseProperty(key + '');
	    }

	    /**
	     * The inverse of `_.property`; this method creates a function which returns
	     * the property value of a given key on `object`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Object} object The object to inspect.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var object = { 'a': 3, 'b': 1, 'c': 2 };
	     *
	     * _.map(['a', 'c'], _.propertyOf(object));
	     * // => [3, 2]
	     *
	     * _.sortBy(['a', 'b', 'c'], _.propertyOf(object));
	     * // => ['b', 'c', 'a']
	     */
	    function propertyOf(object) {
	      return function(key) {
	        return object == null ? undefined : object[key];
	      };
	    }

	    /**
	     * Creates an array of numbers (positive and/or negative) progressing from
	     * `start` up to, but not including, `end`. If `end` is not specified it
	     * defaults to `start` with `start` becoming `0`. If `start` is less than
	     * `end` a zero-length range is created unless a negative `step` is specified.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} [step=1] The value to increment or decrement by.
	     * @returns {Array} Returns the new array of numbers.
	     * @example
	     *
	     * _.range(4);
	     * // => [0, 1, 2, 3]
	     *
	     * _.range(1, 5);
	     * // => [1, 2, 3, 4]
	     *
	     * _.range(0, 20, 5);
	     * // => [0, 5, 10, 15]
	     *
	     * _.range(0, -4, -1);
	     * // => [0, -1, -2, -3]
	     *
	     * _.range(1, 4, 0);
	     * // => [1, 1, 1]
	     *
	     * _.range(0);
	     * // => []
	     */
	    function range(start, end, step) {
	      if (step && isIterateeCall(start, end, step)) {
	        end = step = null;
	      }
	      start = +start || 0;
	      step = step == null ? 1 : (+step || 0);

	      if (end == null) {
	        end = start;
	        start = 0;
	      } else {
	        end = +end || 0;
	      }
	      // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.
	      // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.
	      var index = -1,
	          length = nativeMax(ceil((end - start) / (step || 1)), 0),
	          result = Array(length);

	      while (++index < length) {
	        result[index] = start;
	        start += step;
	      }
	      return result;
	    }

	    /**
	     * Invokes the iteratee function `n` times, returning an array of the results
	     * of each invocation. The `iteratee` is bound to `thisArg` and invoked with
	     * one argument; (index).
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {number} n The number of times to invoke `iteratee`.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the array of results.
	     * @example
	     *
	     * var diceRolls = _.times(3, _.partial(_.random, 1, 6, false));
	     * // => [3, 6, 4]
	     *
	     * _.times(3, function(n) {
	     *   mage.castSpell(n);
	     * });
	     * // => invokes `mage.castSpell(n)` three times with `n` of `0`, `1`, and `2` respectively
	     *
	     * _.times(3, function(n) {
	     *   this.cast(n);
	     * }, mage);
	     * // => also invokes `mage.castSpell(n)` three times
	     */
	    function times(n, iteratee, thisArg) {
	      n = +n;

	      // Exit early to avoid a JSC JIT bug in Safari 8
	      // where `Array(0)` is treated as `Array(1)`.
	      if (n < 1 || !nativeIsFinite(n)) {
	        return [];
	      }
	      var index = -1,
	          result = Array(nativeMin(n, MAX_ARRAY_LENGTH));

	      iteratee = bindCallback(iteratee, thisArg, 1);
	      while (++index < n) {
	        if (index < MAX_ARRAY_LENGTH) {
	          result[index] = iteratee(index);
	        } else {
	          iteratee(index);
	        }
	      }
	      return result;
	    }

	    /**
	     * Generates a unique ID. If `prefix` is provided the ID is appended to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {string} [prefix] The value to prefix the ID with.
	     * @returns {string} Returns the unique ID.
	     * @example
	     *
	     * _.uniqueId('contact_');
	     * // => 'contact_104'
	     *
	     * _.uniqueId();
	     * // => '105'
	     */
	    function uniqueId(prefix) {
	      var id = ++idCounter;
	      return baseToString(prefix) + id;
	    }

	    /*------------------------------------------------------------------------*/

	    // Ensure wrappers are instances of `baseLodash`.
	    lodash.prototype = baseLodash.prototype;

	    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
	    LodashWrapper.prototype.constructor = LodashWrapper;

	    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
	    LazyWrapper.prototype.constructor = LazyWrapper;

	    // Add functions to the `Map` cache.
	    MapCache.prototype['delete'] = mapDelete;
	    MapCache.prototype.get = mapGet;
	    MapCache.prototype.has = mapHas;
	    MapCache.prototype.set = mapSet;

	    // Add functions to the `Set` cache.
	    SetCache.prototype.push = cachePush;

	    // Assign cache to `_.memoize`.
	    memoize.Cache = MapCache;

	    // Add functions that return wrapped values when chaining.
	    lodash.after = after;
	    lodash.ary = ary;
	    lodash.assign = assign;
	    lodash.at = at;
	    lodash.before = before;
	    lodash.bind = bind;
	    lodash.bindAll = bindAll;
	    lodash.bindKey = bindKey;
	    lodash.callback = callback;
	    lodash.chain = chain;
	    lodash.chunk = chunk;
	    lodash.compact = compact;
	    lodash.constant = constant;
	    lodash.countBy = countBy;
	    lodash.create = create;
	    lodash.curry = curry;
	    lodash.curryRight = curryRight;
	    lodash.debounce = debounce;
	    lodash.defaults = defaults;
	    lodash.defer = defer;
	    lodash.delay = delay;
	    lodash.difference = difference;
	    lodash.drop = drop;
	    lodash.dropRight = dropRight;
	    lodash.dropRightWhile = dropRightWhile;
	    lodash.dropWhile = dropWhile;
	    lodash.fill = fill;
	    lodash.filter = filter;
	    lodash.flatten = flatten;
	    lodash.flattenDeep = flattenDeep;
	    lodash.flow = flow;
	    lodash.flowRight = flowRight;
	    lodash.forEach = forEach;
	    lodash.forEachRight = forEachRight;
	    lodash.forIn = forIn;
	    lodash.forInRight = forInRight;
	    lodash.forOwn = forOwn;
	    lodash.forOwnRight = forOwnRight;
	    lodash.functions = functions;
	    lodash.groupBy = groupBy;
	    lodash.indexBy = indexBy;
	    lodash.initial = initial;
	    lodash.intersection = intersection;
	    lodash.invert = invert;
	    lodash.invoke = invoke;
	    lodash.keys = keys;
	    lodash.keysIn = keysIn;
	    lodash.map = map;
	    lodash.mapValues = mapValues;
	    lodash.matches = matches;
	    lodash.matchesProperty = matchesProperty;
	    lodash.memoize = memoize;
	    lodash.merge = merge;
	    lodash.mixin = mixin;
	    lodash.negate = negate;
	    lodash.omit = omit;
	    lodash.once = once;
	    lodash.pairs = pairs;
	    lodash.partial = partial;
	    lodash.partialRight = partialRight;
	    lodash.partition = partition;
	    lodash.pick = pick;
	    lodash.pluck = pluck;
	    lodash.property = property;
	    lodash.propertyOf = propertyOf;
	    lodash.pull = pull;
	    lodash.pullAt = pullAt;
	    lodash.range = range;
	    lodash.rearg = rearg;
	    lodash.reject = reject;
	    lodash.remove = remove;
	    lodash.rest = rest;
	    lodash.shuffle = shuffle;
	    lodash.slice = slice;
	    lodash.sortBy = sortBy;
	    lodash.sortByAll = sortByAll;
	    lodash.spread = spread;
	    lodash.take = take;
	    lodash.takeRight = takeRight;
	    lodash.takeRightWhile = takeRightWhile;
	    lodash.takeWhile = takeWhile;
	    lodash.tap = tap;
	    lodash.throttle = throttle;
	    lodash.thru = thru;
	    lodash.times = times;
	    lodash.toArray = toArray;
	    lodash.toPlainObject = toPlainObject;
	    lodash.transform = transform;
	    lodash.union = union;
	    lodash.uniq = uniq;
	    lodash.unzip = unzip;
	    lodash.values = values;
	    lodash.valuesIn = valuesIn;
	    lodash.where = where;
	    lodash.without = without;
	    lodash.wrap = wrap;
	    lodash.xor = xor;
	    lodash.zip = zip;
	    lodash.zipObject = zipObject;

	    // Add aliases.
	    lodash.backflow = flowRight;
	    lodash.collect = map;
	    lodash.compose = flowRight;
	    lodash.each = forEach;
	    lodash.eachRight = forEachRight;
	    lodash.extend = assign;
	    lodash.iteratee = callback;
	    lodash.methods = functions;
	    lodash.object = zipObject;
	    lodash.select = filter;
	    lodash.tail = rest;
	    lodash.unique = uniq;

	    // Add functions to `lodash.prototype`.
	    mixin(lodash, lodash);

	    /*------------------------------------------------------------------------*/

	    // Add functions that return unwrapped values when chaining.
	    lodash.attempt = attempt;
	    lodash.camelCase = camelCase;
	    lodash.capitalize = capitalize;
	    lodash.clone = clone;
	    lodash.cloneDeep = cloneDeep;
	    lodash.deburr = deburr;
	    lodash.endsWith = endsWith;
	    lodash.escape = escape;
	    lodash.escapeRegExp = escapeRegExp;
	    lodash.every = every;
	    lodash.find = find;
	    lodash.findIndex = findIndex;
	    lodash.findKey = findKey;
	    lodash.findLast = findLast;
	    lodash.findLastIndex = findLastIndex;
	    lodash.findLastKey = findLastKey;
	    lodash.findWhere = findWhere;
	    lodash.first = first;
	    lodash.has = has;
	    lodash.identity = identity;
	    lodash.includes = includes;
	    lodash.indexOf = indexOf;
	    lodash.inRange = inRange;
	    lodash.isArguments = isArguments;
	    lodash.isArray = isArray;
	    lodash.isBoolean = isBoolean;
	    lodash.isDate = isDate;
	    lodash.isElement = isElement;
	    lodash.isEmpty = isEmpty;
	    lodash.isEqual = isEqual;
	    lodash.isError = isError;
	    lodash.isFinite = isFinite;
	    lodash.isFunction = isFunction;
	    lodash.isMatch = isMatch;
	    lodash.isNaN = isNaN;
	    lodash.isNative = isNative;
	    lodash.isNull = isNull;
	    lodash.isNumber = isNumber;
	    lodash.isObject = isObject;
	    lodash.isPlainObject = isPlainObject;
	    lodash.isRegExp = isRegExp;
	    lodash.isString = isString;
	    lodash.isTypedArray = isTypedArray;
	    lodash.isUndefined = isUndefined;
	    lodash.kebabCase = kebabCase;
	    lodash.last = last;
	    lodash.lastIndexOf = lastIndexOf;
	    lodash.max = max;
	    lodash.min = min;
	    lodash.noConflict = noConflict;
	    lodash.noop = noop;
	    lodash.now = now;
	    lodash.pad = pad;
	    lodash.padLeft = padLeft;
	    lodash.padRight = padRight;
	    lodash.parseInt = parseInt;
	    lodash.random = random;
	    lodash.reduce = reduce;
	    lodash.reduceRight = reduceRight;
	    lodash.repeat = repeat;
	    lodash.result = result;
	    lodash.runInContext = runInContext;
	    lodash.size = size;
	    lodash.snakeCase = snakeCase;
	    lodash.some = some;
	    lodash.sortedIndex = sortedIndex;
	    lodash.sortedLastIndex = sortedLastIndex;
	    lodash.startCase = startCase;
	    lodash.startsWith = startsWith;
	    lodash.template = template;
	    lodash.trim = trim;
	    lodash.trimLeft = trimLeft;
	    lodash.trimRight = trimRight;
	    lodash.trunc = trunc;
	    lodash.unescape = unescape;
	    lodash.uniqueId = uniqueId;
	    lodash.words = words;

	    // Add aliases.
	    lodash.all = every;
	    lodash.any = some;
	    lodash.contains = includes;
	    lodash.detect = find;
	    lodash.foldl = reduce;
	    lodash.foldr = reduceRight;
	    lodash.head = first;
	    lodash.include = includes;
	    lodash.inject = reduce;

	    mixin(lodash, (function() {
	      var source = {};
	      baseForOwn(lodash, function(func, methodName) {
	        if (!lodash.prototype[methodName]) {
	          source[methodName] = func;
	        }
	      });
	      return source;
	    }()), false);

	    /*------------------------------------------------------------------------*/

	    // Add functions capable of returning wrapped and unwrapped values when chaining.
	    lodash.sample = sample;

	    lodash.prototype.sample = function(n) {
	      if (!this.__chain__ && n == null) {
	        return sample(this.value());
	      }
	      return this.thru(function(value) {
	        return sample(value, n);
	      });
	    };

	    /*------------------------------------------------------------------------*/

	    /**
	     * The semantic version number.
	     *
	     * @static
	     * @memberOf _
	     * @type string
	     */
	    lodash.VERSION = VERSION;

	    // Assign default placeholders.
	    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
	      lodash[methodName].placeholder = lodash;
	    });

	    // Add `LazyWrapper` methods that accept an `iteratee` value.
	    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
	      var isFilter = index == LAZY_FILTER_FLAG,
	          isWhile = index == LAZY_WHILE_FLAG;

	      LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
	        var result = this.clone(),
	            filtered = result.__filtered__,
	            iteratees = result.__iteratees__ || (result.__iteratees__ = []);

	        result.__filtered__ = filtered || isFilter || (isWhile && result.__dir__ < 0);
	        iteratees.push({ 'iteratee': getCallback(iteratee, thisArg, 3), 'type': index });
	        return result;
	      };
	    });

	    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
	    arrayEach(['drop', 'take'], function(methodName, index) {
	      var countName = '__' + methodName + 'Count__',
	          whileName = methodName + 'While';

	      LazyWrapper.prototype[methodName] = function(n) {
	        n = n == null ? 1 : nativeMax(floor(n) || 0, 0);

	        var result = this.clone();
	        if (result.__filtered__) {
	          var value = result[countName];
	          result[countName] = index ? nativeMin(value, n) : (value + n);
	        } else {
	          var views = result.__views__ || (result.__views__ = []);
	          views.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });
	        }
	        return result;
	      };

	      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
	        return this.reverse()[methodName](n).reverse();
	      };

	      LazyWrapper.prototype[methodName + 'RightWhile'] = function(predicate, thisArg) {
	        return this.reverse()[whileName](predicate, thisArg).reverse();
	      };
	    });

	    // Add `LazyWrapper` methods for `_.first` and `_.last`.
	    arrayEach(['first', 'last'], function(methodName, index) {
	      var takeName = 'take' + (index ? 'Right' : '');

	      LazyWrapper.prototype[methodName] = function() {
	        return this[takeName](1).value()[0];
	      };
	    });

	    // Add `LazyWrapper` methods for `_.initial` and `_.rest`.
	    arrayEach(['initial', 'rest'], function(methodName, index) {
	      var dropName = 'drop' + (index ? '' : 'Right');

	      LazyWrapper.prototype[methodName] = function() {
	        return this[dropName](1);
	      };
	    });

	    // Add `LazyWrapper` methods for `_.pluck` and `_.where`.
	    arrayEach(['pluck', 'where'], function(methodName, index) {
	      var operationName = index ? 'filter' : 'map',
	          createCallback = index ? baseMatches : baseProperty;

	      LazyWrapper.prototype[methodName] = function(value) {
	        return this[operationName](createCallback(value));
	      };
	    });

	    LazyWrapper.prototype.compact = function() {
	      return this.filter(identity);
	    };

	    LazyWrapper.prototype.dropWhile = function(predicate, thisArg) {
	      var done;
	      predicate = getCallback(predicate, thisArg, 3);
	      return this.filter(function(value, index, array) {
	        return done || (done = !predicate(value, index, array));
	      });
	    };

	    LazyWrapper.prototype.reject = function(predicate, thisArg) {
	      predicate = getCallback(predicate, thisArg, 3);
	      return this.filter(function(value, index, array) {
	        return !predicate(value, index, array);
	      });
	    };

	    LazyWrapper.prototype.slice = function(start, end) {
	      start = start == null ? 0 : (+start || 0);
	      var result = start < 0 ? this.takeRight(-start) : this.drop(start);

	      if (typeof end != 'undefined') {
	        end = (+end || 0);
	        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
	      }
	      return result;
	    };

	    LazyWrapper.prototype.toArray = function() {
	      return this.drop(0);
	    };

	    // Add `LazyWrapper` methods to `lodash.prototype`.
	    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
	      var lodashFunc = lodash[methodName],
	          retUnwrapped = /^(?:first|last)$/.test(methodName);

	      lodash.prototype[methodName] = function() {
	        var value = this.__wrapped__,
	            args = arguments,
	            chainAll = this.__chain__,
	            isHybrid = !!this.__actions__.length,
	            isLazy = value instanceof LazyWrapper,
	            onlyLazy = isLazy && !isHybrid;

	        if (retUnwrapped && !chainAll) {
	          return onlyLazy
	            ? func.call(value)
	            : lodashFunc.call(lodash, this.value());
	        }
	        var interceptor = function(value) {
	          var otherArgs = [value];
	          push.apply(otherArgs, args);
	          return lodashFunc.apply(lodash, otherArgs);
	        };
	        if (isLazy || isArray(value)) {
	          var wrapper = onlyLazy ? value : new LazyWrapper(this),
	              result = func.apply(wrapper, args);

	          if (!retUnwrapped && (isHybrid || result.__actions__)) {
	            var actions = result.__actions__ || (result.__actions__ = []);
	            actions.push({ 'func': thru, 'args': [interceptor], 'thisArg': lodash });
	          }
	          return new LodashWrapper(result, chainAll);
	        }
	        return this.thru(interceptor);
	      };
	    });

	    // Add `Array.prototype` functions to `lodash.prototype`.
	    arrayEach(['concat', 'join', 'pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
	      var func = arrayProto[methodName],
	          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
	          retUnwrapped = /^(?:join|pop|shift)$/.test(methodName);

	      lodash.prototype[methodName] = function() {
	        var args = arguments;
	        if (retUnwrapped && !this.__chain__) {
	          return func.apply(this.value(), args);
	        }
	        return this[chainName](function(value) {
	          return func.apply(value, args);
	        });
	      };
	    });

	    // Add functions to the lazy wrapper.
	    LazyWrapper.prototype.clone = lazyClone;
	    LazyWrapper.prototype.reverse = lazyReverse;
	    LazyWrapper.prototype.value = lazyValue;

	    // Add chaining functions to the `lodash` wrapper.
	    lodash.prototype.chain = wrapperChain;
	    lodash.prototype.commit = wrapperCommit;
	    lodash.prototype.plant = wrapperPlant;
	    lodash.prototype.reverse = wrapperReverse;
	    lodash.prototype.toString = wrapperToString;
	    lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

	    // Add function aliases to the `lodash` wrapper.
	    lodash.prototype.collect = lodash.prototype.map;
	    lodash.prototype.head = lodash.prototype.first;
	    lodash.prototype.select = lodash.prototype.filter;
	    lodash.prototype.tail = lodash.prototype.rest;

	    return lodash;
	  }

	  /*--------------------------------------------------------------------------*/

	  // Export lodash.
	  var _ = runInContext();

	  // Some AMD build optimizers like r.js check for condition patterns like the following:
	  if (true) {
	    // Expose lodash to the global object when an AMD loader is present to avoid
	    // errors in cases where lodash is loaded by a script tag and not intended
	    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
	    // more details.
	    root._ = _;

	    // Define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module.
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
	  else if (freeExports && freeModule) {
	    // Export for Node.js or RingoJS.
	    if (moduleExports) {
	      (freeModule.exports = _)._ = _;
	    }
	    // Export for Narwhal or Rhino -require.
	    else {
	      freeExports._ = _;
	    }
	  }
	  else {
	    // Export for a browser or Rhino.
	    root._ = _;
	  }
	}.call(this));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(50)(module), (function() { return this; }())))

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(52)

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = __webpack_require__(54)

	exports.createHmac = __webpack_require__(63)

	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}

	var p = __webpack_require__(64)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync


	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(53)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(44).Buffer))

/***/ },
/* 53 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(55)

	var md5 = toConstructor(__webpack_require__(60))
	var rmd160 = toConstructor(__webpack_require__(62))

	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}

	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}

	var Buffer = __webpack_require__(44).Buffer
	var Hash   = __webpack_require__(56)(Buffer)

	exports.sha1 = __webpack_require__(57)(Buffer, Hash)
	exports.sha256 = __webpack_require__(58)(Buffer, Hash)
	exports.sha512 = __webpack_require__(59)(Buffer, Hash)


/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = function (Buffer) {

	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }

	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }

	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }

	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block

	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)

	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }

	      s += ch
	      f += ch

	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s

	    return this
	  }

	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8

	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80

	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)

	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }

	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)

	    var hash = this._update(this._block) || this._hash()

	    return enc ? hash.toString(enc) : hash
	  }

	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }

	  return Hash
	}


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(4).inherits

	module.exports = function (Buffer, Hash) {

	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0

	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

	  var POOL = []

	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()

	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)

	    this._h = null
	    this.init()
	  }

	  inherits(Sha1, Hash)

	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0

	    Hash.prototype.init.call(this)
	    return this
	  }

	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {

	    var a, b, c, d, e, _a, _b, _c, _d, _e

	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e

	    var w = this._w

	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )

	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }

	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }

	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }

	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }

	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }

	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }

	  return Sha1
	}


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(4).inherits

	module.exports = function (Buffer, Hash) {

	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]

	  var W = new Array(64)

	  function Sha256() {
	    this.init()

	    this._w = W //new Array(64)

	    Hash.call(this, 16*4, 14*4)
	  }

	  inherits(Sha256, Hash)

	  Sha256.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }

	  function R (X, n) {
	    return (X >>> n);
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }

	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }

	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }

	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }

	  Sha256.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }

	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0

	  };

	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)

	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)

	    return H
	  }

	  return Sha256

	}


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(4).inherits

	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]

	  var W = new Array(160)

	  function Sha512() {
	    this.init()
	    this._w = W

	    Hash.call(this, 128, 112)
	  }

	  inherits(Sha512, Hash)

	  Sha512.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  Sha512.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0

	    for (var i = 0; i < 80; i++) {
	      var j = i * 2

	      var Wi, Wil

	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]

	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]

	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

	        W[j] = Wi
	        W[j + 1] = Wil
	      }

	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)

	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]

	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)

	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }

	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0

	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }

	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)

	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }

	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)

	    return H
	  }

	  return Sha512

	}


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(61);

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};

	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};

	var processBlock = function (H, M, offset) {

	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];

	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }

	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;

	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;

	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};

	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}

	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}

	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}

	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}

	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}

	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}

	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');

	  var m = bytesToWords(message);

	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;

	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );

	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }

	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];

	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }

	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(54)

	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)

	module.exports = Hmac

	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg

	  var blocksize = (alg === 'sha512') ? 128 : 64

	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)

	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = createHash(alg).update(ipad)
	}

	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}

	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(65)

	module.exports = function (crypto, exports) {
	  exports = exports || {}

	  var exported = pbkdf2Export(crypto)

	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync

	  return exports
	}


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }

	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')

	    setTimeout(function() {
	      var result

	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }

	      callback(undefined, result)
	    })
	  }

	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')

	    if (iterations < 0)
	      throw new TypeError('Bad iterations')

	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')

	    if (keylen < 0)
	      throw new TypeError('Bad key length')

	    digest = digest || 'sha1'

	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)

	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)

	      var U = crypto.createHmac(digest, password).update(block1).digest()

	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen

	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }

	      U.copy(T, 0, 0, hLen)

	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()

	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }

	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }

	    return DK
	  }

	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*
	 * Basic JavaScript BN library - subset useful for RSA encryption.
	 * 
	 * Copyright (c) 2003-2005  Tom Wu
	 * All Rights Reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
	 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
	 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
	 *
	 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
	 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
	 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
	 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
	 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 * In addition, the following condition applies:
	 *
	 * All redistributions must retain an intact copy of this copyright notice
	 * and disclaimer.
	 */

	/*
	 * Added Node.js Buffers support
	 * 2014 rzcoder
	 */

	var crypt = __webpack_require__(51);
	var _ = __webpack_require__(49);

	// Bits per digit
	var dbits;

	// JavaScript engine analysis
	var canary = 0xdeadbeefcafe;
	var j_lm = ((canary & 0xffffff) == 0xefcafe);

	// (public) Constructor
	function BigInteger(a, b) {
	    if (a != null) {
	        if ("number" == typeof a) {
	            this.fromNumber(a, b);
	        } else if (Buffer.isBuffer(a)) {
	            this.fromBuffer(a);
	        } else if (b == null && "string" != typeof a) {
	            this.fromByteArray(a);
	        } else {
	            this.fromString(a, b);
	        }
	    }
	}

	// return new, unset BigInteger
	function nbi() {
	    return new BigInteger(null);
	}

	// am: Compute w_j += (x*this_i), propagate carries,
	// c is initial carry, returns final carry.
	// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
	// We need to select the fastest one that works in this environment.

	// am1: use a single mult and divide to get the high bits,
	// max digit bits should be 26 because
	// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
	function am1(i, x, w, j, c, n) {
	    while (--n >= 0) {
	        var v = x * this[i++] + w[j] + c;
	        c = Math.floor(v / 0x4000000);
	        w[j++] = v & 0x3ffffff;
	    }
	    return c;
	}
	// am2 avoids a big mult-and-extract completely.
	// Max digit bits should be <= 30 because we do bitwise ops
	// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
	function am2(i, x, w, j, c, n) {
	    var xl = x & 0x7fff, xh = x >> 15;
	    while (--n >= 0) {
	        var l = this[i] & 0x7fff;
	        var h = this[i++] >> 15;
	        var m = xh * l + h * xl;
	        l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
	        c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
	        w[j++] = l & 0x3fffffff;
	    }
	    return c;
	}
	// Alternately, set max digit bits to 28 since some
	// browsers slow down when dealing with 32-bit numbers.
	function am3(i, x, w, j, c, n) {
	    var xl = x & 0x3fff, xh = x >> 14;
	    while (--n >= 0) {
	        var l = this[i] & 0x3fff;
	        var h = this[i++] >> 14;
	        var m = xh * l + h * xl;
	        l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
	        c = (l >> 28) + (m >> 14) + xh * h;
	        w[j++] = l & 0xfffffff;
	    }
	    return c;
	}

	// We need to select the fastest one that works in this environment. 
	//if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
	//	BigInteger.prototype.am = am2;
	//	dbits = 30;
	//} else if (j_lm && (navigator.appName != "Netscape")) {
	//	BigInteger.prototype.am = am1;
	//	dbits = 26;
	//} else { // Mozilla/Netscape seems to prefer am3
	//	BigInteger.prototype.am = am3;
	//	dbits = 28;
	//}

	// For node.js, we pick am3 with max dbits to 28.
	BigInteger.prototype.am = am3;
	dbits = 28;

	BigInteger.prototype.DB = dbits;
	BigInteger.prototype.DM = ((1 << dbits) - 1);
	BigInteger.prototype.DV = (1 << dbits);

	var BI_FP = 52;
	BigInteger.prototype.FV = Math.pow(2, BI_FP);
	BigInteger.prototype.F1 = BI_FP - dbits;
	BigInteger.prototype.F2 = 2 * dbits - BI_FP;

	// Digit conversions
	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	var BI_RC = new Array();
	var rr, vv;
	rr = "0".charCodeAt(0);
	for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
	rr = "a".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
	rr = "A".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

	function int2char(n) {
	    return BI_RM.charAt(n);
	}
	function intAt(s, i) {
	    var c = BI_RC[s.charCodeAt(i)];
	    return (c == null) ? -1 : c;
	}

	// (protected) copy this to r
	function bnpCopyTo(r) {
	    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
	    r.t = this.t;
	    r.s = this.s;
	}

	// (protected) set from integer value x, -DV <= x < DV
	function bnpFromInt(x) {
	    this.t = 1;
	    this.s = (x < 0) ? -1 : 0;
	    if (x > 0) this[0] = x;
	    else if (x < -1) this[0] = x + DV;
	    else this.t = 0;
	}

	// return bigint initialized to value
	function nbv(i) {
	    var r = nbi();
	    r.fromInt(i);
	    return r;
	}

	// (protected) set from string and radix
	function bnpFromString(data, radix, unsigned) {
	    var k;
	    switch (radix) {
	        case 2:
	            k = 1;
	            break;
	        case 4:
	            k = 2;
	            break;
	        case 8:
	            k = 3;
	            break;
	        case 16:
	            k = 4;
	            break;
	        case 32:
	            k = 5;
	            break;
	        case 256:
	            k = 8;
	            break;
	        default:
	            this.fromRadix(data, radix);
	            return;
	    }

	    this.t = 0;
	    this.s = 0;

	    var i = data.length;
	    var mi = false;
	    var sh = 0;

	    while (--i >= 0) {
	        var x = (k == 8) ? data[i] & 0xff : intAt(data, i);
	        if (x < 0) {
	            if (data.charAt(i) == "-") mi = true;
	            continue;
	        }
	        mi = false;
	        if (sh === 0)
	            this[this.t++] = x;
	        else if (sh + k > this.DB) {
	            this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
	            this[this.t++] = (x >> (this.DB - sh));
	        }
	        else
	            this[this.t - 1] |= x << sh;
	        sh += k;
	        if (sh >= this.DB) sh -= this.DB;
	    }
	    if ((!unsigned) && k == 8 && (data[0] & 0x80) != 0) {
	        this.s = -1;
	        if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
	    }
	    this.clamp();
	    if (mi) BigInteger.ZERO.subTo(this, this);
	}

	function bnpFromByteArray(a, unsigned) {
	    this.fromString(a, 256, unsigned)
	}

	function bnpFromBuffer(a) {
	    this.fromString(a, 256, true)
	}

	// (protected) clamp off excess high words
	function bnpClamp() {
	    var c = this.s & this.DM;
	    while (this.t > 0 && this[this.t - 1] == c) --this.t;
	}

	// (public) return string representation in given radix
	function bnToString(b) {
	    if (this.s < 0) return "-" + this.negate().toString(b);
	    var k;
	    if (b == 16) k = 4;
	    else if (b == 8) k = 3;
	    else if (b == 2) k = 1;
	    else if (b == 32) k = 5;
	    else if (b == 4) k = 2;
	    else return this.toRadix(b);
	    var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
	    var p = this.DB - (i * this.DB) % k;
	    if (i-- > 0) {
	        if (p < this.DB && (d = this[i] >> p) > 0) {
	            m = true;
	            r = int2char(d);
	        }
	        while (i >= 0) {
	            if (p < k) {
	                d = (this[i] & ((1 << p) - 1)) << (k - p);
	                d |= this[--i] >> (p += this.DB - k);
	            }
	            else {
	                d = (this[i] >> (p -= k)) & km;
	                if (p <= 0) {
	                    p += this.DB;
	                    --i;
	                }
	            }
	            if (d > 0) m = true;
	            if (m) r += int2char(d);
	        }
	    }
	    return m ? r : "0";
	}

	// (public) -this
	function bnNegate() {
	    var r = nbi();
	    BigInteger.ZERO.subTo(this, r);
	    return r;
	}

	// (public) |this|
	function bnAbs() {
	    return (this.s < 0) ? this.negate() : this;
	}

	// (public) return + if this > a, - if this < a, 0 if equal
	function bnCompareTo(a) {
	    var r = this.s - a.s;
	    if (r != 0) return r;
	    var i = this.t;
	    r = i - a.t;
	    if (r != 0) return (this.s < 0) ? -r : r;
	    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
	    return 0;
	}

	// returns bit length of the integer x
	function nbits(x) {
	    var r = 1, t;
	    if ((t = x >>> 16) != 0) {
	        x = t;
	        r += 16;
	    }
	    if ((t = x >> 8) != 0) {
	        x = t;
	        r += 8;
	    }
	    if ((t = x >> 4) != 0) {
	        x = t;
	        r += 4;
	    }
	    if ((t = x >> 2) != 0) {
	        x = t;
	        r += 2;
	    }
	    if ((t = x >> 1) != 0) {
	        x = t;
	        r += 1;
	    }
	    return r;
	}

	// (public) return the number of bits in "this"
	function bnBitLength() {
	    if (this.t <= 0) return 0;
	    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
	}

	// (protected) r = this << n*DB
	function bnpDLShiftTo(n, r) {
	    var i;
	    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
	    for (i = n - 1; i >= 0; --i) r[i] = 0;
	    r.t = this.t + n;
	    r.s = this.s;
	}

	// (protected) r = this >> n*DB
	function bnpDRShiftTo(n, r) {
	    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
	    r.t = Math.max(this.t - n, 0);
	    r.s = this.s;
	}

	// (protected) r = this << n
	function bnpLShiftTo(n, r) {
	    var bs = n % this.DB;
	    var cbs = this.DB - bs;
	    var bm = (1 << cbs) - 1;
	    var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
	    for (i = this.t - 1; i >= 0; --i) {
	        r[i + ds + 1] = (this[i] >> cbs) | c;
	        c = (this[i] & bm) << bs;
	    }
	    for (i = ds - 1; i >= 0; --i) r[i] = 0;
	    r[ds] = c;
	    r.t = this.t + ds + 1;
	    r.s = this.s;
	    r.clamp();
	}

	// (protected) r = this >> n
	function bnpRShiftTo(n, r) {
	    r.s = this.s;
	    var ds = Math.floor(n / this.DB);
	    if (ds >= this.t) {
	        r.t = 0;
	        return;
	    }
	    var bs = n % this.DB;
	    var cbs = this.DB - bs;
	    var bm = (1 << bs) - 1;
	    r[0] = this[ds] >> bs;
	    for (var i = ds + 1; i < this.t; ++i) {
	        r[i - ds - 1] |= (this[i] & bm) << cbs;
	        r[i - ds] = this[i] >> bs;
	    }
	    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
	    r.t = this.t - ds;
	    r.clamp();
	}

	// (protected) r = this - a
	function bnpSubTo(a, r) {
	    var i = 0, c = 0, m = Math.min(a.t, this.t);
	    while (i < m) {
	        c += this[i] - a[i];
	        r[i++] = c & this.DM;
	        c >>= this.DB;
	    }
	    if (a.t < this.t) {
	        c -= a.s;
	        while (i < this.t) {
	            c += this[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c += this.s;
	    }
	    else {
	        c += this.s;
	        while (i < a.t) {
	            c -= a[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c -= a.s;
	    }
	    r.s = (c < 0) ? -1 : 0;
	    if (c < -1) r[i++] = this.DV + c;
	    else if (c > 0) r[i++] = c;
	    r.t = i;
	    r.clamp();
	}

	// (protected) r = this * a, r != this,a (HAC 14.12)
	// "this" should be the larger one if appropriate.
	function bnpMultiplyTo(a, r) {
	    var x = this.abs(), y = a.abs();
	    var i = x.t;
	    r.t = i + y.t;
	    while (--i >= 0) r[i] = 0;
	    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
	    r.s = 0;
	    r.clamp();
	    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
	}

	// (protected) r = this^2, r != this (HAC 14.16)
	function bnpSquareTo(r) {
	    var x = this.abs();
	    var i = r.t = 2 * x.t;
	    while (--i >= 0) r[i] = 0;
	    for (i = 0; i < x.t - 1; ++i) {
	        var c = x.am(i, x[i], r, 2 * i, 0, 1);
	        if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
	            r[i + x.t] -= x.DV;
	            r[i + x.t + 1] = 1;
	        }
	    }
	    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
	    r.s = 0;
	    r.clamp();
	}

	// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
	// r != q, this != m.  q or r may be null.
	function bnpDivRemTo(m, q, r) {
	    var pm = m.abs();
	    if (pm.t <= 0) return;
	    var pt = this.abs();
	    if (pt.t < pm.t) {
	        if (q != null) q.fromInt(0);
	        if (r != null) this.copyTo(r);
	        return;
	    }
	    if (r == null) r = nbi();
	    var y = nbi(), ts = this.s, ms = m.s;
	    var nsh = this.DB - nbits(pm[pm.t - 1]);	// normalize modulus
	    if (nsh > 0) {
	        pm.lShiftTo(nsh, y);
	        pt.lShiftTo(nsh, r);
	    }
	    else {
	        pm.copyTo(y);
	        pt.copyTo(r);
	    }
	    var ys = y.t;
	    var y0 = y[ys - 1];
	    if (y0 === 0) return;
	    var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
	    var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
	    var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
	    y.dlShiftTo(j, t);
	    if (r.compareTo(t) >= 0) {
	        r[r.t++] = 1;
	        r.subTo(t, r);
	    }
	    BigInteger.ONE.dlShiftTo(ys, t);
	    t.subTo(y, y);	// "negative" y so we can replace sub with am later
	    while (y.t < ys) y[y.t++] = 0;
	    while (--j >= 0) {
	        // Estimate quotient digit
	        var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
	        if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {	// Try it out
	            y.dlShiftTo(j, t);
	            r.subTo(t, r);
	            while (r[i] < --qd) r.subTo(t, r);
	        }
	    }
	    if (q != null) {
	        r.drShiftTo(ys, q);
	        if (ts != ms) BigInteger.ZERO.subTo(q, q);
	    }
	    r.t = ys;
	    r.clamp();
	    if (nsh > 0) r.rShiftTo(nsh, r);	// Denormalize remainder
	    if (ts < 0) BigInteger.ZERO.subTo(r, r);
	}

	// (public) this mod a
	function bnMod(a) {
	    var r = nbi();
	    this.abs().divRemTo(a, null, r);
	    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
	    return r;
	}

	// Modular reduction using "classic" algorithm
	function Classic(m) {
	    this.m = m;
	}
	function cConvert(x) {
	    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
	    else return x;
	}
	function cRevert(x) {
	    return x;
	}
	function cReduce(x) {
	    x.divRemTo(this.m, null, x);
	}
	function cMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	    this.reduce(r);
	}
	function cSqrTo(x, r) {
	    x.squareTo(r);
	    this.reduce(r);
	}

	Classic.prototype.convert = cConvert;
	Classic.prototype.revert = cRevert;
	Classic.prototype.reduce = cReduce;
	Classic.prototype.mulTo = cMulTo;
	Classic.prototype.sqrTo = cSqrTo;

	// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
	// justification:
	//         xy == 1 (mod m)
	//         xy =  1+km
	//   xy(2-xy) = (1+km)(1-km)
	// x[y(2-xy)] = 1-k^2m^2
	// x[y(2-xy)] == 1 (mod m^2)
	// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
	// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
	// JS multiply "overflows" differently from C/C++, so care is needed here.
	function bnpInvDigit() {
	    if (this.t < 1) return 0;
	    var x = this[0];
	    if ((x & 1) === 0) return 0;
	    var y = x & 3;		// y == 1/x mod 2^2
	    y = (y * (2 - (x & 0xf) * y)) & 0xf;	// y == 1/x mod 2^4
	    y = (y * (2 - (x & 0xff) * y)) & 0xff;	// y == 1/x mod 2^8
	    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;	// y == 1/x mod 2^16
	    // last step - calculate inverse mod DV directly;
	    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
	    y = (y * (2 - x * y % this.DV)) % this.DV;		// y == 1/x mod 2^dbits
	    // we really want the negative inverse, and -DV < y < DV
	    return (y > 0) ? this.DV - y : -y;
	}

	// Montgomery reduction
	function Montgomery(m) {
	    this.m = m;
	    this.mp = m.invDigit();
	    this.mpl = this.mp & 0x7fff;
	    this.mph = this.mp >> 15;
	    this.um = (1 << (m.DB - 15)) - 1;
	    this.mt2 = 2 * m.t;
	}

	// xR mod m
	function montConvert(x) {
	    var r = nbi();
	    x.abs().dlShiftTo(this.m.t, r);
	    r.divRemTo(this.m, null, r);
	    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
	    return r;
	}

	// x/R mod m
	function montRevert(x) {
	    var r = nbi();
	    x.copyTo(r);
	    this.reduce(r);
	    return r;
	}

	// x = x/R mod m (HAC 14.32)
	function montReduce(x) {
	    while (x.t <= this.mt2)	// pad x so am has enough room later
	        x[x.t++] = 0;
	    for (var i = 0; i < this.m.t; ++i) {
	        // faster way of calculating u0 = x[i]*mp mod DV
	        var j = x[i] & 0x7fff;
	        var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
	        // use am to combine the multiply-shift-add into one call
	        j = i + this.m.t;
	        x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
	        // propagate carry
	        while (x[j] >= x.DV) {
	            x[j] -= x.DV;
	            x[++j]++;
	        }
	    }
	    x.clamp();
	    x.drShiftTo(this.m.t, x);
	    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	// r = "x^2/R mod m"; x != r
	function montSqrTo(x, r) {
	    x.squareTo(r);
	    this.reduce(r);
	}

	// r = "xy/R mod m"; x,y != r
	function montMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	    this.reduce(r);
	}

	Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;
	Montgomery.prototype.reduce = montReduce;
	Montgomery.prototype.mulTo = montMulTo;
	Montgomery.prototype.sqrTo = montSqrTo;

	// (protected) true iff this is even
	function bnpIsEven() {
	    return ((this.t > 0) ? (this[0] & 1) : this.s) === 0;
	}

	// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
	function bnpExp(e, z) {
	    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
	    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
	    g.copyTo(r);
	    while (--i >= 0) {
	        z.sqrTo(r, r2);
	        if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
	        else {
	            var t = r;
	            r = r2;
	            r2 = t;
	        }
	    }
	    return z.revert(r);
	}

	// (public) this^e % m, 0 <= e < 2^32
	function bnModPowInt(e, m) {
	    var z;
	    if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
	    return this.exp(e, z);
	}

	// Copyright (c) 2005-2009  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.

	// Extended JavaScript BN functions, required for RSA private ops.

	// Version 1.1: new BigInteger("0", 10) returns "proper" zero
	// Version 1.2: square() API, isProbablePrime fix

	//(public)
	function bnClone() {
	    var r = nbi();
	    this.copyTo(r);
	    return r;
	}

	//(public) return value as integer
	function bnIntValue() {
	    if (this.s < 0) {
	        if (this.t == 1) return this[0] - this.DV;
	        else if (this.t === 0) return -1;
	    }
	    else if (this.t == 1) return this[0];
	    else if (this.t === 0) return 0;
	// assumes 16 < DB < 32
	    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
	}

	//(public) return value as byte
	function bnByteValue() {
	    return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
	}

	//(public) return value as short (assumes DB>=16)
	function bnShortValue() {
	    return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
	}

	//(protected) return x s.t. r^x < DV
	function bnpChunkSize(r) {
	    return Math.floor(Math.LN2 * this.DB / Math.log(r));
	}

	//(public) 0 if this === 0, 1 if this > 0
	function bnSigNum() {
	    if (this.s < 0) return -1;
	    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
	    else return 1;
	}

	//(protected) convert to radix string
	function bnpToRadix(b) {
	    if (b == null) b = 10;
	    if (this.signum() === 0 || b < 2 || b > 36) return "0";
	    var cs = this.chunkSize(b);
	    var a = Math.pow(b, cs);
	    var d = nbv(a), y = nbi(), z = nbi(), r = "";
	    this.divRemTo(d, y, z);
	    while (y.signum() > 0) {
	        r = (a + z.intValue()).toString(b).substr(1) + r;
	        y.divRemTo(d, y, z);
	    }
	    return z.intValue().toString(b) + r;
	}

	//(protected) convert from radix string
	function bnpFromRadix(s, b) {
	    this.fromInt(0);
	    if (b == null) b = 10;
	    var cs = this.chunkSize(b);
	    var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
	    for (var i = 0; i < s.length; ++i) {
	        var x = intAt(s, i);
	        if (x < 0) {
	            if (s.charAt(i) == "-" && this.signum() === 0) mi = true;
	            continue;
	        }
	        w = b * w + x;
	        if (++j >= cs) {
	            this.dMultiply(d);
	            this.dAddOffset(w, 0);
	            j = 0;
	            w = 0;
	        }
	    }
	    if (j > 0) {
	        this.dMultiply(Math.pow(b, j));
	        this.dAddOffset(w, 0);
	    }
	    if (mi) BigInteger.ZERO.subTo(this, this);
	}

	//(protected) alternate constructor
	function bnpFromNumber(a, b) {
	    if ("number" == typeof b) {
	        // new BigInteger(int,int,RNG)
	        if (a < 2) this.fromInt(1);
	        else {
	            this.fromNumber(a);
	            if (!this.testBit(a - 1))	// force MSB set
	                this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
	            if (this.isEven()) this.dAddOffset(1, 0); // force odd
	            while (!this.isProbablePrime(b)) {
	                this.dAddOffset(2, 0);
	                if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
	            }
	        }
	    } else {
	        // new BigInteger(int,RNG)
	        var x = crypt.randomBytes((a >> 3) + 1)
	        var t = a & 7;

	        if (t > 0)
	            x[0] &= ((1 << t) - 1);
	        else
	            x[0] = 0;

	        this.fromByteArray(x);
	    }
	}

	//(public) convert to bigendian byte array
	function bnToByteArray() {
	    var i = this.t, r = new Array();
	    r[0] = this.s;
	    var p = this.DB - (i * this.DB) % 8, d, k = 0;
	    if (i-- > 0) {
	        if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
	            r[k++] = d | (this.s << (this.DB - p));
	        while (i >= 0) {
	            if (p < 8) {
	                d = (this[i] & ((1 << p) - 1)) << (8 - p);
	                d |= this[--i] >> (p += this.DB - 8);
	            }
	            else {
	                d = (this[i] >> (p -= 8)) & 0xff;
	                if (p <= 0) {
	                    p += this.DB;
	                    --i;
	                }
	            }
	            if ((d & 0x80) != 0) d |= -256;
	            if (k === 0 && (this.s & 0x80) != (d & 0x80)) ++k;
	            if (k > 0 || d != this.s) r[k++] = d;
	        }
	    }
	    return r;
	}

	/**
	 * return Buffer object
	 * @param trim {boolean} slice buffer if first element == 0
	 * @returns {Buffer}
	 */
	function bnToBuffer(trimOrSize) {
	    var res = new Buffer(this.toByteArray());
	    if (trimOrSize === true && res[0] === 0) {
	        res = res.slice(1);
	    } else if (_.isNumber(trimOrSize)) {
	        if (res.length > trimOrSize) {
	            for (var i = 0; i < res.length - trimOrSize; i++) {
	                if (res[i] !== 0) {
	                    return null;
	                }
	            }
	            return res.slice(res.length - trimOrSize);
	        } else if (res.length < trimOrSize) {
	            var padded = new Buffer(trimOrSize);
	            padded.fill(0, 0, trimOrSize - res.length);
	            res.copy(padded, trimOrSize - res.length);
	            return padded;
	        }
	    }
	    return res;
	}

	function bnEquals(a) {
	    return (this.compareTo(a) == 0);
	}
	function bnMin(a) {
	    return (this.compareTo(a) < 0) ? this : a;
	}
	function bnMax(a) {
	    return (this.compareTo(a) > 0) ? this : a;
	}

	//(protected) r = this op a (bitwise)
	function bnpBitwiseTo(a, op, r) {
	    var i, f, m = Math.min(a.t, this.t);
	    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
	    if (a.t < this.t) {
	        f = a.s & this.DM;
	        for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
	        r.t = this.t;
	    }
	    else {
	        f = this.s & this.DM;
	        for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
	        r.t = a.t;
	    }
	    r.s = op(this.s, a.s);
	    r.clamp();
	}

	//(public) this & a
	function op_and(x, y) {
	    return x & y;
	}
	function bnAnd(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_and, r);
	    return r;
	}

	//(public) this | a
	function op_or(x, y) {
	    return x | y;
	}
	function bnOr(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_or, r);
	    return r;
	}

	//(public) this ^ a
	function op_xor(x, y) {
	    return x ^ y;
	}
	function bnXor(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_xor, r);
	    return r;
	}

	//(public) this & ~a
	function op_andnot(x, y) {
	    return x & ~y;
	}
	function bnAndNot(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_andnot, r);
	    return r;
	}

	//(public) ~this
	function bnNot() {
	    var r = nbi();
	    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
	    r.t = this.t;
	    r.s = ~this.s;
	    return r;
	}

	//(public) this << n
	function bnShiftLeft(n) {
	    var r = nbi();
	    if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
	    return r;
	}

	//(public) this >> n
	function bnShiftRight(n) {
	    var r = nbi();
	    if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
	    return r;
	}

	//return index of lowest 1-bit in x, x < 2^31
	function lbit(x) {
	    if (x === 0) return -1;
	    var r = 0;
	    if ((x & 0xffff) === 0) {
	        x >>= 16;
	        r += 16;
	    }
	    if ((x & 0xff) === 0) {
	        x >>= 8;
	        r += 8;
	    }
	    if ((x & 0xf) === 0) {
	        x >>= 4;
	        r += 4;
	    }
	    if ((x & 3) === 0) {
	        x >>= 2;
	        r += 2;
	    }
	    if ((x & 1) === 0) ++r;
	    return r;
	}

	//(public) returns index of lowest 1-bit (or -1 if none)
	function bnGetLowestSetBit() {
	    for (var i = 0; i < this.t; ++i)
	        if (this[i] != 0) return i * this.DB + lbit(this[i]);
	    if (this.s < 0) return this.t * this.DB;
	    return -1;
	}

	//return number of 1 bits in x
	function cbit(x) {
	    var r = 0;
	    while (x != 0) {
	        x &= x - 1;
	        ++r;
	    }
	    return r;
	}

	//(public) return number of set bits
	function bnBitCount() {
	    var r = 0, x = this.s & this.DM;
	    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
	    return r;
	}

	//(public) true iff nth bit is set
	function bnTestBit(n) {
	    var j = Math.floor(n / this.DB);
	    if (j >= this.t) return (this.s != 0);
	    return ((this[j] & (1 << (n % this.DB))) != 0);
	}

	//(protected) this op (1<<n)
	function bnpChangeBit(n, op) {
	    var r = BigInteger.ONE.shiftLeft(n);
	    this.bitwiseTo(r, op, r);
	    return r;
	}

	//(public) this | (1<<n)
	function bnSetBit(n) {
	    return this.changeBit(n, op_or);
	}

	//(public) this & ~(1<<n)
	function bnClearBit(n) {
	    return this.changeBit(n, op_andnot);
	}

	//(public) this ^ (1<<n)
	function bnFlipBit(n) {
	    return this.changeBit(n, op_xor);
	}

	//(protected) r = this + a
	function bnpAddTo(a, r) {
	    var i = 0, c = 0, m = Math.min(a.t, this.t);
	    while (i < m) {
	        c += this[i] + a[i];
	        r[i++] = c & this.DM;
	        c >>= this.DB;
	    }
	    if (a.t < this.t) {
	        c += a.s;
	        while (i < this.t) {
	            c += this[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c += this.s;
	    }
	    else {
	        c += this.s;
	        while (i < a.t) {
	            c += a[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c += a.s;
	    }
	    r.s = (c < 0) ? -1 : 0;
	    if (c > 0) r[i++] = c;
	    else if (c < -1) r[i++] = this.DV + c;
	    r.t = i;
	    r.clamp();
	}

	//(public) this + a
	function bnAdd(a) {
	    var r = nbi();
	    this.addTo(a, r);
	    return r;
	}

	//(public) this - a
	function bnSubtract(a) {
	    var r = nbi();
	    this.subTo(a, r);
	    return r;
	}

	//(public) this * a
	function bnMultiply(a) {
	    var r = nbi();
	    this.multiplyTo(a, r);
	    return r;
	}

	// (public) this^2
	function bnSquare() {
	    var r = nbi();
	    this.squareTo(r);
	    return r;
	}

	//(public) this / a
	function bnDivide(a) {
	    var r = nbi();
	    this.divRemTo(a, r, null);
	    return r;
	}

	//(public) this % a
	function bnRemainder(a) {
	    var r = nbi();
	    this.divRemTo(a, null, r);
	    return r;
	}

	//(public) [this/a,this%a]
	function bnDivideAndRemainder(a) {
	    var q = nbi(), r = nbi();
	    this.divRemTo(a, q, r);
	    return new Array(q, r);
	}

	//(protected) this *= n, this >= 0, 1 < n < DV
	function bnpDMultiply(n) {
	    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
	    ++this.t;
	    this.clamp();
	}

	//(protected) this += n << w words, this >= 0
	function bnpDAddOffset(n, w) {
	    if (n === 0) return;
	    while (this.t <= w) this[this.t++] = 0;
	    this[w] += n;
	    while (this[w] >= this.DV) {
	        this[w] -= this.DV;
	        if (++w >= this.t) this[this.t++] = 0;
	        ++this[w];
	    }
	}

	//A "null" reducer
	function NullExp() {
	}
	function nNop(x) {
	    return x;
	}
	function nMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	}
	function nSqrTo(x, r) {
	    x.squareTo(r);
	}

	NullExp.prototype.convert = nNop;
	NullExp.prototype.revert = nNop;
	NullExp.prototype.mulTo = nMulTo;
	NullExp.prototype.sqrTo = nSqrTo;

	//(public) this^e
	function bnPow(e) {
	    return this.exp(e, new NullExp());
	}

	//(protected) r = lower n words of "this * a", a.t <= n
	//"this" should be the larger one if appropriate.
	function bnpMultiplyLowerTo(a, n, r) {
	    var i = Math.min(this.t + a.t, n);
	    r.s = 0; // assumes a,this >= 0
	    r.t = i;
	    while (i > 0) r[--i] = 0;
	    var j;
	    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
	    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
	    r.clamp();
	}

	//(protected) r = "this * a" without lower n words, n > 0
	//"this" should be the larger one if appropriate.
	function bnpMultiplyUpperTo(a, n, r) {
	    --n;
	    var i = r.t = this.t + a.t - n;
	    r.s = 0; // assumes a,this >= 0
	    while (--i >= 0) r[i] = 0;
	    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
	        r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
	    r.clamp();
	    r.drShiftTo(1, r);
	}

	//Barrett modular reduction
	function Barrett(m) {
	// setup Barrett
	    this.r2 = nbi();
	    this.q3 = nbi();
	    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
	    this.mu = this.r2.divide(m);
	    this.m = m;
	}

	function barrettConvert(x) {
	    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
	    else if (x.compareTo(this.m) < 0) return x;
	    else {
	        var r = nbi();
	        x.copyTo(r);
	        this.reduce(r);
	        return r;
	    }
	}

	function barrettRevert(x) {
	    return x;
	}

	//x = x mod m (HAC 14.42)
	function barrettReduce(x) {
	    x.drShiftTo(this.m.t - 1, this.r2);
	    if (x.t > this.m.t + 1) {
	        x.t = this.m.t + 1;
	        x.clamp();
	    }
	    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
	    this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
	    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
	    x.subTo(this.r2, x);
	    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	//r = x^2 mod m; x != r
	function barrettSqrTo(x, r) {
	    x.squareTo(r);
	    this.reduce(r);
	}

	//r = x*y mod m; x,y != r
	function barrettMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	    this.reduce(r);
	}

	Barrett.prototype.convert = barrettConvert;
	Barrett.prototype.revert = barrettRevert;
	Barrett.prototype.reduce = barrettReduce;
	Barrett.prototype.mulTo = barrettMulTo;
	Barrett.prototype.sqrTo = barrettSqrTo;

	//(public) this^e % m (HAC 14.85)
	function bnModPow(e, m) {
	    var i = e.bitLength(), k, r = nbv(1), z;
	    if (i <= 0) return r;
	    else if (i < 18) k = 1;
	    else if (i < 48) k = 3;
	    else if (i < 144) k = 4;
	    else if (i < 768) k = 5;
	    else k = 6;
	    if (i < 8)
	        z = new Classic(m);
	    else if (m.isEven())
	        z = new Barrett(m);
	    else
	        z = new Montgomery(m);

	// precomputation
	    var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
	    g[1] = z.convert(this);
	    if (k > 1) {
	        var g2 = nbi();
	        z.sqrTo(g[1], g2);
	        while (n <= km) {
	            g[n] = nbi();
	            z.mulTo(g2, g[n - 2], g[n]);
	            n += 2;
	        }
	    }

	    var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
	    i = nbits(e[j]) - 1;
	    while (j >= 0) {
	        if (i >= k1) w = (e[j] >> (i - k1)) & km;
	        else {
	            w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
	            if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
	        }

	        n = k;
	        while ((w & 1) === 0) {
	            w >>= 1;
	            --n;
	        }
	        if ((i -= n) < 0) {
	            i += this.DB;
	            --j;
	        }
	        if (is1) {	// ret == 1, don't bother squaring or multiplying it
	            g[w].copyTo(r);
	            is1 = false;
	        }
	        else {
	            while (n > 1) {
	                z.sqrTo(r, r2);
	                z.sqrTo(r2, r);
	                n -= 2;
	            }
	            if (n > 0) z.sqrTo(r, r2); else {
	                t = r;
	                r = r2;
	                r2 = t;
	            }
	            z.mulTo(r2, g[w], r);
	        }

	        while (j >= 0 && (e[j] & (1 << i)) === 0) {
	            z.sqrTo(r, r2);
	            t = r;
	            r = r2;
	            r2 = t;
	            if (--i < 0) {
	                i = this.DB - 1;
	                --j;
	            }
	        }
	    }
	    return z.revert(r);
	}

	//(public) gcd(this,a) (HAC 14.54)
	function bnGCD(a) {
	    var x = (this.s < 0) ? this.negate() : this.clone();
	    var y = (a.s < 0) ? a.negate() : a.clone();
	    if (x.compareTo(y) < 0) {
	        var t = x;
	        x = y;
	        y = t;
	    }
	    var i = x.getLowestSetBit(), g = y.getLowestSetBit();
	    if (g < 0) return x;
	    if (i < g) g = i;
	    if (g > 0) {
	        x.rShiftTo(g, x);
	        y.rShiftTo(g, y);
	    }
	    while (x.signum() > 0) {
	        if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
	        if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
	        if (x.compareTo(y) >= 0) {
	            x.subTo(y, x);
	            x.rShiftTo(1, x);
	        }
	        else {
	            y.subTo(x, y);
	            y.rShiftTo(1, y);
	        }
	    }
	    if (g > 0) y.lShiftTo(g, y);
	    return y;
	}

	//(protected) this % n, n < 2^26
	function bnpModInt(n) {
	    if (n <= 0) return 0;
	    var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
	    if (this.t > 0)
	        if (d === 0) r = this[0] % n;
	        else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
	    return r;
	}

	//(public) 1/this % m (HAC 14.61)
	function bnModInverse(m) {
	    var ac = m.isEven();
	    if ((this.isEven() && ac) || m.signum() === 0) return BigInteger.ZERO;
	    var u = m.clone(), v = this.clone();
	    var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
	    while (u.signum() != 0) {
	        while (u.isEven()) {
	            u.rShiftTo(1, u);
	            if (ac) {
	                if (!a.isEven() || !b.isEven()) {
	                    a.addTo(this, a);
	                    b.subTo(m, b);
	                }
	                a.rShiftTo(1, a);
	            }
	            else if (!b.isEven()) b.subTo(m, b);
	            b.rShiftTo(1, b);
	        }
	        while (v.isEven()) {
	            v.rShiftTo(1, v);
	            if (ac) {
	                if (!c.isEven() || !d.isEven()) {
	                    c.addTo(this, c);
	                    d.subTo(m, d);
	                }
	                c.rShiftTo(1, c);
	            }
	            else if (!d.isEven()) d.subTo(m, d);
	            d.rShiftTo(1, d);
	        }
	        if (u.compareTo(v) >= 0) {
	            u.subTo(v, u);
	            if (ac) a.subTo(c, a);
	            b.subTo(d, b);
	        }
	        else {
	            v.subTo(u, v);
	            if (ac) c.subTo(a, c);
	            d.subTo(b, d);
	        }
	    }
	    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
	    if (d.compareTo(m) >= 0) return d.subtract(m);
	    if (d.signum() < 0) d.addTo(m, d); else return d;
	    if (d.signum() < 0) return d.add(m); else return d;
	}

	var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
	var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

	//(public) test primality with certainty >= 1-.5^t
	function bnIsProbablePrime(t) {
	    var i, x = this.abs();
	    if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
	        for (i = 0; i < lowprimes.length; ++i)
	            if (x[0] == lowprimes[i]) return true;
	        return false;
	    }
	    if (x.isEven()) return false;
	    i = 1;
	    while (i < lowprimes.length) {
	        var m = lowprimes[i], j = i + 1;
	        while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
	        m = x.modInt(m);
	        while (i < j) if (m % lowprimes[i++] === 0) return false;
	    }
	    return x.millerRabin(t);
	}

	//(protected) true if probably prime (HAC 4.24, Miller-Rabin)
	function bnpMillerRabin(t) {
	    var n1 = this.subtract(BigInteger.ONE);
	    var k = n1.getLowestSetBit();
	    if (k <= 0) return false;
	    var r = n1.shiftRight(k);
	    t = (t + 1) >> 1;
	    if (t > lowprimes.length) t = lowprimes.length;
	    var a = nbi();
	    for (var i = 0; i < t; ++i) {
	        //Pick bases at random, instead of starting at 2
	        a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
	        var y = a.modPow(r, this);
	        if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
	            var j = 1;
	            while (j++ < k && y.compareTo(n1) != 0) {
	                y = y.modPowInt(2, this);
	                if (y.compareTo(BigInteger.ONE) === 0) return false;
	            }
	            if (y.compareTo(n1) != 0) return false;
	        }
	    }
	    return true;
	}

	// protected
	BigInteger.prototype.copyTo = bnpCopyTo;
	BigInteger.prototype.fromInt = bnpFromInt;
	BigInteger.prototype.fromString = bnpFromString;
	BigInteger.prototype.fromByteArray = bnpFromByteArray;
	BigInteger.prototype.fromBuffer = bnpFromBuffer;
	BigInteger.prototype.clamp = bnpClamp;
	BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
	BigInteger.prototype.drShiftTo = bnpDRShiftTo;
	BigInteger.prototype.lShiftTo = bnpLShiftTo;
	BigInteger.prototype.rShiftTo = bnpRShiftTo;
	BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;
	BigInteger.prototype.squareTo = bnpSquareTo;
	BigInteger.prototype.divRemTo = bnpDivRemTo;
	BigInteger.prototype.invDigit = bnpInvDigit;
	BigInteger.prototype.isEven = bnpIsEven;
	BigInteger.prototype.exp = bnpExp;

	BigInteger.prototype.chunkSize = bnpChunkSize;
	BigInteger.prototype.toRadix = bnpToRadix;
	BigInteger.prototype.fromRadix = bnpFromRadix;
	BigInteger.prototype.fromNumber = bnpFromNumber;
	BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
	BigInteger.prototype.changeBit = bnpChangeBit;
	BigInteger.prototype.addTo = bnpAddTo;
	BigInteger.prototype.dMultiply = bnpDMultiply;
	BigInteger.prototype.dAddOffset = bnpDAddOffset;
	BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
	BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
	BigInteger.prototype.modInt = bnpModInt;
	BigInteger.prototype.millerRabin = bnpMillerRabin;


	// public
	BigInteger.prototype.toString = bnToString;
	BigInteger.prototype.negate = bnNegate;
	BigInteger.prototype.abs = bnAbs;
	BigInteger.prototype.compareTo = bnCompareTo;
	BigInteger.prototype.bitLength = bnBitLength;
	BigInteger.prototype.mod = bnMod;
	BigInteger.prototype.modPowInt = bnModPowInt;

	BigInteger.prototype.clone = bnClone;
	BigInteger.prototype.intValue = bnIntValue;
	BigInteger.prototype.byteValue = bnByteValue;
	BigInteger.prototype.shortValue = bnShortValue;
	BigInteger.prototype.signum = bnSigNum;
	BigInteger.prototype.toByteArray = bnToByteArray;
	BigInteger.prototype.toBuffer = bnToBuffer;
	BigInteger.prototype.equals = bnEquals;
	BigInteger.prototype.min = bnMin;
	BigInteger.prototype.max = bnMax;
	BigInteger.prototype.and = bnAnd;
	BigInteger.prototype.or = bnOr;
	BigInteger.prototype.xor = bnXor;
	BigInteger.prototype.andNot = bnAndNot;
	BigInteger.prototype.not = bnNot;
	BigInteger.prototype.shiftLeft = bnShiftLeft;
	BigInteger.prototype.shiftRight = bnShiftRight;
	BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
	BigInteger.prototype.bitCount = bnBitCount;
	BigInteger.prototype.testBit = bnTestBit;
	BigInteger.prototype.setBit = bnSetBit;
	BigInteger.prototype.clearBit = bnClearBit;
	BigInteger.prototype.flipBit = bnFlipBit;
	BigInteger.prototype.add = bnAdd;
	BigInteger.prototype.subtract = bnSubtract;
	BigInteger.prototype.multiply = bnMultiply;
	BigInteger.prototype.divide = bnDivide;
	BigInteger.prototype.remainder = bnRemainder;
	BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
	BigInteger.prototype.modPow = bnModPow;
	BigInteger.prototype.modInverse = bnModInverse;
	BigInteger.prototype.pow = bnPow;
	BigInteger.prototype.gcd = bnGCD;
	BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
	BigInteger.int2char = int2char;

	// "constants"
	BigInteger.ZERO = nbv(0);
	BigInteger.ONE = nbv(1);

	// JSBN-specific extension
	BigInteger.prototype.square = bnSquare;

	//BigInteger interfaces not implemented in jsbn:

	//BigInteger(int signum, byte[] magnitude)
	//double doubleValue()
	//float floatValue()
	//int hashCode()
	//long longValue()
	//static BigInteger valueOf(long val)

	module.exports = BigInteger;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/*
	 * Utils functions
	 *
	 */

	var crypt = __webpack_require__(51);

	/**
	 * Break string str each maxLen symbols
	 * @param str
	 * @param maxLen
	 * @returns {string}
	 */
	module.exports.linebrk = function (str, maxLen) {
	    var res = "";
	    var i = 0;
	    while (i + maxLen < str.length) {
	        res += str.substring(i, i + maxLen) + "\n";
	        i += maxLen;
	    }
	    return res + str.substring(i, str.length);
	};

	module.exports.detectEnvironment = function () {
	    if (process && process.title != 'browser') {
	        return 'node';
	    } else if (window) {
	        return 'browser';
	    }
	    return 'node';
	};

	/**
	 * Trying get a 32-bit unsigned integer from the partial buffer
	 * @param buffer
	 * @param offset
	 * @returns {Number}
	 */
	module.exports.get32IntFromBuffer = function (buffer, offset) {
	    offset = offset || 0;
	    var size = 0;
	    if ((size = buffer.length - offset) > 0) {
	        if (size >= 4) {
	            return buffer.readUInt32BE(offset);
	        } else {
	            var res = 0;
	            for (var i = offset + size, d = 0; i > offset; i--, d += 2) {
	                res += buffer[i - 1] * Math.pow(16, d);
	            }
	            return res;
	        }
	    } else {
	        return NaN;
	    }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    pkcs1: __webpack_require__(69),
	    pkcs1_oaep: __webpack_require__(70),
	    pss: __webpack_require__(71),

	    /**
	     * Check if scheme has padding methods
	     * @param scheme {string}
	     * @returns {Boolean}
	     */
	    isEncryption: function (scheme) {
	        return module.exports[scheme] && module.exports[scheme].isEncryption;
	    },

	    /**
	     * Check if scheme has sign/verify methods
	     * @param scheme {string}
	     * @returns {Boolean}
	     */
	    isSignature: function (scheme) {
	        return module.exports[scheme] && module.exports[scheme].isSignature;
	    }
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * PKCS1 padding and signature scheme
	 */

	var BigInteger = __webpack_require__(66);
	var crypt = __webpack_require__(51);
	var SIGN_INFO_HEAD = {
	    md2: new Buffer('3020300c06082a864886f70d020205000410', 'hex'),
	    md5: new Buffer('3020300c06082a864886f70d020505000410', 'hex'),
	    sha1: new Buffer('3021300906052b0e03021a05000414', 'hex'),
	    sha224: new Buffer('302d300d06096086480165030402040500041c', 'hex'),
	    sha256: new Buffer('3031300d060960864801650304020105000420', 'hex'),
	    sha384: new Buffer('3041300d060960864801650304020205000430', 'hex'),
	    sha512: new Buffer('3051300d060960864801650304020305000440', 'hex'),
	    ripemd160: new Buffer('3021300906052b2403020105000414', 'hex'),
	    rmd160: new Buffer('3021300906052b2403020105000414', 'hex')
	};

	var SIGN_ALG_TO_HASH_ALIASES = {
	    'ripemd160': 'rmd160'
	};

	var DEFAULT_HASH_FUNCTION = 'sha256';

	module.exports = {
	    isEncryption: true,
	    isSignature: true
	};

	module.exports.makeScheme = function (key, options) {
	    function Scheme(key, options) {
	        this.key = key;
	        this.options = options;
	    }

	    Scheme.prototype.maxMessageLength = function () {
	        return this.key.encryptedDataLength - 11;
	    };

	    /**
	     * Pad input Buffer to encryptedDataLength bytes, and return new Buffer
	     * alg: PKCS#1
	     * @param buffer
	     * @returns {Buffer}
	     */
	    Scheme.prototype.encPad = function (buffer, options) {
	        options = options || {};
	        var filled;
	        if (buffer.length > this.key.maxMessageLength) {
	            throw new Error("Message too long for RSA (n=" + this.key.encryptedDataLength + ", l=" + buffer.length + ")");
	        }

	        if (options.type === 1) {
	            filled = new Buffer(this.key.encryptedDataLength - buffer.length - 1);
	            filled.fill(0xff, 0, filled.length - 1);
	            filled[0] = 1;
	            filled[filled.length - 1] = 0;

	            return Buffer.concat([filled, buffer]);
	        } else {
	            filled = new Buffer(this.key.encryptedDataLength - buffer.length);
	            filled[0] = 0;
	            filled[1] = 2;
	            var rand = crypt.randomBytes(filled.length - 3);
	            for (var i = 0; i < rand.length; i++) {
	                var r = rand[i];
	                while (r === 0) { // non-zero only
	                    r = crypt.randomBytes(1)[0];
	                }
	                filled[i + 2] = r;
	            }
	            filled[filled.length - 1] = 0;
	            return Buffer.concat([filled, buffer]);
	        }
	    };

	    /**
	     * Unpad input Buffer and, if valid, return the Buffer object
	     * alg: PKCS#1 (type 2, random)
	     * @param buffer
	     * @returns {Buffer}
	     */
	    Scheme.prototype.encUnPad = function (buffer, options) {
	        options = options || {};
	        var i = 0;

	        if (buffer.length < 4) {
	            return null;
	        }

	        if (options.type === 1) {
	            if (buffer[0] !== 0 && buffer[1] !== 1) {
	                return null;
	            }
	            i = 3;
	            while (buffer[i] !== 0) {
	                if (buffer[i] != 0xFF || ++i >= buffer.length) {
	                    return null;
	                }
	            }
	        } else {
	            if (buffer[0] !== 0 && buffer[1] !== 2) {
	                return null;
	            }
	            i = 3;
	            while (buffer[i] !== 0) {
	                if (++i >= buffer.length) {
	                    return null;
	                }
	            }
	        }
	        return buffer.slice(i + 1, buffer.length);
	    };

	    Scheme.prototype.sign = function (buffer) {
	        var hashAlgorithm = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        if (this.options.environment == 'browser') {
	            hashAlgorithm = SIGN_ALG_TO_HASH_ALIASES[hashAlgorithm] || hashAlgorithm;

	            var hasher = crypt.createHash(hashAlgorithm);
	            hasher.update(buffer);
	            var hash = this.pkcs1pad(hasher.digest(), hashAlgorithm);
	            var res = this.key.$doPrivate(new BigInteger(hash)).toBuffer(this.key.encryptedDataLength);

	            return res;
	        } else {
	            var signer = crypt.createSign('RSA-' + hashAlgorithm.toUpperCase());
	            signer.update(buffer);
	            return signer.sign(this.options.rsaUtils.exportKey('private'));
	        }
	    };

	    Scheme.prototype.verify = function (buffer, signature, signature_encoding) {
	        var hashAlgorithm = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        if (this.options.environment == 'browser') {
	            hashAlgorithm = SIGN_ALG_TO_HASH_ALIASES[hashAlgorithm] || hashAlgorithm;

	            if (signature_encoding) {
	                signature = new Buffer(signature, signature_encoding);
	            }

	            var hasher = crypt.createHash(hashAlgorithm);
	            hasher.update(buffer);
	            var hash = this.pkcs1pad(hasher.digest(), hashAlgorithm);
	            var m = this.key.$doPublic(new BigInteger(signature));

	            return m.toBuffer().toString('hex') == hash.toString('hex');
	        } else {
	            var verifier = crypt.createVerify('RSA-' + hashAlgorithm.toUpperCase());
	            verifier.update(buffer);
	            return verifier.verify(this.options.rsaUtils.exportKey('public'), signature, signature_encoding);
	        }
	    };

	    /**
	     * PKCS#1 pad input buffer to max data length
	     * @param hashBuf
	     * @param hashAlgorithm
	     * @returns {*}
	     */
	    Scheme.prototype.pkcs1pad = function (hashBuf, hashAlgorithm) {
	        var digest = SIGN_INFO_HEAD[hashAlgorithm];
	        if (!digest) {
	            throw Error('Unsupported hash algorithm');
	        }

	        var data = Buffer.concat([digest, hashBuf]);

	        if (data.length + 10 > this.key.encryptedDataLength) {
	            throw Error('Key is too short for signing algorithm (' + hashAlgorithm + ')');
	        }

	        var filled = new Buffer(this.key.encryptedDataLength - data.length - 1);
	        filled.fill(0xff, 0, filled.length - 1);
	        filled[0] = 1;
	        filled[filled.length - 1] = 0;

	        var res = Buffer.concat([filled, data]);

	        return res;
	    };

	    return new Scheme(key, options);
	};



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * PKCS_OAEP signature scheme
	 */

	var BigInteger = __webpack_require__(66);
	var crypt = __webpack_require__(51);

	module.exports = {
	    isEncryption: true,
	    isSignature: false
	};

	module.exports.digestLength = {
	    md4: 16,
	    md5: 16,
	    ripemd160: 20,
	    rmd160: 20,
	    sha: 20,
	    sha1: 20,
	    sha224: 28,
	    sha256: 32,
	    sha384: 48,
	    sha512: 64
	};

	var DEFAULT_HASH_FUNCTION = 'sha1';

	/*
	 * OAEP Mask Generation Function 1
	 * Generates a buffer full of pseudorandom bytes given seed and maskLength.
	 * Giving the same seed, maskLength, and hashFunction will result in the same exact byte values in the buffer.
	 *
	 * https://tools.ietf.org/html/rfc3447#appendix-B.2.1
	 *
	 * Parameters:
	 * seed			[Buffer]	The pseudo random seed for this function
	 * maskLength	[int]		The length of the output
	 * hashFunction	[String]	The hashing function to use. Will accept any valid crypto hash. Default "sha1"
	 *		Supports "sha1" and "sha256".
	 *		To add another algorythm the algorythem must be accepted by crypto.createHash, and then the length of the output of the hash function (the digest) must be added to the digestLength object below.
	 *		Most RSA implementations will be expecting sha1
	 */
	module.exports.eme_oaep_mgf1 = function (seed, maskLength, hashFunction) {
	    hashFunction = hashFunction || DEFAULT_HASH_FUNCTION;
	    var hLen = module.exports.digestLength[hashFunction];
	    var count = Math.ceil(maskLength / hLen);
	    var T = new Buffer(hLen * count);
	    var c = new Buffer(4);
	    for (var i = 0; i < count; ++i) {
	        var hash = crypt.createHash(hashFunction);
	        hash.update(seed);
	        c.writeUInt32BE(i, 0);
	        hash.update(c);
	        hash.digest().copy(T, i * hLen);
	    }
	    return T.slice(0, maskLength);
	};

	module.exports.makeScheme = function (key, options) {
	    function Scheme(key, options) {
	        this.key = key;
	        this.options = options;
	    }

	    Scheme.prototype.maxMessageLength = function () {
	        return this.key.encryptedDataLength - 2 * module.exports.digestLength[this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION] - 2;
	    };

	    /**
	     * Pad input
	     * alg: PKCS1_OAEP
	     *
	     * https://tools.ietf.org/html/rfc3447#section-7.1.1
	     */
	    Scheme.prototype.encPad = function (buffer) {
	        var hash = this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.encryptionSchemeOptions.mgf || module.exports.eme_oaep_mgf1;
	        var label = this.options.encryptionSchemeOptions.label || new Buffer(0);
	        var emLen = this.key.encryptedDataLength;

	        var hLen = module.exports.digestLength[hash];

	        // Make sure we can put message into an encoded message of emLen bytes
	        if (buffer.length > emLen - 2 * hLen - 2) {
	            throw new Error("Message is too long to encode into an encoded message with a length of " + emLen + " bytes, increase" +
	            "emLen to fix this error (minimum value for given parameters and options: " + (emLen - 2 * hLen - 2) + ")");
	        }

	        var lHash = crypt.createHash(hash);
	        lHash.update(label);
	        lHash = lHash.digest();

	        var PS = new Buffer(emLen - buffer.length - 2 * hLen - 1); // Padding "String"
	        PS.fill(0); // Fill the buffer with octets of 0
	        PS[PS.length - 1] = 1;

	        var DB = Buffer.concat([lHash, PS, buffer]);
	        var seed = crypt.randomBytes(hLen);

	        // mask = dbMask
	        var mask = mgf(seed, DB.length, hash);
	        // XOR DB and dbMask together.
	        for (var i = 0; i < DB.length; i++) {
	            DB[i] ^= mask[i];
	        }
	        // DB = maskedDB

	        // mask = seedMask
	        mask = mgf(DB, hLen, hash);
	        // XOR seed and seedMask together.
	        for (i = 0; i < seed.length; i++) {
	            seed[i] ^= mask[i];
	        }
	        // seed = maskedSeed

	        var em = new Buffer(1 + seed.length + DB.length);
	        em[0] = 0;
	        seed.copy(em, 1);
	        DB.copy(em, 1 + seed.length);

	        return em;
	    };

	    /**
	     * Unpad input
	     * alg: PKCS1_OAEP
	     *
	     * Note: This method works within the buffer given and modifies the values. It also returns a slice of the EM as the return Message.
	     * If the implementation requires that the EM parameter be unmodified then the implementation should pass in a clone of the EM buffer.
	     *
	     * https://tools.ietf.org/html/rfc3447#section-7.1.2
	     */
	    Scheme.prototype.encUnPad = function (buffer) {
	        var hash = this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.encryptionSchemeOptions.mgf || module.exports.eme_oaep_mgf1;
	        var label = this.options.encryptionSchemeOptions.label || new Buffer(0);

	        var hLen = module.exports.digestLength[hash];

	        // Check to see if buffer is a properly encoded OAEP message
	        if (buffer.length < 2 * hLen + 2) {
	            throw new Error("Error decoding message, the supplied message is not long enough to be a valid OAEP encoded message");
	        }

	        var seed = buffer.slice(1, hLen + 1);	// seed = maskedSeed
	        var DB = buffer.slice(1 + hLen);		// DB = maskedDB

	        var mask = mgf(DB, hLen, hash); // seedMask
	        // XOR maskedSeed and seedMask together to get the original seed.
	        for (var i = 0; i < seed.length; i++) {
	            seed[i] ^= mask[i];
	        }

	        mask = mgf(seed, DB.length, hash); // dbMask
	        // XOR DB and dbMask together to get the original data block.
	        for (i = 0; i < DB.length; i++) {
	            DB[i] ^= mask[i];
	        }

	        var lHash = crypt.createHash(hash);
	        lHash.update(label);
	        lHash = lHash.digest();

	        var lHashEM = DB.slice(0, hLen);
	        if (lHashEM.toString("hex") != lHash.toString("hex")) {
	            throw new Error("Error decoding message, the lHash calculated from the label provided and the lHash in the encrypted data do not match.");
	        }

	        // Filter out padding
	        i = hLen;
	        while (DB[i++] === 0 && i < DB.length);
	        if (DB[i - 1] != 1) {
	            throw new Error("Error decoding message, there is no padding message separator byte");
	        }

	        return DB.slice(i); // Message
	    };

	    return new Scheme(key, options);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * PSS signature scheme
	 */

	var BigInteger = __webpack_require__(66);
	var crypt = __webpack_require__(51);

	module.exports = {
	    isEncryption: false,
	    isSignature: true
	};

	var DEFAULT_HASH_FUNCTION = 'sha1';
	var DEFAULT_SALT_LENGTH = 20;

	module.exports.makeScheme = function (key, options) {
	    var OAEP = __webpack_require__(68).pkcs1_oaep;

	    /**
	     * @param key
	     * options    [Object]    An object that contains the following keys that specify certain options for encoding.
	     *  └>signingSchemeOptions
	     *     ├>hash    [String]    Hash function to use when encoding and generating masks. Must be a string accepted by node's crypto.createHash function. (default = "sha1")
	     *     ├>mgf    [function]    The mask generation function to use when encoding. (default = mgf1SHA1)
	     *     └>sLen    [uint]        The length of the salt to generate. (default = 20)
	     * @constructor
	     */
	    function Scheme(key, options) {
	        this.key = key;
	        this.options = options;
	    }

	    Scheme.prototype.sign = function (buffer) {
	        var encoded = this.emsa_pss_encode(buffer, this.key.keySize - 1);
	        var res = this.key.$doPrivate(new BigInteger(encoded)).toBuffer(this.key.encryptedDataLength);
	        return res;
	    };

	    Scheme.prototype.verify = function (buffer, signature, signature_encoding) {
	        if (signature_encoding) {
	            signature = new Buffer(signature, signature_encoding);
	        }
	        signature = new BigInteger(signature);

	        var emLen = Math.ceil((this.key.keySize - 1) / 8);
	        var m = this.key.$doPublic(signature).toBuffer(emLen);

	        return this.emsa_pss_verify(buffer, m, this.key.keySize - 1);
	    };

	    /*
	     * https://tools.ietf.org/html/rfc3447#section-9.1.1
	     *
	     * M		[Buffer]	Message to encode
	     * emBits	[uint]		Maximum length of output in bits. Must be at least 8hLen + 8sLen + 9 (hLen = Hash digest length in bytes | sLen = length of salt in bytes)
	     * @returns {Buffer} The encoded message
	     */
	    Scheme.prototype.emsa_pss_encode = function (M, emBits) {
	        var hash = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.signingSchemeOptions.mgf || OAEP.eme_oaep_mgf1;
	        var sLen = this.options.signingSchemeOptions.saltLength || DEFAULT_SALT_LENGTH;

	        var hLen = OAEP.digestLength[hash];
	        var emLen = Math.ceil(emBits / 8);

	        if (emLen < hLen + sLen + 2) {
	            throw new Error("Output length passed to emBits(" + emBits + ") is too small for the options " +
	                "specified(" + hash + ", " + sLen + "). To fix this issue increase the value of emBits. (minimum size: " +
	                (8 * hLen + 8 * sLen + 9) + ")"
	            );
	        }

	        var mHash = crypt.createHash(hash);
	        mHash.update(M);
	        mHash = mHash.digest();

	        var salt = crypt.randomBytes(sLen);

	        var Mapostrophe = new Buffer(8 + hLen + sLen);
	        Mapostrophe.fill(0, 0, 8);
	        mHash.copy(Mapostrophe, 8);
	        salt.copy(Mapostrophe, 8 + mHash.length);

	        var H = crypt.createHash(hash);
	        H.update(Mapostrophe);
	        H = H.digest();

	        var PS = new Buffer(emLen - salt.length - hLen - 2);
	        PS.fill(0);

	        var DB = new Buffer(PS.length + 1 + salt.length);
	        PS.copy(DB);
	        DB[PS.length] = 0x01;
	        salt.copy(DB, PS.length + 1);

	        var dbMask = mgf(H, DB.length, hash);

	        // XOR DB and dbMask together
	        var maskedDB = new Buffer(DB.length);
	        for (var i = 0; i < dbMask.length; i++) {
	            maskedDB[i] = DB[i] ^ dbMask[i];
	        }

	        var bits = emBits - 8 * (emLen - 1);
	        var mask = 255 << 8 - bits >> 8 - bits;
	        maskedDB[0] &= ((maskedDB[0] ^ mask) & maskedDB[0]);

	        var EM = new Buffer(maskedDB.length + H.length + 1);
	        maskedDB.copy(EM, 0);
	        H.copy(EM, maskedDB.length);
	        EM[EM.length - 1] = 0xbc;

	        return EM;
	    };

	    /*
	     * https://tools.ietf.org/html/rfc3447#section-9.1.2
	     *
	     * M		[Buffer]	Message
	     * EM		[Buffer]	Signature
	     * emBits	[uint]		Length of EM in bits. Must be at least 8hLen + 8sLen + 9 to be a valid signature. (hLen = Hash digest length in bytes | sLen = length of salt in bytes)
	     * @returns {Boolean} True if signature(EM) matches message(M)
	     */
	    Scheme.prototype.emsa_pss_verify = function (M, EM, emBits) {
	        var hash = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.signingSchemeOptions.mgf || OAEP.eme_oaep_mgf1;
	        var sLen = this.options.signingSchemeOptions.saltLength || DEFAULT_SALT_LENGTH;

	        var hLen = OAEP.digestLength[hash];
	        var emLen = Math.ceil(emBits / 8);

	        if (emLen < hLen + sLen + 2 || EM[EM.length - 1] != 0xbc) {
	            return false;
	        }

	        var DB = new Buffer(emLen - hLen - 1);
	        EM.copy(DB, 0, 0, emLen - hLen - 1);

	        var mask = 0;
	        for (var i = 0, bits = 8 * emLen - emBits; i < bits; i++) {
	            mask |= 1 << (7 - i);
	        }

	        if ((DB[0] & mask) !== 0) {
	            return false;
	        }

	        var H = EM.slice(emLen - hLen - 1, emLen - 1);
	        var dbMask = mgf(H, DB.length, hash);

	        // Unmask DB
	        for (i = 0; i < DB.length; i++) {
	            DB[i] ^= dbMask[i];
	        }

	        mask = 0;
	        for (i = 0, bits = emBits - 8 * (emLen - 1); i < bits; i++) {
	            mask |= 1 << i;
	        }
	        DB[0] &= mask;

	        // Filter out padding
	        while (DB[i++] === 0 && i < DB.length);
	        if (DB[i - 1] != 1) {
	            return false;
	        }

	        var salt = DB.slice(DB.length - sLen);

	        var mHash = crypt.createHash(hash);
	        mHash.update(M);
	        mHash = mHash.digest();

	        var Mapostrophe = new Buffer(8 + hLen + sLen);
	        Mapostrophe.fill(0, 0, 8);
	        mHash.copy(Mapostrophe, 8);
	        salt.copy(Mapostrophe, 8 + mHash.length);

	        var Hapostrophe = crypt.createHash(hash);
	        Hapostrophe.update(Mapostrophe);
	        Hapostrophe = Hapostrophe.digest();

	        return H.toString("hex") === Hapostrophe.toString("hex");
	    };

	    return new Scheme(key, options);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var crypt = __webpack_require__(51);

	module.exports = {
	    getEngine: function (keyPair, options) {
	        var engine = __webpack_require__(73);
	        if (options.environment === 'node') {
	            if (typeof crypt.publicEncrypt === 'function' && typeof crypt.privateDecrypt === 'function') {
	                if (typeof crypt.privateEncrypt === 'function' && typeof crypt.publicDecrypt === 'function') {
	                    engine = __webpack_require__(74);
	                } else {
	                    engine = __webpack_require__(76);
	                }
	            }
	        }
	        return engine(keyPair, options);
	    }
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var BigInteger = __webpack_require__(66);
	var schemes = __webpack_require__(68);

	module.exports = function (keyPair, options) {
	    var pkcs1Scheme = schemes.pkcs1.makeScheme(keyPair, options);

	    return {
	        encrypt: function (buffer, usePrivate) {
	            var m, c;
	            if (usePrivate) {
	                m = new BigInteger(pkcs1Scheme.encPad(buffer, {type: 1}));
	                c = keyPair.$doPrivate(m);
	            } else {
	                m = new BigInteger(keyPair.encryptionScheme.encPad(buffer));
	                c = keyPair.$doPublic(m);
	            }
	            return c.toBuffer(keyPair.encryptedDataLength);
	        },

	        decrypt: function (buffer, usePublic) {
	            var m, c = new BigInteger(buffer);

	            if (usePublic) {
	                m = keyPair.$doPublic(c);
	                return pkcs1Scheme.encUnPad(m.toBuffer(keyPair.encryptedDataLength), {type: 1});
	            } else {
	                m = keyPair.$doPrivate(c);
	                return keyPair.encryptionScheme.encUnPad(m.toBuffer(keyPair.encryptedDataLength));
	            }
	        }
	    };
	};

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var crypto = __webpack_require__(51);
	var constants = __webpack_require__(75);

	module.exports = function (keyPair, options) {
	    var jsEngine = __webpack_require__(73)(keyPair, options);

	    return {
	        encrypt: function (buffer, usePrivate) {
	            if (usePrivate) {
	                return crypto.privateEncrypt({
	                    key: options.rsaUtils.exportKey('private'),
	                    padding: constants.RSA_PKCS1_PADDING
	                }, buffer);
	            } else {
	                var padding = constants.RSA_PKCS1_OAEP_PADDING;
	                if (options.encryptionScheme === 'pkcs1') {
	                    padding = constants.RSA_PKCS1_PADDING;
	                }

	                return crypto.publicEncrypt({
	                    key: options.rsaUtils.exportKey('public'),
	                    padding: padding
	                }, buffer);
	            }
	        },

	        decrypt: function (buffer, usePublic) {
	            if (usePublic) {
	                return crypto.publicDecrypt({
	                    key: options.rsaUtils.exportKey('public'),
	                    padding: constants.RSA_PKCS1_PADDING
	                }, buffer);
	            } else {
	                var padding = constants.RSA_PKCS1_OAEP_PADDING;
	                if (options.encryptionScheme === 'pkcs1') {
	                    padding = constants.RSA_PKCS1_PADDING;
	                }

	                return crypto.privateDecrypt({
	                    key: options.rsaUtils.exportKey('private'),
	                    padding: padding
	                }, buffer);
	            }
	        }
	    };
	};

/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = {
		"O_RDONLY": 0,
		"O_WRONLY": 1,
		"O_RDWR": 2,
		"S_IFMT": 61440,
		"S_IFREG": 32768,
		"S_IFDIR": 16384,
		"S_IFCHR": 8192,
		"S_IFBLK": 24576,
		"S_IFIFO": 4096,
		"S_IFLNK": 40960,
		"S_IFSOCK": 49152,
		"O_CREAT": 512,
		"O_EXCL": 2048,
		"O_NOCTTY": 131072,
		"O_TRUNC": 1024,
		"O_APPEND": 8,
		"O_DIRECTORY": 1048576,
		"O_NOFOLLOW": 256,
		"O_SYNC": 128,
		"O_SYMLINK": 2097152,
		"S_IRWXU": 448,
		"S_IRUSR": 256,
		"S_IWUSR": 128,
		"S_IXUSR": 64,
		"S_IRWXG": 56,
		"S_IRGRP": 32,
		"S_IWGRP": 16,
		"S_IXGRP": 8,
		"S_IRWXO": 7,
		"S_IROTH": 4,
		"S_IWOTH": 2,
		"S_IXOTH": 1,
		"E2BIG": 7,
		"EACCES": 13,
		"EADDRINUSE": 48,
		"EADDRNOTAVAIL": 49,
		"EAFNOSUPPORT": 47,
		"EAGAIN": 35,
		"EALREADY": 37,
		"EBADF": 9,
		"EBADMSG": 94,
		"EBUSY": 16,
		"ECANCELED": 89,
		"ECHILD": 10,
		"ECONNABORTED": 53,
		"ECONNREFUSED": 61,
		"ECONNRESET": 54,
		"EDEADLK": 11,
		"EDESTADDRREQ": 39,
		"EDOM": 33,
		"EDQUOT": 69,
		"EEXIST": 17,
		"EFAULT": 14,
		"EFBIG": 27,
		"EHOSTUNREACH": 65,
		"EIDRM": 90,
		"EILSEQ": 92,
		"EINPROGRESS": 36,
		"EINTR": 4,
		"EINVAL": 22,
		"EIO": 5,
		"EISCONN": 56,
		"EISDIR": 21,
		"ELOOP": 62,
		"EMFILE": 24,
		"EMLINK": 31,
		"EMSGSIZE": 40,
		"EMULTIHOP": 95,
		"ENAMETOOLONG": 63,
		"ENETDOWN": 50,
		"ENETRESET": 52,
		"ENETUNREACH": 51,
		"ENFILE": 23,
		"ENOBUFS": 55,
		"ENODATA": 96,
		"ENODEV": 19,
		"ENOENT": 2,
		"ENOEXEC": 8,
		"ENOLCK": 77,
		"ENOLINK": 97,
		"ENOMEM": 12,
		"ENOMSG": 91,
		"ENOPROTOOPT": 42,
		"ENOSPC": 28,
		"ENOSR": 98,
		"ENOSTR": 99,
		"ENOSYS": 78,
		"ENOTCONN": 57,
		"ENOTDIR": 20,
		"ENOTEMPTY": 66,
		"ENOTSOCK": 38,
		"ENOTSUP": 45,
		"ENOTTY": 25,
		"ENXIO": 6,
		"EOPNOTSUPP": 102,
		"EOVERFLOW": 84,
		"EPERM": 1,
		"EPIPE": 32,
		"EPROTO": 100,
		"EPROTONOSUPPORT": 43,
		"EPROTOTYPE": 41,
		"ERANGE": 34,
		"EROFS": 30,
		"ESPIPE": 29,
		"ESRCH": 3,
		"ESTALE": 70,
		"ETIME": 101,
		"ETIMEDOUT": 60,
		"ETXTBSY": 26,
		"EWOULDBLOCK": 35,
		"EXDEV": 18,
		"SIGHUP": 1,
		"SIGINT": 2,
		"SIGQUIT": 3,
		"SIGILL": 4,
		"SIGTRAP": 5,
		"SIGABRT": 6,
		"SIGIOT": 6,
		"SIGBUS": 10,
		"SIGFPE": 8,
		"SIGKILL": 9,
		"SIGUSR1": 30,
		"SIGSEGV": 11,
		"SIGUSR2": 31,
		"SIGPIPE": 13,
		"SIGALRM": 14,
		"SIGTERM": 15,
		"SIGCHLD": 20,
		"SIGCONT": 19,
		"SIGSTOP": 17,
		"SIGTSTP": 18,
		"SIGTTIN": 21,
		"SIGTTOU": 22,
		"SIGURG": 16,
		"SIGXCPU": 24,
		"SIGXFSZ": 25,
		"SIGVTALRM": 26,
		"SIGPROF": 27,
		"SIGWINCH": 28,
		"SIGIO": 23,
		"SIGSYS": 12,
		"SSL_OP_ALL": 2147486719,
		"SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION": 262144,
		"SSL_OP_CIPHER_SERVER_PREFERENCE": 4194304,
		"SSL_OP_CISCO_ANYCONNECT": 32768,
		"SSL_OP_COOKIE_EXCHANGE": 8192,
		"SSL_OP_CRYPTOPRO_TLSEXT_BUG": 2147483648,
		"SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS": 2048,
		"SSL_OP_EPHEMERAL_RSA": 2097152,
		"SSL_OP_LEGACY_SERVER_CONNECT": 4,
		"SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER": 32,
		"SSL_OP_MICROSOFT_SESS_ID_BUG": 1,
		"SSL_OP_MSIE_SSLV2_RSA_PADDING": 64,
		"SSL_OP_NETSCAPE_CA_DN_BUG": 536870912,
		"SSL_OP_NETSCAPE_CHALLENGE_BUG": 2,
		"SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG": 1073741824,
		"SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG": 8,
		"SSL_OP_NO_COMPRESSION": 131072,
		"SSL_OP_NO_QUERY_MTU": 4096,
		"SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION": 65536,
		"SSL_OP_NO_SSLv2": 16777216,
		"SSL_OP_NO_SSLv3": 33554432,
		"SSL_OP_NO_TICKET": 16384,
		"SSL_OP_NO_TLSv1": 67108864,
		"SSL_OP_NO_TLSv1_1": 268435456,
		"SSL_OP_NO_TLSv1_2": 134217728,
		"SSL_OP_PKCS1_CHECK_1": 0,
		"SSL_OP_PKCS1_CHECK_2": 0,
		"SSL_OP_SINGLE_DH_USE": 1048576,
		"SSL_OP_SINGLE_ECDH_USE": 524288,
		"SSL_OP_SSLEAY_080_CLIENT_DH_BUG": 128,
		"SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG": 16,
		"SSL_OP_TLS_BLOCK_PADDING_BUG": 512,
		"SSL_OP_TLS_D5_BUG": 256,
		"SSL_OP_TLS_ROLLBACK_BUG": 8388608,
		"NPN_ENABLED": 1
	};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var crypto = __webpack_require__(51);
	var constants = __webpack_require__(75);

	module.exports = function (keyPair, options) {
	    var jsEngine = __webpack_require__(73)(keyPair, options);

	    return {
	        encrypt: function (buffer, usePrivate) {
	            if (usePrivate) {
	                return jsEngine.encrypt(buffer, usePrivate);
	            }
	            var padding = constants.RSA_PKCS1_OAEP_PADDING;
	            if (options.encryptionScheme === 'pkcs1') {
	                padding = constants.RSA_PKCS1_PADDING;
	            }

	            return crypto.publicEncrypt({
	                key: options.rsaUtils.exportKey('public'),
	                padding: padding
	            }, buffer);
	        },

	        decrypt: function (buffer, usePublic) {
	            if (usePublic) {
	                return jsEngine.decrypt(buffer, usePublic);
	            }
	            var padding = constants.RSA_PKCS1_OAEP_PADDING;
	            if (options.encryptionScheme === 'pkcs1') {
	                padding = constants.RSA_PKCS1_PADDING;
	            }

	            return crypto.privateDecrypt({
	                key: options.rsaUtils.exportKey('private'),
	                padding: padding
	            }, buffer);
	        }
	    };
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	// If you have no idea what ASN.1 or BER is, see this:
	// ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc

	var Ber = __webpack_require__(78);



	///--- Exported API

	module.exports = {

	  Ber: Ber,

	  BerReader: Ber.Reader,

	  BerWriter: Ber.Writer

	};


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	var errors = __webpack_require__(79);
	var types = __webpack_require__(80);

	var Reader = __webpack_require__(81);
	var Writer = __webpack_require__(83);


	///--- Exports

	module.exports = {

	  Reader: Reader,

	  Writer: Writer

	};

	for (var t in types) {
	  if (types.hasOwnProperty(t))
	    module.exports[t] = types[t];
	}
	for (var e in errors) {
	  if (errors.hasOwnProperty(e))
	    module.exports[e] = errors[e];
	}


/***/ },
/* 79 */
/***/ function(module, exports) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.


	module.exports = {

	  newInvalidAsn1Error: function(msg) {
	    var e = new Error();
	    e.name = 'InvalidAsn1Error';
	    e.message = msg || '';
	    return e;
	  }

	};


/***/ },
/* 80 */
/***/ function(module, exports) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.


	module.exports = {
	  EOC: 0,
	  Boolean: 1,
	  Integer: 2,
	  BitString: 3,
	  OctetString: 4,
	  Null: 5,
	  OID: 6,
	  ObjectDescriptor: 7,
	  External: 8,
	  Real: 9, // float
	  Enumeration: 10,
	  PDV: 11,
	  Utf8String: 12,
	  RelativeOID: 13,
	  Sequence: 16,
	  Set: 17,
	  NumericString: 18,
	  PrintableString: 19,
	  T61String: 20,
	  VideotexString: 21,
	  IA5String: 22,
	  UTCTime: 23,
	  GeneralizedTime: 24,
	  GraphicString: 25,
	  VisibleString: 26,
	  GeneralString: 28,
	  UniversalString: 29,
	  CharacterString: 30,
	  BMPString: 31,
	  Constructor: 32,
	  Context: 128
	};


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	var assert = __webpack_require__(82);

	var ASN1 = __webpack_require__(80);
	var errors = __webpack_require__(79);


	///--- Globals

	var newInvalidAsn1Error = errors.newInvalidAsn1Error;



	///--- API

	function Reader(data) {
	  if (!data || !Buffer.isBuffer(data))
	    throw new TypeError('data must be a node Buffer');

	  this._buf = data;
	  this._size = data.length;

	  // These hold the "current" state
	  this._len = 0;
	  this._offset = 0;

	  var self = this;
	  this.__defineGetter__('length', function() { return self._len; });
	  this.__defineGetter__('offset', function() { return self._offset; });
	  this.__defineGetter__('remain', function() {
	    return self._size - self._offset;
	  });
	  this.__defineGetter__('buffer', function() {
	    return self._buf.slice(self._offset);
	  });
	}


	/**
	 * Reads a single byte and advances offset; you can pass in `true` to make this
	 * a "peek" operation (i.e., get the byte, but don't advance the offset).
	 *
	 * @param {Boolean} peek true means don't move offset.
	 * @return {Number} the next byte, null if not enough data.
	 */
	Reader.prototype.readByte = function(peek) {
	  if (this._size - this._offset < 1)
	    return null;

	  var b = this._buf[this._offset] & 0xff;

	  if (!peek)
	    this._offset += 1;

	  return b;
	};


	Reader.prototype.peek = function() {
	  return this.readByte(true);
	};


	/**
	 * Reads a (potentially) variable length off the BER buffer.  This call is
	 * not really meant to be called directly, as callers have to manipulate
	 * the internal buffer afterwards.
	 *
	 * As a result of this call, you can call `Reader.length`, until the
	 * next thing called that does a readLength.
	 *
	 * @return {Number} the amount of offset to advance the buffer.
	 * @throws {InvalidAsn1Error} on bad ASN.1
	 */
	Reader.prototype.readLength = function(offset) {
	  if (offset === undefined)
	    offset = this._offset;

	  if (offset >= this._size)
	    return null;

	  var lenB = this._buf[offset++] & 0xff;
	  if (lenB === null)
	    return null;

	  if ((lenB & 0x80) == 0x80) {
	    lenB &= 0x7f;

	    if (lenB == 0)
	      throw newInvalidAsn1Error('Indefinite length not supported');

	    if (lenB > 4)
	      throw newInvalidAsn1Error('encoding too long');

	    if (this._size - offset < lenB)
	      return null;

	    this._len = 0;
	    for (var i = 0; i < lenB; i++)
	      this._len = (this._len << 8) + (this._buf[offset++] & 0xff);

	  } else {
	    // Wasn't a variable length
	    this._len = lenB;
	  }

	  return offset;
	};


	/**
	 * Parses the next sequence in this BER buffer.
	 *
	 * To get the length of the sequence, call `Reader.length`.
	 *
	 * @return {Number} the sequence's tag.
	 */
	Reader.prototype.readSequence = function(tag) {
	  var seq = this.peek();
	  if (seq === null)
	    return null;
	  if (tag !== undefined && tag !== seq)
	    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
	                              ': got 0x' + seq.toString(16));

	  var o = this.readLength(this._offset + 1); // stored in `length`
	  if (o === null)
	    return null;

	  this._offset = o;
	  return seq;
	};


	Reader.prototype.readInt = function() {
	  return this._readTag(ASN1.Integer);
	};


	Reader.prototype.readBoolean = function() {
	  return (this._readTag(ASN1.Boolean) === 0 ? false : true);
	};


	Reader.prototype.readEnumeration = function() {
	  return this._readTag(ASN1.Enumeration);
	};


	Reader.prototype.readString = function(tag, retbuf) {
	  if (!tag)
	    tag = ASN1.OctetString;

	  var b = this.peek();
	  if (b === null)
	    return null;

	  if (b !== tag)
	    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
	                              ': got 0x' + b.toString(16));

	  var o = this.readLength(this._offset + 1); // stored in `length`

	  if (o === null)
	    return null;

	  if (this.length > this._size - o)
	    return null;

	  this._offset = o;

	  if (this.length === 0)
	    return retbuf ? new Buffer(0) : '';

	  var str = this._buf.slice(this._offset, this._offset + this.length);
	  this._offset += this.length;

	  return retbuf ? str : str.toString('utf8');
	};

	Reader.prototype.readOID = function(tag) {
	  if (!tag)
	    tag = ASN1.OID;

	  var b = this.readString(tag, true);
	  if (b === null)
	    return null;

	  var values = [];
	  var value = 0;

	  for (var i = 0; i < b.length; i++) {
	    var byte = b[i] & 0xff;

	    value <<= 7;
	    value += byte & 0x7f;
	    if ((byte & 0x80) == 0) {
	      values.push(value);
	      value = 0;
	    }
	  }

	  value = values.shift();
	  values.unshift(value % 40);
	  values.unshift((value / 40) >> 0);

	  return values.join('.');
	};


	Reader.prototype._readTag = function(tag) {
	  assert.ok(tag !== undefined);

	  var b = this.peek();

	  if (b === null)
	    return null;

	  if (b !== tag)
	    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
	                              ': got 0x' + b.toString(16));

	  var o = this.readLength(this._offset + 1); // stored in `length`
	  if (o === null)
	    return null;

	  if (this.length > 4)
	    throw newInvalidAsn1Error('Integer too long: ' + this.length);

	  if (this.length > this._size - o)
	    return null;
	  this._offset = o;

	  var fb = this._buf[this._offset];
	  var value = 0;

	  for (var i = 0; i < this.length; i++) {
	    value <<= 8;
	    value |= (this._buf[this._offset++] & 0xff);
	  }

	  if ((fb & 0x80) == 0x80 && i !== 4)
	    value -= (1 << (i * 8));

	  return value >> 0;
	};



	///--- Exported API

	module.exports = Reader;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	// when used in node, this will actually load the util module we depend on
	// versus loading the builtin util module as happens otherwise
	// this is a bug in node module loading as far as I am concerned
	var util = __webpack_require__(4);

	var pSlice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  if (options.message) {
	    this.message = options.message;
	    this.generatedMessage = false;
	  } else {
	    this.message = getMessage(this);
	    this.generatedMessage = true;
	  }
	  var stackStartFunction = options.stackStartFunction || fail;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  }
	  else {
	    // non v8 browsers so we can have a stacktrace
	    var err = new Error();
	    if (err.stack) {
	      var out = err.stack;

	      // try to strip useless frames
	      var fn_name = stackStartFunction.name;
	      var idx = out.indexOf('\n' + fn_name);
	      if (idx >= 0) {
	        // once we have located the function frame
	        // we need to strip out everything before it (and its line)
	        var next_line = out.indexOf('\n', idx + 1);
	        out = out.substring(next_line + 1);
	      }

	      this.stack = out;
	    }
	  }
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
	  if (util.isUndefined(value)) {
	    return '' + value;
	  }
	  if (util.isNumber(value) && !isFinite(value)) {
	    return value.toString();
	  }
	  if (util.isFunction(value) || util.isRegExp(value)) {
	    return value.toString();
	  }
	  return value;
	}

	function truncate(s, n) {
	  if (util.isString(s)) {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}

	function getMessage(self) {
	  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
	         self.operator + ' ' +
	         truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	  if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};

	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;

	  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
	    if (actual.length != expected.length) return false;

	    for (var i = 0; i < actual.length; i++) {
	      if (actual[i] !== expected[i]) return false;
	    }

	    return true;

	  // 7.2. If the expected value is a Date object, the actual value is
	  // equivalent if it is also a Date object that refers to the same time.
	  } else if (util.isDate(actual) && util.isDate(expected)) {
	    return actual.getTime() === expected.getTime();

	  // 7.3 If the expected value is a RegExp object, the actual value is
	  // equivalent if it is also a RegExp object with the same source and
	  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	    return actual.source === expected.source &&
	           actual.global === expected.global &&
	           actual.multiline === expected.multiline &&
	           actual.lastIndex === expected.lastIndex &&
	           actual.ignoreCase === expected.ignoreCase;

	  // 7.4. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (!util.isObject(actual) && !util.isObject(expected)) {
	    return actual == expected;

	  // 7.5 For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected);
	  }
	}

	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
	  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  // if one is a primitive, the other must be same
	  if (util.isPrimitive(a) || util.isPrimitive(b)) {
	    return a === b;
	  }
	  var aIsArgs = isArguments(a),
	      bIsArgs = isArguments(b);
	  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
	    return false;
	  if (aIsArgs) {
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  var ka = objectKeys(a),
	      kb = objectKeys(b),
	      key, i;
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};

	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }

	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }

	  return false;
	}

	function _throws(shouldThrow, block, expected, message) {
	  var actual;

	  if (util.isString(expected)) {
	    message = expected;
	    expected = null;
	  }

	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }

	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	            (message ? ' ' + message : '.');

	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }

	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }

	  if ((shouldThrow && actual && expected &&
	      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	    throw actual;
	  }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function(err) { if (err) {throw err;}};

	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) keys.push(key);
	  }
	  return keys;
	};


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	var assert = __webpack_require__(82);
	var ASN1 = __webpack_require__(80);
	var errors = __webpack_require__(79);


	///--- Globals

	var newInvalidAsn1Error = errors.newInvalidAsn1Error;

	var DEFAULT_OPTS = {
	  size: 1024,
	  growthFactor: 8
	};


	///--- Helpers

	function merge(from, to) {
	  assert.ok(from);
	  assert.equal(typeof(from), 'object');
	  assert.ok(to);
	  assert.equal(typeof(to), 'object');

	  var keys = Object.getOwnPropertyNames(from);
	  keys.forEach(function(key) {
	    if (to[key])
	      return;

	    var value = Object.getOwnPropertyDescriptor(from, key);
	    Object.defineProperty(to, key, value);
	  });

	  return to;
	}



	///--- API

	function Writer(options) {
	  options = merge(DEFAULT_OPTS, options || {});

	  this._buf = new Buffer(options.size || 1024);
	  this._size = this._buf.length;
	  this._offset = 0;
	  this._options = options;

	  // A list of offsets in the buffer where we need to insert
	  // sequence tag/len pairs.
	  this._seq = [];

	  var self = this;
	  this.__defineGetter__('buffer', function() {
	    if (self._seq.length)
	      throw new InvalidAsn1Error(self._seq.length + ' unended sequence(s)');

	    return self._buf.slice(0, self._offset);
	  });
	}


	Writer.prototype.writeByte = function(b) {
	  if (typeof(b) !== 'number')
	    throw new TypeError('argument must be a Number');

	  this._ensure(1);
	  this._buf[this._offset++] = b;
	};


	Writer.prototype.writeInt = function(i, tag) {
	  if (typeof(i) !== 'number')
	    throw new TypeError('argument must be a Number');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Integer;

	  var sz = 4;

	  while ((((i & 0xff800000) === 0) || ((i & 0xff800000) === 0xff800000 >> 0)) &&
	         (sz > 1)) {
	    sz--;
	    i <<= 8;
	  }

	  if (sz > 4)
	    throw new InvalidAsn1Error('BER ints cannot be > 0xffffffff');

	  this._ensure(2 + sz);
	  this._buf[this._offset++] = tag;
	  this._buf[this._offset++] = sz;

	  while (sz-- > 0) {
	    this._buf[this._offset++] = ((i & 0xff000000) >>> 24);
	    i <<= 8;
	  }

	};


	Writer.prototype.writeNull = function() {
	  this.writeByte(ASN1.Null);
	  this.writeByte(0x00);
	};


	Writer.prototype.writeEnumeration = function(i, tag) {
	  if (typeof(i) !== 'number')
	    throw new TypeError('argument must be a Number');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Enumeration;

	  return this.writeInt(i, tag);
	};


	Writer.prototype.writeBoolean = function(b, tag) {
	  if (typeof(b) !== 'boolean')
	    throw new TypeError('argument must be a Boolean');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Boolean;

	  this._ensure(3);
	  this._buf[this._offset++] = tag;
	  this._buf[this._offset++] = 0x01;
	  this._buf[this._offset++] = b ? 0xff : 0x00;
	};


	Writer.prototype.writeString = function(s, tag) {
	  if (typeof(s) !== 'string')
	    throw new TypeError('argument must be a string (was: ' + typeof(s) + ')');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.OctetString;

	  var len = Buffer.byteLength(s);
	  this.writeByte(tag);
	  this.writeLength(len);
	  if (len) {
	    this._ensure(len);
	    this._buf.write(s, this._offset);
	    this._offset += len;
	  }
	};


	Writer.prototype.writeBuffer = function(buf, tag) {
	  if (typeof(tag) !== 'number')
	    throw new TypeError('tag must be a number');
	  if (!Buffer.isBuffer(buf))
	    throw new TypeError('argument must be a buffer');

	  this.writeByte(tag);
	  this.writeLength(buf.length);
	  this._ensure(buf.length);
	  buf.copy(this._buf, this._offset, 0, buf.length);
	  this._offset += buf.length;
	};


	Writer.prototype.writeStringArray = function(strings) {
	  if ((!strings instanceof Array))
	    throw new TypeError('argument must be an Array[String]');

	  var self = this;
	  strings.forEach(function(s) {
	    self.writeString(s);
	  });
	};

	// This is really to solve DER cases, but whatever for now
	Writer.prototype.writeOID = function(s, tag) {
	  if (typeof(s) !== 'string')
	    throw new TypeError('argument must be a string');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.OID;

	  if (!/^([0-9]+\.){3,}[0-9]+$/.test(s))
	    throw new Error('argument is not a valid OID string');

	  function encodeOctet(bytes, octet) {
	    if (octet < 128) {
	        bytes.push(octet);
	    } else if (octet < 16384) {
	        bytes.push((octet >>> 7) | 0x80);
	        bytes.push(octet & 0x7F);
	    } else if (octet < 2097152) {
	      bytes.push((octet >>> 14) | 0x80);
	      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
	      bytes.push(octet & 0x7F);
	    } else if (octet < 268435456) {
	      bytes.push((octet >>> 21) | 0x80);
	      bytes.push(((octet >>> 14) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
	      bytes.push(octet & 0x7F);
	    } else {
	      bytes.push(((octet >>> 28) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 21) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 14) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
	      bytes.push(octet & 0x7F);
	    }
	  }

	  var tmp = s.split('.');
	  var bytes = [];
	  bytes.push(parseInt(tmp[0], 10) * 40 + parseInt(tmp[1], 10));
	  tmp.slice(2).forEach(function(b) {
	    encodeOctet(bytes, parseInt(b, 10));
	  });

	  var self = this;
	  this._ensure(2 + bytes.length);
	  this.writeByte(tag);
	  this.writeLength(bytes.length);
	  bytes.forEach(function(b) {
	    self.writeByte(b);
	  });
	};


	Writer.prototype.writeLength = function(len) {
	  if (typeof(len) !== 'number')
	    throw new TypeError('argument must be a Number');

	  this._ensure(4);

	  if (len <= 0x7f) {
	    this._buf[this._offset++] = len;
	  } else if (len <= 0xff) {
	    this._buf[this._offset++] = 0x81;
	    this._buf[this._offset++] = len;
	  } else if (len <= 0xffff) {
	    this._buf[this._offset++] = 0x82;
	    this._buf[this._offset++] = len >> 8;
	    this._buf[this._offset++] = len;
	  } else if (len <= 0xffffff) {
	    this._buf[this._offset++] = 0x83;
	    this._buf[this._offset++] = len >> 16;
	    this._buf[this._offset++] = len >> 8;
	    this._buf[this._offset++] = len;
	  } else {
	    throw new InvalidAsn1ERror('Length too long (> 4 bytes)');
	  }
	};

	Writer.prototype.startSequence = function(tag) {
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Sequence | ASN1.Constructor;

	  this.writeByte(tag);
	  this._seq.push(this._offset);
	  this._ensure(3);
	  this._offset += 3;
	};


	Writer.prototype.endSequence = function() {
	  var seq = this._seq.pop();
	  var start = seq + 3;
	  var len = this._offset - start;

	  if (len <= 0x7f) {
	    this._shift(start, len, -2);
	    this._buf[seq] = len;
	  } else if (len <= 0xff) {
	    this._shift(start, len, -1);
	    this._buf[seq] = 0x81;
	    this._buf[seq + 1] = len;
	  } else if (len <= 0xffff) {
	    this._buf[seq] = 0x82;
	    this._buf[seq + 1] = len >> 8;
	    this._buf[seq + 2] = len;
	  } else if (len <= 0xffffff) {
	    this._shift(start, len, 1);
	    this._buf[seq] = 0x83;
	    this._buf[seq + 1] = len >> 16;
	    this._buf[seq + 2] = len >> 8;
	    this._buf[seq + 3] = len;
	  } else {
	    throw new InvalidAsn1Error('Sequence too long');
	  }
	};


	Writer.prototype._shift = function(start, len, shift) {
	  assert.ok(start !== undefined);
	  assert.ok(len !== undefined);
	  assert.ok(shift);

	  this._buf.copy(this._buf, start + shift, start, start + len);
	  this._offset += shift;
	};

	Writer.prototype._ensure = function(len) {
	  assert.ok(len);

	  if (this._size - this._offset < len) {
	    var sz = this._size * this._options.growthFactor;
	    if (sz - this._offset < len)
	      sz += len;

	    var buf = new Buffer(sz);

	    this._buf.copy(buf, 0, 0, this._offset);
	    this._buf = buf;
	    this._size = sz;
	  }
	};



	///--- Exported API

	module.exports = Writer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(49);

	function formatParse(format) {
	    format = format.split('-');
	    var keyType = 'private';
	    var keyOpt = {type: 'default'};

	    for (var i = 1; i < format.length; i++) {
	        if (format[i]) {
	            switch (format[i]) {
	                case 'public':
	                    keyType = format[i];
	                    break;
	                case 'private':
	                    keyType = format[i];
	                    break;
	                case 'pem':
	                    keyOpt.type = format[i];
	                    break;
	                case 'der':
	                    keyOpt.type = format[i];
	                    break;
	            }
	        }
	    }

	    return {scheme: format[0], keyType: keyType, keyOpt: keyOpt};
	}

	module.exports = {
	    pkcs1: __webpack_require__(85),
	    pkcs8: __webpack_require__(86),

	    isPrivateExport: function (format) {
	        return module.exports[format] && typeof module.exports[format].privateExport === 'function';
	    },

	    isPrivateImport: function (format) {
	        return module.exports[format] && typeof module.exports[format].privateImport === 'function';
	    },

	    isPublicExport: function (format) {
	        return module.exports[format] && typeof module.exports[format].publicExport === 'function';
	    },

	    isPublicImport: function (format) {
	        return module.exports[format] && typeof module.exports[format].publicImport === 'function';
	    },

	    detectAndImport: function (key, data, format) {
	        if (format === undefined) {
	            for (var scheme in module.exports) {
	                if (typeof module.exports[scheme].autoImport === 'function' && module.exports[scheme].autoImport(key, data)) {
	                    return true;
	                }
	            }
	        } else if (format) {
	            var fmt = formatParse(format);

	            if (module.exports[fmt.scheme]) {
	                if (fmt.keyType === 'private') {
	                    module.exports[fmt.scheme].privateImport(key, data, fmt.keyOpt);
	                } else {
	                    module.exports[fmt.scheme].publicImport(key, data, fmt.keyOpt);
	                }
	            } else {
	                throw Error('Unsupported key format');
	            }
	        }

	        return false;
	    },

	    detectAndExport: function (key, format) {
	        if (format) {
	            var fmt = formatParse(format);

	            if (module.exports[fmt.scheme]) {
	                if (fmt.keyType === 'private') {
	                    if (!key.isPrivate()) {
	                        throw Error("It is not private key");
	                    }
	                    return module.exports[fmt.scheme].privateExport(key, fmt.keyOpt);
	                } else {
	                    if (!key.isPublic()) {
	                        throw Error("It is not public key");
	                    }
	                    return module.exports[fmt.scheme].publicExport(key, fmt.keyOpt);
	                }
	            } else {
	                throw Error('Unsupported key format');
	            }
	        }
	    }
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var ber = __webpack_require__(77).Ber;
	var _ = __webpack_require__(49);
	var utils = __webpack_require__(67);

	module.exports = {
	    privateExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var d = key.d.toBuffer();
	        var p = key.p.toBuffer();
	        var q = key.q.toBuffer();
	        var dmp1 = key.dmp1.toBuffer();
	        var dmq1 = key.dmq1.toBuffer();
	        var coeff = key.coeff.toBuffer();

	        var length = n.length + d.length + p.length + q.length + dmp1.length + dmq1.length + coeff.length + 512; // magic
	        var writer = new ber.Writer({size: length});

	        writer.startSequence();
	        writer.writeInt(0);
	        writer.writeBuffer(n, 2);
	        writer.writeInt(key.e);
	        writer.writeBuffer(d, 2);
	        writer.writeBuffer(p, 2);
	        writer.writeBuffer(q, 2);
	        writer.writeBuffer(dmp1, 2);
	        writer.writeBuffer(dmq1, 2);
	        writer.writeBuffer(coeff, 2);
	        writer.endSequence();

	        if (options.type === 'der') {
	            return writer.buffer;
	        } else {
	            return '-----BEGIN RSA PRIVATE KEY-----\n' + utils.linebrk(writer.buffer.toString('base64'), 64) + '\n-----END RSA PRIVATE KEY-----';
	        }
	    },

	    privateImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN RSA PRIVATE KEY-----', '')
	                    .replace('-----END RSA PRIVATE KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            } else {
	                throw Error('Unsupported key format');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var reader = new ber.Reader(buffer);
	        reader.readSequence();
	        reader.readString(2, true); // just zero
	        key.setPrivate(
	            reader.readString(2, true),  // modulus
	            reader.readString(2, true),  // publicExponent
	            reader.readString(2, true),  // privateExponent
	            reader.readString(2, true),  // prime1
	            reader.readString(2, true),  // prime2
	            reader.readString(2, true),  // exponent1 -- d mod (p1)
	            reader.readString(2, true),  // exponent2 -- d mod (q-1)
	            reader.readString(2, true)   // coefficient -- (inverse of q) mod p
	        );
	    },

	    publicExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var length = n.length + 512; // magic

	        var bodyWriter = new ber.Writer({size: length});
	        bodyWriter.startSequence();
	        bodyWriter.writeBuffer(n, 2);
	        bodyWriter.writeInt(key.e);
	        bodyWriter.endSequence();

	        if (options.type === 'der') {
	            return bodyWriter.buffer;
	        } else {
	            return '-----BEGIN RSA PUBLIC KEY-----\n' + utils.linebrk(bodyWriter.buffer.toString('base64'), 64) + '\n-----END RSA PUBLIC KEY-----';
	        }
	    },

	    publicImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN RSA PUBLIC KEY-----', '')
	                    .replace('-----END RSA PUBLIC KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var body = new ber.Reader(buffer);
	        body.readSequence();
	        key.setPublic(
	            body.readString(0x02, true), // modulus
	            body.readString(0x02, true)  // publicExponent
	        );
	    },

	    /**
	     * Trying autodetect and import key
	     * @param key
	     * @param data
	     */
	    autoImport: function (key, data) {
	        if (/^\s*-----BEGIN RSA PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END RSA PRIVATE KEY-----\s*$/g.test(data)) {
	            module.exports.privateImport(key, data);
	            return true;
	        }

	        if (/^\s*-----BEGIN RSA PUBLIC KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END RSA PUBLIC KEY-----\s*$/g.test(data)) {
	            module.exports.publicImport(key, data);
	            return true;
	        }

	        return false;
	    }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var ber = __webpack_require__(77).Ber;
	var _ = __webpack_require__(49);
	var PUBLIC_RSA_OID = '1.2.840.113549.1.1.1';
	var utils = __webpack_require__(67);

	module.exports = {
	    privateExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var d = key.d.toBuffer();
	        var p = key.p.toBuffer();
	        var q = key.q.toBuffer();
	        var dmp1 = key.dmp1.toBuffer();
	        var dmq1 = key.dmq1.toBuffer();
	        var coeff = key.coeff.toBuffer();

	        var length = n.length + d.length + p.length + q.length + dmp1.length + dmq1.length + coeff.length + 512; // magic
	        var bodyWriter = new ber.Writer({size: length});

	        bodyWriter.startSequence();
	        bodyWriter.writeInt(0);
	        bodyWriter.writeBuffer(n, 2);
	        bodyWriter.writeInt(key.e);
	        bodyWriter.writeBuffer(d, 2);
	        bodyWriter.writeBuffer(p, 2);
	        bodyWriter.writeBuffer(q, 2);
	        bodyWriter.writeBuffer(dmp1, 2);
	        bodyWriter.writeBuffer(dmq1, 2);
	        bodyWriter.writeBuffer(coeff, 2);
	        bodyWriter.endSequence();

	        var writer = new ber.Writer({size: length});
	        writer.startSequence();
	        writer.writeInt(0);
	        writer.startSequence();
	        writer.writeOID(PUBLIC_RSA_OID);
	        writer.writeNull();
	        writer.endSequence();
	        writer.writeBuffer(bodyWriter.buffer, 4);
	        writer.endSequence();

	        if (options.type === 'der') {
	            return writer.buffer;
	        } else {
	            return '-----BEGIN PRIVATE KEY-----\n' + utils.linebrk(writer.buffer.toString('base64'), 64) + '\n-----END PRIVATE KEY-----';
	        }
	    },

	    privateImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN PRIVATE KEY-----', '')
	                    .replace('-----END PRIVATE KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            } else {
	                throw Error('Unsupported key format');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var reader = new ber.Reader(buffer);
	        reader.readSequence();
	        reader.readInt(0);
	        var header = new ber.Reader(reader.readString(0x30, true));

	        if (header.readOID(0x06, true) !== PUBLIC_RSA_OID) {
	            throw Error('Invalid Public key format');
	        }

	        var body = new ber.Reader(reader.readString(0x04, true));
	        body.readSequence();
	        body.readString(2, true); // just zero
	        key.setPrivate(
	            body.readString(2, true),  // modulus
	            body.readString(2, true),  // publicExponent
	            body.readString(2, true),  // privateExponent
	            body.readString(2, true),  // prime1
	            body.readString(2, true),  // prime2
	            body.readString(2, true),  // exponent1 -- d mod (p1)
	            body.readString(2, true),  // exponent2 -- d mod (q-1)
	            body.readString(2, true)   // coefficient -- (inverse of q) mod p
	        );
	    },

	    publicExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var length = n.length + 512; // magic

	        var bodyWriter = new ber.Writer({size: length});
	        bodyWriter.writeByte(0);
	        bodyWriter.startSequence();
	        bodyWriter.writeBuffer(n, 2);
	        bodyWriter.writeInt(key.e);
	        bodyWriter.endSequence();

	        var writer = new ber.Writer({size: length});
	        writer.startSequence();
	        writer.startSequence();
	        writer.writeOID(PUBLIC_RSA_OID);
	        writer.writeNull();
	        writer.endSequence();
	        writer.writeBuffer(bodyWriter.buffer, 3);
	        writer.endSequence();

	        if (options.type === 'der') {
	            return writer.buffer;
	        } else {
	            return '-----BEGIN PUBLIC KEY-----\n' + utils.linebrk(writer.buffer.toString('base64'), 64) + '\n-----END PUBLIC KEY-----';
	        }
	    },

	    publicImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN PUBLIC KEY-----', '')
	                    .replace('-----END PUBLIC KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var reader = new ber.Reader(buffer);
	        reader.readSequence();
	        var header = new ber.Reader(reader.readString(0x30, true));

	        if (header.readOID(0x06, true) !== PUBLIC_RSA_OID) {
	            throw Error('Invalid Public key format');
	        }

	        var body = new ber.Reader(reader.readString(0x03, true));
	        body.readByte();
	        body.readSequence();
	        key.setPublic(
	            body.readString(0x02, true), // modulus
	            body.readString(0x02, true)  // publicExponent
	        );
	    },

	    /**
	     * Trying autodetect and import key
	     * @param key
	     * @param data
	     */
	    autoImport: function (key, data) {
	        if (/^\s*-----BEGIN PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END PRIVATE KEY-----\s*$/g.test(data)) {
	            module.exports.privateImport(key, data);
	            return true;
	        }

	        if (/^\s*-----BEGIN PUBLIC KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END PUBLIC KEY-----\s*$/g.test(data)) {
	            module.exports.publicImport(key, data);
	            return true;
	        }

	        return false;
	    }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(44).Buffer))

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4),
	    Tab = __webpack_require__(41).Tab,
	    rewriter = __webpack_require__(9);

	var BalanceTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(BalanceTab, Tab);

	BalanceTab.prototype.tabName = 'balance';
	BalanceTab.prototype.mainMenu = 'wallet';

	BalanceTab.prototype.angular = function (module)
	{
	  module.controller('BalanceCtrl', ['$scope', 'rpId', 'rpNetwork', 'rpTracker',
	                                     function ($scope, $id, $network, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    $scope.transactions = [];
	    $scope.current_page = 1;

	    // filter effect types
	    // Show only offer_funded, offer_partially_funded, offer_cancelled,
	    // offer_bought, trust_change_no_ripple side effects
	    var filterEffects = function (tx) {
	      if (!tx) return null;

	      var event = jQuery.extend(true, {}, tx);
	      var effects = [];

	      if (event.effects) {
	        $.each(event.effects, function(){
	          var effect = this;
	          if (effect.type == 'offer_funded'
	            || effect.type == 'offer_partially_funded'
	            || effect.type == 'offer_bought'
	            || effect.type == 'trust_change_no_ripple'
	            || effect.type === 'offer_cancelled')
	          {
	            if (effect.type === 'offer_cancelled' && event.transaction
	              && event.transaction.type === 'offercancel') {
	              return
	            }
	            effects.push(effect);
	          }
	        });

	        event.showEffects = effects;
	      }

	      if (effects.length || event.transaction) {
	        return event;
	      } else {
	        return null;
	      }
	    };

	    $scope.reset = function () {
	      $scope.transactions = [];
	      $scope.has_more = true;
	    };

	    var marker;
	    $scope.loadMore = function () {
	      var account = $id.account;

	      if (!$id.account) return;
	      if ($scope.is_loading_more) return;
	      if (!$scope.has_more) return;

	      $scope.tx_load_status = 'loading';

	      var params = {
	        'account': account,
	        'ledger_index_min': -1,
	//        'binary': true,
	        'limit': Options.transactions_per_page
	      };

	      if (marker) params.marker = marker;

	      $network.remote.request_account_tx(params)
	        .on('success', function(data) {
	          $scope.$apply(function () {
	            if (data.transactions) {
	              var transactions = [];

	              if (data.marker) {
	                // XXX There is a server-side bug right now:
	                //     Instead of returning no marker if there are no more
	                //     results, the server returns the marker it was given as an
	                //     input.
	                if (marker &&
	                    "undefined" !== typeof data.marker.ledger &&
	                    data.marker.ledger === marker.ledger &&
	                    "undefined" !== typeof data.marker.seq &&
	                    data.marker.seq === marker.seq) {
	                  $scope.has_more = false;
	                } else {
	                  marker = data.marker;
	                }
	              } else $scope.has_more = false;

	              data.transactions.forEach(function (e) {
	                var tx = rewriter.processTxn(e.tx, e.meta, account);
	                tx = filterEffects(tx);
	                if (tx) {
	                  $scope.transactions.push(tx);
	                }
	              });

	              // Loading mode
	              $scope.tx_load_status = false;
	            }
	          });
	        })
	        .on('error', function(err){
	          $scope.tx_load_status = 'error';
	          console.log(err);
	        }).request();
	    };

	    $scope.reset();
	    $scope.loadMore();

	    $scope.$on('$idAccountLoad', function () {
	      $scope.reset();
	      $scope.loadMore();
	    });
	  }]);
	};

	module.exports = BalanceTab;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4),
	    Tab = __webpack_require__(41).Tab,
	    rewriter = __webpack_require__(9);

	var HistoryTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(HistoryTab, Tab);

	HistoryTab.prototype.tabName = 'history';
	HistoryTab.prototype.mainMenu = 'wallet';

	HistoryTab.prototype.angular = function (module) {
	  module.controller('HistoryCtrl', ['$scope', 'rpId', 'rpNetwork', 'rpTracker',
	                                     function ($scope, $id, $network, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    // Latest transaction
	    var latest;

	    // History collection
	    $scope.historyShow = [];

	    // History states
	    $scope.$watch('loadState.transactions',function(){
	      $scope.historyState = !$scope.loadState.transactions ? 'loading' : 'ready';
	    });

	    // Open/close states of individual history items
	    $scope.details = [];

	    //$scope.typeUsage = [];
	    //$scope.currencyUsage = [];

	    // Currencies from history
	    var historyCurrencies = [];

	    $scope.types = {
	      sent: {
	        'types': ['sent'],
	        'checked': true
	      },
	      received: {
	        'types': ['received'],
	        'checked': true
	      },
	      trusts: {
	        'types': ['trusting','trusted'],
	        'checked': true
	      },
	      offers: {
	        'types': ['offernew','offercancel','convert'],
	        'checked': true
	      },
	      other: {
	        'types': ['accountset','failed','rippling'],
	        'checked': true
	      }
	    };

	    $scope.orderedTypes = ['sent','received','trusts','offers','other'];

	    if (store.get('ripple_history_type_selections')) {
	      $scope.types = $.extend(true,$scope.types,store.get('ripple_history_type_selections'));
	    }

	    // Filters
	    if (store.get('ripple_history_filters')) {
	      $scope.filters = store.get('ripple_history_filters');
	    } else {
	      $scope.filters = {
	        'currencies_is_active': false, // we do the currency filter only if this is true, which happens when at least one currency is off
	        'currencies': {},
	        'types': ['sent','received','convert','trusting','trusted','offernew','offercancel','rippling'],
	        'minimumAmount': 0.000001
	      };
	    }

	    var getDateRangeHistory = function(dateMin,dateMax,callback)
	    {
	      var completed = false;
	      var history = [];

	      var params = {
	        'account': $id.account,
	        'ledger_index_min': -1,
	        'limit': 200
	      };

	      var getTx = function(){
	        $network.remote.request_account_tx(params)
	        .on('success', function(data) {
	          if (data.transactions.length) {
	            for(var i=0;i<data.transactions.length;i++) {
	              var date = (data.transactions[i].tx.date + 0x386D4380) * 1000;

	              if(date < dateMin.getTime()) {
	                completed = true;
	                break;
	              }

	              if(date > dateMax.getTime())
	                continue;

	              // Push
	              var tx = rewriter.processTxn(data.transactions[i].tx, data.transactions[i].meta, $id.account);
	              if (tx) history.push(tx);
	            }

	            params.marker = {'ledger':data.transactions[i-1].tx.inLedger,'seq':0};
	            $scope.tx_marker = params.marker;

	            if (completed)
	              callback(history);
	            else
	              getTx();
	          } else {
	            callback(history);
	          }
	        }).request();
	      };

	      getTx(0);
	    };

	    // DateRange filter form
	    $scope.submitDateRangeForm = function() {
	      $scope.dateMaxView.setDate($scope.dateMaxView.getDate() + 1); // Including last date
	      changeDateRange($scope.dateMinView,$scope.dateMaxView);
	    };

	    $scope.submitMinimumAmountForm = function() {
	      updateHistory();
	    };

	    var changeDateRange = function(dateMin,dateMax) {
	      $scope.history = [];
	      $scope.historyState = 'loading';

	      getDateRangeHistory(dateMin,dateMax,function(history){
	        $scope.$apply(function () {
	          $scope.history = history;
	          $scope.historyState = 'ready';
	        })
	      })
	    };

	    // All the currencies
	    $scope.$watch('balances', function(){
	      updateCurrencies();
	    });

	    // Types filter has been changed
	    $scope.$watch('types', function(){
	      var arr = [];
	      var checked = {};
	      _.each($scope.types, function(type,index){
	        if (type.checked) {
	          arr = arr.concat(type.types);
	        }

	        checked[index] = {
	          checked: !!type.checked
	        };
	      });
	      $scope.filters.types = arr;

	      if (!store.disabled) {
	        store.set('ripple_history_type_selections', checked);
	      }
	    }, true);

	    if (!store.disabled) {
	      $scope.$watch('filters', function(){
	        store.set('ripple_history_filters', $scope.filters);
	      }, true);
	    }

	    $scope.$watch('filters.types', function(){
	      updateHistory();
	    }, true);

	    // Currency filter has been changed
	    $scope.$watch('filters.currencies', function(){
	      updateCurrencies();
	      updateHistory();
	    }, true);

	    // New transactions
	    $scope.$watchCollection('history',function(){
	      // TODO This function has a double call on a history change. Don't know why
	      // This is a temporoary fix.
	      if (latest && $scope.history[$scope.history.length-1] && latest.hash === $scope.history[$scope.history.length-1].hash)
	        return;

	      updateHistory();

	      // Update currencies
	      if ($scope.history.length)
	        updateCurrencies();

	      latest = $.extend(true, {}, $scope.history[$scope.history.length-1]);
	    },true);

	    // Updates the history collection
	    var updateHistory = function (){

	      //$scope.typeUsage = [];
	      //$scope.currencyUsage = [];
	      $scope.historyShow = [];

	      if ($scope.history.length) {
	        var dateMin, dateMax;

	        $scope.minLedger = 0;

	        var currencies = _.map($scope.filters.currencies,function(obj,key){return obj.checked ? key : false});
	        $scope.history.forEach(function(event)
	        {

	          // Calculate dateMin/dateMax. Used in date filter view
	          if (!$scope.dateMinView) {
	            if (!dateMin || dateMin > event.date)
	              dateMin = event.date;

	            if (!dateMax || dateMax < event.date)
	              dateMax = event.date;
	          }

	          // Update currencies
	          historyCurrencies = _.union(historyCurrencies, event.affected_currencies); // TODO put in one large array, then union outside of foreach

	          // Calculate min ledger. Used in "load more"
	          if (!$scope.minLedger || $scope.minLedger > event.ledger_index)
	            $scope.minLedger = event.ledger_index;

	          // Type filter
	          if (event.transaction && !_.contains($scope.filters.types,event.transaction.type))
	            return;

	          // Some events don't have transactions.. this is a temporary fix for filtering offers
	          else if (!event.transaction && !_.contains($scope.filters.types,'offernew'))
	            return;

	          // Currency filter
	          if ($scope.filters.currencies_is_active && _.intersection(currencies,event.affected_currencies).length <= 0)
	            return;

	          var effects = [];

	          if (event.effects) {
	            // Show effects
	            $.each(event.effects, function(){
	              var effect = this;
	              switch (effect.type) {
	                case 'offer_funded':
	                case 'offer_partially_funded':
	                case 'offer_bought':
	                case 'offer_cancelled':
	                  if (effect.type === 'offer_cancelled' && event.transaction && event.transaction.type === 'offercancel') {
	                    return;
	                  }
	                  effects.push(effect);
	                  break;
	              }
	            });

	            event.showEffects = effects;

	            effects = [ ];

	            var amount, maxAmount;
	            var minimumAmount = $scope.filters.minimumAmount;

	            // Balance changer effects
	            $.each(event.effects, function(){
	              var effect = this;
	              switch (effect.type) {
	                case 'fee':
	                case 'balance_change':
	                case 'trust_change_balance':
	                  effects.push(effect);

	                  // Minimum amount filter
	                  if (effect.type === 'balance_change' || effect.type === 'trust_change_balance') {
	                    amount = effect.amount.abs().is_native()
	                      ? effect.amount.abs().to_number() / 1000000
	                      : effect.amount.abs().to_number();

	                    if (!maxAmount || amount > maxAmount)
	                      maxAmount = amount;
	                    }
	                  break;
	              }
	            });

	            // Minimum amount filter
	            if (maxAmount && minimumAmount > maxAmount)
	              return;

	            event.balanceEffects = effects;
	          }

	          // Don't show sequence update events
	          if (event.effects && 1 === event.effects.length && event.effects[0].type == 'fee')
	            return;

	          // Push events to history collection
	          $scope.historyShow.push(event);

	          // Type and currency usages
	          // TODO offers/trusts
	          //if (event.transaction)
	          //  $scope.typeUsage[event.transaction.type] = $scope.typeUsage[event.transaction.type] ? $scope.typeUsage[event.transaction.type]+1 : 1;

	          //event.affected_currencies.forEach(function(currency){
	          //  $scope.currencyUsage[currency] = $scope.currencyUsage[currency]? $scope.currencyUsage[currency]+1 : 1;
	          //});
	        });

	        if ($scope.historyShow.length && !$scope.dateMinView) {
	          setValidDateOnScopeOrNullify('dateMinView', dateMin);
	          setValidDateOnScopeOrNullify('dateMaxView', dateMax);
	        }
	      }
	    };

	    // Update the currency list
	    var updateCurrencies = function (){
	      if (!$.isEmptyObject($scope.balances)) {
	        var currencies = _.union(
	          ['XRP'],
	          _.map($scope.balances,function(obj,key){return key.toUpperCase()}),
	          historyCurrencies
	        );

	        var objCurrencies = {};

	        var firstProcess = $.isEmptyObject($scope.filters.currencies);

	        $scope.filters.currencies_is_active = false;

	        _.each(currencies, function(currency){
	          var checked = ($scope.filters.currencies[currency] && $scope.filters.currencies[currency].checked) || firstProcess;
	          objCurrencies[currency] = {'checked':checked};

	          if (!checked)
	            $scope.filters.currencies_is_active = true;
	        });

	        $scope.filters.currencies = objCurrencies;
	      }
	    };

	    var setValidDateOnScopeOrNullify = function(key, value) {
	      if (isNaN(value) || value == null) {
	        $scope[key] = null;
	      } else {
	        $scope[key] = new Date(value);
	      }
	    }

	    $scope.loadMore = function () {
	      var dateMin;

	      $scope.historyState = 'loading';

	      var limit = 100; // TODO why 100?

	      var params = {
	        account: $id.account,
	        ledger_index_min: -1,
	        limit: limit,
	        marker: $scope.tx_marker
	      };

	      $network.remote.request_account_tx(params)
	      .on('success', function(data) {
	        $scope.$apply(function () {
	          if (data.transactions.length < limit) {

	          }

	          $scope.tx_marker = data.marker;

	          if (data.transactions) {
	            var transactions = [];

	            data.transactions.forEach(function (e) {
	              var tx = rewriter.processTxn(e.tx, e.meta, $id.account);
	              if (tx) {
	                transactions.push(tx);

	                // Min date
	                if (!dateMin || tx.date < dateMin)
	                  dateMin = tx.date;
	              }
	            });

	            var newHistory = _.uniq($scope.history.concat(transactions),false,function(ev){return ev.hash});

	            $scope.historyState = ($scope.history.length === newHistory.length) ? 'full' : 'ready';
	            $scope.history = newHistory;
	            setValidDateOnScopeOrNullify('dateMinView', dateMin);
	          }
	        });
	      }).request();
	    }
	  }]);
	};

	module.exports = HistoryTab;


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var util      = __webpack_require__(4);
	var webutil   = __webpack_require__(16);
	var Tab       = __webpack_require__(41).Tab;

	var ContactsTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(ContactsTab, Tab);

	ContactsTab.prototype.tabName = 'contacts';
	ContactsTab.prototype.mainMenu = 'wallet';

	// /contact is the way it appears in Ripple URIs
	ContactsTab.prototype.aliases = ['contact'];

	ContactsTab.prototype.angular = function (module) {
	  module.controller('ContactsCtrl', ['$scope', 'rpId', 'rpTracker',
	    function ($scope, $id, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    $scope.reset_form = function ()
	    {
	      $scope.contact = {
	        name: '',
	        address: ''
	      };
	      if ($scope.addForm) $scope.addForm.$setPristine();
	    };

	    $scope.reset_form();

	    /**
	     * Toggle "add contact" form
	     */
	    $scope.toggle_form = function ()
	    {
	      $scope.addform_visible = !$scope.addform_visible;
	      $scope.reset_form();
	    };

	    /**
	     * Create contact
	     */
	    $scope.create = function ()
	    {
	      var contact = {
	        name: $scope.contact.name,
	        address: $scope.contact.address
	      };

	      if ($scope.contact.dt) {
	        contact.dt = $scope.contact.dt;
	      }

	      // Enable the animation
	      $scope.enable_highlight = true;

	      // Add an element
	      $scope.userBlob.data.contacts.unshift(contact);

	      // Hide the form
	      $scope.toggle_form();

	      // Clear form
	      $scope.reset_form();
	    };
	  }]);

	  module.controller('ContactRowCtrl', ['$scope', '$location',
	    function ($scope, $location) {
	      $scope.editing = false;

	      /**
	       * Switch to edit mode
	       *
	       * @param index
	       */
	      $scope.edit = function (index)
	      {
	        $scope.editing = true;
	        $scope.editname = $scope.entry.name;
	        $scope.editaddress = $scope.entry.address;
	        $scope.editdt = $scope.entry.dt;
	      };

	      /**
	       * Update contact
	       *
	       * @param index
	       */
	      $scope.update = function (index)
	      {
	        if (!$scope.inlineAddress.editaddress.$error.rpUnique
	            && !$scope.inlineAddress.editaddress.$error.rpDest
	            && !$scope.inlineName.editname.$error.rpUnique) {

	          // Update blob
	          $scope.entry.name = $scope.editname;
	          $scope.entry.address = $scope.editaddress;

	          if ($scope.editdt) {
	            $scope.entry.dt = $scope.editdt;
	          }

	          $scope.editing = false;
	        }
	      };

	      /**
	       * Remove contact
	       *
	       * @param index
	       */
	      $scope.remove = function (index) {
	        // Update blob
	        $scope.userBlob.data.contacts.splice(index,1);
	      };

	      /**
	       * Cancel contact edit
	       *
	       * @param index
	       */
	      $scope.cancel = function (index)
	      {
	        $scope.editing = false;
	      };

	      $scope.send = function (index)
	      {
	        var search = {to: $scope.entry.name};

	        $location.path('/send');
	        $location.search(search);
	      };
	    }]);
	};

	module.exports = ContactsTab;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var util = __webpack_require__(4),
	    webutil = __webpack_require__(16),
	    Tab = __webpack_require__(41).Tab,
	    Amount = ripple.Amount,
	    Base = ripple.Base;

	var ConvertTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(ConvertTab, Tab);

	ConvertTab.prototype.tabName = 'convert';
	ConvertTab.prototype.mainMenu = 'wallet';

	ConvertTab.prototype.angular = function (module)
	{
	  module.controller('ConvertCtrl', ['$scope', '$timeout', '$routeParams', 'rpId', 'rpNetwork', 'rpTracker',
	    function ($scope, $timeout, $routeParams, $id, $network, $rpTracker)
	    {
	      if (!$id.loginStatus) return $id.goId();

	      var timer;

	      $scope.xrp = _.where($scope.currencies_all, {value: "XRP"})[0];

	      $scope.$watch('convert.amount', function () {
	        $scope.update_convert();
	      }, true);

	      $scope.$watch('convert.currency', function () {
	        $scope.convert.currency_code = $scope.convert.currency ? $scope.convert.currency.slice(0, 3).toUpperCase() : "XRP";
	        $scope.update_convert();
	      }, true);

	      var pathUpdateTimeout;
	      $scope.update_convert = function () {
	        var convert = $scope.convert;
	        var currency = convert.currency_code;
	        var formatted = "" + convert.amount + " " + currency.slice(0, 3);

	        // if formatted or money to convert is 0 then don't calculate paths or offer to convert
	        if (parseFloat(formatted) === 0)
	        {
	          $scope.error_type = 'required';
	          return false;
	        }

	        convert.amount_feedback = Amount.from_human(formatted);
	        convert.amount_feedback.set_issuer($id.account);

	        if (convert.amount_feedback.is_valid()) {
	          convert.path_status = 'pending';
	          convert.alt = null;

	          if (pathUpdateTimeout) clearTimeout(pathUpdateTimeout);
	          pathUpdateTimeout = $timeout($scope.update_paths, 500);
	        } else {
	          convert.path_status = 'waiting';
	        }
	      };

	      $scope.update_paths = function () {
	        $scope.$apply(function () {
	          $scope.convert.path_status = 'pending';
	          var amount = $scope.convert.amount_feedback;

	          if (amount.is_zero()) return;

	          // Start path find
	          var pf = $network.remote.path_find($id.account,
	              $id.account,
	              amount);

	          var lastUpdate;

	          pf.on('update', function (upd) {
	            $scope.$apply(function () {
	              lastUpdate = new Date();

	              clearInterval(timer);
	              timer = setInterval(function(){
	                $scope.$apply(function(){
	                  var seconds = Math.round((new Date() - lastUpdate)/1000);
	                  $scope.lastUpdate = seconds ? seconds : 0;
	                })
	              }, 1000);

	              console.log(upd);
	              
	              if (!upd.alternatives || !upd.alternatives.length) {
	                $scope.convert.path_status = "no-path";
	                $scope.convert.alternatives = [];
	              } else {
	                $scope.convert.path_status = "done";
	                $scope.convert.alternatives = _.map(upd.alternatives, function (raw) {
	                  var alt = {};
	                  alt.amount = Amount.from_json(raw.source_amount);
	                  alt.rate   = alt.amount.ratio_human(amount);
	                  alt.send_max = alt.amount.product_human(Amount.from_json('1.01'));
	                  alt.paths = raw.paths_computed
	                      ? raw.paths_computed
	                      : raw.paths_canonical;

	                  return alt;
	                });
	              }
	            });
	          });
	        });
	      };

	      $scope.currency_query = webutil.queryFromOptions($scope.currencies_all);
	      $scope.$watch('lines', function (lines) {
	        var currencies = _.uniq(_.map(_.keys(lines), function (line) {
	          return line.slice(-3);
	        }));

	        // XXX Not the fastest way of doing it...
	        currencies = _.map(currencies, function (currency) {
	          _.each($scope.currencies_all, function (entry) {
	            if (currency === entry.value) {
	              currency = entry.name;
	              return false;
	            }
	          });
	          return currency;
	        });
	        $scope.source_currency_query = webutil.queryFromArray(currencies);
	      }, true);

	      $scope.reset = function () {
	        $scope.mode = "form";

	        // XXX Most of these variables should be properties of $scope.convert.
	        //     The Angular devs recommend that models be objects due to the way
	        //     scope inheritance works.
	        $scope.convert = {
	          amount: '',
	          currency: $scope.xrp.name,
	          currency_code: "XRP",
	          path_status: 'waiting',
	          fund_status: 'none'
	        };
	        $scope.nickname = '';
	        $scope.error_type = '';
	        if ($scope.convertForm) $scope.convertForm.$setPristine(true);
	      };

	      $scope.cancelConfirm = function () {
	        $scope.mode = "form";
	        $scope.convert.alt = null;
	      };

	      $scope.reset_goto = function (tabName) {
	        $scope.reset();

	        // TODO do something clever instead of document.location
	        // because goToTab does $scope.$digest() which we don't need
	        document.location = '#' + tabName;
	      };

	      /**
	       * N3. Confirmation page
	       */
	      $scope.convert_prepared = function () {
	        $scope.confirm_wait = true;
	        $timeout(function () {
	          $scope.confirm_wait = false;
	        }, 1000, true);

	        $scope.mode = "confirm";
	      };

	      /**
	       * N4. Waiting for transaction result page
	       */
	      $scope.convert_confirmed = function () {
	        var currency = $scope.convert.currency.slice(0, 3).toUpperCase();
	        var amount = Amount.from_human(""+$scope.convert.amount+" "+currency);

	        amount.set_issuer($id.account);

	        var tx = $network.remote.transaction();

	        // Destination tag
	        tx.destination_tag(webutil.getDestTagFromAddress($id.account));
	        tx.payment($id.account, $id.account, amount.to_json());
	        tx.send_max($scope.convert.alt.send_max);
	        tx.paths($scope.convert.alt.paths);

	        tx.on('proposed', function (res) {
	          $scope.$apply(function () {
	            setEngineStatus(res, false);
	            $scope.converted(tx.hash);

	            // Remember currency and increase order
	            var found;

	            for (var i = 0; i < $scope.currencies_all.length; i++) {
	              if ($scope.currencies_all[i].value.toLowerCase() === $scope.convert.amount_feedback.currency().to_human().toLowerCase()) {
	                $scope.currencies_all[i].order++;
	                found = true;
	                break;
	              }
	            }

	            if (!found) {
	              $scope.currencies_all.push({
	                "name": $scope.convert.amount_feedback.currency().to_human().toUpperCase(),
	                "value": $scope.convert.amount_feedback.currency().to_human().toUpperCase(),
	                "order": 1
	              });
	            }
	          });
	        });
	        tx.on('success',function(res){
	          setEngineStatus(res, true);
	        });
	        tx.on('error', function (res) {
	          setImmediate(function () {
	            $scope.$apply(function () {
	              $scope.mode = "error";

	              if (res.error === 'remoteError' &&
	                  res.remote.error === 'noPath') {
	                $scope.mode = "status";
	                $scope.tx_result = "noPath";
	              }
	            });
	          });
	        });
	        tx.submit();

	        $scope.mode = "sending";
	      };

	      /**
	       * N6. Converted page
	       */
	      $scope.converted = function (hash) {
	        $scope.mode = "status";
	        $network.remote.on('transaction', handleAccountEvent);

	        function handleAccountEvent(e) {
	          $scope.$apply(function () {
	            if (e.transaction.hash === hash) {
	              setEngineStatus(e, true);
	              $network.remote.removeListener('transaction', handleAccountEvent);
	            }
	          });
	        }
	      };

	      function setEngineStatus(res, accepted) {
	        $scope.engine_result = res.engine_result;
	        $scope.engine_result_message = res.engine_result_message;
	        switch (res.engine_result.slice(0, 3)) {
	          case 'tes':
	            $scope.tx_result = accepted ? "cleared" : "pending";
	            break;
	          case 'tem':
	            $scope.tx_result = "malformed";
	            break;
	          case 'ter':
	            $scope.tx_result = "failed";
	            break;
	          case 'tep':
	            $scope.tx_result = "partial";
	            break;
	          case 'tec':
	            $scope.tx_result = "claim";
	            break;
	          case 'tef':
	            $scope.tx_result = "failure";
	            break;
	          case 'tel':
	            $scope.tx_result = "local";
	            break;
	          default:
	            console.warn("Unhandled engine status encountered!");
	        }
	      }

	      $scope.reset();
	    }]);

	  /**
	   * Contact name and address uniqueness validator
	   */
	    // TODO move to global directives
	  module.directive('unique', function() {
	    return {
	      restrict: 'A',
	      require: '?ngModel',
	      link: function ($scope, elm, attr, ctrl) {
	        if (!ctrl) return;

	        var validator = function(value) {
	          var unique = !webutil.getContact($scope.userBlob.data.contacts,value);
	          ctrl.$setValidity('unique', unique);
	          if (unique) return value;
	        };

	        ctrl.$formatters.push(validator);
	        ctrl.$parsers.unshift(validator);

	        attr.$observe('unique', function() {
	          validator(ctrl.$viewValue);
	        });
	      }
	    };
	  });
	};

	module.exports = ConvertTab;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4),
	    Tab = __webpack_require__(41).Tab,
	    rewriter = __webpack_require__(9);

	var CashinTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(CashinTab, Tab);

	CashinTab.prototype.tabName = 'cashin';
	CashinTab.prototype.mainMenu = 'wallet';

	CashinTab.prototype.angular = function (module)
	{
	  module.controller('CashinCtrl', ['$scope', '$rootScope', 'rpId', 'rpNetwork', 'rpZipzap', 'rpTracker',
	  function ($scope, $rootScope, $id, $network, $zipzap, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    $scope.form = {
	      'countrycode': 'US'
	    };

	    // TODO request results should be stored in blob
	    $scope.$watch('address',function(address){
	      if (!$rootScope.zipzap && address) {
	        var account = $network.remote.account(address);

	        $scope.loading = true;

	        // Get ZipZap account
	        if ($scope.userBlob.data.zipzap && !$.isEmptyObject($scope.userBlob.data.zipzap)) {
	          account.line('USD','rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',function(err,line){
	            $scope.$apply(function () {
	              $scope.mode = line && line.limit > 0 ? 'details' : 'step2';
	              $scope.zipzap = $scope.userBlob.data.zipzap;
	              $scope.loading = false;
	            })
	          });
	        }
	        else {
	          $scope.mode = 'step1';
	          $scope.loading = false;
	        }
	      }
	    });

	    // TODO ability to edit account details
	    $scope.signup = function() {
	      $scope.signupProgress = 'loading';

	      // Create zipzap account, fund the ripple wallet
	      $zipzap.register($id.account,$scope.form);
	      $zipzap.request(function(response){
	        var account = $network.remote.account($scope.address);

	        $scope.signupProgress = false;
	        if (response.ZipZapAcctNum) {
	          // Add ZipZap account to user blob
	          $scope.userBlob.data.zipzap = response;

	          // Check trust to SnapSwap
	          account.line('USD','rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q',function(err,line){
	            $scope.$apply(function () {
	              $scope.displaySignupForm = false;
	              $scope.mode = line && line.limit > 0 ? 'details' : 'step2';
	              $scope.zipzap = response;
	              $scope.loading = false;
	            })
	          });

	          $rpTracker.track('ZipZap register', {
	            'Status': 'success'
	          });
	        } else {
	          $scope.$apply(function () {
	            if (response && response.Message) {
	              $scope.error = {
	                'code': response.Code,
	                'message': response.Message,
	                'verboseMessage': response.VerboseMessage
	              };

	              $rpTracker.track('ZipZap register', {
	                'Status': 'error',
	                'Message': response.VerboseMessage
	              });
	            } else {
	              $scope.error = {
	                'code': null,
	                'message': 'Invalid form',
	                'verboseMessage': 'Form is invalid, please make sure entered information is correct'
	              };

	              $rpTracker.track('ZipZap register', {
	                'Status': 'error',
	                'Message': 'Form is invalid'
	              });
	            }
	          });
	        }
	      });
	    };

	    // Locate ZipZap payment centers
	    $scope.locate = function() {
	      $scope.locateStatus = 'loading';

	      $zipzap.locate($scope.query);
	      $zipzap.request(function(response){
	        $scope.$apply(function () {
	          $scope.locations = response;
	          $scope.locateStatus = false;

	          if (!response.PayCenters || (response.PayCenters && !response.PayCenters.length)) {
	            $scope.locateStatus = 'notfound';

	            $rpTracker.track('ZipZap locate payment center', {
	              'Status': 'success'
	            });
	          } else {
	            $rpTracker.track('ZipZap locate payment center', {
	              'Status': 'notfound'
	            });
	          }
	        });
	      })
	    }
	  }]);

	  module.directive('rpDob', function () {
	    return {
	      restrict: 'A',
	      require: '?ngModel',
	      link: function (scope, elm, attr, ctrl) {
	        if (!ctrl) return;

	        var pattern = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;

	        var validator = function(value) {
	          ctrl.$setValidity('rpDob', pattern.test(value));
	          return value;
	        };

	        ctrl.$formatters.push(validator);
	        ctrl.$parsers.unshift(validator);

	        attr.$observe('rpDob', function() {
	          validator(ctrl.$viewValue);
	        });
	      }
	    };
	  });
	};

	module.exports = CashinTab;


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var util = __webpack_require__(4);
	var webutil = __webpack_require__(16);
	var Tab = __webpack_require__(41).Tab;
	var Amount = ripple.Amount;

	var TrustTab = function ()
	{
	  Tab.call(this);

	};

	util.inherits(TrustTab, Tab);

	TrustTab.prototype.tabName = 'trust';
	TrustTab.prototype.mainMenu = 'advanced';

	TrustTab.prototype.angular = function (module)
	{
	  module.controller('TrustCtrl', ['$scope', '$timeout', '$routeParams', 'rpId', '$filter', 'rpNetwork', 'rpTracker',
	                                  function ($scope, $timeout, $routeParams, $id, $filter, $network, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    // Trust line sorting
	    $scope.sorting = {
	      predicate: 'balance',
	      reverse: true,
	      sort: function(line){
	        return $scope.sorting.predicate === 'currency' ? line.currency : line.balance.to_number();
	      }
	    };

	    // orderBy filter works with arrays
	    $scope.$watch('lines', function(lines){
	      $scope.linesArray = _.toArray(lines);
	    }, true);

	    $scope.validation_pattern = /^0*(([1-9][0-9]*.?[0-9]*)|(.0*[1-9][0-9]*))$/; //Don't allow zero for new trust lines.
	    $scope.reset = function () {
	      $scope.mode = 'main';
	      $scope.currency = 'USD';
	      $scope.addform_visible = false;
	      $scope.editform_visible = false;
	      $scope.edituser = '';
	      $scope.amount = '';
	      $scope.allowrippling = false;
	      $scope.counterparty = '';
	      $scope.saveAddressName = '';
	      $scope.error_account_reserve = false;

	      // If all the form fields are prefilled, go to confirmation page
	      if ($routeParams.to && $routeParams.amount) {
	        // At this stage 'counterparty_address' may be empty. Wait for it...
	        var watcher = $scope.$watch('counterparty_address', function(address){
	          if (address) {
	            $scope.grant();
	            watcher();
	          }
	        })
	      }
	    };

	    $scope.toggle_form = function () {
	      if($scope.addform_visible || $scope.editform_visible)
	        $scope.reset();
	      else
	        $scope.addform_visible = true;
	    };

	    // User should not even be able to try grunting a trust if the reserve is insufficient
	    $scope.$watch('account', function() {
	      $scope.can_add_trust = false;
	      if ($scope.account.Balance && $scope.account.reserve_to_add_trust) {
	        if (!$scope.account.reserve_to_add_trust.subtract($scope.account.Balance).is_positive()
	          || $.isEmptyObject($scope.lines))
	        {
	          $scope.can_add_trust = true;
	        }
	      }
	    }, true);

	    $scope.$watch('counterparty', function() {
	      $scope.error_account_reserve = false;
	      $scope.contact = webutil.getContact($scope.userBlob.data.contacts,$scope.counterparty);
	      if ($scope.contact) {
	        $scope.counterparty_name = $scope.contact.name;
	        $scope.counterparty_address = $scope.contact.address;
	      } else {
	        $scope.counterparty_name = '';
	        $scope.counterparty_address = $scope.counterparty;
	      }
	    }, true);

	    /**
	     * N2. Confirmation page
	     */
	    $scope.grant = function ()
	    {
	      // set variable to show throbber
	      $scope.verifying = true;
	      $scope.error_account_reserve = false;
	      // test if account is valid
	      $network.remote.request_account_info($scope.counterparty_address)
	        // if account is valid then just to confirm page
	        .on('success', function (m){
	          $scope.$apply(function(){
	            // hide throbber
	            $scope.verifying = false;
	            var amount = ripple.Amount.from_human('' + $scope.amount + ' ' + $scope.currency.slice(0, 3).toUpperCase());

	            $scope.amount_feedback = amount.to_human();
	            $scope.currency_feedback = amount.currency().to_json();

	            $scope.confirm_wait = true;
	            $timeout(function () {
	              $scope.confirm_wait = false;
	            }, 1000, true);

	            $scope.mode = 'confirm';

	            /**
	             * Warning messages
	             *
	             * - firstIssuer
	             * - sameIssuer
	             * - multipleIssuers
	             */
	            var currency = amount.currency().to_json();
	            var balance = $scope.balances[currency];
	            $scope.currencyWarning = false;

	            // New trust on a currency
	            if (!balance) {
	              $scope.currencyWarning = 'firstIssuer';
	            }
	            else {
	              // Trust limit change
	              for (var counterparty in balance.components) {
	                if (counterparty === $scope.counterparty_address)
	                  $scope.currencyWarning = 'sameIssuer';
	              }

	              // Multiple trusts on a same currency
	              if (!$scope.currencyWarning)
	                $scope.currencyWarning = 'multipleIssuers';
	            }
	          });
	        })
	        .on('error', function (m){
	          setImmediate(function () {
	            $scope.$apply(function(){
	              $scope.verifying = false;
	              $scope.error_account_reserve = true;
	            });
	          });
	        })
	        .request();
	    };

	    /**
	     * N3. Waiting for grant result page
	     */
	    $scope.grant_confirmed = function () {
	      var currency = $scope.currency.slice(0, 3).toUpperCase();
	      var amount = $scope.amount + '/' + currency + '/' + $scope.counterparty_address;

	      var tx = $network.remote.transaction();

	      // Flags
	      tx
	        .rippleLineSet($id.account, amount)
	        .setFlags($scope.allowrippling ? 'ClearNoRipple' : 'NoRipple')
	        .on('proposed', function(res){
	          $scope.$apply(function () {
	            setEngineStatus(res, false);
	            $scope.granted(tx.hash);

	            // Remember currency and increase order
	            var found;

	            for (var i = 0; i < $scope.currencies_all.length; i++) {
	              if ($scope.currencies_all[i].value.toLowerCase() === currency.toLowerCase()) {
	                $scope.currencies_all[i].order++;
	                found = true;
	                break;
	              }
	            }

	            if (!found) {
	              $scope.currencies_all.push({
	                'name': currency,
	                'value': currency,
	                'order': 1
	              });
	            }
	          });
	        })
	        .on('success', function(res){
	          $scope.$apply(function () {
	            setEngineStatus(res, true);
	          });
	        })
	        .on('error', function(res){
	          setImmediate(function () {
	            $scope.$apply(function () {
	              $scope.mode = 'error';
	            });
	          });
	        })
	        .submit()
	      ;

	      $scope.mode = 'granting';
	    };

	    /**
	     * N5. Granted page
	     */
	    $scope.granted = function (hash) {
	      $scope.mode = 'granted';
	      $network.remote.on('transaction', handleAccountEvent);

	      function handleAccountEvent(e) {
	        $scope.$apply(function () {
	          if (e.transaction.hash === hash) {
	            setEngineStatus(e, true);
	            $network.remote.removeListener('transaction', handleAccountEvent);
	          }
	        });
	      }
	    };

	    function setEngineStatus(res, accepted) {
	      $scope.engine_result = res.engine_result;
	      $scope.engine_result_message = res.engine_result_message;

	      switch (res.engine_result.slice(0, 3)) {
	        case 'tes':
	          $scope.tx_result = accepted ? 'cleared' : 'pending';
	          break;
	        case 'tem':
	          $scope.tx_result = 'malformed';
	          break;
	        case 'ter':
	          $scope.tx_result = 'failed';
	          break;
	        case 'tec':
	          $scope.tx_result = 'failed';
	          break;
	        case 'tel':
	          $scope.tx_result = "local";
	          break;
	        case 'tep':
	          console.warn('Unhandled engine status encountered!');
	      }
	    }

	    $scope.saveAddress = function () {
	      $scope.addressSaving = true;

	      var contact = {
	        'name': $scope.saveAddressName,
	        'address': $scope.counterparty_address
	      };

	      var removeListener = $scope.$on('$blobSave', function () {
	        removeListener();
	        $scope.contact = contact;
	        $scope.addressSaved = true;
	      });

	      $scope.userBlob.data.contacts.unshift(contact);
	    };

	    $scope.edit_line = function ()
	    {
	      var line = this.line;
	      var filterAddress = $filter('rpcontactnamefull');
	      var contact = filterAddress(line.account);
	      $scope.edituser = (contact) ? contact : 'User';
	      $scope.validation_pattern = contact ? /^[0-9.]+$/ : /^0*(([1-9][0-9]*.?[0-9]*)|(.0*[1-9][0-9]*))$/;
	      $scope.currency = line.currency;
	      $scope.counterparty = line.account;
	      $scope.amount = +line.limit.to_text();
	      console.log('line',line);
	      $scope.allowrippling = !line.no_ripple;

	      // Close/open form. Triggers focus on input.
	      $scope.addform_visible = false;
	      $scope.editform_visible = false;
	      $timeout(function(){
	        $scope.editform_visible = true;
	      })
	    };

	    /**
	     * Used for rpDestination validator
	     *
	     * @param destionation
	     */
	    $scope.counterparty_query = function (match, re) {
	      var opts = $scope.userBlob.data.contacts.map(function (contact) {
	        return contact.name;
	      });

	      if (re instanceof RegExp) {
	        return opts.filter(function (v) {
	          return v.toLowerCase().match(match.toLowerCase());
	        });
	      } else return opts;
	    };

	    $scope.currency_query = webutil.queryFromOptions($scope.currencies_all);

	    $scope.reset();
	  }]);
	};

	module.exports = TrustTab;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var util = __webpack_require__(4),
	    webutil = __webpack_require__(16),
	    Tab = __webpack_require__(41).Tab,
	    Amount = ripple.Amount,
	    Base = ripple.Base,
	    RippleError = ripple.RippleError;

	var SendTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(SendTab, Tab);

	SendTab.prototype.tabName = 'send';
	SendTab.prototype.mainMenu = 'send';

	SendTab.prototype.angularDeps = Tab.prototype.angularDeps.concat(['federation']);

	SendTab.prototype.angular = function (module)
	{
	  module.controller('SendCtrl', ['$scope', '$timeout', '$routeParams', 'rpId',
	                                 'rpNetwork', 'rpFederation', 'rpTracker',
	                                 function ($scope, $timeout, $routeParams, $id,
	                                           $network, $federation, $rpTracker)
	  {
	    // XRP currency object.
	    // {name: "XRP - Ripples", order: 146, value: "XRP"}
	    $scope.xrp = _.where($scope.currencies_all, {value: "XRP"})[0];

	    $scope.recipient_update = function() {
	      // raw address without any parameters
	      var address = webutil.stripRippleAddress($scope.send.recipient);

	      $scope.contact = '';

	      // Sets
	      // send.recipient, send.recipient_name, send.recipient_address, send.dt.
	      if ($scope.contact) {
	        if ($scope.send.recipient === $scope.contact.address) {
	          $scope.send.recipient = $scope.contact.name;
	        }
	        $scope.send.recipient_name = $scope.contact.name;
	        $scope.send.recipient_address = $scope.contact.address;

	        if ($scope.contact.dt) {
	          $scope.send.dt = $scope.contact.dt;
	        }
	      }
	      else {
	        $scope.send.recipient_name = '';
	        $scope.send.recipient_address = address;
	      }

	      $scope.update_destination();
	    };

	    $scope.currency_update = function() {
	      $scope.send.currency_code = $scope.send.currency ? $scope.send.currency.slice(0, 3).toUpperCase() : "XRP";
	      $scope.update_currency();
	    };

	    $scope.amount_update = function() {
	      $scope.update_amount();
	    };

	    $scope.total_update = function(recipient, currency, amount, dt) {
	      $scope.send = {};
	      $scope.send.recipient = recipient;
	      $scope.send.currency = currency;
	      $scope.send.amount = amount;
	      $scope.send.dt = dt;
	      $scope.send.recipient_info = {};
	      $scope.send.recipient_info.exists = true;
	      $scope.send.recipient_info.dest_tag_required = true;

	      $scope.recipient_update();
	      $scope.currency_update();
	      $scope.amount_update();

	      console.log($scope.send.path_status);

	      // send transaction
	      $scope.send_confirmed();
	    };

	    $scope.send_one_step = function(recipient, currency, amount, dt) {
	      var scope = angular.element(document.querySelectorAll('[ng-controller=AppCtrl]')).scope();
	      scope.network.remote.connect();
	      function waitForConnection() {
	        if (scope.network.connected==false) {
	            setTimeout(waitForConnection, 500);
	        } else {
	          $scope.send.amount = amount;
	          $scope.send.currency = currency;
	          $scope.send.recipient = recipient;
	          $scope.send.amount = amount;
	          $scope.send.dt = dt;
	          $scope.update_destination_remote();
	        }
	      }
	      waitForConnection();
	    };

	    $scope.send_payment = function(alt) {
	      $scope.send.alt = alt;
	      $scope.send_confirmed();
	      $scope.reset_destination_deps();
	    };

	    $scope.$watch('send.recipient', $scope.recipient_update, true);
	    $scope.$watch('send.currency', $scope.currency_update, true);
	    $scope.$watch('send.amount', $scope.amount_update, true);
	    $scope.$watch('send.extra_fields', $scope.amount_update, true);

	    var destUpdateTimeout;

	    // Reset everything that depends on the destination
	    $scope.reset_destination_deps = function() {
	      var send = $scope.send;
	      send.self = false;
	      send.bitcoin = false;
	      send.quote_url = false;
	      send.federation = false;
	      send.fund_status = "none";
	      send.extra_fields = [];

	      // Now starting to work on resolving the recipient
	      send.recipient_resolved = false;

	      $scope.reset_currency_deps();
	    };

	    $scope.check_dt_visibility = function () {
	      var send = $scope.send;

	      send.show_dt_field = ($routeParams.dt
	        || send.dt
	        || send.recipient_info.dest_tag_required)
	          && !send.bitcoin
	          && !send.federation;
	    };

	    $scope.update_destination = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_address;

	      if (recipient === send.last_recipient) return;

	      send.last_recipient = recipient;

	      $scope.reset_destination_deps();

	      // Trying to send XRP to self.
	      // This is used to disable 'Send XRP' button
	      send.self = recipient === $scope.address;

	      // Trying to send to a Bitcoin address
	      send.bitcoin = !isNaN(Base.decode_check([0, 5], recipient, 'bitcoin'));

	      // Trying to send to an email/federation address
	      send.federation = ("string" === typeof recipient) && ~recipient.indexOf('@');

	      // Check destination tag visibility
	      $scope.check_dt_visibility();

	      if (destUpdateTimeout) $timeout.cancel(destUpdateTimeout);
	      destUpdateTimeout = $timeout($scope.update_destination_remote, 500);
	    };

	    $scope.update_destination_remote = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_address;

	      if (send.bitcoin) {
	        send.quote_url = Options.bridge.out.bitcoin;
	        send.quote_destination = recipient;

	        // Destination is not known yet, skip ahead
	        $scope.update_currency_constraints();
	      }
	      else if (send.federation) {
	        send.path_status = "fed-check";
	        $federation.check_email(recipient)
	          .then(function (result) {
	            // Check if this request is still current, exit if not
	            var now_recipient = send.recipient_actual || send.recipient_address;
	            if (recipient !== now_recipient) return;

	            send.federation_record = result;

	            if (result.extra_fields) {
	              send.extra_fields = result.extra_fields;
	            }

	            send.dt = ("number" === typeof result.dt) ? result.dt : undefined;

	            if (result.destination_address) {
	              // Federation record specifies destination
	              send.recipient_name = recipient;
	              send.recipient_address = result.destination_address;

	              $scope.check_destination();
	            } else if (result.quote_url) {
	              // Federation destination requires us to request a quote
	              send.quote_url = result.quote_url;
	              send.quote_destination = result.destination;
	              send.path_status = "waiting";
	              $scope.update_currency_constraints();
	            } else {
	              // Invalid federation result
	              send.path_status = "waiting";
	              // XXX Show specific error message
	            }
	          }, function () {
	            // Check if this request is still current, exit if not
	            var now_recipient = send.recipient_actual || send.recipient_address;
	            if (recipient !== now_recipient) return;

	            send.path_status = "waiting";
	          })
	        ;
	      }
	      else {
	        $scope.check_destination();
	      }
	    };

	    // Check destination for XRP sufficiency and flags
	    $scope.check_destination = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_actual || send.recipient_address || send.recipient;

	      if (!ripple.UInt160.is_valid(recipient)) return;

	      var account = $network.remote.account(recipient);

	      send.path_status = 'checking';
	      account.entry(function (e, data) {
	        $scope.$apply(function () {
	          // Check if this request is still current, exit if not
	          var now_recipient = send.recipient_actual || send.recipient_address;
	          if (recipient !== now_recipient) return;

	          // If we get this far, we have a Ripple address resolved
	          send.recipient_resolved = true;

	          if (e) {
	            if (e.remote.error === "actNotFound") {
	              send.recipient_info = {
	                'loaded': true,
	                'exists': false,
	                'Balance': "0"
	              };
	              $scope.update_currency_constraints();
	            } else {
	              // XXX Actual error
	            }
	          } else {
	            send.recipient_info = {
	              'loaded': true,
	              'exists': true,
	              'Balance': data.account_data.Balance,

	              // Flags
	              'disallow_xrp': data.account_data.Flags & ripple.Remote.flags.account_root.DisallowXRP,
	              'dest_tag_required': data.account_data.Flags & ripple.Remote.flags.account_root.RequireDestTag
	            };

	            // Check destination tag visibility
	            $scope.check_dt_visibility();

	            if (!$scope.account || !$scope.account.reserve_base) return;

	            var reserve_base = $scope.account.reserve_base;
	            send.xrp_deficiency = reserve_base.subtract(data.account_data.Balance);

	            send.recipient_lines = false;
	            $scope.update_currency_constraints();
	          }
	        });
	      });
	    };

	    /**
	     * Update any constraints on what currencies the user can select.
	     *
	     * In many modes, the user is restricted in terms of what they can send.
	     * For example, when sending to a Bitcoin address, they can only send BTC.
	     *
	     * This function checks those conditions and updates the UI.
	     */
	    $scope.update_currency_constraints = function () {
	      var send = $scope.send;

	      // Reset constraints
	      send.currency_choices = $scope.currencies_all;
	      send.currency_force = false;

	      // Apply Bitcoin currency restrictions
	      if (send.bitcoin) {
	        // Force BTC
	        send.currency_choices = ["BTC"];
	        send.currency_force = "BTC";
	        send.currency = "BTC";
	        return;
	      }

	      // Federation response can specific a fixed amount
	      if (send.federation_record &&
	          "undefined" !== typeof send.federation_record.amount) {
	        send.force_amount = Amount.from_json(send.federation_record.amount);
	        send.amount = send.force_amount.to_text();
	        send.currency_choices = [send.force_amount.currency().to_json()];
	        send.currency_force = send.force_amount.currency().to_json();
	        send.currency = send.currency_force;
	      }

	      // Apply federation currency restrictions
	      if (send.federation_record &&
	          $.isArray(send.federation_record.currencies) &&
	          send.federation_record.currencies.length >= 1 &&
	          "object" === typeof send.federation_record.currencies[0] &&
	          "string" === typeof send.federation_record.currencies[0].currency) {
	        // XXX Do some validation on this
	        send.currency_choices = [];
	        $.each(send.federation_record.currencies, function () {
	          send.currency_choices.push(this.currency);
	        });
	        send.currency_force = send.currency_choices[0];
	        send.currency = send.currency_choices[0];
	      }

	      if (!send.recipient_info.loaded) return;

	      if (send.recipient_info.exists) {
	        // Check allowed currencies for this address
	        $network.remote.request_account_currencies(send.recipient_address)
	          .on('success', function (data) {
	            if (data.receive_currencies) {
	              $scope.$apply(function () {
	                send.restrict_currencies = data.receive_currencies;
	                // Generate list of accepted currencies
	                send.currency_choices = _.uniq(_.compact(_.map(data.receive_currencies, function (currency) {
	                  return currency;
	                })));

	                // Add XRP if they allow it
	                if (!send.recipient_info.disallow_xrp) {
	                  send.currency_choices.unshift("XRP");
	                }
	              });
	            }
	          })
	          .on('error', function () {})
	          .request();
	      } else if (send.recipient_info.exists) {
	        // Their account exists, but we couldn't grab their trust lines,
	        // probably because their owner directory is too large. So, we'll
	        // just show a default selection of currencies.

	        // If we do nothing here, we'll be showing the default currency list

	        // Do nothing
	      } else {
	        // If the account doesn't exist, we can only send XRP
	        send.currency_choices = ["XRP"];
	        send.currency_force = "XRP";
	        send.currency = "XRP";
	      }

	      $scope.update_currency();
	    };

	    // Reset anything that depends on the currency
	    $scope.reset_currency_deps = function () {
	      // XXX Reset

	      $scope.reset_amount_deps();
	    };

	    $scope.update_currency = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_actual || send.recipient_address;
	      var currency = send.currency;

	      $scope.reset_currency_deps();

	      if (!ripple.UInt160.is_valid(recipient)) {
	        return;
	      }

	      $scope.update_amount();
	    };

	    var pathUpdateTimeout;

	    $scope.reset_amount_deps = function () {
	      var send = $scope.send;
	      send.sender_insufficient_xrp = false;
	      send.quote = false;

	      $scope.reset_paths();
	    };

	    $scope.update_amount = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_actual || send.recipient_address;
	      var currency = send.currency;
	      var formatted = "" + send.amount + " " + currency.slice(0, 3);

	      var amount = send.amount_feedback = Amount.from_human(formatted);

	      $scope.reset_amount_deps();
	      send.path_status = 'waiting';

	      if (send.quote_url) {
	        if (!send.amount_feedback.is_valid())
	          return;

	        // Dummy issuer
	        send.amount_feedback.set_issuer(1);
	        $scope.update_quote();
	      } else {
	        if (!ripple.UInt160.is_valid(recipient) || !ripple.Amount.is_valid(amount)) {
	          // XXX Error?
	          return;
	        }

	        // Create Amount object
	        if (!send.amount_feedback.is_native()) {
	          send.amount_feedback.set_issuer(recipient);
	        }

	        // If we don't have recipient info yet, then don't search for paths
	        if (!send.recipient_info) {
	          return;
	        }

	        // Cannot make XRP payment if the sender does not have enough XRP
	        send.sender_insufficient_xrp = send.amount_feedback.is_native()
	          && $scope.account.max_spend
	          && $scope.account.max_spend.to_number() > 1
	          && $scope.account.max_spend.compareTo(send.amount_feedback) < 0;

	        var total = send.amount_feedback.add(send.recipient_info.Balance);
	        var reserve_base = $scope.account.reserve_base;
	        if (total.compareTo(reserve_base) < 0) {
	          send.fund_status = "insufficient-xrp";
	          send.xrp_deficiency = reserve_base.subtract(send.recipient_info.Balance);
	        }

	        // If the destination doesn't exist, then don't search for paths.
	        if (!send.recipient_info.exists) {
	          send.path_status = 'none';
	          return;
	        }

	        send.path_status = 'pending';
	        $scope.update_paths();
	      }
	    };

	    /**
	     * Query the bridge for a quote.
	     *
	     * This will set send.amount_actual and send.recipient_actual based on the
	     * quote that the bridge returns.
	     */
	    $scope.update_quote = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_actual || send.recipient_address;

	      $scope.reset_paths();

	      try {
	        // Get a quote
	        send.path_status = "bridge-quote";

	        var data = {
	          type: "quote",
	          amount: send.amount_feedback.to_text()+"/"+send.amount_feedback.currency().to_json(),
	          destination: send.quote_destination,
	          address: $scope.address
	        };

	        if ($.isArray(send.extra_fields)) {
	          $.each(send.extra_fields, function () {
	            data[this.name] = this.value;
	          });
	        }

	        $.ajax({
	          url: send.quote_url,
	          dataType: 'json',
	          data: data,
	          error: function () {
	            setImmediate(function () {
	              $scope.$apply(function () {
	                $scope.send.path_status = "error-quote";
	              });
	            });
	          },
	          success: function (data) {
	            $scope.$apply(function () {
	              // Check if this request is still current, exit if not
	              var now_recipient = send.recipient_actual || send.recipient_address;
	              if (recipient !== now_recipient) return;

	              var now_amount = send.amount_feedback;
	              if (!now_amount.equals(send.amount_feedback)) return;

	              if (!data || !data.quote ||
	                  !(data.result === "success" || data.status === "success") ||
	                  !Array.isArray(data.quote.send) ||
	                  !data.quote.send.length || !data.quote.address) {
	                $scope.send.path_status = "error-quote";
	                $scope.send.quote_error = "";
	                if (data && data.result === "error" &&
	                    "string" === typeof data.error_message) {
	                  $scope.send.quote_error = data.error_message;
	                }
	                return;
	              }

	              var amount = Amount.from_json(data.quote.send[0]);

	              send.quote = data.quote;

	              // We have a quote, now calculate a path
	              send.recipient_actual = data.quote.address;
	              send.amount_actual = amount;

	              $scope.update_paths();
	            });
	          }
	        });
	      } catch (e) {
	        console.error(e.stack ? e.stack : e);
	        $scope.send.path_status = "error-quote";
	      }
	    };

	    $scope.reset_paths = function () {
	      var send = $scope.send;

	      send.alternatives = [];
	    };

	    $scope.update_paths = function () {
	      var send = $scope.send;
	      var recipient = send.recipient_actual || send.recipient_address;
	      var amount = send.amount_actual || send.amount_feedback;
	      var tracked;

	      $scope.reset_paths();

	      // Note that last_am_recipient and last_recipient are intentionally
	      // separate, the former is the last recipient that update_paths used.
	      send.last_am_recipient = recipient;
	      send.last_amount = send.amount_feedback;

	      send.path_status = 'pending';

	      // Determine if we need to update the paths.
	      if (send.pathfind &&
	          send.pathfind.src_account === $id.account &&
	          send.pathfind.dst_account === recipient &&
	          send.pathfind.dst_amount.equals(amount))
	        return;

	      // Start path find
	      var pf = $network.remote.path_find($id.account,
	                                         recipient,
	                                         amount);

	      send.pathfind = pf;

	      var lastUpdate;

	      pf.on('update', function (upd) {
	        $scope.$apply(function () {
	          // lastUpdate = new Date();

	          // clearInterval(timer);
	          // timer = setInterval(function(){
	          //   $scope.$apply(function(){
	          //     var seconds = Math.round((new Date() - lastUpdate)/1000);
	          //     $scope.lastUpdate = seconds ? seconds : 0;
	          //   })
	          // }, 1000);

	          // Check if this request is still current, exit if not
	          var now_recipient = send.recipient_actual || send.recipient_address;
	          if (recipient !== now_recipient) return;

	          var now_amount = send.amount_actual || send.amount_feedback;
	          if (!now_amount.equals(amount)) return;

	          if (!upd.alternatives || !upd.alternatives.length) {
	            $scope.send.path_status  = "no-path";
	            $scope.send.alternatives = [];
	          } else {
	            var currentKey;
	            $scope.send.path_status  = "done";
	            $scope.send.alternatives = _.map(upd.alternatives, function (raw,key) {
	              var alt = {};
	              alt.amount   = Amount.from_json(raw.source_amount);
	              alt.rate     = alt.amount.ratio_human(amount);
	              alt.send_max = alt.amount.product_human(Amount.from_json('1.01'));
	              alt.paths    = raw.paths_computed
	                ? raw.paths_computed
	                : raw.paths_canonical;

	              // Selected currency should be the first option
	              if (raw.source_amount.currency) {
	                if (raw.source_amount.currency === $scope.send.currency_code)
	                  currentKey = key;
	              } else if ($scope.send.currency_code === 'XRP') {
	                currentKey = key;
	              }

	              return alt;
	            });

	            if (currentKey)
	              $scope.send.alternatives.splice(0, 0, $scope.send.alternatives.splice(currentKey, 1)[0]);
	          }

	          if (!tracked) {
	            $rpTracker.track('Send pathfind', {
	              'Status': 'success',
	              'Currency': $scope.send.currency_code,
	              'Address Type': $scope.send.bitcoin ? 'bitcoin' :
	                  $scope.send.federation ? 'federation' : 'ripple',
	              'Destination Tag': !!$scope.send.dt,
	              'Paths': upd.alternatives.length,
	              'Time': (+new Date() - +pathFindTime) / 1000
	            });

	            tracked = true;
	          }
	        });
	      });

	      pf.on('error', function (res) {
	        setImmediate(function () {
	          $scope.$apply(function () {
	            send.path_status = "error";
	          });
	        });

	        $rpTracker.track('Send pathfind', {
	          'Status': 'error',
	          'Message': res.engine_result,
	          'Currency': $scope.send.currency_code,
	          'Address Type': $scope.send.bitcoin ? 'bitcoin' :
	            $scope.send.federation ? 'federation' : 'ripple',
	          'Destination Tag': !!$scope.send.dt
	        })
	      });

	      var pathFindTime = new Date();
	    };

	    $scope.handle_paths = function (data) {
	      if (!data.alternatives || !data.alternatives.length) {
	        $scope.send.path_status = "no-path";
	      } else {
	        $scope.send.path_status = "done";
	        $scope.send.alternatives = _.map(data.alternatives, function (raw) {
	          var alt = {};
	          alt.amount = Amount.from_json(raw.source_amount);
	          alt.send_max = alt.amount.product_human(Amount.from_json('1.01'));
	          alt.paths = raw.paths_computed
	            ? raw.paths_computed
	            : raw.paths_canonical;

	          return alt;
	        });
	        //              $scope.send.alt = $scope.send.alternatives[0];
	      }
	    };

	    $scope.$watch('userBlob.data.contacts', function (contacts) {
	      $scope.recipient_query = webutil.queryFromOptions(contacts);
	    }, true);

	    $scope.$watch('lines', function (lines) {
	      var currencies = _.uniq(_.map(_.keys(lines), function (line) {
	        return line.slice(-3);
	      }));

	      // XXX Not the fastest way of doing it...
	      currencies = _.map(currencies, function (currency) {
	        _.each($scope.currencies_all, function (entry) {
	          if (currency === entry.value) {
	            currency = entry.name;
	            return false;
	          }
	        });
	        return currency;
	      });
	      $scope.source_currency_query = webutil.queryFromArray(currencies);
	    }, true);

	    $scope.reset = function () {
	      $scope.mode = "form";

	      // XXX Most of these variables should be properties of $scope.send.
	      //     The Angular devs recommend that models be objects due to the way
	      //     scope inheritance works.
	      $scope.send = {
	        recipient: '',
	        recipient_name: '',
	        recipient_address: '',
	        recipient_prev: '',
	        recipient_info: {},
	        amount: '',
	        amount_prev: new Amount(),
	        currency: $scope.xrp.name,
	        currency_choices: $scope.currencies_all,
	        currency_code: "XRP",
	        path_status: 'waiting',
	        fund_status: 'none',
	        sender_insufficient_xrp: false
	      };
	      $scope.nickname = '';
	      $scope.error_type = '';
	      $scope.resetAddressForm();
	    };

	    $scope.cancelConfirm = function () {
	      $scope.mode = "form";
	      $scope.send.alt = null;

	      // Force pathfinding reset
	      $scope.send.last_am_recipient = null;
	      $scope.update_paths();
	    };

	    $scope.resetAddressForm = function() {
	      $scope.show_save_address_form = false;
	      $scope.addressSaved = false;
	      $scope.saveAddressName = '';
	      $scope.addressSaving = false;
	      if ($scope.saveAddressForm) $scope.saveAddressForm.$setPristine(true);
	    };

	    $scope.reset_goto = function (tabName) {
	      $scope.reset();

	      // TODO do something clever instead of document.location
	      // because goToTab does $scope.$digest() which we don't need
	      document.location = '#' + tabName;
	    };

	    /**
	     * N3. Confirmation page
	     */
	    $scope.send_prepared = function () {
	      // check if paths are available, if not then it is a direct send
	      $scope.send.indirect = $scope.send.alt ? $scope.send.alt.paths.length : false;

	      $scope.confirm_wait = true;
	      $timeout(function () {
	        $scope.confirm_wait = false;
	      }, 1000, true);

	      // Stop the pathfind - once we're on the confirmation page, we'll freeze
	      // the last state we had so the user doesn't get surprises when
	      // submitting.
	      // XXX ST: The confirmation page should warn you somehow once it becomes
	      //         outdated.
	      if ($scope.send.pathfind) {
	        $scope.send.pathfind.close();
	        delete $scope.send.pathfind;
	      }

	      $scope.mode = "confirm";

	      $rpTracker.track('Send confirmation page', {
	        'Currency': $scope.send.currency_code,
	        'Address Type': $scope.send.bitcoin ? 'bitcoin' :
	            $scope.send.federation ? 'federation' : 'ripple',
	        'Destination Tag': !!$scope.send.dt
	      })
	    };

	    /**
	     * N4. Waiting for transaction result page
	     */

	    $scope.onTransactionProposed = function (res, tx) {
	      $scope.$apply(function () {
	        $scope.setEngineStatus(res, false);
	        $scope.sent(tx.hash);

	        // Remember currency and increase order
	        var found;

	        for (var i = 0; i < $scope.currencies_all.length; i++) {
	          if ($scope.currencies_all[i].value.toLowerCase() === $scope.send.amount_feedback.currency().to_human().toLowerCase()) {
	            $scope.currencies_all[i].order++;
	            found = true;
	            break;
	          }
	        }

	        if (!found) {
	          $scope.currencies_all.push({
	            "name": $scope.send.amount_feedback.currency().to_human().toUpperCase(),
	            "value": $scope.send.amount_feedback.currency().to_human().toUpperCase(),
	            "order": 1
	          });
	        }
	      });
	    };

	    $scope.onTransactionSuccess = function (res, tx) {
	      $scope.$apply(function () {
	        $scope.setEngineStatus(res, true);
	      });
	    };

	    $scope.onTransactionError = function (res, tx) {
	      setImmediate(function () {
	        $scope.$apply(function () {
	          if (res.engine_result) {
	            $scope.setEngineStatus(res);
	          } else if (res.error === 'remoteError') {
	            $scope.mode = "error";
	            $scope.error_type = res.remote.error;
	          } else {
	            $scope.mode = "error";
	            $scope.error_type = "unknown";
	          }
	        });
	      });
	    };

	    $scope.send_confirmed = function () {
	      var send = $scope.send;
	      var currency = $scope.send.currency.slice(0, 3).toUpperCase();
	      var amount = Amount.from_human(""+$scope.send.amount+" "+currency);
	      var addrress = $scope.send.recipient_address;

	      amount.set_issuer(addrress);

	      var tx = $network.remote.transaction();
	      // Source tag
	      if ($scope.send.st) {
	        tx.source_tag($scope.send.st);
	      }

	      if ($scope.send.quote) {
	        if ("number" === typeof $scope.send.quote.destination_tag) {
	          tx.destination_tag($scope.send.quote.destination_tag);
	        }

	        if ("string" === typeof $scope.send.quote.invoice_id) {
	          tx.tx_json.InvoiceID = $scope.send.quote.invoice_id.toUpperCase();
	        }

	        tx.payment($id.account,
	                   $scope.send.quote.address,
	                   $scope.send.quote.send[0]);
	      } else {
	        // Destination tag
	        var dt;
	        if ($scope.send.dt) {
	          dt = $scope.send.dt;
	        } else {
	          dt = webutil.getDestTagFromAddress($scope.send.recipient);
	        }

	        tx.destination_tag(dt ? +dt : undefined); // 'cause +dt is NaN when dt is undefined

	        tx.payment($id.account, addrress, amount.to_json());
	      }

	      if ($scope.send.alt) {
	        tx.send_max($scope.send.alt.send_max);
	        tx.paths($scope.send.alt.paths);
	      } else {
	        if (!amount.is_native()) {
	          tx.build_path(true);
	        }
	      }

	      tx.on('success', function (res) {
	        $scope.onTransactionSuccess(res, tx);

	        $rpTracker.track('Send result', {
	          'Status': 'success',
	          'Currency': $scope.send.currency_code,
	          'Address Type': $scope.send.bitcoin ? 'bitcoin' :
	              $scope.send.federation ? 'federation' : 'ripple',
	          'Destination Tag': !!$scope.send.dt,
	          'Time': (+new Date() - +$scope.confirmedTime) / 1000
	        })
	      });

	      tx.on('proposed', function (res) {
	        $scope.onTransactionProposed(res, tx);
	      });

	      tx.on('error', function (res) {
	        $scope.onTransactionError(res, tx);

	        $rpTracker.track('Send result', {
	          'Status': 'error',
	          'Message': res.engine_result,
	          'Currency': $scope.send.currency_code,
	          'Address Type': $scope.send.bitcoin ? 'bitcoin' :
	              $scope.send.federation ? 'federation' : 'ripple',
	          'Destination Tag': !!$scope.send.dt,
	          'Time': (+new Date() - +$scope.confirmedTime) / 1000
	        })
	      });

	      tx.submit();

	      $scope.mode = "sending";

	      $scope.confirmedTime = new Date();
	    };

	    /**
	     * N5. Sent page
	     */
	    $scope.sent = function (hash) {
	      $scope.mode = "status";
	      $network.remote.on('transaction', handleAccountEvent);

	      function handleAccountEvent(e) {
	        $scope.$apply(function () {
	          if (e.transaction.hash === hash) {
	            $scope.setEngineStatus(e, true);
	            $network.remote.removeListener('transaction', handleAccountEvent);
	          }
	        });
	      }
	    };

	    $scope.setEngineStatus = function(res, accepted) {
	      $scope.engine_result = res.engine_result;
	      $scope.engine_result_message = res.engine_result_message;
	      $scope.engine_status_accepted = !!accepted;
	      $scope.mode = "status";
	      $scope.tx_result = "partial";
	      switch (res.engine_result.slice(0, 3)) {
	        case 'tes':
	          $scope.mode = "status";
	          $scope.tx_result = accepted ? "cleared" : "pending";
	          break;
	        case 'tep':
	          $scope.mode = "status";
	          $scope.tx_result = "partial";
	          break;
	        default:
	          $scope.mode = "rippleerror";
	          $scope.tx_result = "cleared";
	      }

	      if ($scope.tx_result=='cleared') {
	        setTimeout(function() {
	          $scope.tx_result = 'clear';
	        }, 2000);
	        if (redirectAfterSend) {
	          window.location.href = sendRedirectUrl;
	        }
	      }
	    };

	    $scope.saveAddress = function () {
	      $scope.addressSaving = true;

	      var contact = {
	        'name': $scope.saveAddressName,
	        'address': $scope.send.recipient_address
	      };

	      var removeListener = $scope.$on('$blobSave', function () {
	        removeListener();
	        $scope.contact = contact;
	        $scope.addressSaved = true;
	      });

	      $scope.userBlob.data.contacts.unshift(contact);
	    };

	    $scope.$on("$destroy", function () {
	      // Stop pathfinding if the user leaves the tab
	      if ($scope.send.pathfind) {
	        $scope.send.pathfind.close();
	        delete $scope.send.pathfind;
	      }
	    });

	    $scope.reset();
	  }]);

	  /**
	   * Contact name and address uniqueness validator
	   */
	  // TODO move to global directives
	  module.directive('unique', function() {
	    return {
	      restrict: 'A',
	      require: '?ngModel',
	      link: function ($scope, elm, attr, ctrl) {
	        if (!ctrl) return;

	        var validator = function(value) {
	          var unique = !webutil.getContact($scope.userBlob.data.contacts,value);
	          ctrl.$setValidity('unique', unique);
	          if (unique) return value;
	        };

	        ctrl.$formatters.push(validator);
	        ctrl.$parsers.unshift(validator);

	        attr.$observe('unique', function() {
	          validator(ctrl.$viewValue);
	        });
	      }
	    };
	  });
	};

	module.exports = SendTab;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Tab = __webpack_require__(41).Tab;

	var ReceiveTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(ReceiveTab, Tab);

	ReceiveTab.prototype.tabName = 'receive';
	ReceiveTab.prototype.mainMenu = 'receive';

	ReceiveTab.prototype.angular = function (module) {
	  module.controller('ReceiveCtrl', ['$scope', 'rpId', 'rpTracker',
	                                     function ($scope, $id, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	     // watch the address function and detect when it changes so we can inject the qr
	    $scope.$watch('address', function(){
	      if ($scope.address !== undefined)
	      // use jquery qr code library to inject qr code into div
	        $('#qr-code').qrcode('https://ripple.com//contact?to=' + $scope.address);
	    }, true);
	  }]);
	};

	module.exports = ReceiveTab;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {var util = __webpack_require__(4);
	var webutil = __webpack_require__(16);
	var Tab = __webpack_require__(41).Tab;
	var Amount = ripple.Amount;

	var TradeTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(TradeTab, Tab);

	TradeTab.prototype.tabName = 'trade';
	TradeTab.prototype.mainMenu = 'trade';

	TradeTab.prototype.angularDeps = Tab.prototype.angularDeps.concat(['books']);

	TradeTab.prototype.extraRoutes = [ 
	  { name: '/trade/:first/:second' }
	];

	TradeTab.prototype.angular = function(module)
	{
	  module.controller('TradeCtrl', ['rpBooks', '$scope', 'rpId', 'rpNetwork', '$routeParams', '$location', '$filter', 'rpTracker',
	                                  function (books, $scope, $id, $network, $routeParams, $location, $filter, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    $scope.pairs_query = webutil.queryFromOptions($scope.pairs_all);

	    var widget = {
	      first: '',
	      price: '',
	      second: '',
	      mode: 'trade'
	    };

	    var OrderbookFilterOpts = {
	      'precision':5,
	      'min_precision':5,
	      'max_sig_digits':20
	    };

	    $scope.reset = function (keepPair) {
	      var pair = keepPair ? $scope.order.currency_pair :
	            store.get('ripple_trade_currency_pair') || $scope.pairs_all[0].name;
	      var fIssuer = keepPair ? $scope.order.first_issuer : $id.account;
	      var sIssuer = keepPair ? $scope.order.second_issuer : $id.account;

	      // Decide which listing to show
	      var listing;
	      if ($scope.order) {
	        listing = $scope.order.listing;
	      }
	      else if(store.get('ripple_trade_listing')) {
	        listing = store.get('ripple_trade_listing');
	      }
	      else {
	        listing = 'orderbook';
	      }

	      $scope.order = {
	        currency_pair: pair,
	        first_currency: pair.slice(0, 3),
	        second_currency: pair.slice(4, 7),
	        first_issuer: fIssuer,
	        second_issuer: sIssuer,
	        listing: listing,

	        buy: jQuery.extend(true, {}, widget),
	        sell: jQuery.extend(true, {}, widget),

	        // This variable is true if both the pair and the issuers are set to
	        // valid values. It is used to enable or disable all the functionality
	        // on the page.
	        valid_settings: false
	      };

	      updateSettings();
	    };

	    /**
	     * Resets single order widget. Used to reset widgets after
	     * the order confirmation.
	     *
	     * @param type (buy, sell)
	     */
	    $scope.reset_widget = function(type) {
	      $scope.order[type] = jQuery.extend(true, {}, widget);

	      updateSettings();
	    };

	    /**
	     * Sets current listing, and stores it in local storage.
	     *
	     * @param listing (my, orderbook)
	     */
	    $scope.setListing = function(listing){
	      $scope.order.listing = listing;

	      if (!store.disabled) {
	        store.set('ripple_trade_listing', listing);
	      }
	    };

	    /**
	     * Fill buy/sell widget when clicking on orderbook orders (sum or price)
	     *
	     * @param type (buy/sell)
	     * @param order (order)
	     * @param sum fill sum or not
	     */
	    $scope.fill_widget = function (type, order, sum) {
	      $scope.reset_widget(type);

	      $scope.order[type].price = order.price.to_human().replace(',','');
	      
	      if (sum) {
	        $scope.order[type].first = order.sum.to_human().replace(',','');
	        $scope.calc_second(type);
	      }
	    };

	    /**
	     * Happens when user clicks on "Place Order" button.
	     *
	     * @param type (buy, sell)
	     */
	    // TODO type is this....
	    $scope.place_order = function (type) {
	      $scope.order[type].mode = "confirm";

	      if (type === 'buy') {
	        $scope.order.buy.sell_amount = $scope.order.buy.second_amount;
	        $scope.order.buy.buy_amount = $scope.order.buy.first_amount;
	      } else {
	        $scope.order.sell.sell_amount = $scope.order.sell.first_amount;
	        $scope.order.sell.buy_amount = $scope.order.sell.second_amount;
	      }

	      // TODO track order type
	      $rpTracker.track('Trade order confirmation page', {
	        'Currency pair': $scope.order.currency_pair
	      });
	    };

	    /**
	     * Happens when user clicks on "Cancel" in "My Orders".
	     */
	    $scope.cancel_order = function ()
	    {
	      var seq = this.entry ? this.entry.seq : this.order.Sequence;

	      var tx = $network.remote.transaction();
	      tx.offer_cancel($id.account, seq);
	      tx.on('success', function() {
	        $rpTracker.track('Trade order cancellation', {
	          'Status': 'success'
	        });
	      });
	      // TODO handle this
	      tx.on('error', function (err) {
	        $rpTracker.track('Trade order cancellation', {
	          'Status': 'error',
	          'Message': err.engine_result
	        });
	      });
	      tx.submit();

	      this.cancelling = true;
	    };

	    /**
	     * Happens when user clicks "Confirm" in order confirmation view.
	     *
	     * @param type (buy, sell)
	     */
	    $scope.order_confirmed = function (type)
	    {
	      var order = $scope.order[type];
	      var tx = $network.remote.transaction();

	      tx.offer_create(
	        $id.account,
	        order.buy_amount,
	        order.sell_amount
	      );

	      // Sets a tfSell flag. This is the only way to distinguish
	      // sell offers from buys.
	      if (type === 'sell')
	        tx.set_flags('Sell');

	      tx.on('proposed', function (res) {
	        $scope.$apply(function () {
	          setEngineStatus(res, false, type);

	          // Remember currency pair and increase usage number
	          var found;

	          for (var i = 0; i < $scope.pairs_all.length; i++) {
	            if ($scope.pairs_all[i].name === $scope.order.currency_pair) {
	              $scope.pairs_all[i].order++;
	              found = true;
	              break;
	            }
	          }

	          if (!found) {
	            $scope.pairs_all.push({
	              "name": $scope.order.currency_pair,
	              "order": 1
	            });
	          }
	        });
	      });

	      tx.on('success', function(res){
	        $scope.$apply(function () {
	          setEngineStatus(res, true, type);

	          order.mode = "done";

	          $rpTracker.track('Trade order result', {
	            'Status': 'success',
	            'Currency pair': $scope.order.currency_pair
	          });
	        });
	      });

	      tx.on('error', function (err) {
	        $scope.$apply(function () {
	          setEngineStatus(err, false, type);

	          order.mode = "done";
	        });

	        $rpTracker.track('Trade order result', {
	          'Status': 'error',
	          'Message': err.engine_result,
	          'Currency pair': $scope.order.currency_pair
	        });
	      });

	      tx.submit();

	      order.mode = "sending";
	    };

	    /**
	     * Handle transaction result
	     */
	    function setEngineStatus(res, accepted, type) {
	      var order = $scope.order[type];

	      order.engine_result = res.engine_result;
	      order.engine_result_message = res.engine_result_message;
	      switch (res.engine_result.slice(0, 3)) {
	        case 'tes':
	          order.tx_result = accepted ? "cleared" : "pending";
	          break;
	        case 'tem':
	          order.tx_result = "malformed";
	          break;
	        case 'ter':
	          order.tx_result = "failed";
	          break;
	        case 'tec':
	          order.tx_result = "claim";
	          break;
	        case 'tel':
	          order.tx_result = "local";
	          break;
	        //case 'tep':
	        default:
	          order.tx_result = "unknown";
	          console.warn("Unhandled engine status encountered:"+res.engine_result);
	          break;
	      }
	    }

	    $scope.update_first = function (type) {
	      var order = $scope.order[type];
	      var first_currency = $scope.order.first_currency || "XRP";
	      var formatted = "" + order.first + " " + first_currency;

	      order.first_amount = ripple.Amount.from_human(formatted);

	      if (first_currency !== 'XRP') order.first_amount.set_issuer($scope.order.first_issuer);
	    };

	    $scope.update_price = function (type) {
	      var order = $scope.order[type];
	      var second_currency = $scope.order.second_currency || "XRP";
	      var formatted = "" + order.price + " " + second_currency;

	      order.price_amount = ripple.Amount.from_human(formatted);

	      if (second_currency !== 'XRP') order.price_amount.set_issuer($scope.order.second_issuer);
	    };

	    $scope.update_second = function (type) {
	      var order = $scope.order[type];
	      var second_currency = $scope.order.second_currency || "XRP";
	      var formatted = "" + order.second + " " + second_currency;

	      order.second_amount = ripple.Amount.from_human(formatted);

	      if (second_currency !== 'XRP') order.second_amount.set_issuer($scope.order.second_issuer);
	    };

	    /**
	     * Calculate second when first or price changes.
	     *
	     * @param type
	     */
	    $scope.calc_second = function (type) {
	      var order = $scope.order[type];

	      $scope.update_first(type);
	      $scope.update_price(type);
	      if (order.price_amount && order.price_amount.is_valid() &&
	          order.first_amount && order.first_amount.is_valid()) {
	        order.second_amount = order.price_amount.product_human(order.first_amount);
	        order.second = +order.second_amount.to_human({group_sep: false});
	      }
	    };

	    /**
	     * Calculate first when second changes.
	     *
	     * @param type
	     */
	    $scope.calc_first = function (type) {
	      var order = $scope.order[type];

	      $scope.update_second(type);
	      $scope.update_price(type);
	      if (order.price_amount  && order.price_amount.is_valid() &&
	          order.second_amount && order.second_amount.is_valid()) {
	        order.first_amount = order.second_amount.ratio_human(order.price_amount);
	        order.first = +order.first_amount.to_human({group_sep: false});
	      }
	    };

	    // This functions is called whenever the settings, specifically the pair and
	    // the issuer(s) have been modified. It checks the new configuration and
	    // sets $scope.valid_settings.
	    function updateSettings() {
	      var order = $scope.order;

	      var pair = order.currency_pair;

	      // Invalid currency pair
	      if ("string" !== typeof pair || !pair.match(/^[a-z]{3}\/[a-z]{3}$/i)) {
	        order.first_currency = 'XRP';
	        order.second_currency = 'XRP';
	        order.valid_settings = false;
	        return;
	      }

	      var first_currency = order.first_currency = pair.slice(0, 3);
	      var second_currency = order.second_currency = pair.slice(4, 7);
	      var first_issuer = ripple.UInt160.from_json(order.first_issuer);
	      var second_issuer = ripple.UInt160.from_json(order.second_issuer);

	      // Invalid issuers or XRP/XRP pair
	      if ((first_currency !== 'XRP' && !first_issuer.is_valid()) ||
	          (second_currency !== 'XRP' && !second_issuer.is_valid()) ||
	          (first_currency === 'XRP' && second_currency === 'XRP')) {
	        order.valid_settings = false;
	        return;
	      }

	      order.valid_settings = true;

	      // Remember pair
	      // Produces currency/issuer:currency/issuer
	      var key = "" +
	        order.first_currency +
	        (order.first_currency === 'XRP' ? "" : "/" + order.first_issuer) +
	        ":" +
	        order.second_currency +
	        (order.second_currency === 'XRP' ? "" : "/" + order.second_issuer);

	      // Load orderbook
	      if (order.prev_settings !== key) {
	        loadOffers();

	        order.prev_settings = key;
	      }

	      // Update widgets
	      ['buy','sell'].forEach(function(type){
	        $scope.update_first(type);
	        $scope.update_price(type);
	        $scope.update_second(type);
	      });

	      updateCanBuySell();
	    }

	    /**
	     * Tries to guess an issuer based on user's preferred issuer or highest trust.
	     *
	     * @param currency
	     * @param exclude_issuer
	     * @returns issuer
	     */
	    function guessIssuer(currency, exclude_issuer) {
	      var guess;

	      // First guess: An explicit issuer preference setting in the user's blob
	      try {
	        guess = $scope.userBlob.data.preferred_issuer[currency];
	        if (guess && guess === exclude_issuer) {
	          guess = $scope.userBlob.data.preferred_second_issuer[currency];
	        }
	        if (guess) return guess;
	      } catch (e) {}

	      // Second guess: The user's highest trust line in this currency
	      try {
	        var issuers = $scope.balances[currency].components;
	        for (var counterparty in issuers) {
	          if (counterparty != exclude_issuer) {
	            return counterparty;
	          }
	        }
	      } catch (e) {}

	      // We found nothing
	      return null;
	    }

	    function resetIssuers(force) {
	      var guess;
	      var order = $scope.order;

	      if (force) {
	        order.first_issuer = null;
	        order.second_issuer = null;
	      }

	      ['first','second'].forEach(function(prefix){
	        if (!order[prefix + '_issuer'] &&
	            order[prefix + '_currency'] &&
	            order[prefix + '_currency'] !== 'XRP' &&
	            (guess = guessIssuer(order[prefix + '_currency']))) {
	          order[prefix + '_issuer'] = guess;
	        }
	      });

	      // If the same currency, exclude first issuer for second issuer guess
	      if (order.first_currency === order.second_currency &&
	          order.first_issuer === order.second_issuer &&
	          (guess = guessIssuer(order.first_currency, order.first_issuer))) {
	        order.second_issuer = guess;
	      }
	    }

	    /**
	     * $scope.edit_first_issuer
	     * $scope.save_first_issuer
	     * $scope.edit_second_issuer
	     * $scope.save_second_issuer
	     */
	    ['first','second'].forEach(function(prefix){
	      $scope['edit_' + prefix + '_issuer'] = function () {
	        $scope.show_issuer_form = prefix;
	        $scope.order[prefix + '_issuer_edit'] = webutil.unresolveContact($scope.userBlob.data.contacts, $scope.order[prefix + '_issuer']);

	        setImmediate(function () {
	          $('#' + prefix + '_issuer').select();
	        });
	      };

	      $scope['save_' + prefix + '_issuer'] = function () {
	        $scope.order[prefix + '_issuer'] = webutil.resolveContact($scope.userBlob.data.contacts, $scope.order[prefix + '_issuer_edit']);
	        $scope.show_issuer_form = false;

	        updateSettings();

	        // Persist issuer setting
	        if ($scope.order.valid_settings && $scope.order[prefix + '_currency'] !== 'XRP') {
	          if (prefix === 'first') {
	            $scope.userBlob.data.preferred_issuer[$scope.order['first_currency']] = $scope.order['first_issuer'];
	          } else {
	            if ($scope.order.first_currency === $scope.order.second_currency) {
	              $scope.userBlob.data.preferred_second_issuer[$scope.order.second_currency] =
	                  $scope.order.second_issuer;
	            } else {
	              $scope.userBlob.data.preferred_issuer[$scope.order.second_currency] =
	                  $scope.order.second_issuer;
	            }
	          }
	        }
	      };
	    });

	    /**
	     * Load orderbook
	     */
	    function loadOffers() {
	      // Make sure we unsubscribe from any previously loaded orderbook
	      if ($scope.book && "function" === typeof $scope.book.unsubscribe) {
	        $scope.book.unsubscribe();
	      }

	      $scope.book = books.get({
	        currency: $scope.order.first_currency,
	        issuer: $scope.order.first_issuer
	      }, {
	        currency: $scope.order.second_currency,
	        issuer: $scope.order.second_issuer
	      }, $scope.address);
	    }

	    /**
	     * Determine whether user can sell and/or buy on this pair
	     */
	    var updateCanBuySell = function () {
	      var first_currency = $scope.order.first_currency;
	      var first_issuer = $scope.order.first_issuer;
	      var second_currency = $scope.order.second_currency;
	      var second_issuer = $scope.order.second_issuer;

	      var canBuy = second_currency.toUpperCase() === 'XRP' ||
	          second_issuer == $scope.address ||
	          ($scope.lines[second_issuer+second_currency] && $scope.lines[second_issuer+second_currency].balance.is_positive());

	      var canSell = first_currency.toUpperCase() === 'XRP' ||
	          first_issuer == $scope.address ||
	          ($scope.lines[first_issuer+first_currency] && $scope.lines[first_issuer+first_currency].balance.is_positive());

	      $scope.order.buy.showWidget = canBuy;
	      $scope.order.sell.showWidget = canSell;
	    };

	    var rpamountFilter = $filter('rpamount');

	    $scope.$watchCollection('book', function () {
	      if (!jQuery.isEmptyObject($scope.book)) {
	        ['asks','bids'].forEach(function(type){
	          if ($scope.book[type]) {
	            $scope.book[type].forEach(function(order){
	              order.showSum = rpamountFilter(order.sum,OrderbookFilterOpts);
	              order.showPrice = rpamountFilter(order.price,OrderbookFilterOpts);

	              var showValue = type === 'bids' ? 'TakerPays' : 'TakerGets';
	              order['show' + showValue] = rpamountFilter(order[showValue],OrderbookFilterOpts);
	            });
	          }
	        });
	      }
	    });

	    /**
	     * Watch widget field changes
	     */
	    ['buy','sell'].forEach(function(type){
	      $scope.$watch('order.' + type + '.first', function () {
	        $scope.update_first(type);
	      }, true);

	      $scope.$watch('order.' + type + '.price', function () {
	        $scope.update_price(type);
	      }, true);

	      $scope.$watch('order.' + type + '.second', function () {
	        $scope.update_second(type);
	      }, true);
	    });

	    $scope.$watch('order.currency_pair', function (pair) {
	      if (!store.disabled) {
	        store.set('ripple_trade_currency_pair', pair);
	      }
	      updateSettings();
	      resetIssuers(true);
	    }, true);

	    $scope.$watch('userBlob', function () {
	      resetIssuers(false);
	    }, true);

	    $scope.$watch('order.type', function () {
	      updateCanBuySell();
	    });

	    $scope.$watch('order.first_issuer', function () {
	      updateSettings();
	    });

	    $scope.$watch('order.second_issuer', function () {
	      updateSettings();
	    });

	    $scope.$watch('balances', function () {
	      updateCanBuySell();
	      resetIssuers(false);
	    }, true);

	    $scope.$watch('userBlob.data.contacts', function (contacts) {
	      $scope.issuer_query = webutil.queryFromOptions(contacts);
	    }, true);

	    $scope.$watch('offers', function (offers){
	      $scope.offersCount = _.size(offers);
	    }, true);

	    $scope.reset();

	    /**
	     * Route includes currency pair
	     */
	    if ($routeParams.first && $routeParams.second) {
	      var routeIssuers = {};
	      var routeCurrencies = {};

	      ['first','second'].forEach(function(prefix){
	        routeIssuers[prefix] = $routeParams[prefix].match(/:(.+)$/);
	        routeCurrencies[prefix] = $routeParams[prefix].match(/^(\w{3})/);

	        if (routeIssuers[prefix]) {
	          if (ripple.UInt160.is_valid(routeIssuers[prefix][1])) {
	            $scope.order[prefix + '_issuer'] = routeIssuers[prefix][1];
	          } else {
	            $location.path('/trade');
	          }
	        }
	      });

	      if (routeCurrencies['first'] && routeCurrencies['second']) {
	        if (routeCurrencies['first'][1] !== routeCurrencies['second'][1]) {
	          $scope.order.currency_pair = routeCurrencies['first'][1] + '/' + routeCurrencies['second'][1];
	        } else {
	          $location.path('/trade');
	        }
	      }

	      updateSettings();
	    }
	  }]);
	};

	module.exports = TradeTab;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13).setImmediate))

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var webutil = __webpack_require__(16);
	var Tab = __webpack_require__(41).Tab;

	var OptionsTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(OptionsTab, Tab);

	OptionsTab.prototype.tabName = 'options';
	OptionsTab.prototype.mainMenu = 'advanced';

	OptionsTab.prototype.angular = function(module)
	{
	  module.controller('OptionsCtrl', ['$scope', '$rootScope', 'rpId', 'rpTracker',
	                                    function ($scope, $rootScope, $id, $rpTracker)
	  {
	    $scope.options = Options;

	    $scope.save = function () {
	      // Save in local storage
	      if (!store.disabled) {
	        store.set('ripple_settings', JSON.stringify($scope.options));
	      }

	      // Reload
	      location.reload();
	    };
	  }]);
	};

	module.exports = OptionsTab;


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Tab  = __webpack_require__(41).Tab;

	var SecurityTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(SecurityTab, Tab);

	SecurityTab.prototype.tabName = 'security';
	SecurityTab.prototype.mainMenu = 'wallet';

	SecurityTab.prototype.angular = function (module) {
	  module.controller('SecurityCtrl', ['$scope', 'rpId', 'rpOldBlob', 'rpTracker',
	                                     function ($scope, $id, $blob, $rpTracker)
	  {
	    if (!$id.loginStatus) return $id.goId();

	    $scope.$watch('userBlob', updateEnc, true);

	    function updateEnc()
	    {
	      if ("string" === typeof $id.username &&
	          "string" === typeof $id.password &&
	          $scope.userBlob) {
	        $scope.enc = $blob.enc($id.username.toLowerCase(), $id.password, $scope.userBlob);
	      }
	    }
	  }]);
	};

	module.exports = SecurityTab;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Tab = __webpack_require__(41).Tab;

	var TxTab = function ()
	{
	  Tab.call(this);
	};

	util.inherits(TxTab, Tab);

	TxTab.prototype.tabName = 'tx';

	TxTab.prototype.angular = function (module)
	{
	  module.controller('TxCtrl', ['$scope', 'rpNetwork', '$routeParams',
	                               function ($scope, net, $routeParams)
	  {
	    $scope.state = 'loading';
	    $scope.transaction = {
	      hash: $routeParams.id
	    };

	    function loadTx() {
	      // XXX: Dirty, dirty. But it's going to change soon anyway.
	      var request = net.remote.request_ledger_hash();
	      request.message.command = 'tx';
	      request.message.transaction = $routeParams.id;
	      request.on('success', function (res) {
	        $scope.$apply(function () {
	          $scope.state = 'loaded';
	          // XXX This is for the upcoming tx RPC call format change.
	          var tx = res.tx ? res.tx : res;
	          _.extend($scope.transaction, res);

	          if (tx.TransactionType === "Payment") {
	            var sender = tx.Account;
	            var affectedNode;
	            var difference;
	            var cur;
	            var i;

	            if (tx.Amount.currency) {//It's not XRP
	              /* Find the metadata node with entry type == "RippleState" 
	              and either HighLimit.issuer == [sender's account] or 
	              LowLimit.issuer == [sender's account] and 
	              Balance.currency == [currency of SendMax || Amount]
	              */
	              if (tx.meta.AffectedNodes) {
	                for (i=0; i<tx.meta.AffectedNodes.length; i++) {
	                  affectedNode = tx.meta.AffectedNodes[i];
	                  if (affectedNode.ModifiedNode && affectedNode.ModifiedNode.LedgerEntryType === "RippleState" && 
	                    (affectedNode.ModifiedNode.FinalFields.HighLimit.issuer === sender ||
	                      affectedNode.ModifiedNode.FinalFields.LowLimit.issuer === sender) &&
	                    affectedNode.ModifiedNode.FinalFields.Balance.currency === tx.SendMax.currency
	                    ) {
	                    break;
	                  } else {
	                    affectedNode = null;
	                  }
	                }
	              }

	              // Calculate the difference before/after. If HighLimit.issuer == [sender's account] negate it.
	              if (affectedNode) {
	                difference = affectedNode.ModifiedNode.PreviousFields.Balance.value - affectedNode.ModifiedNode.FinalFields.Balance.value;
	                if (affectedNode.ModifiedNode.FinalFields.HighLimit.issuer === sender) {
	                  difference *= -1;
	                }
	                cur = affectedNode.ModifiedNode.FinalFields.Balance.currency;
	              }

	            } else { //It's XRP
	              // Find the metadata node with entry type == "AccountRoot" and Account == [sender's account].
	              if (tx.meta.AffectedNodes) {
	                for (i=0; i<tx.meta.AffectedNodes.length; i++) {
	                  affectedNode = tx.meta.AffectedNodes[i];
	                  if (affectedNode.ModifiedNode && affectedNode.ModifiedNode.LedgerEntryType === "AccountRoot" && 
	                    affectedNode.ModifiedNode.FinalFields.Account === sender) {
	                    break;
	                  } else {
	                    affectedNode = null;
	                  }
	                }
	              }

	              // Calculate the difference minus the fee
	              if (affectedNode) {
	                difference = affectedNode.ModifiedNode.PreviousFields.Balance - affectedNode.ModifiedNode.FinalFields.Balance - tx.Fee;
	              }
	            }
	            var amountSent;
	            if (cur) {
	              amountSent = {value: String(difference), currency:cur};
	            } else {
	              amountSent = difference;
	            }
	            $scope.amountSent = amountSent;
	          }
	        });
	      });
	      request.on('error', function (res) {
	        $scope.$apply(function () {
	          $scope.state = 'error';
	          console.log(res);
	        });
	      });
	      request.request();
	    }

	    if (net.connected) loadTx();
	    else var removeListener = $scope.$on('$netConnected', function () {
	      removeListener();
	      loadTx();
	    });
	  }]);
	};

	module.exports = TxTab;


/***/ }
/******/ ]);