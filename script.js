import { data } from "./data.js";

const lenis = new Lenis({
  wrapper: document.querySelector(".gallery-section"),
});
const lenis2 = new Lenis({
  wrapper: document.querySelector(".gallery-section-mobile"),
  orientation:'horizontal',
  // infinite:true,
  // gestureOrientation:'horizontal',
});

// Basic
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

let currentIdx = 0;
let isAnimating = false;
let isSpedoAnimating = false

const overlayBG = document.querySelector('.overlay .img')


function createNestingTags(content, tag, isObj = false, l = 4) {
  if (isObj) {
    const tags = [document.createElement("div")];
    let i = 0;
    for (const key in content) {
      tags[i].classList.add("item");
      tags[i].innerHTML = `
        <p>${key}:${content[key]}</p>
      `;
      i++;
      tags[i] = document.createElement("div");
    }
    return tags;
  } else {
    const words = content.split(" ");
    let revs = 0;
    let i = 0;
    let tags = [document.createElement("div")];
    words.forEach((e) => {
      revs++;
      if (revs >= l) {
        revs = 0;
        i++;
        tags[i] = document.createElement(tag);
        tags[i].classList.add("item");
      }
      if (e) {
        const myTag = document.createElement(tag);
        myTag.innerHTML += e + "&nbsp;";
        tags[i].classList.add("item");
        tags[i].appendChild(myTag);
      }
    });
    return tags;
  }
}

function Animate(i,isMobile) {
  if (isAnimating || isSpedoAnimating) return;
  SpedoAnimation()
  let mobileSelected = document.querySelector(".gallery-section-mobile .selected");
  let mobileElem = document.querySelector(`.gallery-section-mobile [data-index='${i}']`);
  let desktopSelected= document.querySelector(".gallery-section .selected");
  let desktopElem =  document.querySelector(`.gallery-section [data-index='${i}']`);


  if (mobileSelected && desktopSelected) {
    mobileSelected.classList.remove("selected");
    desktopSelected.classList.remove("selected");
  }
  mobileElem.classList.add("selected");
  desktopElem.classList.add("selected");
  currentIdx = i;

  const myData = data[i];
  const heading = document.querySelector(".heading");
  const headingItems = heading.querySelectorAll(".item h1");

  isAnimating = true;

   
  const para = document.querySelector(".para");
  const paraItems = para.querySelectorAll(".item p");
    
  const credit = document.querySelector('.credits')
  const credits = credit.querySelectorAll('.item p')

  const infoImgWrapper = document.querySelector('.info-img')

  const OutTL = gsap.timeline({
    onComplete(){

      const InTL = gsap.timeline({
        onComplete(){
          isAnimating = false;
        }
      })

      // Animating The Background 
      gsap.to(overlayBG,{
        filter:'brightness(20%)',
        duration:.4,
        onComplete(){
          const img = overlayBG.querySelector('img')
          img.src = myData.img
          gsap.to(overlayBG,{
            filter:'brightness(80%)',
            duration:.4,
            duration:.7
          })
        }
      })

      // Animating In The New Headings
      heading.innerHTML = "";
      let tags = createNestingTags(myData.heading, "h1");
      gsap.set(tags, {
        y: 100,
      })
      heading.append(...tags);
      InTL.to(tags, {
        delay:.3,
        stagger: 0.1,
        y: 0,
        duration: 1,
        ease: "power3.inOut",
      },'in-tl');

      // Animating In The New Paragraphs
      para.innerHTML = "";
      const paras = createNestingTags(myData.info, "p", false, 7);
      para.append(...paras);
      paras.forEach(item => {
        gsap.set(item.querySelectorAll('p'),{
          y:100
        })
      })
      paras.forEach((item,i) => {
        InTL.to(item.querySelectorAll('p'),{
          duration:1,
          y:0,
          stagger:.02,
          delay:i/10,
          ease:'power3.inOut'
        },'in-tl')
      })

      // Animating In The Credits
      credit.innerHTML = ''
      const newCredits = createNestingTags(myData.credit,'p',true,4)
      credit.append(...newCredits)
      
      let creditParas = newCredits.map(cred => cred.querySelector('p'))
      creditParas = creditParas.filter(e => e ? true : false)
      gsap.set(creditParas,{
        y:100,
      })
      InTL.to(creditParas,{
        delay:.2,
        y:0,
        duration:1,
        stagger:.05,
        ease:"power4.inOut"
      },'in-tl')

    }
  })

  // Animating The Headings
  OutTL.to(headingItems, {
    y: -100,
    duration: .3,
    ease: "power3.in",
  },'out-tl');

  // Animating the paragraphs 
  OutTL.to(paraItems, {
    y: -100,
    duration: .3,
    stagger: 0.03,
    ease: "power4.in",
  },'out-tl');

  // Animating The Credits
  OutTL.to(credits,{
    y:-100,
    duration:1.3,
    ease:'power3.inOut',
    stagger:.03,
  },'out-tl')

  // Animating The Info Img 
  gsap.to(infoImgWrapper,{
    transformOrigin:'center top'
  })
  OutTL.to(infoImgWrapper,{
    scale:0,
    duration:1,
    delay:.5,
    ease:'power4.inOut',
    duration:.7,
    onComplete(){
      infoImgWrapper.innerHTML = `<img src="${myData.img}" />`
      gsap.set(infoImgWrapper,{
        transformOrigin:'center bottom'
      })
      gsap.to(infoImgWrapper,{
        scale:1,
        duration:1.2,
        ease:'power2.inOut'
      })
    }
  },'out-tl')

}

function HandleSelection(e,isMobile) {
  const { target } = e;
  const i = target.dataset.index;
  let selected;
  if (isMobile) {
    selected = document.querySelector(".gallery-section-mobile .selected");
  } else {
    selected = document.querySelector(".gallery-section .selected");
  }
  if (!selected && !currentIdx) {
    Animate(i,isMobile);
  }
  if (selected && selected.dataset.index !== i) {
    Animate(i,isMobile);
  }
}

function ShowData() {
  const gallerySection = document.querySelector(".gallery-section");
  const mobileGallerySection = document.querySelector('.gallery-section-mobile')
  mobileGallerySection.innerHTML = ""
  gallerySection.innerHTML = "";
  function AddImages(parent,isMobile = false){
    data.forEach((item, i) => {
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("img");
      imgWrapper.innerHTML = `<img src="${item.img}" alt="image" />`;
      imgWrapper.dataset.index = i;
      parent.appendChild(imgWrapper);
  
      // adding click event in imgWrapper
      imgWrapper.addEventListener("click", e => {
        HandleSelection(e,isMobile)
      });
    });
  }
  AddImages(gallerySection)
  AddImages(mobileGallerySection,true)
}

const copywright = document.querySelector('.copywright')
const spedo = document.querySelector('.hover-spedo .spedo')
function SpedoAnimation(){

  if (isSpedoAnimating) return;
  const childs = spedo.querySelectorAll("*")
  const childRect = childs[0].getBoundingClientRect()
  const childHeight = childRect.height
  const childsLength = childs.length
  isSpedoAnimating = true 
  gsap.to(spedo,{
    y:-1 * childHeight * (childsLength - 1),
    // y:-100,
    duration:3,
    ease:'power4.inOut',
    onComplete(){
      gsap.set(spedo,{
        y:0
      })
      isSpedoAnimating = false
    }
  })


  
}
copywright.addEventListener('mouseenter',e =>{
  SpedoAnimation()
})
SpedoAnimation()
ShowData();
isSpedoAnimating = false 
Animate(currentIdx)
isSpedoAnimating = false 
