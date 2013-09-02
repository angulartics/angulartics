module.exports = function(grunt) {
   'use strict';

   grunt.initConfig({
      karma: {
         unit: {
            configFile: 'karma.conf.js',
            singleRun: true
         }
      },

      jshint: {
         all: ['Gruntfile.js', 'src/*.js', 'test/**/*.js']
      }
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-karma');

   grunt.registerTask('test', ['jshint', 'karma']);
};
