/**
 * Square geom for display in WebGL
 */
export default class GeomSquare
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
        /* gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices)
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0) */
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
}