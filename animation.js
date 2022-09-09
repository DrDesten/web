const floatingElements = document.querySelectorAll("*[float-depth]")

window.onmousemove = e => {
  const [x,y] = [e.clientX, e.clientY]
  const [rx,ry] = [x / window.innerWidth - .5, y / window.innerHeight - .5]
  for (const ele of floatingElements) {
    const factor = -ele.getAttribute("float-depth")
    const displace = {x: factor * rx, y: factor * ry}
    ele.style.transform = `translate(${displace.x}rem, ${displace.y}rem)`
  }
}