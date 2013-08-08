(function(angular) {
'use strict';

angular.module('angulartics', [])
  .provider('$analytics', function() {
    var settings = { tracking: { auto: true } };

    var api = {
      settings: settings,
      pageTrack: angular.noop,
      eventTrack: angular.noop
    };

    var registerPageTrack = function(fn) {
      api.pageTrack = fn;
    };
    var registerEventTrack = function(fn) {
      api.eventTrack = fn;
    };

    return {
      $get: function() { return api; },
      virtualPageviews: function(value) { this.settings.tracking.auto = value; },
      settings: settings,
      registerPageTrack: registerPageTrack,
      registerEventTrack: registerEventTrack
    };
  })

  .run(['$rootScope', '$location', '$analytics', '$log', function($rootScope, $location, $analytics, $log) {
    if ($analytics.settings.tracking.auto) {
      $rootScope.$on('$routeChangeStart', function() {
        $analytics.pageTrack($location.url());
      });
    }
  }])

  .directive('analyticsOn', ['$analytics', function($analytics) {

    function isCommand(element) {
      return ['a:','button:submit','input:button','input:submit'].indexOf(
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
      return name.substr(0, 9) === 'analytics' && ['on', 'event'].indexOf(name.substr(10)) === -1;
    }
    function evalAttr(scope, attr) {
        var str1 = attr.substring(0, attr.indexOf("{")),
            str2 = attr.substring(attr.lastIndexOf("}") + 1);
        attr = attr.replace(str1,"").replace(str2,"").replace("{{", "").replace("}}", "");
        return str1 + scope.$eval(attr) + str2;
    }
    return {
      restrict: 'A',
      scope: false,
      link: function($scope, $element, $attrs) {
        var eventType = $attrs.analyticsOn || inferEventType($element[0]),
            eventName = $attrs.analyticsEvent || inferEventName($element[0]),
            properties = {};


        angular.element($element[0]).bind(eventType, function() {
          for (var i = 0, len = this.attributes.length; i < len; i++) {
            var attr = this.attributes[i],
                name = attr.name,
                value = attr.value;
            
            if (name === "analytics-event") {
              if (value.indexOf("{") != -1) {
                eventName = evalAttr($scope, value);
              } else {
                eventName = value;
              }
            }else if (isProperty(name)) {
              if (value.indexOf("{") != -1) {
                properties[name.slice(10).toLowerCase()] = evalAttr($scope, value);
              } else {
                properties[name.slice(10).toLowerCase()] = value;
              }
            }
          }
          if (!eventName) eventName = inferEventName(this);
            
          $analytics.eventTrack(eventName, properties);
        });
      }
    };
  }]);

})(angular);
