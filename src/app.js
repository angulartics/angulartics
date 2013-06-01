(function(angular) {
'use strict';

angular.module('myApp', ['angulartics', 'angulartics.ga'])
  .config(function($routeProvider, $analyticsProvider) {
    $routeProvider
      .when('/a', { templateUrl: 'sample.tpl.html', controller: 'SampleCtrl' })
      .when('/b', { templateUrl: 'sample.tpl.html', controller: 'SampleCtrl' })
      .otherwise({ redirectTo: '/a' });

    // $analyticsProvider.settings.tracking.auto = false;
  })

  .controller('SampleCtrl', function() {
  });

})(angular);