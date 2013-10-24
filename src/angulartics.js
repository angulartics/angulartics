!function () {
'use strict';

/**
 * Directive prefix customization support
 */
var DEFAULT_DIRECTIVE_PREFIX = 'track';

var angulartics = window.angulartics = {
	directivePrefix: document.getElementsByTagName('html')[0].dataset.tkPrefix || DEFAULT_DIRECTIVE_PREFIX,
	prefixed: function (name) { return this.directivePrefix + name[0].toUpperCase() + name.slice(1); }	
};

if (angulartics.directivePrefix !== DEFAULT_DIRECTIVE_PREFIX) console.debug('Using directive prefix:', directivePrefix);

/**
* Returns a link function that binds the specified trigger to the hit() method of the
* trackMetric directive controller.
*
* @param {String} trigger
*/
function elementBind(trigger) {
	return function (scope, iElement, iAttrs, metricCtrl) {
		metricCtrl && iElement.bind(trigger, metricCtrl.hit);
	};
}

/**
 * Returns a directive function that wraps common functionality for
 * automatically integrated HTML elements.
 *
 * @param {String} directiveName
 * @param {String} restrict
 * @param {String} trigger
 */
angulartics.commonElementDirective = function (restrict, trigger) {
	return function () {
		return {
			restrict: restrict,
			require: '?' + angulartics.prefixed('metric'),
			link: elementBind(trigger)
		};
	};
}

/**
 * AngularJS module
 */
angular.module('angulartics', []);

}();