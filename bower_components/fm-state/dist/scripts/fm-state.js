angular.module('fm.state.templates', ['idlewarning.html', 'root.html']);

angular.module('idlewarning.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('idlewarning.html',
    '<div ng-idle-countdown="idleCountdown" ng-init="idleCountdown=idleSettings.warningDuration" class="modal-body">\n' +
    '  <h4><span class="icon-warning large text-danger"></span> <span data-i18n="fmState.idleMsg" data-countdown="{{idleCountdown}}"></span></h4>\n' +
    '</div>\n' +
    '<div class="modal-footer">\n' +
    '  <div class="btn-toolbar" role="toolbar">\n' +
    '    <button type="button" class="btn btn-primary" ng-click="$close()" i18n="fmState.continue"></button>\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('root.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('root.html',
    '<!-- Add your site or application content here -->\n' +
    '<header class="header" ui-view="header"></header>\n' +
    '<main class="main" ui-view="main"></main>\n' +
    '');
}]);

'use strict';

angular.module('fm.state', [
  'fm.api',
  'fm.locale',
  'fm.state.templates',
  'fm.toast',
  'fm.ui',
  'ngIdle',
  'ui.router',
]).config(['$idleProvider', '$keepaliveProvider', 'api', function($idleProvider, $keepaliveProvider, api){
  // configure $idle settings
  $idleProvider.idleDuration(570); // 9.5 minutes by default
  $idleProvider.warningDuration(30); // in seconds
  $idleProvider.activeOn(''); // disable mouse or keyboard events?
  $idleProvider.keepalive(false); // disable auto keepalive, will issue a ping based on whether the user responds to the timeout modal
  $keepaliveProvider.http(api.secmgr + '/user/current');
}]).run(['auth', 'idler', 'locale', function(auth, idler, locale){
  idler.close();
  auth.checkAndSetStoredCredentials();
  locale.ready('fmState');
}]);

'use strict';

angular.module('fm.state').constant('fmStateConstants', {
  'tokenHeader': 'X-FM-AUTH-Token',
  'tokenStorageKey': 'fmtoken',
  'returnToUrlKey': 'returnToUrl'
});

(function () {
  'use strict';

  // Mimics ui-sref but uses $watch. Updates href when the value changes.
  // All code is from ui-router except when stated otherwise ( marked by !!)

  function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed) {
      ref = current + '(' + preparsed[1] + ')';
    }
    parsed = ref.replace(/\n/g, ' ').match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4) {
      return null;
    }
    return { state: parsed[1], paramExpr: parsed[3] || null };
  }

  function stateContext(el) {
    var stateData = el.parent().inheritedData('$uiView');

    if (stateData && stateData.state && stateData.state.name) {
      return stateData.state;
    }
  }

  var allowedOptions = ['location', 'inherit', 'reload'];

  function FmSref($state, $timeout, $interpolate) {

    return {
      restrict: 'A',
      require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
      link: function (scope, element, attrs, uiSrefActive) {
        var fmSref = '';

        // !! Init processes added to init funciton
        var ref, params, newHref, isAnchor, url, base, isForm, nav, attr, options, optionsOverride, update;
        var init = function () {
          // !! moved ref impl to update function
          params = null;
          url = null;
          base = stateContext(element) || $state.$current;
          newHref = null;
          isAnchor = element.prop('tagName') === 'A';
          isForm = element[0].nodeName === 'FORM';
          attr = isForm ? 'action' : 'href';
          nav = true;

          options = { relative: base, inherit: true };
          optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};

          angular.forEach(allowedOptions, function (option) {
            if (option in optionsOverride) {
              options[option] = optionsOverride[option];
            }
          });

          if (isForm) {
            return;
          }

          element.bind('click', function (e) {
            var button = e.which || e.button;
            if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target'))) {
              // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
              var transition = $timeout(function () {
                $state.go(ref.state, params, options);
              });
              e.preventDefault();

              // if the state has no URL, ignore one preventDefault from the <a> directive.
              var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
              e.preventDefault = function () {
                if (ignorePreventDefaultCount-- <= 0) {
                  $timeout.cancel(transition);
                }
              };
            }
          });

          // !! update heavily modified
          update = function () {
            ref = parseStateRef(fmSref, $state.current.name);

            if (!ref) {
              //console.log('Unknown sref: ' + scope.fmSref);
              //console.log('Source: ' + element[0].outerHTML);
              return;
            }

            params = {};
            if (ref.paramExpr) {
              params = angular.copy(scope.$eval(ref.paramExpr));
            }

            if (!nav) {
              return;
            }

            newHref = $state.href(ref.state, params, options);

            var activeDirective = uiSrefActive[1] || uiSrefActive[0];
            if (activeDirective) {
              activeDirective.$$setStateInfo(ref.state, params);
            }
            if (newHref === null) {
              nav = false;
              return false;
            }

            attrs.$set(attr, newHref);
          };

          update();
        };


        // !! fmSref addition start
        var firstWatch = true;
        attrs.$observe('fmSref', function () {
          var val = $interpolate(attrs.fmSref)(scope);
          if (val !== fmSref) {
            fmSref = val;

            if (firstWatch) {
              firstWatch = false;
              init();
            } else {
              update();
            }
          }
        });
        // !! fmSref addition end
      }
    };
  }
  FmSref.$inject = ['$state', '$timeout', '$interpolate'];

  // !! Directive declaration is not a copy from ui-sref
  angular.module('fm.state').directive('fmSref', FmSref);

})();

