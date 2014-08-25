module.exports = (grunt) ->
    grunt.initConfig
        coffee:
            options:
                bare: yes
            build:
                files: 'lib/jimage.js': 'src/jimage.coffee'

        watch:
            scripts:
                files: ['src/jimage.coffee']
                tasks: ['coffee']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-watch'

    grunt.registerTask 'default', ['coffee', 'watch']
