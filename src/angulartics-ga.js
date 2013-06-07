(function(angular) {
'use strict';

angular.module('angulartics.ga', ['angulartics'])
  .config(function($analyticsProvider) {

    $analyticsProvider.registerPageTrack(function(path) {
      window._gaq.push(['_trackPageview', path]);
      // ga('send', 'pageview', path);
    });

    $analyticsProvider.registerEventTrack(function(category, action, label, value, implicitCount) {
      window._gaq.push(['_trackEvent', category, action, label, value, implicitCount]);
      // ga('send', 'event', category, action, label, value);
    });

  });

})(angular);