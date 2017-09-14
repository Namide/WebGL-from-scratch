import Uniform from './Uniform.js'

class UniformTexture
{
    constuctor(label, gl, texture, id, program)
    {
        this.texture = texture
        this.id = id
        this.location = gl.getUniformLocation(program, label)
    }

    /**
     * Push the new value to the GPU.
     */
    update(gl)
    {        
        gl.activeTexture(gl.TEXTURE0 + this.id)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(this.location, this.id)
    }
}

class TexturesGroup
{
    constructor()
    {
        this.num = 0
        this.uniforms = []
    }

    add(textureData, label, program, gl)
    {
        if (this.num >= gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS - 1)
            return new Error('You can not have more texture than ' + gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS + ' on your GPU')

        this.num++
        const uniform = new UniformTexture(label, gl, textureData.texture, this.num, program)

        return uniform
        // this.uniforms.push(uniform)
    }

    /*update(gl)
    {
        for (const uniform of this.uniforms)
            uniform.update(gl)
    }*/
}

export default class Program
{
    constructor(gl, vertexSrc, fragmentSrc)
    {
        this._init(gl, vertexSrc, fragmentSrc)
        this.uniforms = {}
        this.texturesGroup = new TexturesGroup()
    }

    update(gl)
    {
        gl.useProgram(this.program)
        
        for (const uniform of this.uniforms)
            uniform.update(gl)
    }

    _init(gl, vertexSrc, fragmentSrc)
    {
        // Init vertex and fragment shader
        const vertexShader = Program.compileShader(gl, vertexSrc, gl.VERTEX_SHADER)
        const fragmentShader = Program.compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER)
    
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

    addUniform(gl, label, value, type)
    {
        if (!this.uniforms[label])
            this.uniforms[label] = new Uniform(label, value, gl, this.program, type)

        return this.uniforms[label]
    }

    addTexture(gl, label, textureData)
    {
        return this.texturesGroup.add(textureData, label, this.program, gl)
        /* if (!this.uniforms[label])
            this.uniforms[label] = new Uniform(label, value, gl, this.program, type)

        return this.uniforms[label] */
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