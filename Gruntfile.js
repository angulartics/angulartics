module.exports = function(grunt) {
   'use strict';

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      karma: {
         unit: {
            configFile: 'karma.conf.js',
            singleRun: true
         }
      },

      jshint: {
         all: ['Gruntfile.js', 'src/*.js', 'test/**/*.js']
      },

      concat: {
         options: {
            stripBanners: false
         },
         dist: {
            src: ['dist/angulartics-scroll.min.js', 'components/jquery-waypoints/waypoints.min.js'],
            dest: 'dist/angulartics-scroll.min.js'
         }
      },

      uglify: {
         options: {
            preserveComments: 'some',
            report: 'min'
         },
         predist: {
            files: {
               'dist/angulartics-scroll.min.js': ['src/angulartics-scroll.js']
            }
         },
         dist: {
            files: {
               'dist/angulartics.min.js': ['src/angulartics.js'],
			   'dist/angulartics-adobe.min.js': ['src/angulartics-adobe.js'],
               'dist/angulartics-chartbeat.min.js': ['src/angulartics-chartbeat.js'],
               'dist/angulartics-piwik.min.js': ['src/angulartics-piwik.js'],
               'dist/angulartics-ga.min.js': ['src/angulartics-ga.js'],
               'dist/angulartics-ga-cordova.min.js': ['src/angulartics-ga-cordova.js'],
               'dist/angulartics-kissmetrics.min.js': ['src/angulartics-kissmetrics.js'],
               'dist/angulartics-mixpanel.min.js': ['src/angulartics-mixpanel.js'],
               'dist/angulartics-segmentio.min.js': ['src/angulartics-segmentio.js'],
               'dist/angulartics-gtm.min.js': ['src/angulartics-gtm.js'],
               'dist/angulartics-woopra.min.js': ['src/angulartics-woopra.js'],
               'dist/angulartics-splunk.min.js': ['src/angulartics-splunk.js'],
               'dist/angulartics-flurry.min.js': ['src/angulartics-flurry.js']
            }
         }
      },

      clean: ['dist']
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-clean');

   grunt.registerTask('test', ['jshint', 'karma']);
   grunt.registerTask('default', ['jshint', 'karma', 'uglify:predist', 'concat:dist', 'uglify:dist']);
};
