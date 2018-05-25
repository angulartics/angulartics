(function (window, angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name angulartics.webtrends.analytics
     * Enables analytics support for Webtrends Analytics (http://webtrends.com/products-solutions/analytics/)
     */
    angular.module('angulartics.webtrends.analytics', ['angulartics'])
        .config(['$analyticsProvider', function ($analyticsProvider) {

            // Depending on Tag version, the vendor name will be different.
            // New Tag
            // var vendorWT = 'WT';
            // Old Tag
            var vendorWT = 'Webtrends';

            angulartics.waitForVendorApi(vendorWT, 500, function (vendor) {

                // Store the current path for page event calls.
                var urlPath = "";

                // Store the referring URL
                var refUrl = "";

                $analyticsProvider.registerPageTrack(function (path, params) {

                    // Set default values for data object
                    var data = {
                        "WT": {
                            "dl": 0,
                            "angjs": 1
                        }
                    };

                    // Set the referring URL, first hits will be empty.
                    if (urlPath !== "") {
                        var href = window.location.href;
                        href = href.split("/");
                        var domain = href[0] + "//" + href[2];
                        refUrl = domain + urlPath;
                    }

                    // Set the current path (to be used for page events)
                    urlPath = path;

                    // Check if additional parameters are being passed. If so, add to data object.
                    if (params && typeof params === 'object') {
                        for (var key in params) {
                            data[key] = params[key];
                        }
                    }

                    sendDataToWebtrends(data);
                });

                /**
                 * Track Event in Webtrends Analytics
                 * @name eventTrack
                 * @param {string} action Required 'action' (string) associated with the event
                 */
                $analyticsProvider.registerEventTrack(function (action, properties) {

                    // Set default values for data object
                    var data = {
                        "WT": {
                            "angjs": 1
                        }
                    };

                    // action will indicate what the WT.dl value will be set to. Default is 99.
                    // See: http://kb.webtrends.com/articles/Information/WT-dl-Values-and-Functionality-1365447872904
                    var wtdl = "99";
                    if (action && (action % 1 === 0)) {
                        wtdl = action;
                    }
                    data.WT.dl = wtdl;

                    // Check if additional parameters are being passed. If so, add to data object.
                    if (properties.params) {
                        // Params will be added as a JSON object, as it is a HTML attribute value.
                        var paramsObject = JSON.parse(properties.params);
                        if (paramsObject) {
                            for (var key in paramsObject) {
                                data[key] = paramsObject[key];
                            }
                        }
                    }

                    sendDataToWebtrends(data);
                });

                // Send the so far collected data to webtrends.
                function sendDataToWebtrends(data) {
                    // Check which tag version is in use, and send the data to Webtrends.
                    if (vendor.multiTrack) {
                        data["DCS.dcsuri"] = urlPath;

                        if (refUrl !== "") {
                            data["DCS.dcsref"] = refUrl;
                        }

                        vendor.multiTrack({args: data});
                    } else if (vendor.collect) {
                        data.dcsuri = urlPath;

                        if (refUrl !== "") {
                            data.dcsref = refUrl;
                        }

                        vendor.collect({data: data});
                    }
                }

            });
        }]);

})(window, angular);
