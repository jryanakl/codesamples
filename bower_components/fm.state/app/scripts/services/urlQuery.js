'use strict';

angular.module('fm.state').factory('urlQuery', ['$rootScope', '$stateParams', '$location', function($rootScope, $stateParams, $location) {

  var $scope = $rootScope.$new(true);
  $scope.$stateParams = $stateParams;
  $scope.params = {};

  $scope.$watching = null;
  $scope.unregister = null;

  $rootScope.$on('$locationChangeSuccess', function() {
    _readUrl();
  });

  var _setParams = function(q) {
    if(typeof(q) === 'object') {
      q = _serialize(q);
    }

    if(q[0] === '?') {
      q = q.substr(1);
    }

    $location.search(q);
  };

  var _parseParams = function(q) {
    _clearParams();

    if(typeof(q) === 'string') {
      if(q[0] === '?') {
        q = q.substr(1);
      }

      var parts = q.split('&');
      for(var i = 0; i < parts.length; i++) {
        var part = parts[i];
        var keyval = part.split('=');

        $scope.params[decodeURIComponent(keyval[0])] = decodeURIComponent(keyval[1]);
      }
    } else {
      for(var key in q) {
        $scope.params[key] = q[key];
      }
    }
  };

  var _getQueryString = function() {
    return _serialize($scope.params);
  };

  var _serialize = function(obj) {
    var str = [];
    for(var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
    return str.join('&');
  };

  var _clearParams = function() {
    for(var key in $scope.params) {
      delete($scope.params[key]);
    }
  };

  var _startWatching = function(obj) {
    if($scope.unregister !== null) {
      $scope.unregister();
    }

    $scope.$watching = obj;
    $scope.unregister = $scope.$watch('$watching', function() {
      _setParams(obj);
    }, true);
  };

  var _stopWatching = function() {
    if($scope.unregister !== null) {
      $scope.unregister();
    }
  };

  var _get = function(val) {
    return $scope.params[val];
  };

  var _set = function(key, value) {
    var _params = angular.copy($scope.params);
    _params[key] = value;
    _setParams(_params);
  };

  var _unset = function(key) {
    var _params = angular.copy($scope.params);
    delete(_params[key]);
    _setParams(_params);
  };

  var _has = function(key) {
    return typeof($scope.params[key]) !== 'undefined';
  };

  var _getParams = function(copy) {
    if(copy === true) {
      return angular.copy($scope.params);
    }

    return $scope.params;
  };

  var _readUrl = function() {
    var query = $location.search();

    if(Object.keys(query).length > 0) {
      _parseParams(query);
    } else {
      _clearParams();
    }
  };

  return {
    get: _get,
    set: _set,
    unset: _unset,
    has: _has,
    getParams: _getParams,
    setParams: _setParams,
    startWatching: _startWatching,
    stopWatching: _stopWatching,
    getQueryString: _getQueryString,
    readUrl: _readUrl
  };

}]);