module.exports = function (grunt) {

	'use strict';

	// Force use of Unix newlines
	grunt.util.linefeed = '\n';

	// Project configuration.
	grunt.initConfig({

		// clean the build dir
		clean: {
			build: {
				src: [ 'build/' ]
			}
		},

		// copy dev files to dist
		copy: {

			manifest: {
				expand: true,
				cwd: 'src/',
				src: 'manifest.json',
				dest: 'build/'
			},

			locales: {
				expand: true,
				cwd: 'src/_locales/',
				src: '**',
				dest: 'build/_locales/'
			},

			images: {
				expand: true,
				cwd: 'src/',
				src: [
					'images/**',
					'icons/**'
				],
				dest: 'build/'
			},

			option: {
				expand: true,
				cwd: 'src/options',
				src: [
					'**',
					'!*.less'
				],
				dest: 'build/'
			},

			popup: {
				expand: true,
				cwd: 'src/popup',
				src: [
					'**',
					'!*.less'
				],
				dest: 'build/'
			},

			update: {
				expand: true,
				cwd: 'src/update',
				src: [
					'**',
					'!*.less'
				],
				dest: 'build/'
			}
		},

		less: {
			content: {
				files: {
					'build/content.css': 'src/css/content.less'
				}
			},
			option: {
				files: {
					'build/options.css': 'src/options/options.less'
				}
			},
			popup: {
				files: {
					'build/popup.css': 'src/popup/popup.less'
				}
			},
			update: {
				files: {
					'build/update.css': 'src/update/update.less'
				}
			}
		},

		uglify: {
			background: {
				options: {
					mangle: false,
					compress: false,
					beautify: true
				},
				files: {
					'build/background.js': 'src/js/background/**/*.js'
				}
			},
			content: {
				options: {
					mangle: false,
					compress: false,
					beautify: true
				},
				files: {
					'build/content.js': 'src/js/content/**/*.js'
				}
			}
		},

		watch: {

			manifest: {
				files: 'src/manifest.json',
				tasks: ['copy:manifest']
			},

			locales: {
				files: 'src/_locales/**',
				tasks: ['copy:locales']
			},

			images: {
				files: [ 'src/images/**', 'src/icons/**' ],
				tasks: ['copy:images']
			},

			optionless: {
				files: 'src/options/options.less',
				tasks: ['less:option']
			},
			optionfiles: {
				files: [
					'src/options/**',
					'!src/options/options.less'
				],
				tasks: ['copy:option']
			},

			popupless: {
				files: 'src/popup/popup.less',
				tasks: ['less:popup']
			},
			popupfiles: {
				files: [
					'src/popup/**',
					'!src/popup/popup.less'
				],
				tasks: ['copy:popup']
			},

			updateless: {
				files: 'src/update/update.less',
				tasks: ['less:update']
			},
			updatefiles: {
				files: [
					'src/update/**',
					'!src/update/update.less'
				],
				tasks: ['copy:update']
			},

			contentjs: {
				files: [
					'src/js/content/**'
				],
				tasks: ['uglify:content']
			},

			backgroundjs: {
				files: [
					'src/js/background/**'
				],
				tasks: ['uglify:background']
			},

			contentcss: {
				files: 'src/css/content.less',
				tasks: 'less:content'
			}

		},

		zip: {
			test: {
				cwd: 'build/',
				src: 'build/**/*',
				dest: 'pageruler.zip'
			}
		}

	});


	// autoload tasks
	require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

	/*
	 * Initialisation task
	 * Removes previous builds and generates a new one
	 */
	grunt.registerTask('init', [
		'clean',
		'copy',
		'uglify',
		'less'
	]);

	grunt.registerTask('publish', [
		//'init',
		'zip'
	]);

	/*
	 * Default task
	 * Rebuild and watch for changes
	 */
	grunt.registerTask('default', [
		'init',
		'watch'
	]);

};