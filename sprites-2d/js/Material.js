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

        this._uniformsProxyTarget = {}
        this.uniforms = new Proxy(this._uniformsProxyTarget, {

            get (target, prop)
            {
                if(!target[prop])
                    throw new Error('Attempt to get forbidden uniform ' + prop)
    
                return target[prop].value
            },

            set (target, prop, value)
            {
                if(!target[prop])
                    throw new Error('Attempt to set forbidden uniform ' + prop)
    
                target[prop].value = value
            }
        })
    }

    addUniform(gl, label, value, type)
    {
        const uniform = this.program.addUniform(gl, label, value, type)
        const data = {label, value, uniform}
        this.uniformDataList.push(data)

        this._uniformsProxyTarget[label] = data
    }

    addTexture(gl, label, textureData)
    {
        const uniformTexture = this.program.addTexture(gl, label, textureData)
        this.textureUniformList.push(uniformTexture)
    }

    update(gl)
    {
        this.program.update(gl)

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