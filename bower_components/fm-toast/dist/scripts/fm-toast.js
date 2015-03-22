'use strict';

angular.module('fm.toast', [
  'toaster'
]);

angular.module('fm.toast').factory('toast', [
  '$rootScope',
  'toaster',
  function ($rootScope, toaster) {
    'use strict';
    var $scope = $rootScope.$new(true);
    $scope.toasts = [];

    var formatErrorMessage = function (text, error, title) {

      var errStr = null;
      // in effort to be flexible with the error parameter,
      // checking if it's an object or just a string
      // if object then look for the message
      // either as a first order attribute or an attribute of the data object
      // (which is where it will be in the error returned by secmgr server)
      if (_.isObject(error)) {
        if (error.message) {
          errStr = error.message;
        } else if (error.data) {
          errStr = error.data.message;
        }
      } else if (_.isString(error)) {
        errStr = error;
      }

      if (errStr) {
        text += ' [' + errStr + ']';
      }

      var message = {
        status: 'error',
        title: title,
        text: text
      };
      return message;
    };

    return {
      addErrorMessage: function (text, error, title) {
        this.doToast(formatErrorMessage(text, error, title));
      },
      addStickyErrorMessage: function (text, error, title) {
        this.doStickyToast(formatErrorMessage(text, error, title));
      },
      addSuccessMessage: function (text, title) {
        var message = {
          status: 'success',
          title: title,
          text: text
        };
        this.doToast(message);
      },
      clearToast: function () {
        toaster.clear();
      },
      doToast: function (message) {
        toaster.clear();
        toaster.pop(message.status, message.title, message.text);
      },
      doStickyToast: function (message) {
        toaster.clear();
        toaster.pop(message.status, message.title, message.text, 0);
      }
    };
  }
]);
