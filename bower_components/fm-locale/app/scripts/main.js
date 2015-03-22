(function () {
  'use strict';

  angular.module('fm.locale', [
    'ngLocalize'
  ]).run(['locale', function (locale) {
    locale.ready('common');
  }]);

})();
