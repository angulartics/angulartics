# angulartics

[![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-downloads-url] [![Bower version][bower-image]][bower-url] [![Dependencies status][dep-status-image]][dep-status-url] [![devDependency Status](https://david-dm.org/angulartics/angulartics/dev-status.svg)](https://david-dm.org/angulartics/angulartics#info=devDependencies) [![MIT license][license-image]][license-url] [![Gitter Chat](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/angulartics) [![CDNJS](https://img.shields.io/cdnjs/v/angulartics.svg)](https://cdnjs.com/libraries/angulartics)

Vendor-agnostic analytics for AngularJS applications. [angulartics.github.io](http://angulartics.github.io "Go to the website")

## Please Read!

This is **Angulartics**, not _**[Angularytics](http://github.com/mgonto/angularytics)**_. There's been some complains about the unfortunate similarity in the names of both projects (this is actually a [funny story](#FunnyStory)), so [we hear you guys](https://daveceddia.com/angular/angularytics-vs-angulartics/) and are making this clarification here. Just make sure **Angulartics** is the library you actually want to use, and if you work in a team, make sure this is the library they are using!

## Install

### npm

```shell
npm install angulartics
```

### Bower

To install angulartics core module:
```shell
bower install angulartics
```

### NuGet

> **Note: we are dropping support for NuGet.

## Full path tracking (for pages without a router)
Introduced in 0.15.19 - support websites that do not use Angular `routes` or `states` on every page and still want to track full paths.  The modifications lead to the following behavior:

 - **Viewing page `http://host.com/routes#/route` will be tracked as `/routes#/route`.** The original version would only track the page as `/route`
 - **Viewing page `http://host.com/noroutes` will be tracked as `/noroutes`.**  This is useful for pages that do not contain Angular code besides initializing the base module.
 - **Viewing page `http://host.com/routes2` that loads a default route and changes the path to `http://host.com/routes2#/` will be tracked as `/routes2#/`.** This will only fire one pageview, whereas earlier versions would have fired two.

To enable this behavior, add the following to your configuration:

		...
		var yourApp = angular.module('YourApp', ['angulartics', 'angulartics.google.analytics'])
		    .config(function ($analyticsProvider) {
		        $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
		        $analyticsProvider.withAutoBase(true);  /* Records full path */
		});

You can also use `$analyticsProvider.withBase(true)` instead of `$analyticsProvider.withAutoBase(true)` if you are using a `<base>` HTML tag.

## Minimal setup

### for Google Analytics

See [angulartics-google-analytics](https://github.com/angulartics/angulartics-google-analytics/blob/master/README.md) documentation.

### for Google Tag Manager (new interface)

    angular.module('myApp', ['angulartics', 'angulartics.google.tagmanager'])

Add the full tracking code from Google Tag Manager to the beginning of your body tag.

Setup listeners in Google Tag Manager

#### 6 Variables

Naming and case must match.

1. **angulartics page path**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **content-name**
2. **angulartics event category**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **target**
3. **angulartics event action**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **action**
4. **angulartics event label**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **target-properties**
5. **angulartics event value**
    Macro Type: **Data Layer Variable**
    Data Layer Variable Name: **value**
6. **angulartics event interaction type**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **interaction-type**

#### 2 Triggers

Name and case must match

1. **Angulartics events**
    Event: **Custom Event**
    Fire on: **interaction**
2. **Angulartics pageviews**
    Event: **Custom Event**
    Fire on: **content-view**

#### 2 Tags

1. **Angulartics Events**
    Product: **Google Analytics**
    Type: **Universal Analytics**
    Tracking ID: **YourGoogleAnalyticsID**
    Track Type: **Event**
    Category: **{{angulartics event category}}**
    Action: **{{angulartics event action}}**
    Label: **{{angulartics event label}}**
    Value: **{{angulartics event value}}**
    Non-Interaction Hit: **{{angulartics event interaction type}}**
    Fire On: **Angulartics events**
2. **Angulartics Pageviews**
    Product: **Google Analytics**
    Type: **Universal Analytics**
    Tracking ID: **YourGoogleAnalyticsID**
    Track Type: **Page View**
    More settings > Field to Set > name: **page**, value: **{{angulartics page path}}**
    Fire On: **Angulartics pageviews**

### for Google Tag Manager (old interface)

    angular.module('myApp', ['angulartics', 'angulartics.google.tagmanager'])

Add the full tracking code from Google Tag Manager to the beginning of your body tag.

Setup listeners in Google Tag Manager

#### 6 Macros

Naming and case must match.

1. **angulartics page path**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **content-name**
2. **angulartics event category**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **target**
3. **angulartics event action**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **action**
4. **angulartics event label**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **target-properties**
5. **angulartics event value**
    Macro Type: **Data Layer Variable**
    Data Layer Variable Name: **value**
6. **angulartics event interaction type**
    Type: **Data Layer Variable**
    Data Layer Variable Name: **interaction-type**

#### 2 Rules

Name and case must match

1. **Angulartics events**
    Condition: **{{event}} equals interaction**
2. **Angulartics pageviews**
    Condition: **{{event}} equals content-view**

#### 2 Tags

1. **Angulartics Events**
    Product: **Google Analytics**
    Type: **Universal Analytics**
    Tracking ID: **YourGoogleAnalyticsID**
    Track Type: **Event**
    Category: **{{angulartics event category}}**
    Action: **{{angulartics event action}}**
    Label: **{{angulartics event label}}**
    Value: **{{angulartics event value}}**
    Non-Interaction Hit: **{{angulartics event interaction type}}**
    Firing Rules: **Angulartics events**
2. **Angulartics Pageviews**
    Product: **Google Analytics**
    Type: **Universal Analytics**
    Tracking ID: **YourGoogleAnalyticsID**
    Track Type: **Page View**
    More settings > Basic Configuration > Document Path: **{{angulartics page path}}**
    Firing Rules: **Angulartics pageviews**

### for Piwik ##

See [angulartics-piwik](https://github.com/angulartics/angulartics-piwik) for more details.

### for other providers

[Browse the website for detailed instructions.](http://angulartics.github.io)

## Supported providers

* [Adobe Analytics](https://github.com/angulartics/angulartics-adobe-analytics)
* [Chartbeat](https://github.com/angulartics/angulartics-chartbeat)
* [Clicky](https://github.com/angulartics/angulartics-clicky)
* [Facebook Pixel] (https://github.com/mooyoul/angulartics-facebook-pixel)
* [Flurry](https://github.com/angulartics/angulartics-flurry)
* [Google Analytics](https://github.com/angulartics/angulartics-google-analytics)
* Google Tag Manager
* GoSquared
* [HubSpot](https://github.com/angulartics/angulartics-hubspot)
* [IBM Digital Analytics](https://github.com/cwill747/angulartics-coremetrics)
* [Kissmetrics](https://github.com/angulartics/angulartics-kissmetrics)
* [Localytics](https://github.com/angulartics/angulartics-localytics)
* Loggly
* Marketo
* [Mixpanel](https://github.com/angulartics/angulartics-mixpanel)
* Piwik
* [Scout](https://github.com/Trolleymusic/angulartics-scout)
* Scroll tracking
* [Segment](https://github.com/angulartics/angulartics-segment)
* Splunk
* Woopra

If there's no Angulartics plugin for your analytics vendor of choice, please feel free to write yours and PR' it! Here's how to do it.

## Creating your own vendor plugin

> Make sure you follow the [Plugin contribution guidelines](https://github.com/angulartics/angulartics/wiki/Plugin-contribution-rules). You can also use [any of the existing plugins](https://github.com/angulartics) as a starter template.

It's very easy to write your own plugin. First, create your module and inject `$analyticsProvider`:

	angular.module('angulartics.myplugin', ['angulartics'])
	  .config(['$analyticsProvider', function ($analyticsProvider) {

Please follow the style `angulartics.{vendorname}`.

Next, you register either the page track function, event track function, or both. You do it by calling the `registerPageTrack` and `registerEventTrack` methods. Let's take a look at page tracking first:

    $analyticsProvider.registerPageTrack(function (path) {
		// your implementation here
	}

By calling `registerPageTrack`, you tell Angulartics to invoke your function on `$routeChangeSuccess` or `$stateChangeSuccess`. Angulartics will send the new path as an argument.

    $analyticsProvider.registerEventTrack(function (action, properties) {
		// your implementation here

This is very similar to page tracking. Angulartics will invoke your function every time the event (`analytics-on` attribute) is fired, passing the action (`analytics-event` attribute) and an object composed of any `analytics-*` attributes you put in the element.

If the analytics provider is created async, you can wrap you code with:

    angulartics.waitForVendorApi("var", 1000, function(window.var) {
      ...
    });

which will polls every 1000ms for `window.var`, and fire `function(window.var)` once `window.var` is not `undefined`. Calls made by `$analytics` will be buffered until `function(window.var)` fires.

You can also poll for `window.var.subvar` with:

    angulartics.waitForVendorApi("var", 1000, "subvar", function(window.var) {
      ...
    });

Check out the bundled plugins as reference. If you still have any questions, feel free to email me or post an issue at GitHub!

## Playing around

### Opt-out settings

When working on a global product there are many countries who by default require the opt-out functionality of all analytics and tracking. These opt out settings are meant to adi with that. The developer mode simply cripples the library where as this actually disables the tracking so it can be turned on and off.

    // $analytics.setOptOut(boolean Optout);
    // To opt out
    $analytics.setOptOut(true);

    // To opt in
    $analytics.setOptOut(false);

    // To get opt out state
    $analytics.getOptOut(); // Returns true or false


### Disabling virtual pageview tracking

If you want to keep pageview tracking for its traditional meaning (whole page visits only), set virtualPageviews to false:

	module.config(function ($analyticsProvider) {
		$analyticsProvider.virtualPageviews(false);

### Disabling pageview tracking for specific routes

If you want to disable pageview tracking for specific routes, you can define a list of excluded routes (using strings or regular expressions):

    module.config(function ($analyticsProvider) {
    		$analyticsProvider.excludeRoutes(['/abc','/def']);

Urls and routes that contain any of the strings or match any of the regular expressions will not trigger the pageview tracking.

### Disabling tracking of specific query string keys

If you want to disable tracking for specific query string keys, you can define a list of both whitelisted and blacklisted keys (using strings or regular expressions):

    module.config(function ($analyticsProvider) {
            $analyticsProvider.queryKeysWhitelist([/^utm_.*/]);
            $analyticsProvider.queryKeysBlacklist(['email',/^user/]);

Any query string key/value pairs will be filtered out of the URL sent to the tracking authority.

Blacklisting overrides Whitelisting.

### Disabling tracking on $routeChangeSuccess

If you want to disable pageview tracking for the $routeChangeSuccess event, set trackRoutes to false:

    module.config(function ($analyticsProvider) {
      $analyticsProvider.trackRoutes(true);

### Disabling tracking on $stateChangeSuccess

If you want to disable pageview tracking for the $stateChangeSuccess event, set trackStates to false:

    module.config(function ($analyticsProvider) {
      $analyticsProvider.trackStates(true);

### Programmatic tracking

Use the `$analytics` service to emit pageview and event tracking:

	module.controller('SampleCtrl', function($analytics) {
		// emit pageview beacon with path /my/url
	    $analytics.pageTrack('/my/url');

		// emit event track (without properties)
	    $analytics.eventTrack('eventName');

		// emit event track (with category and label properties for GA)
	    $analytics.eventTrack('eventName', {
	      category: 'category', label: 'label'
        });

### Declarative tracking

Use `analytics-on` and `analytics-event` attributes for enabling event tracking on a specific HTML element:

	<a href="file.pdf"
		analytics-on="click"
        analytics-if="myScope.shouldTrack"
		analytics-event="Download">Download</a>

`analytics-on` lets you specify the DOM event that triggers the event tracking; `analytics-event` is the event name to be sent.

`analytics-if` is a conditional check. If the attribute value evaluates to a falsey, the event will NOT be fired. Useful for user tracking opt-out, etc.

Additional properties (for example, category as required by GA) may be specified by adding `analytics-*` attributes:

	<a href="file.pdf"
		analytics-on="click"
		analytics-event="Download"
		analytics-category="Content Actions">Download</a>

or setting `analytics-properties`:

	<a href="file.pdf"
		analytics-on="click"
		analytics-event="Download"
		analytics-properties="{ category: 'Content Actions' }">Download</a>

### Scroll tracking

You can use:

    <div analytics-on="scrollby">

which will track an event when the element is scrolled to the top of the viewport.
This relies on [jQuery Waypoints](http://imakewebthings.com/jquery-waypoints/) which must be loaded:

    <script src="waypoints/waypoints.min.js"></script>
    <script src="angulartics/dist/angulartics-scroll.min.js"></script>

The following module must be enabled as well:

    angular.module('myApp', [..., 'angulartics.scroll'])

You can pass [extra options](http://imakewebthings.com/waypoints/api/waypoint/) to Waypoints with `scrollby-OPTION`. For example, to track an event when the element is in the middle on the viewport:

    <div analytics-on="scrollby" scrollby-offset="50%">

Waypoints is fired with the following options:
  - `continuous: false`, when jumping (for example with a URL anchor) passed several tracked elements, only the last one will fire an event
  - `triggerOnce: true`, the tracking event is only fired once for a given page

### User tracking

You can assign user-related properties which will be sent along each page or event tracking thanks to:

    $analytics.setAlias(alias)
    $analytics.setUsername(username)
    $analytics.setUserProperties(properties)
    $analytics.setSuperProperties(properties)

Like `$analytics.pageTrack()` and `$analytics.eventTrack()`, the effect depends on the analytics provider (i.e. `$analytics.register*()`). Not all of them implement those methods.

The Google Analytics module lets you call `$analytics.setUsername(username)` or set up `$analyticsProvider.settings.ga.userId = 'username'`.

### Exception tracking

You can enable automatic exception tracking which decorates angular's `$exceptionHandler` and reports the exception to the analytics provider:

    $analyticsProvider.trackExceptions(true)

Currently only the Google Analytics provider supports tracking exceptions, and it does so by reporting it as an event.

### Developer mode

You can disable tracking with:

    $analyticsProvider.developerMode(true);

You can also debug Angulartics by adding the following module:

    angular.module('myApp', [..., 'angulartics.debug'])

which will call `console.log('Page|Event tracking: ', ...)` accordingly.

## What else?

See more docs and samples at [http://angulartics.github.io](http://angulartics.github.io "http://angulartics.github.io").

## <a name="FunnyStory"></a>Funny Story

Back in 2003 [@mgonto](http://github.com/mgonto) and I were excited with Angular, doing a bunch of stuff. We had met each other at the [Nardoz](http://github.com/nardoz) group and even crossed paths working for the same company. It turns out, both of us came up with the idea of building a module for analytics **at the same time, without knowing about it**. We even created our respective repos with just seconds of difference. Check that out yourselves by using the GitHub api and inspecting [the creation date for this repo](https://api.github.com/repos/angulartics/angulartics) (at that time, this repo was under my username [@luisfarzati](http://github.com/luisfarzati), this is the original so it has the original creation date) and then [Angularytics](https://api.github.com/repos/mgonto/angularytics)' creation date. Even our initial commits were about the same time.

To be honest, initially I thought he was just blatantly copycating the idea but then when I checked out the repo data, truth was his repo timestamp was even earlier than mine. So, technically, I copycated his idea. Of course I did not, that's the funny and weirdest thing of the story. Or perhaps, even weirder, is that we both chose almost the same exact name, only that @mgonto went with an additional Y.

We discussed about renaming one of our projects, we almost decided to play a Rock, Paper, Scissors, Lizard, Spock game to decide who keeps the original name, but both of us really liked our names. So we kept it that way.

Isn't the open source world crazy?

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/angulartics.svg
[npm-url]: https://npmjs.org/package/angulartics
[npm-downloads-image]: https://img.shields.io/npm/dm/angulartics.svg
[npm-downloads-url]: https://npmjs.org/package/angulartics
[bower-image]: https://img.shields.io/bower/v/angulartics.svg
[bower-url]: http://bower.io/search/?q=angulartics
[dep-status-image]: https://img.shields.io/david/angulartics/angulartics.svg
[dep-status-url]: https://david-dm.org/angulartics/angulartics
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE
[slack-image]: https://angulartics.herokuapp.com/badge.svg
[slack-url]: https://angulartics.herokuapp.com
