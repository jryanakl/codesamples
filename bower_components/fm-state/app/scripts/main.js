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
