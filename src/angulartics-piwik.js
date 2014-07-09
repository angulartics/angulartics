/**
 * @license Angulartics v0.15.20
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Piwik 2.1.x update contributed by http://github.com/highskillz
 * License: MIT
 */
(function(angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name angulartics.piwik
     * Enables analytics support for Piwik (http://piwik.org/docs/tracking-api/)
     */
    angular.module('angulartics.piwik', ['angulartics'])
        .config(['$analyticsProvider',
            function($analyticsProvider) {

                // Piwik seems to suppors buffered invocations so we don't need
                // to wrap these inside angulartics.waitForVendorApi

                $analyticsProvider.settings.trackRelativePath = true;

                $analyticsProvider.registerPageTrack(function(path) {
                    if (window._paq) {
                        _paq.push(['setCustomUrl', path]);
                        _paq.push(['trackPageView']);
                    }
                });

                $analyticsProvider.registerEventTrack(function(action, properties) {
                    // GA requires that eventValue be an integer, see:
                    // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
                    // https://github.com/luisfarzati/angulartics/issues/81
                    if (properties.value) {
                        var parsed = parseInt(properties.value, 10);
                        properties.value = isNaN(parsed) ? 0 : parsed;
                    }
                    console.warn('Piwik doesn\'t support event tracking -- silently ignored.');
                    console.warn('\t action\t[%s]', action);
                    console.warn('\t category\t[%s]', properties.category);
                    console.warn('\t label\t[%s]', properties.label);
                    console.warn('\t value\t[%s]', properties.value);
                    console.warn('\t noninteraction\t[%s]', properties.noninteraction);
                    console.warn('');
                });

            }
        ]);
})(angular);
