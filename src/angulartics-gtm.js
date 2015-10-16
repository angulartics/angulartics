/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Google Tag Manager Plugin Contributed by http://github.com/danrowe49
 * License: MIT
 */

(function(angular){
'use strict';


/**
 * @ngdoc overview
 * @name angulartics.google.tagmanager
 * Enables analytics support for Google Tag Manager (http://google.com/tagmanager)
 */

angular.module('angulartics.google.tagmanager', ['angulartics'])
.config(['$analyticsProvider', function($analyticsProvider){
	
	// Set the default settings for this module
	$analyticsProvider.settings.gtm = {
		userId: null
	};

	/**
	* Send content views to the dataLayer
	*
	* @param {string} path Required 'content name' (string) describes the content loaded
	*/

	$analyticsProvider.registerPageTrack(function(path){
		var dataLayer = window.dataLayer = window.dataLayer || [];
		dataLayer.push({
			'event': 'content-view',
			'content-name': path,
			'user-id': $analyticsProvider.settings.gtm.userId
		});
	});

	/**
   	* Send interactions to the dataLayer, i.e. for event tracking in Google Analytics
   	* @name eventTrack
   	*
   	* @param {string} action Required 'action' (string) associated with the event
   	* @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
   	*/

	$analyticsProvider.registerEventTrack(function(action, properties){
		var dataLayer = window.dataLayer = window.dataLayer || [];
		properties = properties || {};
		dataLayer.push({
			'event': properties.event || 'interaction',
			'target': properties.category,
			'action': action,
			'target-properties': properties.label,
			'value': properties.value,
			'interaction-type': properties.noninteraction,
			'user-id': $analyticsProvider.settings.gtm.userId
		});

	});
	
	/**
   	* Register userId for User tracking in GA / etc
   	*/
	$analyticsProvider.registerSetUsername(function (userId) {
	   $analyticsProvider.settings.gtm.userId = userId;
	});
}]);

})(angular);