'use strict';

angular.module('fm.state').factory('authInterceptor', [
  '$location',
  '$log',
  '$q',
  '$window',
  'fmStateConstants',
  function ($location, $log, $q, $window, fmStateConstants) {

    return {
      responseError: function (rejection) {
        $log.debug('Response error ' + rejection.status + ': ', rejection.data);
        if (rejection.status === 401) { //User has not authenticated yet or token has expired.
          var returnToUrl = $location.path();
          if('/' !== returnToUrl){
            $window.localStorage.setItem(fmStateConstants.returnToUrlKey, returnToUrl);
          }
          $location.path('/').replace();
        }
        return $q.reject(rejection);
      }
    };

  }

]).config([
  '$httpProvider',
  function ($httpProvider) {
    /**
     * This header is critical.  It tells the REST services that if authentication fails, do not send a WWW-Authenticate header.
     * The WWW-Authenticate header will make the browser pop its native authentication dialog.
     */
    $httpProvider.defaults.headers.common['Suppress-Auth-Header'] = 'true';
    $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.common.Pragma = 'no-cache';
    /**
     * If the server returns a 401,
     * 1) save the current state,
     * 2) transition to login,
     * 3) and upon successful login, transition to the original target state.
     */
    $httpProvider.interceptors.push('authInterceptor');
  }
]);

'use strict';

angular.module('fm.state').factory('connectionRefusedInterceptor', [
  '$q',
  function ($q) {
    return {
      'responseError': function (rejection) {
        // a status of 500 with ECONNREFUSED in the data is really a 503 Service Unavailable so change the status
        if (rejection.status === 500 && rejection.data && typeof rejection.data === 'string' && rejection.data.indexOf('ECONNREFUSED') !== -1) {
          rejection.status = 503;
        }

        return $q.reject(rejection);
      }
    };
  }
]).config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('connectionRefusedInterceptor');
  }
]);

(function() {
  'use strict';

  angular.module('fm.state').factory('errorInterceptor', [
    '$q',
    '$log',
    '$fmError',
    '$timeout',
    'toast',
    function ($q, $log, FMError, $timeout, toast) {
      return {
        'responseError': function (rejection) {
          if(rejection.status !== 401){
            var Error = new FMError();
            $log.info(rejection.data);

            if(!rejection.data){
              rejection.data = {
                message: rejection.statusText || ''
              };
            }
            else if(typeof rejection.data === 'string') {
              rejection.data = {
                message: rejection.data
              };
            }

            rejection.data.$error = Error;

            // Using a timeout the processes receiving the rejection has an opportunity
            // to handle the message. If the message is not handled the error messaged will be
            // displayed in a toast message.
            $timeout(function() {
              if(!Error.resolved) {
                toast.addErrorMessage(rejection.data.message);
              }
            });
          }
          return $q.reject(rejection);
        }
      };
    }
  ]).config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('errorInterceptor');
    }
  ]);
})();

'use strict';

/**
 * Intended to record the last response datetime for use with the idle timeout.
 */
angular.module('fm.state').factory('lastResponseTimeInterceptor', [
  '$injector',
  function ($injector) {
    return {
      'response': function(response){
        var auth = $injector.get('auth'),
          $idle = $injector.get('$idle');
        if(!!auth.getToken() && !$idle.idling()){
          $idle.watch();
        }
        return response;
      }
    };
  }
]).config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push('lastResponseTimeInterceptor');
  }
]);

