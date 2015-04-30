// package metadata file for Meteor.js
var packageName = 'urigo:angulartics'; // https://atmospherejs.com/urigo/angulartics
var where = 'client'; // where to install: 'client' or 'server'. For both, pass nothing.
var version = '0.17.2_1';

Package.describe({
  name: packageName,
  version: version,
  summary: 'angulartics (official): Analytics for AngularJS applications',
  git: 'git@github.com:luisfarzati/angulartics.git'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);

  api.use('angular:angular@1.1.5', where);
  api.use('jquery-waypoints@1.0.3', where);

  api.addFiles('dist/angulartics.min.js', where);
  api.addFiles('dist/angulartics-adobe.min.js', where);
  api.addFiles('dist/angulartics-chartbeat.min.js', where);
  api.addFiles('dist/angulartics-cnzz.min.js', where);
  api.addFiles('dist/angulartics-flurry.min.js', where);
  api.addFiles('dist/angulartics-ga.min.js', where);
  api.addFiles('dist/angulartics-ga-cordova.min.js', where);
  api.addFiles('dist/angulartics-gtm.min.js', where);
  api.addFiles('dist/angulartics-kissmetrics.min.js', where);
  api.addFiles('dist/angulartics-mixpanel.min.js', where);
  api.addFiles('dist/angulartics-piwik.min.js', where);
  api.addFiles('dist/angulartics-scroll.min.js', where);
  api.addFiles('dist/angulartics-segmentio.min.js', where);
  api.addFiles('dist/angulartics-splunk.min.js', where);
  api.addFiles('dist/angulartics-woopra.min.js', where);
  api.addFiles('dist/angulartics-marketo.min.js', where);
  api.addFiles('dist/angulartics-intercom.min.js', where);
});