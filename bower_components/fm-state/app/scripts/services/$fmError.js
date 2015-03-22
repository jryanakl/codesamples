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