'use strict';

angular.module('fm.ui', 
  [ 
    'mgcrea.ngStrap.tab',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.datepicker',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.select',
    'mgcrea.ngStrap.collapse',
    'mgcrea.ngStrap.dropdown',
    'ui.bootstrap.tpls',
    'ui.bootstrap.modal',
    'ui.bootstrap.typeahead'
  ]);
'use strict';

angular.module('fm.ui')
	.constant('window-xs', 0)
	.constant('window-sm', 750)
	.constant('window-md', 970)
	.constant('window-lg', 1170);

'use strict';

angular.module('fm.ui').constant('colors', {

	// Element Colors
	black : '#231f20', // Body font
	blue : '#2296d1',
	blueDark : '#2484b5',
	blueDarker : '#1e688f',
	blueLight : '#ecf6fb',
	gray : '#787878',
	grayDark : '#3f3e3e',
	grayLight : '#e1e1e1',
	grayLighter : '#f5f5f5',
	orange : '#f58f31',
	white : '#ffffff',

	// Font Colors
	fontGreen : '#b8d988',
	fontRed : '#ef5d2f',

	// Chart Colors
	chartTransparency : '.3',
	chartTransparencyLight : '.7',

	chartBlue : 'rgba(32, 153, 212, 0.7)',
	chartBlueLight : 'rgba(32, 153, 212, 0.3)',

	chartGreen : '#96c85a',
	chartGreenLight : 'rgba(153, 203, 80, 0.3)',

	chartRed : '#c81919',
	chartRedLight : 'rgba(241, 97, 43, 0.3)',

	chartOrange : '#fa9619',
	chartOrangeLight : 'rgba(255, 214, 127, 0.3)',

	chartYellow : '#e6c832',
	chartYellowLight : 'rgba(255, 214, 127, 0.3)',

	chartGray : '#a7a9ab',
	chartGrayLight : 'rgba(171, 167, 209, 0.3)',

	// Old Colors
	green : '#61AA6D',
	yellow : '#F2DA7F',
	red : '#B0182B',

	// Neutrals
	neutral1 : '#F5F5F5',

	/*
	 neutral2 : 'darken($neutral1, 2%)',
	 neutral3 : 'darken($neutral2, 2%)',
	 neutral4 : 'darken($neutral3, 2%)',
	 neutral5 : 'darken($neutral4, 2%)',
	 neutral6 : 'darken($neutral5, 2%)',
	 */

	// Base Colors
	text : '#231f20',
	lightText : '#cecece',
	linkText : '#44aadd',

});


/**
 * <h1>Typeahead Popup Label</h1>
 *
 * <div class="section">
 * <p>By adding the variable <code>typeaheadPopupLabel</code> to the parent scope of a typeahead control,
 * a label will be added to the top of the typeahead-popup.</p>
 *
 * </div>
 */
(function() {
  'use strict';

  angular.module('fm.ui').directive('typeaheadPopupLabel', [function () {
    return {
      restrict: 'A',
      transclude: true,
      link: function (scope, element) {
        scope.$watch('typeaheadPopupLabel', function (newValue) {
          if (newValue) {
            element.css('display', 'block').html('<span>' + newValue + '</span>');
          }
        });
      }
    };
  }]);
})();

'use strict';
angular.module('fm.ui').filter('paginate', [function () {
    return function (input, page, limit) {
      var output = [];
      var length = input.length;
      if (page < 1) {
        page = 1;
      }
      var start = (page - 1) * limit;
      var end = page * limit;
      if (end > length) {
        end = length;
      }
      for (var i = start; i < end; i++) {
        output.push(input[i]);
      }
      return output;
    };
  }]);
'use strict';

/**
 * Overrides the base template, adding the &lt;li typeahead-popup-label ...&gt;>&lt;/li&gt; for the typeaheadPopupLabel directive.
 */
angular.module('template/typeahead/typeahead-popup.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('template/typeahead/typeahead-popup.html', [
    '<ul class="dropdown-menu" ng-show="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">',
    '    <li typeahead-popup-label style="display: none"></li>',
    '    <li ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)" role="option" id="{{match.id}}">',
    '        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>',
    '    </li>',
    '</ul>'
  ].join(''));
}]);
