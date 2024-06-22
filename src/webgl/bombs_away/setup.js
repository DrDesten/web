// Get Camvas element
const canvas = document.querySelector( "#canvas" )
const dimensions = { x: canvas.clientWidth, y: canvas.clientHeight }

// Set up Three.js
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer()
renderer.setSize( dimensions.x, dimensions.y )
canvas.appendChild( renderer.domElement )
