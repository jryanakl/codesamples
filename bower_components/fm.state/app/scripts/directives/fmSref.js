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

  // !! Directive declaration is not a copy from ui-sref
  angular.module('fm.state').directive('fmSref', FmSref);

})();
