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
      settings: settings,
      registerPageTrack: registerPageTrack,
      registerEventTrack: registerEventTrack
    };
  })

  .run(function($rootScope, $location, $analytics, $log) {
    if ($analytics.settings.tracking.auto) {
      $rootScope.$on('$routeChangeStart', function() {
        console.log('pageTrack', $location.url());
        $analytics.pageTrack($location.url());
      });
    }
  })

  .service('$groupDirective', function($compile) {
    function applyBetweenComments(directiveName, element, value) {
      if (!element || (element instanceof Comment && element.data === ' directive: ' + directiveName + ' ')) {
        return;
      }
      if (element instanceof HTMLElement) {
        angular.element(element).attr(directiveName, value);
      }
      applyBetweenComments(directiveName, element.nextSibling, value);
    }

    this.applyBetweenComments = applyBetweenComments;
  })  

  .directive('analyticsCategory', function($groupDirective, $analytics) {
    return {
      restrict: 'M',
      compile: function($element, $attrs) {
        if ($attrs.analyticsCategory) {
          $groupDirective.applyBetweenComments('analytics-category', $element[0].nextSibling, $attrs.analyticsCategory);
        }
      }
    }
  })

  .directive('analyticsTrack', function($groupDirective, $analytics) {
    return {
      restrict: 'M',
      compile: function($element, $attrs) {
        if ($attrs.analyticsTrack) {
          $groupDirective.applyBetweenComments('analytics-track', $element[0].nextSibling, $attrs.analyticsTrack);
        }
      }
    }
  })

  .directive('analyticsTrack', function($analytics) {

    function isCommand(element) {
      return ['a:','button:submit','input:button','input:submit'].indexOf(
        element.tagName.toLowerCase()+':'+(element.type||'')) >= 0;
    }

    function inferAction(element) {
      if (isCommand(element)) return element.innerText || element.value;
    }

    return {
      restrict: 'A',
      scope: false,
      link: function($scope, $element, $attrs) {
        var eventType = $attrs.analyticsTrack,
            category = $attrs.analyticsCategory,
            action = $attrs.analyticsAction || inferAction($element[0]),
            label = $attrs.analyticsLabel,
            value = $attrs.analyticsValue;

        if (category && action) {
          angular.element($element[0]).bind(eventType, function() {
            console.log('eventTrack', category, action, label, value);
            $analytics.eventTrack(category, action, label, value);
          });
        }
      }
    };
  });

})(angular);