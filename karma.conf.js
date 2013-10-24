module.exports = function(config) {
  'use strict';
  
  config.set({
    basePath: './',
    frameworks: ["jasmine"],
    browsers: ['PhantomJS'],
    files: [
      'test/lib/vendor/angular/angular.js',
      'test/lib/vendor/angular-mocks/angular-mocks.js',
      'test/lib/vendor/analytics/analytics.js',
      'test/specs/**/*.js',
      'src/angulartics.js',
      'src/**/*.js'
    ],
    autoWatch: true,
    reportSlowerThan: 500    
  });
};