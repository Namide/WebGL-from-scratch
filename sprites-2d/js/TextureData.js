/**
 * Use it to add an image in your render.
 * Example here https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export default class TextureData
{
    /**
     * @constructor
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {string} url - The url of the image
     * @param {Function} onLoaded - Callback called after image loaded
     */
    constructor(gl, url, label)
    {
        if (!gl.INSTANCE_TEXTURES_DATA)
            gl.INSTANCE_TEXTURES_DATA = { [url]: this }
        else if (!gl.INSTANCE_TEXTURES_DATA[url])
            gl.INSTANCE_TEXTURES_DATA[url] = this
        else
            return gl.INSTANCE_TEXTURES_DATA[url]

            
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
        const data = new Uint8Array([0, 0, 0, 255])
        
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