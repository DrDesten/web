
if (!isTouchDevice) {

  const floatingElements = document.querySelectorAll("*[float-depth]")

  window.onmousemove = e => {
    let [x,y] = [e.clientX, e.clientY]
    let [rx,ry] = [x / window.innerWidth - .5, y / window.innerHeight - .5]
    for (const ele of floatingElements) {
      const factor = -ele.getAttribute("float-depth")
      const displace = { x: factor * rx, y: factor * ry }
      ele.style.transform = `translate(${displace.x.toFixed(10)}rem, ${displace.y.toFixed(10)}rem)`
    }
  }
  
}