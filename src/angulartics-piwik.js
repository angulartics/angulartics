/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Piwik 2.1.x update contributed by http://github.com/highskillz
 * License: MIT
 */

/* global _paq */

(function(angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name angulartics.piwik
     * Enables analytics support for Piwik (http://piwik.org/docs/tracking-api/)
     */
    angular.module('angulartics.piwik', ['angulartics'])
        .config(['$analyticsProvider', '$windowProvider',
            function($analyticsProvider, $windowProvider) {
                var $window = $windowProvider.$get();

                $analyticsProvider.settings.pageTracking.trackRelativePath = true;

                // Add piwik specific trackers to angulartics API

                // scope: visit or page. Defaults to 'page'
                $analyticsProvider.api.setCustomVariable = function(varIndex, varName, value, scope) {
                    if ($window._paq) {
                        scope = scope || 'page';
                        $window._paq.push(['setCustomVariable', varIndex, varName, value, scope]);
                    }
                };

                // trackSiteSearch(keyword, category, [searchCount])
                $analyticsProvider.api.trackSiteSearch = function(keyword, category, searchCount) {

                    // keyword is required
                    if ($window._paq && keyword) {

                        var params = ['trackSiteSearch', keyword, category || false];

                        // searchCount is optional
                        if (angular.isDefined(searchCount)) {
                            params.push(searchCount);
                        }

                        $window._paq.push(params);
                    }
                };

                // logs a conversion for goal 1. revenue is optional
                // trackGoal(goalID, [revenue]);
                $analyticsProvider.api.trackGoal = function(goalID, revenue) {
                    if ($window._paq) {
                        _paq.push(['trackGoal', goalID, revenue || 0]);
                    }
                };

                // Set default angulartics page and event tracking

                // $analytics.setUsername(username)
                $analyticsProvider.registerSetUsername(function(username) {
                    if ($window._paq) {
                        $window._paq.push(['setUserId', username]);
                    }
                });

                // $analytics.setAlias(alias)
                // $analyticsProvider.registerSetAlias(function(param) {
                //     // TODO: No piwik corresponding function found. Use setCustomVariable instead
                // });

                // $analytics.setUserProperties(properties)
                // $analyticsProvider.registerSetUserProperties(function(param) {
                //     // TODO: No piwik corresponding function found. Use setCustomVariable instead
                // });

                // locationObj is the angular $location object
                $analyticsProvider.registerPageTrack(function(path, locationObj) {
                    if ($window._paq) {
                        $window._paq.push(['setDocumentTitle', $window.document.title]);
                        $window._paq.push(['setCustomUrl', path]);
                        $window._paq.push(['trackPageView']);
                    }
                });

                // trackEvent(category, event, [name], [value])
                $analyticsProvider.registerEventTrack(function(action, properties) {
                    if ($window._paq) {
                        // PAQ requires that eventValue be an integer, see: http://piwik.org/docs/event-tracking/
                        if (properties.value) {
                            var parsed = parseInt(properties.value, 10);
                            properties.value = isNaN(parsed) ? 0 : parsed;
                        }

                        $window._paq.push(['trackEvent', properties.category, action, properties.label, properties.value]);
                    }
                });

            }
        ]);
})(angular);
