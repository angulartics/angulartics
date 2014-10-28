<a name="0.17.1"></a>
### 0.17.1 (2014-10-28)

#### Bug Fixes
- Adobe event tracking - download and exit events now sent (thanks to alexismartin)
- Fix angular-scroll directive (thanks to eshaham)
- Fix for Kissmetrics to allow Karma testing

#### Features
- Add Loggly support (thanks to zoellner)
- Add Localytics support (thanks to joehalliwell)
- Add CNZZ support (thanks to L42y)
- Add Hubspot support (thanks to asafdav)
- Add main attr to package.json to enable browserify support (thanks to adamscybot)
- Updates GA provider to support custom metrics and dimensions for universal GA on a per-event basis (thanks to Philo)
- Add `mixpanel.alias` support to call event after user signs up (thanks to tomasescobar)

<a name="0.17.0"></a>
### 0.17.0 (2014-10-02)

#### Bug Fixes
- Fix double page tracking - (don't set noRoutesorState to false if conditionals fail)
- Clean up dependency injections
- Angular-scroll now minification safe

#### Features
- Add Intercom vendor plugin

<a name="0.16.5"></a>
### 0.16.5 (2014-08-28)

#### Bug Fixes
- Google Analytics - do nothing if there is no event category (required)
- Mixpanel - look for the field __loaded before sending events
- Splunk - look for _sp with a dynamic function for anyone wanting to run setup in the module.config or not pull/compile the html of their app when running a testing framework like Karma

#### Features
Evaluate initial attribute values for properties.
- This is so that events that get fired immediately have an initial value for event properties.

<a name="0.16.4"></a>
### 0.16.4 (2014-08-21)

#### Bug Fixes
Fixed #182 double pageview tracking with ui-router

#### Features
Added basic debugging provider angulartics.debug.js that uses console.log to dump page and event tracking

<a name="0.16.3"></a>
### 0.16.3 (2014-08-20)

#### Bug Fixes
- Due to changes in routing logic, Angular 1.1.5 is now the minimum supported version.
- Update all samples to Angular 1.1.5
- Fix Adobe analytics sample

<a name="0.16.2"></a>
### 0.16.2 (2014-08-19)

#### Features
* Add marketo plugin. Thanks https://github.com/cthorner
* Better releasing with grunt-bump

<a name="0.16.1"></a>
### 0.16.1 (2014-08-06)

#### Features
* **analytics-if** - Analytics call will only be made if the `analytic-if` condition passes. Example: `<button analytics-on analytics-if="user.isLoggedIn">` 
* Better buffering
* Support for multiple providers

<a name="v0.15.20"></a>
### v0.15.20 (2014-07-09)

#### Bug Fixes

* **kissmetrics:** changing kissmetrics plugin to use global window object ([d505801](https://github.com/luisfarzati/angulartics/commit/d50580181c5cbb752c2bcb1d8334c65452aac9a2), closes [#161](https://github.com/luisfarzati/angulartics/issues/161))

#### Features

* **bower** add all vendor scripts to bower to enable automatic dependency injections via wiredep and similar tools [7cbcef1](https://github.com/luisfarzati/angulartics/commit/0108263228fe24c294c5cd120122bb6570a090a2)
