/**
 * Push variable to shaders 
 */
export default class Uniform
{
    /**
     * The type '1i' can be use for int, sampler2D and samplerCube.
     * WebGL make the difference with the location (initialized in the constructor of the uniform).
     * https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html#uniforms
     * 
     * @constructor
     * @param {String} label - Label of the uniform, you can't have same label 
     * @param {*} value - Value of the uniform: 5.0, [3.2, 5.1]...
     * @param {WebGLRenderingContext} gl - Context of the render
     * @param {WebGLProgram} program  - Program used for the render
     * @param {String} type - Type of the unifom (same label than the end of the uniform setter function)
     *      - 1f: float
     *      - 1fv: float array
     *      - 2f: vec2
     *      - 2fv: vec2 or vec2 array
     *      - 3f: vec3
     *      - 3fv: vec3 or vec3 array
     *      - 4f: vec4
     *      - 4fv: vec4 or vec4 array
     *      - Matrix2fv: mat2
     *      - Matrix3fv: mat3
     *      - Matrix4fv: mat4
     *      - 1i: int
     *      - 1iv: int array
     *      - 2i: ivec2
     *      - 2iv: ivec2 or ivec2 array
     *      - 3i: ivec3
     *      - 3iv: ivec3 or ivec3 array
     *      - 4i: ivec4
     *      - 4iv: ivec4 or ivec4 array
     *      - 1i: sampler2D (textures)
     *      - 1iv: sampler2D or sampler2D array
     *      - 31i: samplerCube (textures)
     *      - 31iv: samplerCube or samplerCube array
     */
    constructor(label, value, gl, program, type)
    {
        this.label = label
        this.updated = true
        this._value = value
        
        this.location = gl.getUniformLocation(program, label)

        this._splitArgs = type[type.length - 1] !== 'v'
        this._isMatrix = type.includes('Matrix')
        this._setter = gl['uniform' + type]
    }

    /**
     * Push the new value to the GPU.
     */
    update(gl)
    {
        if (this.updated)
        {
            if (this._isMatrix)
                this._setter.call(gl, this.location, false, this._value)
            else if (this._splitArgs)
                this._setter.call(gl, this.location, ...this._value)
            else
                this._setter.call(gl, this.location, this._value)

            this.updated = false
        }
    }

    /**
     * Change the value of the uniform.
     */
    set value(value)
    {
        if (typeof value[Symbol.iterator] === 'function')
            this.updated = !this._value.every((val, index) => val === value[index])
        else
            this.updated = this._value !== value

        this._value = value
    }
}