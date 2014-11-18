/**
 * @license Angulartics v0.17.0
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.google.analytics
 * Enables analytics support for Google Analytics (http://google.com/analytics)
 */
angular.module('angulartics.google.analytics', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

  // GA already supports buffered invocations so we don't need
  // to wrap these inside angulartics.waitForVendorApi

  $analyticsProvider.settings.trackRelativePath = true;

  $analyticsProvider.registerPageTrack(function (path) {
    if (window._gaq) _gaq.push(['_trackPageview', path]);
    if (window.ga) ga('send', 'pageview', path);
  });

  /**
   * Track Event in GA
   * @name eventTrack
   *
   * @param {string} action Required 'action' (string) associated with the event
   * @param {object} properties Comprised of the mandatory field 'category' (string) and optional fields 'label' (string), 'value' (integer), 'noninteraction' (boolean), and 'hitcallback' (function) (Note: hitcallback is ignored in some versions of Google Analytics)
   *
   * @link https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide#SettingUpEventTracking
   *
   * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/events
   */
  $analyticsProvider.registerEventTrack(function (action, properties) {

    // do nothing if there is no category (it's required by GA)
    if (!properties || !properties.category) {
		return;
	}
    // GA requires that eventValue be an integer, see:
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
    // https://github.com/luisfarzati/angulartics/issues/81
    if(properties.value) {
      var parsed = parseInt(properties.value, 10);
      properties.value = isNaN(parsed) ? 0 : parsed;
    }

    if (window._gaq) {
      _gaq.push(['_trackEvent', properties.category, action, properties.label, properties.value, properties.noninteraction]);
    }
    else if (window.ga) {
	  var eventOptions = {
		eventCategory: properties.category || null,
		eventAction: action || null,
		eventLabel: properties.label ||  null,
		eventValue: properties.value || null,
		nonInteraction: properties.noninteraction || null,
		hitCallback: properties.hitcallback || null
	  };

	  // add custom dimensions and metrics
	  for(var idx = 1; idx<=20;idx++) {
		if(properties['dimension' +idx.toString()]) {
		  eventOptions['dimension' +idx.toString()] = properties['dimension' +idx.toString()];
		}
		if(properties['metric' +idx.toString()]) {
		  eventOptions['metric' +idx.toString()] = properties['metric' +idx.toString()];
	    }
	  }
	  ga('send', 'event', eventOptions);
    }
  });

}]);
})(angular);
