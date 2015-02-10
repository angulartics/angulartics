/**
 * @license Angulartics v0.17.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Tealium Plugin Contributed by https://github.com/ianhampton & https://github.com/simonbrowning
 * License: MIT
 */

(function(angular){
'use strict';


/**
 * @ngdoc overview
 * @name angulartics.tealium
 * Enables angulartics native intergration with Tealium's utag.js
 */

angular.module('angulartics.tealium', ['angulartics'])
.config(['$analyticsProvider', function($analyticsProvider){
  var dataCheck;
  
  /**
  * dataCheck function to convert data sources into Tealium proposed standard. i.e. 'page_name'.
  */

  dataCheck = function(data){
    var key,result ={},res,prop; 
    for (key in data) {
      if(!data.hasOwnProperty(key)){
        continue;
      }
      if (/\w+\_\w+/.test(key)) {
        result[key.toLowerCase()] = data[key];
      }else {
        res = key.match(/(\w+)([A-Z]|\-)(\w+)/);
        if (res && res[1] && res[2] && res[3]) {
          prop = (res[1].toLowerCase()) + "_" + (res[2].toLowerCase().replace('-', '')) + (res[3].toLowerCase());
          result[prop] = data[key];
        }
      }
    }
    return result;  
  };


  /**
  *   Trigger virtual page view within Tealium
  *   @params {string} path Optional. 'pathname / hash' changes will automatically be recorded within the latest versions of utag.js.
  *   Intergrate the the utag_data object into the view call.
  */

  $analyticsProvider.registerPageTrack(function(path){
    if(window.utag && window.utag.view){
      var utag_data = window.utag_data || {};
      if(path && path !== ""){
       utag_data.page_path = path; 
      }
      window.utag.view(utag_data);
    }
  });

  /**
   * Event Tracking
   * @param {string} source Required 'source' (string) event origin. For example 'Button 1'.
   * @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
   */

  $analyticsProvider.registerEventTrack(function(source, properties){
    var utag_data = {};
    if(window.utag && window.utag.link){
      if(!properties){
        return;
      }
      utag_data = dataCheck(properties);
      utag_data.event_source = source;
      window.utag.link(utag_data);
    }
  });
}]);

})(angular);
