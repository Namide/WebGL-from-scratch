export default class Material
{
    /**
     * 
     * @param {Program} program
     */
    constructor(program)
    {
        this.program = program
        this.uniformDataList = []
        this.textureUniformList = []
    }

    addUniform(gl, label, value, type)
    {
        const uniform = this.program.addUniform(gl, label, value, type)
        this.uniformDataList.push({label, value, uniform})
    }

    addTexture(gl, label, textureData)
    {
        const uniformTexture = this.program.addTexture(gl, label, textureData)
        this.textureUniformList.push(uniformTexture)
    }

    update(gl)
    {
        for (const data of this.uniformDataList)
        {
            const uniform = data.uniform
            uniform.value = data.value
            uniform.update(gl)
        }

        for (const textureUniform of this.textureUniformList)
            textureUniform.update(gl)
    }
}