var util = require('util');
var webutil = require('../util/web');
var Tab = require('../client/tab').Tab;

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
