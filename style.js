var tw_delay = 1;
var tw_speed_header = 0.15;
var tw_speed_p = 0.04;


// TYPEWRITER ANIMATION /////////////////////////////////////////////////////////////////////////

var typewriter_elements = document.getElementsByClassName("typewriter")
for (let i = 0; i < typewriter_elements.length; i++) {
  let ele = typewriter_elements[i]
  let char_length = ele.innerHTML.length
  if (ele.tagName == "H1") {
    ele.style.setProperty("--tw-anim-before", `typewriter-animation ${tw_speed_header * char_length}s steps(${char_length}) ${tw_delay}s forwards`)
    ele.style.setProperty("--tw-anim-after", `typewriter-animation ${tw_speed_header * char_length}s steps(${char_length}) ${tw_delay}s forwards`)
  } else {
    ele.style.setProperty("--tw-anim-before", `typewriter-animation ${tw_speed_p * char_length}s steps(${char_length}) ${tw_delay}s forwards`)
    ele.style.setProperty("--tw-anim-after", `typewriter-animation ${tw_speed_p * char_length}s steps(${char_length}) ${tw_delay}s forwards`)
  }
}



// NAVIGATION BAR /////////////////////////////////////////////////////////////////////////

window.addEventListener("scroll", (e) => {
  let nav = document.querySelectorAll("table.nav")[0]
  if (window.scrollY >= window.innerHeight * 0.2) {
    nav.classList.add("nav-shadow")
  } else {
    nav.classList.remove("nav-shadow")
  }
})


// PARAGRAPH SECTIONS /////////////////////////////////////////////////////////////////////////

// Add Alternating Colors to sections
var paragraph_elements = $("section.paragraph")
for (let i = 0; i < paragraph_elements.length; i++) {
  if (i % 2 == 0) {
    paragraph_elements[i].classList.add("color-variation-1")
  } else {
    paragraph_elements[i].classList.add("color-variation-2")
  }
}