(function() {
  'use strict';

  function $fmError() {}

  $fmError.prototype.resolved = false;
  $fmError.prototype.setResolved = function(val) {
    this.resolved = !!val;
  };

  angular.module('fm.state').service('$fmError', function() {
    return $fmError;
  });
})();
(function(){
  'use strict';

  function AuthFactory($cacheFactory, $http, $idle, $q, $window, api, fmStateConstants) {

    return {
      /**
       * Username and password authentication.
       *
       * Upon successful login sets token in header defaults and stores token in local storage.
       *
       * @param username
       * @param password
       * @returns {*} Promise
       */
      'authenticate': function(username, password){
        var self = this,
          deferred = $q.defer();

        this.removeToken();
        $http({
          async: false,
          cache: false,
          data: JSON.stringify({
            username: username,
            password: password
          }),
          method: 'POST',
          responseType: 'json',
          url: api.secmgr + '/authentication/login'
        }).success(function(result){
          self.setToken(result.token, result.tokenTTL);
          deferred.resolve(result);
        }).error(function(error){
          self.removeToken();
          deferred.reject(error);
        });
        return deferred.promise;
      },

      /**
       *
       * @returns {*} token
       */
      'getToken' : function(){
        return $window.localStorage.getItem(fmStateConstants.tokenStorageKey);
      },

      /**
       * Sets token in local storage and sets default header.
       * @param token authentication token
       * @param ttl time to live in seconds
       */
      'setToken' : function(token, ttl){
        if (!token) {
          this.removeToken();
        } else {
          $window.localStorage.setItem(fmStateConstants.tokenStorageKey, token);
          $http.defaults.headers.common[fmStateConstants.tokenHeader] = token;
          //Subtract the warning duration from the ttl to get the idle duration.
          if($idle && ttl){
            $idle._options().idleDuration = ttl - $idle._options().warningDuration;
            $idle.watch();
          }
        }
      },

      /**
       * Checks storage for token and sets default token header
       */
      'checkAndSetStoredCredentials': function() {
        var self = this,
          token = $window.localStorage.getItem(fmStateConstants.tokenStorageKey);
        self.setToken(token);

        if(!!token){
          $http({
            cache: false,
            method: 'GET',
            responseType: 'json',
            url: api.secmgr + '/user/current'
          }).catch(function(){
            self.removeToken();
          });
        }
      },

      /**
       * Removes auth token from storage
       */
      'removeToken': function() {
        $window.localStorage.removeItem(fmStateConstants.tokenStorageKey);
        delete $http.defaults.headers.common[fmStateConstants.tokenHeader];
        $idle.unwatch();
      },

      /**
       * Removes auth token, calls the logout endpoint, and removes http cache.
       */
      'invalidateCredentials': function() {
        var $httpCache = $cacheFactory.get('$http'),
          token = $window.localStorage.getItem(fmStateConstants.tokenStorageKey);

        if (token) {
          $http({
            method: 'POST',
            url: api.secmgr + '/authentication/logout'
          });
          this.removeToken();
        }
        $window.localStorage.removeItem(fmStateConstants.returnToUrlKey);
        $httpCache.removeAll();
      }
    };

  }
  AuthFactory.$inject = ['$cacheFactory', '$http', '$idle', '$q', '$window', 'api', 'fmStateConstants'];

  function AuthProvider() {
    this.$get = AuthFactory;
  }

  angular.module('fm.state').provider('auth', AuthProvider);

})();

(function(){
  'use strict';

  function Idler($idle, $keepalive, $location, $modal, $rootScope){

    var modal = null,
      timedout = false;

    function closeModal() {
      if (modal) {
        modal.close();
        modal = null;
      }
    }

    function openModal(){
      timedout = false;
      closeModal();
      modal = $modal.open({
        templateUrl: 'idlewarning.html',
        windowClass: 'modal-danger'
      });
      modal.result.then(function(){
        if(!timedout){
          $keepalive.ping();
          $idle.watch();
        }
      });
    }

    function timeout(){
      timedout = true;
      closeModal();
      $location.path( '/timedout' );
    }

    $rootScope.$on('$idleStart', openModal);
    $rootScope.$on('$idleEnd', closeModal);
    $rootScope.$on('$idleTimeout', timeout);

    return {
      open: openModal,
      close: closeModal,
      timeout: timeout
    };
  }
  Idler.$inject = ['$idle', '$keepalive', '$location', '$modal', '$rootScope'];

  angular.module('fm.state').factory('idler', Idler);

})();

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
'use strict';

angular.module('fm.state').factory('$qStateParams', function() {
  return {};
});

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
'use strict';

angular.module('fm.state').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('root.logout', {
      url: '/logout',
      views: {
        header: {
          template: ''
        },
        main: {
          template: '',
          controller: [
            '$rootScope',
            '$state',
            'auth',
            function($rootScope, $state, auth){
              auth.invalidateCredentials();
              $rootScope.$broadcast('fmlogout'); //broadcast logout event.
              $state.go('root.login', {}, {
                location: 'replace',
                reload: true,
                notify: true
              });
            }
          ]
        }
      }
    });
  }
]);

'use strict';

angular.module('fm.state').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('root', {
      abstract: true,
      resolve: {
        locale: ['locale', function (locale) {
          return locale.ready('common').then(function () {
            return locale;
          });
        }]
      },
      views: {
        root: {
          templateUrl: 'root.html'
        }
      }
    });
  }
]);

'use strict';

angular.module('fm.state').config([
  '$stateProvider',
  function ($stateProvider) {
    $stateProvider.state('root.timedout', {
      url: '/timedout',
      views: {
        header: {
          template: ''
        },
        main: {
          template: '',
          controller: [
            '$state',
            '$stateParams',
            'locale',
            'toast',
            function($state, $stateParams, locale, toast){
              toast.addStickyErrorMessage(locale.getString('fmState.timedout'));
              $state.transitionTo('root.logout', $stateParams, {
                location: 'replace',
                reload: true,
                notify: true
              });
            }
          ]
        }
      }
    });
  }
]);
