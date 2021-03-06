/**
 * In this sample I use a draw of Chun li by Julio Cesar
 * and a draw of Josh Van Zuylen: CyberRunner
 * 
 * If you need help, please read this articles about webgl:
 * https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
 * 
 * @author Damien Doussaud (namide.com)
 */


/**
 * Vertex shader of the render
 */
const VERTEX_SHADER = `

    precision mediump float;

    attribute vec2 a_vertex;
    uniform vec2 u_screenSize;
    varying vec2 v_pixel;
    varying vec2 v_uv;

    void main(void)
    {
        v_uv = vec2(0.5) + a_vertex * vec2(0.5, -0.5);
        v_pixel = v_uv * u_screenSize;
        gl_Position = vec4(a_vertex, 0.0, 1.0);
    }
`

/**
 * Fragment shader of the render
 */
const FRAGMENT_SHADER = `

    precision mediump float;

    varying vec2 v_pixel;
    varying vec2 v_uv;

    uniform float u_time;

    uniform sampler2D u_textureChun;
    uniform vec2 u_texturePosChun;
    uniform vec2 u_textureSizeChun;
    uniform vec2 u_textureScaleChun;
    
    uniform sampler2D u_texturestreet;
    uniform vec2 u_texturePosstreet;
    uniform vec2 u_textureSizestreet;
    uniform vec2 u_textureScalestreet;

    vec4 displayTexture(vec4 color, sampler2D sample, vec2 pos, vec2 size, vec2 scale)
    {
        vec2 texPixel = (v_pixel - pos) / (scale.xy * size);
        if (texPixel.x >= 0.0 && texPixel.x <= 1.0
            && texPixel.y >= 0.0 && texPixel.y <= 1.0)
        {
            color = texture2D(sample, texPixel);
        }

        return color;
    }
    
    void main(void)
    {
        vec4 color = vec4(
            cos(v_uv.x + u_time / 715.0) * 0.2 + 1.0,
            sin(v_uv.y + u_time / 333.0) * 0.5 + 0.2,
            0.25,
            1.0
        );

        color = displayTexture(color, u_texturestreet, u_texturePosstreet, u_textureSizestreet, u_textureScalestreet);
        color = displayTexture(color, u_textureChun, u_texturePosChun, u_textureSizeChun, u_textureScaleChun);
        
        gl_FragColor = color;
    }
`

/**
 * Push variable to shaders 
 */
class Uniform
{
    /**
     * @constructor
     * @param {String} label - Label of the uniform, you can't have same label 
     * @param {*} value - Value of the uniform: 5.0, [3.2, 5.1]...
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} shaderProgram  - Program used for the render
     * @param {Function} updateCallback - WebGL settings function (depend on uniform type): gl.uniform1f, gl.uniform2f...
     */
    constructor(label, value, gl, shaderProgram, updateCallback)
    {
        this.label = label
        this.value = value
        this.updated = true
        this._updateCallback = updateCallback
        this.isArray = Array.isArray(value)
        this.location = gl.getUniformLocation(shaderProgram, label)
    }

    /**
     * Push the new value to the GPU.
     */
    update(gl)
    {
        if (this.updated)
        {
            if (this.isArray)
                this._updateCallback.call(gl, this.location, ...this._value)
            else 
                this._updateCallback.call(gl, this.location, this._value)
            
            this.updated = false
        }
    }

    /**
     * Change the value of the uniform.
     */
    set value(value)
    {
        this.updated = true
        this._value = value
    }

    get value()
    {
        return this._value
    }
}


/**
 * Square mesh for display in WebGL
 */
