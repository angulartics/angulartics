module.exports = function(grunt) {
   'use strict';

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      bower: grunt.file.readJSON('bower.json'),

      shell: {
         publish: {
            command: 'npm publish'
         }
      },

      bump: {
         options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: ['pkg', 'bower'],
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['package.json'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'upstream',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
         }
      },

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
               'dist/angulartics-flurry.min.js': ['src/angulartics-flurry.js'],
               'dist/angulartics-marketo.min.js': ['src/angulartics-marketo.js']
            }
         }
      },

      clean: ['dist']
   });

   require('load-grunt-tasks')(grunt);

   grunt.registerTask('test', ['jshint', 'karma']);
   grunt.registerTask('default', ['jshint', 'karma', 'uglify:predist', 'concat:dist', 'uglify:dist']);

   grunt.registerTask('release', 'Release a new version, push it and publish it', function(target) {
     if (!target) {
       target = 'patch';
     }
     return grunt.task.run('bump-only:' + target, 'default', 'bump-commit', 'shell:publish');
   });

};
