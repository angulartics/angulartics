/**
 * @license Angulartics v0.15.17
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function(angular, analytics) {
'use strict';

var angulartics = window.angulartics || (window.angulartics = {});
angulartics.waitForVendorApi = function (objectName, delay, registerFn) {
  if (!Object.prototype.hasOwnProperty.call(window, objectName)) {
    setTimeout(function () { angulartics.waitForVendorApi(objectName, delay, registerFn); }, delay);
  }
  else {
    registerFn(window[objectName]);
  }
};

/**
 * @ngdoc overview
 * @name angulartics
 */
angular.module('angulartics', [])
.provider('$analytics', function () {
  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      basePath: '',
      bufferFlushDelay: 1000
    },
    eventTracking: {
      bufferFlushDelay: 1000
    }
  };

  var cache = {
    pageviews: [],
    events: []
  };

  var bufferedPageTrack = function (path) {
    cache.pageviews.push(path);
  };
  var bufferedEventTrack = function (event, properties) {
    cache.events.push({name: event, properties: properties});
  };

  var api = {
    settings: settings,
    pageTrack: bufferedPageTrack,
    eventTrack: bufferedEventTrack
  };

  var registerPageTrack = function (fn) {
    api.pageTrack = fn;
    angular.forEach(cache.pageviews, function (path, index) {
      setTimeout(function () { api.pageTrack(path); }, index * settings.pageTracking.bufferFlushDelay);
    });
  };
  var registerEventTrack = function (fn) {
    api.eventTrack = fn;
    angular.forEach(cache.events, function (event, index) {
      setTimeout(function () { api.eventTrack(event.name, event.properties); }, index * settings.eventTracking.bufferFlushDelay);
    });
  };

  return {
    $get: function() { return api; },
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) { this.settings.pageTracking.basePath = (value) ? angular.element('base').attr('href').slice(0, -1) : ''; },
    registerPageTrack: registerPageTrack,
    registerEventTrack: registerEventTrack
  };
})

.run(['$rootScope', '$location', '$analytics', function ($rootScope, $location, $analytics) {
  if ($analytics.settings.pageTracking.autoTrackFirstPage) {
    if ($analytics.settings.trackRelativePath) {
        $analytics.pageTrack($location.url());
    } else {
	$analytics.pageTrack($location.absUrl());
    }
  }
  if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
    $rootScope.$on('$locationChangeSuccess', function (event, current) {
      if (current && (current.$$route||current).redirectTo) return;
      var url = $analytics.settings.pageTracking.basePath + $location.url();
      $analytics.pageTrack(url);
    });
  }
}])

.directive('analyticsOn', ['$analytics', function ($analytics) {
  function isCommand(element) {
    return ['a:','button:','button:button','button:submit','input:button','input:submit'].indexOf(
      element.tagName.toLowerCase()+':'+(element.type||'')) >= 0;
  }

  function inferEventType(element) {
    if (isCommand(element)) return 'click';
    return 'click';
  }

  function inferEventName(element) {
    if (isCommand(element)) return element.innerText || element.value;
    return element.id || element.name || element.tagName;
  }

  function isProperty(name) {
    return name.substr(0, 9) === 'analytics' && ['On', 'Event'].indexOf(name.substr(9)) === -1;
  }

  return {
    restrict: 'A',
    scope: false,
    link: function ($scope, $element, $attrs) {
      var eventType = $attrs.analyticsOn || inferEventType($element[0]);

      angular.element($element[0]).bind(eventType, function () {
        var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
        var properties = {};
        angular.forEach($attrs.$attr, function(attr, name) {
            if (isProperty(name)) {
                properties[name.slice(9).toLowerCase()] = $attrs[name];
            }
        });

        $analytics.eventTrack(eventName, properties);
      });
    }
  };
}]);
})(angular);
