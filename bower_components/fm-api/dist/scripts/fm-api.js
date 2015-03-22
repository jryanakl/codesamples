'use strict';
angular.module('fm.api', ['ngResource']);
'use strict';
angular.module('fm.api').constant('api', {
  secmgr: '/securitymanager/api',
  policyplanner: '/policyplanner/api',
  policyoptimizer: '/policyoptimizer/api'
});