class Mesh
{
    /**
     * @constructor
     * @param {string} label - The label of the mesh, use differents labels for differents implementations
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    constructor(label, gl)
    {
        // Use differents num to separate images in the render
        if (!Mesh.NUM)
        {
            Mesh.NUM = 1
        }
        else
        {
            Mesh.NUM++
        }

        this.id = Texture.NUM
        this.label = label
        this.updated = true

        this._init(gl)
    }

    /**
     * Initialize the mesh.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    _init(gl)
    {
        this.vertices = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)

        const vertices = [
            1.0,  1.0,  0.0,
            -1.0, 1.0,  0.0,
            1.0,  -1.0, 0.0,
            -1.0, -1.0, 0.0
        ]
    
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW
        )
    }
    
    /**
     * Initialize all attributes of the rectangle.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} shaderProgram  - Program used for the render
     */
    initAttributes(gl, shaderProgram)
    {
        this.verticesAttribute = gl.getAttribLocation(shaderProgram, 'a_vertex' + this.label)
        gl.enableVertexAttribArray(this.verticesAttribute)
    }

    /**
     * Draw the mesh
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    draw(gl)
    {
        if (this.updated || Mesh.NUM > 1)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)
            gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

            this.updated = false
        }
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}

/**
 * Use it to add an image in your render.
 * Example here https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
class Texture
{
    /**
     * @constructor
     * @param {string} url - The url of the image
     * @param {string} label - The label of the image, use differents labels for differents implementations
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    constructor(url, label, gl)
    {
        // Use differents num to separate images in the render
        if (!Texture.NUM)
        {
            Texture.NUM = 1
        }
        else
        {
            Texture.NUM++
        }
        
        this.id = Texture.NUM
        this.label = label
        this.position = [10, -10]
        this.size = [0, 0]

        this._init(gl)

        this.image = new Image()
        this.image.addEventListener('load', this._onLoaded.bind(this, gl))
        this.image.src = url
    }

    /**
     * Refresh the texture if one of the uniform of it has change.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    update(gl)
    {
        this.position.update(gl)
        this.size.update(gl)
        this.scale.update(gl)
    }

    /**
     * Initialize the uniforms of the texture.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} shaderProgram  - Program used for the render
     */
    initUniforms(gl, shaderProgram)
    {
        this.textureUniform = gl.getUniformLocation(shaderProgram, 'u_texture' + this.label)

        this.position = new Uniform('u_texturePos' + this.label, [0, 0], gl, shaderProgram, gl.uniform2f)
        this.size = new Uniform('u_textureSize' + this.label, [0, 0], gl, shaderProgram, gl.uniform2f)
        this.scale = new Uniform('u_textureScale' + this.label, [1, 1], gl, shaderProgram, gl.uniform2f)

        gl.activeTexture(gl.TEXTURE0 + this.id)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(this.textureUniform, this.id)
    }

    /**
     * Initialize the texture object.
     * Create a texture with one pixel first waiting the load of the final image.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    _init(gl)
    {
        this.texture = gl.createTexture()
        const level = 0 // Mipmap level
        
        // Temporary texture
        const width = 1
        const height = 1
        const data = new Uint8Array([
            0, 0, 0, 255
        ])
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
    }

    /**
     * Push the image to the GPU.
     * Called when the image is loaded.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    _onLoaded(gl)
    {
         const level = 0 // Mipmap level
         
         gl.bindTexture(gl.TEXTURE_2D, this.texture)
         gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image)

         this.size.value = [this.image.width, this.image.height]
         
         if (false) // mipmap
         {
             gl.generateMipmap(gl.TEXTURE_2D)
         }
         else
         {
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
         }

         //gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
         //Prevents s-coordinate wrapping (repeating).
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
         //Prevents t-coordinate wrapping (repeating).
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }
}

/**
 * Contain a WebGL context.
 */
class WebGLBackground
{
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - Tag used to display WebGL context in the DOM
     */
    constructor(canvas)
    {
        this.canvas = canvas
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        this._clear(gl)

        this._initProgram(gl)
        this._initUniforms(gl, this.program)

        this.mesh = new Mesh('', gl)
        this.mesh.initAttributes(gl, this.program)

        this.texture1 = new Texture('assets/chun-li-by-julio-cezar.jpg', 'Chun', gl)
        this.texture2 = new Texture('assets/josh-van-zuylen-cyberrunner.jpg', 'street', gl)

        this.texture1.initUniforms(gl, this.program)
        this.texture2.initUniforms(gl, this.program)

        this.gl = gl
    }
    
