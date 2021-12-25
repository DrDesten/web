

// SITE NAVIGATION ////////////////////////////////////////////////////////////////////////

var hasScrolled = false;
if (window.scrollY >= window.innerHeight * 0.75) {
  hasScrolled = true;
}
window.addEventListener("scroll", (e)=>{
  if (window.scrollY >= window.innerHeight * 0.75) {
    hasScrolled = true;
  }
})

setTimeout((e)=>{
  let main_content = document.getElementById("main-content")
  if (hasScrolled == false && main_content != null) {
    main_content.scrollIntoView({behavior: "smooth"})
  }
}, 17000); // 15s delay
