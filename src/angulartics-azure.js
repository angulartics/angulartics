/**
 * @license Angulartics v0.17.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Microsoft Azure Application Insights plugin contributed by https://github.com/anthonychu
 * License: MIT
 */
(function (angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name angulartics.azure
     * Enables analytics support for Microsoft Azure Application Insights (http://azure.microsoft.com/en-us/services/application-insights/)
     */
    angular.module('angulartics.azure', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {

        $analyticsProvider.registerPageTrack(function (path) {
            appInsights.trackPageView(path);
        });

        /**
         * Numeric properties are sent as metric (measurement) properties.
         * Everything else is sent as normal properties.
         */
        $analyticsProvider.registerEventTrack(function (eventName, eventProperties) {
            var properties = {};
            var measurements = {};

            angular.forEach(eventProperties, function (value, key) {
                if (isNumeric(value)) {
                    measurements[key] = parseFloat(value);
                } else {
                    properties[key] = value;
                }
            });

            appInsights.trackEvent(eventName, properties, measurements);
        });

    }]);
    
    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
})(angular);