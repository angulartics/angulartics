/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Inspectlet support contributed by http://github.com/geordie--
 * License: MIT
 */
(function(angular) {
'use strict';

/**
 * @ngdoc overview
 * @name angulartics.inspeclet
 * Enables analytics support for Inspectlet (http://inspectlet.com)
 */
angular.module('angulartics.inspectlet', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

    $analyticsProvider.registerPageTrack(function (path) {

        var pageTrackArray = [];
        pageTrackArray.push('virtualPage');

        if(path){
            pageTrackArray.push({url : path});
        }

      __insp.push(pageTrackArray);

    });

    $analyticsProvider.registerEventTrack(function (action, properties) {

        //Tag only if the action name is allowed by Inspectlet
        if ( !(action == 'identify' || action == 'tagSession') ){
            return;
        }

        if(properties.category){
            delete properties.category;
        }

        var eventTrackArray = [];
        eventTrackArray.push(action);
        eventTrackArray.push(properties);

        __insp.push(eventTrackArray);

  });

}]);
})(angular);
