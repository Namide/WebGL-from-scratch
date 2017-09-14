import GeomSquare from './GeomSquare.js'
import Sprite from './Sprite.js'

/**
 * Contain a WebGL context.
 */
export default class Render
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