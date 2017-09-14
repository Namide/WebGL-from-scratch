import GeomSquare from './GeomSquare.js'
import Material from './Material.js'
import TextureData from './TextureData.js'
import Program from './Program.js'

/**
 * Vertex shader of the render
 */
const SPRITE_VERTEX_SHADER = `

    precision mediump float;

    attribute vec2 aVertexPos;

    // uniform mat3 uScene;
    uniform mat3 uMatrix;
    uniform vec2 uSize;

    varying vec2 vUV;

    void main(void)
    {
        vUV = aVertexPos * uSize * vec2(1.0, -1.0) + vec2(0.5, 0.5);
        gl_Position = vec4(uMatrix * vec3(aVertexPos, 0.0), 1.0);
    }
`

/**
 * Fragment shader of the render
 */
const SPRITE_FRAGMENT_SHADER = `

    precision mediump float;

    uniform sampler2D uDiffuse;
    varying vec2 vUV;

    void main(void)
    {
        gl_FragColor = texture2D(uDiffuse, vUV);
    }
`



export default class Sprite
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

        if (!gl.SAVE_SPRITE_PROGRAM)
        {
            gl.SAVE_SPRITE_PROGRAM = new Program(gl, SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER)
        }
            

        this.material = new Material(gl.SAVE_SPRITE_PROGRAM)
        // this.matrix = new Uniform('uMatrix', new Float32Array(9), gl, this.material.program, 'Matrix3fv') 


        const matrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
        this.material.addUniform(gl, 'uMatrix', matrix, 'Matrix3fv')
        this.material.addUniform(gl, 'uSize', [0, 0], '2v')

        this.textureData = this._createTexture(gl, this._url)
        this.material.addTexture(gl, 'uDiffuse', this.textureData)
    }

    draw(gl)
    {
        this.material.update(gl)
        // this.textureData.update(gl)
        this.geom.draw(gl)
    }

    _createTexture(gl, url)
    {
        const textureData = new TextureData(gl, url)

        if (textureData.isLoaded)
            this._onloaded(textureData)
        else
            textureData.addOnLoaded(this._onloaded.bind(this))

        return textureData
    }

    _onloaded(texture)
    {
        /*this.width = texture.width
        this.height = texture.height*/
        this.material.uniform
    }
}
