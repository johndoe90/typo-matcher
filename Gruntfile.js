'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		watch: {
			scripts: {
				files: ['lib/**/*.js'],
				tasks: ['jshint', 'jasmine']
			}
		},

		jasmine: {
			pivotal: {
				options: {
					specs: 'lib/test/**/*.js'
				}
			}		
		},

		jshint: {
			all: [
				'Gruntfile.js',
				'lib/**/*.js'
			],
			options: {
				node: true,
				esnext: true
			}
		}
	});

  grunt.registerTask('default', ['jshint', 'jasmine', 'watch']);
};
