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

import Render from './js/Render.js'
import Sprite from './js/Sprite.js'


alert('IN CONSTRUCTION!')
throw new Error('IN CONSTRUCTION')


// Test if WebGL is available before start the project
if (Render.isWebGlEnabled())
{
    // Instantiate project
    const canvas = document.getElementById('bg')
    const renderer = new Render(canvas)
    renderer.resize(window.innerWidth, window.innerHeight)

    const sprite1 = new Sprite('assets/chun-li-by-julio-cezar.jpg')
    const sprite2 = new Sprite('assets/josh-van-zuylen-cyberrunner.jpg')

    renderer.addSprite(sprite1)
    renderer.addSprite(sprite2)
    

    // Render loop
    function tick(timestamp = 0)
    {
        renderer.render()
        window.requestAnimationFrame(tick)
    }


    // Check window resize
    window.addEventListener('resize', onResize)
    function onResize()
    {
        renderer.resize(window.innerWidth, window.innerHeight)
    }


    // start renderer loop
    tick()
}
else
{
    alert('WebGL not available with your browser')
}