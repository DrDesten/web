const canvas = document.querySelector( "#canvas" )
const dimensions = { x: canvas.clientWidth, y: canvas.clientHeight }

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 25, dimensions.x / dimensions.y, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer()
renderer.setSize( dimensions.x, dimensions.y )
canvas.appendChild( renderer.domElement )

const canvasObserver = new ResizeObserver( entries => {
    dimensions.x = entries[0].target.clientWidth
    dimensions.y = entries[0].target.clientHeight

    renderer.setSize( dimensions.x, dimensions.y )

    camera.aspect = dimensions.x / dimensions.y
    camera.updateProjectionMatrix()
} )
canvasObserver.observe( canvas )


const geometry = new THREE.BufferGeometry()
geometry.setAttribute( "position", new THREE.BufferAttribute( new Float32Array( [
    -1, -1, 0,
    +1, -1, 0,
    +1, +1, 0,

    +1, +1, 0,
    -1, +1, 0,
    -1, -1, 0,
] ), 3 ) )
geometry.setAttribute( "texcoord", new THREE.BufferAttribute( new Float32Array( [
    -1, -1,
    +1, -1,
    +1, +1,

    +1, +1,
    -1, +1,
    -1, -1,
] ), 2 ) )
scene.add(
    new THREE.Mesh(
        geometry,
        new THREE.ShaderMaterial( {
            uniforms: {},
            vertexShader: `
            attribute vec2 texcoord;
            varying vec2 coord;
            void main() {
                coord = texcoord;
                gl_Position = vec4( projectionMatrix * modelViewMatrix * vec4(position - cameraPosition, 1.0) );
            }
            `,
            fragmentShader: `
            varying vec2 coord;
            void main() {
                gl_FragColor = vec4(coord * .5 + .5,0,1);
            }
            `,
        } )
    )
)

const distance = 5
camera.position.set( 0, 0, distance )
camera.lookAt( 0, 0, 0 )

function animate( time ) {
    requestAnimationFrame( animate )
    renderer.render( scene, camera )
};

animate()