    /**
     * Resize canvas and WebGL context
     * 
     * @param {Number} width - Width of the canvas and WebGL context
     * @param {Number} height - Height of the canvas and WebGL context
     */
    resize(width, height)
    {
        this.width = width
        this.height = height
        this.canvas.width = width
        this.canvas.height = height

        this.gl.viewport(0, 0, width, height)
        this.screenSize.value = [width, height]
    }

    /**
     * Draw the scene.
     * Call it to every frame if the display change.
     */
    render()
    {
        const gl = this.gl

        // Clear scene
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        // Update uniforms
        this.time.update(gl)
        this.screenSize.update(gl)

        // Update textures
        this.texture1.update(gl)
        this.texture2.update(gl)

        // Draw mesh
        this.mesh.draw(gl)
    }

    /**
     * Clear the context
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    _clear(gl)
    {
        // Background color
        gl.clearColor(0.0, 0.0, 0.0, 1.0)

        // Clear old colors
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    /**
     * Initialize the program (vertex shader and fragment shader).
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    _initProgram(gl)
    {
        // Init vertex and fragment shader
        const vertexShader = WebGLBackground._compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER)
        const fragmentShader = WebGLBackground._compileShader(gl, FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
    
        // Create the program and attach shaders
        this.program = gl.createProgram()
        gl.attachShader(this.program, vertexShader)
        gl.attachShader(this.program, fragmentShader)
        gl.linkProgram(this.program)
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        {
            throw 'Could not link program: ' + gl.getProgramInfoLog(this.program)
        }
    
        gl.useProgram(this.program)
    }

    /**
     * Initialize all uniforms of the scene without the texture's uniforms.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} shaderProgram  - Program used for the render
     */
    _initUniforms(gl, shaderProgram)
    {
        const screenSize = [window.innerWidth, window.innerHeight]

        this.time = new Uniform('u_time', 0, gl, shaderProgram, gl.uniform1f)
        this.screenSize = new Uniform('u_screenSize', screenSize, gl, shaderProgram, gl.uniform2f)
    }
    
    /**
     * Detect if the browser support WebGL
     * 
     * @return {Boolean}
     */
    static isWebGlEnabled()
    {
        try
        {
            const canvas = document.createElement('canvas')
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
        }
        catch (e)
        {
            return false
        }

        return false
    }
    
    /**
     * Compile the shader
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {String} shaderSource - Text of your shader (GLSL language)
     * @param {GLenum} shaderType - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     */
    static _compileShader(gl, shaderSource, shaderType)
    {
        const shader = gl.createShader(shaderType)
        gl.shaderSource(shader, shaderSource)
        gl.compileShader(shader)
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            throw 'Could not compile shader: ' + gl.getShaderInfoLog(shader)
        }
        
        return shader
    }
}

// Test if WebGL is available before start the project
if (WebGLBackground.isWebGlEnabled())
{
    // Instantiate project
    const canvas = document.getElementById('bg')
    const webglBackground = new WebGLBackground(canvas)
    webglBackground.resize(window.innerWidth, window.innerHeight)


    // Render loop
    function tick(timestamp = 0)
    {
        webglBackground.time.value = timestamp
        webglBackground.texture1.position.value = [
            100 + 50 * Math.cos(timestamp / 1000),
            100 + 50 * Math.sin(timestamp / 1000)
        ]

        webglBackground.texture2.scale.value = [
            Math.cos(timestamp / 1000) * 0.25 + 1,
            Math.sin(timestamp / 1000) * 0.25 + 1,
        ]

        webglBackground.render()
        window.requestAnimationFrame(tick)
    }


    // Check window resize
    window.addEventListener('resize', onResize)
    function onResize()
    {
        webglBackground.resize(window.innerWidth, window.innerHeight)
    }


    // start render loop
    tick()
}
else
{
    alert('WebGL not available with your browser')
}