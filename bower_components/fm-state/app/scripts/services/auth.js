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

  function AuthProvider() {
    this.$get = AuthFactory;
  }

  angular.module('fm.state').provider('auth', AuthProvider);

})();
