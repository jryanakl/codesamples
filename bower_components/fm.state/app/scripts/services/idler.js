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

  angular.module('fm.state').factory('idler', Idler);

})();
