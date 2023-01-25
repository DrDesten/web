let planet
let moon
{

    const planetGeometry = new THREE.SphereGeometry(100, 16, 8)
    const planetMaterial = new THREE.MeshLambertMaterial({ color: 0x08E020, flatShading: true })
    const planetMesh = new THREE.Mesh( planetGeometry, planetMaterial )

    planet = planetMesh


    const moonGeometry = new THREE.SphereGeometry(20, 8, 4)
    const moonMaterial = new THREE.MeshLambertMaterial({ color: 0x202028, flatShading: true })
    const moonMesh = new THREE.Mesh( moonGeometry, moonMaterial )

    moon = moonMesh
    moon.position.set(250, 75, 150)

}