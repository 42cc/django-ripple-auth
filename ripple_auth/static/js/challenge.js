/**
 * challenge factory
 * --------------
 */


(function() {
  'use strict';

  var app = angular.module('challenge', []);

  app.config(function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  });

  app.factory('getChallenge', [
    '$rootScope', '$http',
    function($scope, $http) {

      var challenge = {};

      challenge.requestChallenge = function () {
        return $http.get('/get_challenge');
      };

      challenge.returnChallenge = function(challenge, signature, publicKey, ripple_address, username) {
        return $http.post(
          '/return_challenge/',
          {
            challenge: challenge,
            signature: signature,
            publicKey: publicKey,
            ripple_address: ripple_address,
            username: username
          }
        )
      };

      return challenge;
  }]);
})();