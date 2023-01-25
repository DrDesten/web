let cameraLight
let camera
let cameraController

const cameraData = {
    fov: 75,
    position: [0,0,0],
    target: [0,0,0],

    updatePosition() {
        camera.position.set(...this.position)
        cameraLight.position.set(...this.position)
    },
}

{

    camera = new THREE.PerspectiveCamera( cameraData.fov, dimensions.x / dimensions.y, 0.1, 1000 )
    cameraLight = new THREE.DirectionalLight("white", 1)

    cameraController = new THREE.TrackballControls( camera, renderer.domElement )


}