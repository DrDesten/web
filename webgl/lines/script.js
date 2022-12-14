
const canvas     = document.querySelector("#canvas")
const dimensions = { x: canvas.clientWidth, y: canvas.clientHeight }

const scene    = new THREE.Scene()
const camera   = new THREE.PerspectiveCamera( 75, dimensions.x / dimensions.y, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer()
renderer.setSize( dimensions.x, dimensions.y )
canvas.appendChild( renderer.domElement )

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();