module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  
  grunt.registerTask('test', 'karma');
};