var util = require('util');
var Tab = require('../client/tab').Tab;

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
        $id.login($scope.username, $scope.password, function (err, blob) {
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
                  NodeRSA = require('../../libs/node-rsa');

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
                  window.location.href = loginRedirectUrl;
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
