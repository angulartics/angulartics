(function (angular) {
  'use strict';

  /**
   * @ngdoc overview
   * @name angulartics.clicky
   * Adds support for Clicky analytics (http://clicky.com/).
   * Custom logging is a premium Clicky feature. To use this plugin,
   * clicky needs to be configured to disable automatic pageview logging
   * and history logging:
   *
   * ````
   * var clicky_custom = { pageview_disable : 1, history_disable : 1 };
   * ````
   */
  angular.module('angulartics.clicky', ['angulartics']).config([
    '$analyticsProvider', '$documentProvider', function ($analyticsProvider, $documentProvider) {

      var clickyApi;
      var $document = $documentProvider.$get;

      $analyticsProvider.settings.pageTracking.trackRelativePath = true;

      angulartics.waitForVendorApi('clicky', 100, registerEvents);

      /**
       * Register Clicky page and event tracking
       * @param {function} clicky - the clicky API function
       */
      function registerEvents(clicky) {

        clickyApi = clicky;

        if (clickyApi) {
          $analyticsProvider.registerPageTrack(pageTrack);
          $analyticsProvider.registerEventTrack(eventTrack);
        }

      }

      /**
       * Track pageview with Clicky
       * @param {string} path
       */
      function pageTrack(path, properties) {
        var title = properties.title || $document[0].title;
        var type = validateType(properties.type);
        clickyApi.log(path, title, type);
      }

      /**
       * registerEventTrack handler. If `properties.goal` is defined, a clicky.goal() is logged,
       * otherwise the clicky.log() is used.
       * @param action
       * @param properties
       */
      function eventTrack(action, properties) {

        // goals parameters
        var goalId, revenue, noQueue;

        // log parameters
        var title, type;

        // if a goal is sent, use the Clicky goal method, otherwise reroute to log
        if (angular.isDefined(properties.goal)) {

          goalId = properties.goal;
          revenue = validateNumber(properties.revenue) ? properties.revenue : undefined;
          noQueue = !!properties.noQueue;
          clickyApi.goal(goalId, revenue, noQueue);

        } else {
          // since `type` is a Clicky keyword, prefer `preoperties.type` over the eventType
          type = (validateType(properties.type) === properties.type) ? properties.type: 'click';

          // use the title if set, otherwise default to value
          title = properties.title || properties.value;
          clickyApi.log(action, title, type);
        }
      }

      /**
       * Validates against Clicky's enumerated values for the page type.
       * The default type is `click`, but we're choosing a default of
       * `pageview` since pageTrack happens during route change
       * @param type
       * @returns {boolean|string}
       * @link http://clicky.com/help/customization/manual#log
       */
      function validateType (type) {
        var TYPE_ENUM = ['click', 'download', 'outbound', 'pageview'];

        return (TYPE_ENUM.indexOf(type) >= 0) ? type : 'pageview';
      }

      /**
       * Returns true if a finite number
       * @param number
       * @returns {boolean}
       */
      function validateNumber (number) {
        return typeof number === 'number' && isFinite(number);
      }

    }
  ]);

})(angular);