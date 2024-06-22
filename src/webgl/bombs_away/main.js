
// Make sure to update the render resolution
const canvasObserver = new ResizeObserver( entries => {
    dimensions.x = entries[0].target.clientWidth
    dimensions.y = entries[0].target.clientHeight

    renderer.setSize( dimensions.x, dimensions.y )

    camera.aspect = dimensions.x / dimensions.y
    camera.updateProjectionMatrix()
} )
canvasObserver.observe( canvas )

scene.add( new THREE.AmbientLight("white", 0.1) )
scene.add( cameraLight )
scene.add( planet )
scene.add( moon )



const distance = 200

function animate( time ) {
    requestAnimationFrame( animate )

    time /= 2000
    //cameraData.position = [ Math.sin( time ) * distance, Math.sin( time ) * distance * 0.25, Math.cos( time ) * distance ]
    cameraData.position = [ 0,0, distance ]
    camera.lookAt( 0, 0, 0 )

    //cameraLight.target.position.set(0,0,0)

    cameraData.updatePosition()
    renderer.render( scene, camera )
};

animate()