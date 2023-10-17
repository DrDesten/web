
const canvas     = document.querySelector("#canvas")
const dimensions = { x: canvas.clientWidth, y: canvas.clientHeight }

const scene    = new THREE.Scene()
const camera   = new THREE.PerspectiveCamera( 75, dimensions.x / dimensions.y, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer()
renderer.setSize( dimensions.x, dimensions.y )
canvas.appendChild( renderer.domElement )

const canvasObserver = new ResizeObserver( entries => {
    dimensions.x = entries[0].target.clientWidth
    dimensions.y = entries[0].target.clientHeight

    renderer.setSize( dimensions.x, dimensions.y )

    camera.aspect = dimensions.x / dimensions.y
    camera.updateProjectionMatrix()
})
canvasObserver.observe( canvas )



const numOfLines = 150
const lines = []
for ( let i = 0; i < numOfLines; i++ ) {

    const start = new THREE.Vector3(Math.random(), Math.random(), Math.random())
        .multiplyScalar(2).subScalar(1)
        .normalize().multiplyScalar(0.5 + Math.random() * 5 )
    const end   = start.clone().multiplyScalar( 1 + 5 * Math.random() )

    const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints( [ start, end ] ),
        new THREE.LineBasicMaterial( { color: 0xFFFFFF, linewidth: 3 } )
    )
    line.length = end.length()

    scene.add( line )
    lines.push( line )
}

scene.add(
    centerSphere = new THREE.Mesh(
        new THREE.SphereGeometry( 1, 32, 16 ),
        new THREE.MeshBasicMaterial( { color: 0xFFFF80 } )
    )
)


console.log( lines[0].geometry.attributes.position.array )

const distance = 25
camera.position.set( 0, 0, distance );
camera.lookAt( 0, 0, 0 );

function animate( time ) {
    requestAnimationFrame( animate );

    time /= 1000
    camera.position.set( Math.sin(time) * distance, Math.sin(time) * distance * 0.25, Math.cos(time) * distance)
    camera.lookAt( 0, 0, 0 );

    lines.forEach( line => {
        const vertices = line.geometry.attributes.position.array

        let start = new THREE.Vector3().fromArray(vertices)
        const startLength = start.length()
        let end = new THREE.Vector3().fromArray(vertices, 3)

        start.add( new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(0.1) ).normalize().multiplyScalar(startLength)
        end = start.clone().normalize().multiplyScalar( end.length() )

        start.toArray(vertices)
        end.toArray(vertices, 3)

        line.geometry.attributes.position.needsUpdate = true;
    })

    centerSphere.material.color.setRGB( 
        Math.sin(time * 10) * 0.05 + 0.95, 
        Math.sin(time * 5) * 0.05 + 0.95, 
        Math.sin(time * 7) * 0.1 + 0.5
    )

    renderer.render( scene, camera );
};

animate();