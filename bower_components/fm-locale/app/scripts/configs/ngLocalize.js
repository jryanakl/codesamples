(function () {
  'use strict';

  angular.module('fm.locale').value('localeConf', {
    basePath: 'languages',
    defaultLocale: 'en-US',
    fileExtension: '.copy.json',
    observableAttrs: /^data-(?!ng-|i18n)/
  });

})();
