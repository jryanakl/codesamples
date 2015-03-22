'use strict';
angular.module('fm.state').provider('$qState', function () {
  var _middlewares = [];
  var _middleware = function (func) {
    _middlewares.push(func);
  };
  var $get = [
    '$state',
    '$qStateParams',
    '$stateParams',
    'urlQuery',
    '$rootScope',
    function ($state, $stateParams, $_stateParams, urlQuery, $rootScope) {
      var $scope = $rootScope.$new(true);
      $scope.actualParams = {};
      $scope.$_stateParams = $_stateParams;
      $rootScope.$on('$stateChangeStart', function (evt, toState, toParams) {
        _.each(_middlewares, function (middleware) {
          middleware(evt, toState, toParams);
        });
        $scope.updateStateParams(angular.copy(toParams));
      });

      // Event waits for $_stateParams to initialize, copies its values, and unlinks itself.
      var unlisten = $rootScope.$on('$viewContentLoaded', function () {
        $scope.updateActualParams($_stateParams);
        $scope.updateStateParams();
        unlisten();
      });

      $scope.go = function () {
        $scope.updateActualParams(angular.copy(arguments[1]));
        $state.go.apply($state, arguments).then(function () {
          $scope.applySearch();
          $scope.clearActualParams();
        });
      };
      $scope.transitionTo = function () {
        $scope.updateActualParams(angular.copy(arguments[1]));
        $state.transitionTo.apply($state, arguments).then(function () {
          $scope.applySearch();
          $scope.clearActualParams();
        });
      };
      $scope.updateActualParams = function (params) {
        $scope.clearActualParams();
        for (var key in params) {
          $scope.actualParams[key] = params[key];
        }
      };
      $scope.updateStateParams = function (params) {
        var key;
        $scope.clearQStateParams();
        var finalParams = angular.copy($scope.actualParams);
        if (params !== undefined) {
          for (key in params) {
            finalParams[key] = params[key];
          }
        }
        for (key in finalParams) {
          $stateParams[key] = finalParams[key];
        }
      };
      $scope.clearActualParams = function () {
        for (var key in $scope.actualParams) {
          delete $scope.actualParams[key];
        }
      };
      $scope.clearQStateParams = function () {
        for (var key in $stateParams) {
          delete $stateParams[key];
        }
      };
      $scope.applySearch = function () {
        if (typeof $scope.actualParams.$q !== 'undefined') {
          urlQuery.setParams($scope.actualParams.$q);
        }
      };

      return {
        go: $scope.go,
        transitionTo: $scope.transitionTo,
        href: $state.href,
        current: $state.current,
        $current: $state.$current,
        get: $state.get,
        includes: $state.includes,
        is: $state.is,
        reload: $state.reload
      };
    }
  ];
  return {
    $get: $get,
    middleware: _middleware
  };
});