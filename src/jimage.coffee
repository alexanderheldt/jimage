class Jimage
    ###
        The `constructor` takes two params; `src` and `options`.

        @param {String|Jimage} src - source of image. Either a path to the image
            or a previously exported Jimage file.
        [@param {Object} options - options for the image.
            @param {String} element - element for the image.
            @param {Int} scale - how much the image will be scaled by.
            @param {String|Function} mode - which mode the image will be drawn
            witoh. Can be either a string or a function.]
    ###
    constructor: (@src, options) ->
        # Default options
        @options =
            element: null
            scale: 1
            mode: 'normal'

        ###
            Overwrite default options with passed options
        ###
        @options[key] = value for key, value of options

        ###
            Set properties from options
        ###
        @[key] = value for key, value of @options

        ###
            If `options.element` is passed then that will be used, else an
            canvas element will be created.
        ###
        unless @element = document.getElementById @options.element
            canvas = document.createElement 'canvas'
            document.body.appendChild canvas
            @element = canvas

        @events =
            loaded: new Event 'loaded'

        load.call this, @src

    ###
        Predefined modes for drawing the image. These "modes" alter each channel
        of a pixel.

        @return {Object}
    ###
    modes =
        normal: (pixel) ->
            r: pixel.r
            g: pixel.g
            b: pixel.b
            a: pixel.a

        inverted: (pixel) ->
            r: 255 - pixel.r
            g: 255 - pixel.g
            b: 255 - pixel.b
            a: pixel.a

    ###
        `load` takes either a string that represents a path to an image or an
        already created Jimage. Once the image is loaded the `loaded` event will
        trigger.
    ###
    load = (src) ->
        if typeof src is 'object'
            @src = src.src
            @width = src.width
            @height = src.height
            @pixels = src.pixels

            @element.dispatchEvent @events.loaded
        else
            img = new Image()
            canvas = document.createElement 'canvas'
            context = canvas.getContext '2d'

            img.onload = (e) =>
                img = e.target
                context.drawImage img, 0, 0
                data = context.getImageData(0, 0, img.width, img.height).data

                @width = img.width
                @height = img.height
                @pixels = extractPixels data, @width

                @element.dispatchEvent @events.loaded

            img.src = src
        return

    extractPixels = (data, width) ->
        pixels = []
        x = y = 0

        for _, i in data by 4
            pixels.push
                x: x
                y: y
                r: data[i]
                g: data[i+1]
                b: data[i+2]
                a: data[i+3]

            x += 1

            # Move down one row in the image when we hit the edge
            if x is width
                x = 0
                y += 1

        return pixels

    getMode = (mode) ->
        if mode of modes
            mode = modes[mode]
        else if typeof mode is 'function'
            mode = mode
        else
            throw new Error '`mode` was either not given or not found.'

        return mode

    ###
        @param {Object} options - any option that was set when creating the
            Jimage can be overwritten by passing them.
    ###
    draw: (options = {}) ->
        for key, value of @options
            options[key] = value unless options[key]

        canvas = if options.element? then document.getElementById options.element else @element
        throw new Error "Canvas \"#{element}\" is invalid." unless canvas?

        scale = options.scale
        mode = getMode options.mode

        canvas.height = @height * scale
        canvas.width = @width * scale
        context = canvas.getContext '2d'

        ###
            Process each pixel in `pixels` through `mode` to alter each channel.
        ###
        for pixel in @pixels
            p = mode pixel
            context.fillStyle = "rgba(#{p.r}, #{p.g}, #{p.b}, #{p.a})"
            context.fillRect pixel.x * scale, pixel.y *scale, scale, scale
        return

    export: -> src: @src, width: @width, height: @height, pixels: @pixels
