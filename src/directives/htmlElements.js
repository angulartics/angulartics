!function (commonElementDirective) {
'use strict';

angular.module('angulartics')
.directive('button', commonElementDirective('E', 'click'))
.directive('a', commonElementDirective('E', 'click'))
.directive('form', commonElementDirective('E', 'submit'))
.directive('iframe', commonElementDirective('E', 'load'));

// if you want to provide automatic integration for other elements, this is the place

}(angulartics.commonElementDirective);