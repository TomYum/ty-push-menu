module.exports = function ( grunt ) {
    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),
        sass: {
            options: {
                includePaths: ['./_dev/bower_components/']
            },
            dist: {
                options: {
                    sourceMap: true,
                },
                files: {'dist/css/ty.pushmenu.css': 'src/scss/ty.pushmenu.scss'}
            }
        },
        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'dist/js/ty.pushmenu.map',
                    mangle: {
                        except: ['jQuery', 'Backbone']
                    }
                },
                files: {
                    'dist/js/ty.pushmenu.min.js': [
                        'src/js/ty.pushmenu.js'
                    ]
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'dist/css/ty.pushmenu.css': [
                        'dist/css/ty.pushmenu.css'
                    ]
                }
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            grunt: {
                options: {
                    reload: true
                },
                files: ['Gruntfile.js'],
                tasks: ['recreate']
            },
            sass: {
                files: ['src/scss/**'],
                tasks: ['sass', 'cssmin']
            },
            js: {
                files: ['src/js/*', 'src/js/**'],
                tasks: ['uglify']
            }
        }
    } );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-sass' );


    grunt.registerTask( 'default', ['sass', 'cssmin', 'uglify', 'watch'] );
    grunt.registerTask( 'recreate', ['sass', 'cssmin', 'uglify', 'watch'] );
};

