/**
 * In this sample I use a draw of Chun li by Julio Cesar
 * and a draw of Josh Van Zuylen: CyberRunner
 * 
 * If you need help, please read this articles about webgl:
 * https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
 * 
 * IN CONSTRUCTION!!!
 * 
 * @author Damien Doussaud (namide.com)
 */

alert('IN CONSTRUCTION!!!')
throw new Error('IN CONSTRUCTION!!!')

/**
 * Vertex shader of the render
 */
const VERTEX_SHADER = `

    precision mediump float;

    attribute vec2 aVertexPos;

    uniform vec2 uScreenSize;
    uniform mat3 uMatrix;

    varying vec2 vUV;

    void main(void)
    {
        vUV = aVertexPos * vec2(1.0, -1.0) + vec2(0.5, 0.5);
        gl_Position = vec4(uMatrix * vec3(aVertexPos * uScreenSize, 0.0), 1.0);
    }
`

/**
 * Fragment shader of the render
 */
const FRAGMENT_SHADER = `

    precision mediump float;

    uniform sampler2D uDiffuse;
    varying vec2 vUV;

    void main(void)
    {
        gl_FragColor = texture2D(uDiffuse, vUV);
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
        
        this.location = gl.getUniformLocation(shaderProgram, label)
    }

    /**
     * Push the new value to the GPU.
     */
    update(gl)
    {
        if (this.updated)
        {
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
}

class UniformVector extends Uniform
{
    constructor(...data)
    {
        super(...data)
    }

    update(gl)
    {
        if (this.updated)
        {
            this._updateCallback.call(gl, this.location, ...this._value)
            this.updated = false
        }
    }
}

class UniformMatrix extends Uniform
{
    constructor(...data)
    {
        super(...data)
    }

    update(gl)
    {
        if (this.updated)
        {
            this._updateCallback.call(gl, this.location, false, this._value)
            this.updated = false
        }
    }
}


/**
 * Square geom for display in WebGL
 */
class GeomSquare
{
    /**
     * @constructor
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    constructor(gl)
    {
        if (!gl.INSTANCE_GEOM_SQUARE)
            gl.INSTANCE_GEOM_SQUARE = this
        else
            return gl.INSTANCE_GEOM_SQUARE

        this._init(gl)
    }

    /**
     * Initialize the geom.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    _init(gl)
    {
        this.vertices = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)

        const vertices = [
            0.5,  0.5,  0.0,
            -0.5, 0.5,  0.0,
            0.5,  -0.5, 0.0,
            -0.5, -0.5, 0.0
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
        this.verticesAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPos')
        gl.enableVertexAttribArray(this.verticesAttribute)
    }

    /**
     * Draw the geom
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    draw(gl)
    {
        /*gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)*/
        
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
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {string} url - The url of the image
     * @param {Function} onLoaded - Callback called after image loaded
     */
    constructor(gl, url)
    {
        if (!gl.INSTANCE_TEXTURES)
            gl.INSTANCE_TEXTURES = { [url]: this }
        else if (!gl.INSTANCE_TEXTURES[url])
            gl.INSTANCE_TEXTURES[url] = this
        else
            return gl.INSTANCE_TEXTURES[url]

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

        this.isLoaded = false
        this.width = 0
        this.height = 0
        this._onLoadedCallback = []

        this._init(gl)

        this.image = new Image()
        this.image.addEventListener('load', this._onLoaded.bind(this, gl))
        this.image.src = url
    }

    addOnLoaded(callback)
    {
        this._onLoadedCallback.push(callback)
    }

    /**
     * Refresh the texture if one of the uniform of it has change.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     */
    update(gl)
    {
        gl.activeTexture(gl.TEXTURE0 + this.id)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(this.uniform, this.id)
    }

    /**
     * Initialize the uniforms of the texture.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} shaderProgram  - Program used for the render
     */
    initUniforms(gl, shaderProgram)
    {
        this.uniform = gl.getUniformLocation(shaderProgram, 'uDiffuse')
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
     * @param {Function} onLoaded - Callback called after image loaded
     */
    _onLoaded(gl)
    {
        const level = 0 // Mipmap level
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image)

        this.width = this.image.width
        this.height = this.image.height
         
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

        this.isLoaded = true
        for (const callback of this._onLoadedCallback)
            callback(this)
    }
}

class Material
{
    constructor(gl, vertexShader, fragmentShader)
    {
        this._init(gl, vertexShader, fragmentShader)
    }
    
    use(gl)
    {
        gl.useProgram(this.program)
    }

    _init(gl, vertexSrc, fragmentSrc)
    {
        // Init vertex and fragment shader
        const vertexShader = Material.compileShader(gl, vertexSrc, gl.VERTEX_SHADER)
        const fragmentShader = Material.compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER)
    
        // Create the program and attach shaders
        this.program = gl.createProgram()
        gl.attachShader(this.program, vertexShader)
        gl.attachShader(this.program, fragmentShader)
        gl.linkProgram(this.program)
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        {
            throw 'Could not link program: ' + gl.getProgramInfoLog(this.program)
        }
    }
    
    /**
     * Compile the shader
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {String} shaderSource - Text of your shader (GLSL language)
     * @param {GLenum} shaderType - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     */
    static compileShader(gl, shaderSource, shaderType)
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

class Sprite
{
    /**
     * 
     * @param {String} texture - URL of the image
     */
    constructor(url)
    {
        this._url = url
    }

    init(gl)
    {
        this.geom = new GeomSquare(gl)
        this.material = new Material(gl, VERTEX_SHADER, FRAGMENT_SHADER)
        this.matrix = new UniformMatrix('uMatrix', new Float32Array(9), gl, this.material.program, gl.uniformMatrix3fv) 

        this.texture = this._createTexture(gl, this._url)
        this.texture.initUniforms(gl, this.material.program)
    }

    draw(gl)
    {
        this.matrix.update(gl)
    }

    _createTexture(gl, url)
    {
        const texture = new Texture(gl, url)

        if (texture.isLoaded)
            this._onloaded(texture)
        else
            texture.addOnLoaded(this._onloaded.bind(this))

        return texture
    }

    _onloaded(texture)
    {
        
    }
}

/**
 * Contain a WebGL context.
 */
class Render
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

        this._initUniforms(gl)

        this.sprites = []

        this.gl = gl
    }

    addSprite(sprite)
    {
        sprite.init(this.gl)
        this.sprites.push(sprite)
    }

    rmSprite(sprite)
    {
        const i = this.sprites.indexOf(sprite)
        if (i > -1)
            this.sprites.splice(i, 1)
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
        // this.screenSize.update(gl)

        // Update textures
        for (const sprite of this.sprites)
            sprite.draw(gl)
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
    /*_initProgram(gl)
    {
        // Init vertex and fragment shader
        const vertexShader = Render._compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER)
        const fragmentShader = Render._compileShader(gl, FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
    
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
    }*/

    /**
     * Initialize all uniforms of the scene without the texture's uniforms.
     * 
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} shaderProgram  - Program used for the render
     */
    _initUniforms(gl)
    {
        // must be global
        // const screenSize = [window.innerWidth, window.innerHeight]
        // this.screenSize = new UniformVector('uScreenSize', screenSize, gl, shaderProgram, gl.uniform2f)
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
}

// Test if WebGL is available before start the project
if (Render.isWebGlEnabled())
{
    // Instantiate project
    const canvas = document.getElementById('bg')
    const webglBackground = new Render(canvas)
    webglBackground.resize(window.innerWidth, window.innerHeight)

    const sprite1 = new Sprite('assets/chun-li-by-julio-cezar.jpg')
    const sprite2 = new Sprite('assets/josh-van-zuylen-cyberrunner.jpg')

    webglBackground.addSprite(sprite1)
    webglBackground.addSprite(sprite2)
    

    // Render loop
    function tick(timestamp = 0)
    {
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