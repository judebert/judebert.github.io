//Snow - http://www.btinternet.com/~kurt.grigg/javascript
// I actually found it at http://www.java2s.com/Code/JavaScript/GUI-Components/Animationsnow.htm

// if ((document.getElementById) && 
//  window.addEventListener || window.attachEvent) {
// Then we can run the script; otherwise, don't!
// }

//Configure here.

var numFlakes = 30;   //Number of flakes
var timeout = 50; //setTimeout speed. Varies on different comps

//End.

// Controls snow loop
var snowing = 1;
var flakeY = [];
var flakeX = [];
var sink = [];
var flakeStyle = [];
var flakeSize = [];
var drift = [];
var theta = [];
var viewheight, viewwidth;
// The viewport is used to find boundaries.
// When finding the screen size, Depending on the browser, this could be 
// unused, or contain innerHeight/Width, or contain clientHeight/Width.
// When finding the viewport offset, this could contain 
// pageY/XOffset or scrollTop/Left.
var viewport; 
var thedoc = document;
var pix = "px";
var domWw = (typeof window.innerWidth == "number");
var domSy = (typeof window.pageYOffset == "number");
// Precalculated tables, limits, and indeces
var random = [];
var rng = 0;
var rngMax = 1000;
var cosMax = 100;
var cos = new Array(cosMax);


function init() {
  // Create the cosine table
  cosFactor = (2 * Math.PI) / cosMax;
  for (i = 0; i < cosMax; i++) {
    cos[i] = Math.cos(i * cosFactor);
  }
  out = '';
  for (i = 0; i < cosMax; i++) {
    out += cos[i] + '\n';
  }

  // Create the random table
  for (i = 0; i < rngMax; i++) {
    random[i] = Math.random();
  }
  rng = 0;

  // Determine how to address the viewport
  if (domWw) {
    viewport = window;
  } else { 
    if (thedoc.documentElement && 
      typeof thedoc.documentElement.clientWidth == "number" && 
      thedoc.documentElement.clientWidth != 0) {
      viewport = thedoc.documentElement;
    } else { 
      if (thedoc.body && 
        typeof thedoc.body.clientWidth == "number")
        viewport = thedoc.body;
    }
  }

  // Create the flakes (only possible to add to body after document is loaded)
  bdy = document.getElementsByTagName('body')[0];
  
//  if (thedoc.documentElement.style && 
//    typeof thedoc.documentElement.style.MozOpacity == "string") {
//    numFlakes = 12;
//  }

  for (i = 0; i < numFlakes; i++){
    flakeSize[i] = Math.round(1 + randUpTo(1)) * 10;

    var aFlake = document.createElement('div');
    var stopLink = document.createElement('a');
    stopLink.href = '#';
    stopLink.style.color = 'white';
    stopLink.style.textDecoration = 'none';
    if (stopLink.attachEvent) {
      stopLink.attachEvent('onclick', toggleSnow);
    } else {
      stopLink.addEventListener('click', toggleSnow, stopLink);
    }
    stopLink.appendChild(document.createTextNode('*'));
    aFlake.appendChild(stopLink);
    aFlake.id = 'flake' + i;
    aFlake.style.position = 'absolute';
    aFlake.style.top = '0px';
    aFlake.style.left = '0px';
    aFlake.style.width = flakeSize[i]+'px';
    aFlake.style.height = flakeSize[i]+'px';
    aFlake.style.color = 'white';
    aFlake.style.fontSize = flakeSize[i]+'px';
    bdy.appendChild(aFlake);
    flakeStyle[i] = aFlake.style;
  }

  // Initialize flake positions
  winsize();
  for (i = 0; i < numFlakes; i++){
    startFlake(i);
    flakeY[i] = randUpTo(-viewheight);
  }

  // Start the snowing
  snow();
}

function toggleSnow() {
  if (snowing) {
   snowing  = 0;
   for (i = 0; i < numFlakes; i++) {
     flakeY[i] -= viewheight;
   }
   flakeY[0] = 0;
  } else {
    snowing = 1;
    snow();
  }
}

function randUpTo(max) {
  rng++;
  if (rng >= rngMax) {
    rng = 0;
  }
  return random[rng] * max;
}

function startFlake(idx) {
    flakeY[i] = -10;
    flakeX[i] = Math.round(randUpTo(viewwidth));
    theta[idx] = 0;
    sink[idx] = (flakeSize[idx] / 10) + (randUpTo(1));
    drift[idx] = Math.round(randUpTo(3)) + 1;
}

// Detemine the size of the document within the viewport
function winsize(){
  var realHeight,realWidth;
  if (domWw){
    if (thedoc.documentElement && thedoc.defaultView && 
      typeof thedoc.defaultView.scrollMaxY == "number"){
      offHt = thedoc.documentElement.offsetHeight;
      scrHt = thedoc.defaultView.scrollMaxY;
      offWd = thedoc.documentElement.offsetWidth;
      scrWd = thedoc.defaultView.scrollMaxX;
      realHeight = offHt-scrHt;
      realWidth = offWd-scrWd;
    }
    else{
      realHeight = viewport.innerHeight;
      realWidth = viewport.innerWidth;
    }
    viewheight = realHeight - 20;
    viewwidth = realWidth - 20;
  }
  else{
    viewheight = viewport.clientHeight - 20;
    viewwidth = viewport.clientWidth - 20;
  }
}

// Find the top offset of the viewport
function viewTop() {
  if (domSy) {
    return viewport.pageYOffset;
  } else {
    return viewport.scrollTop;
  }
}

// Find the left offset of the viewport
function viewLeft() {
  if (domSy) {
    return viewport.pageXOffset;
  } else {
    return viewport.scrollLeft;
  }
}

// Make the flakes sink and drift
function snow(){
  var newy,newx;

  for (i = 0; i < numFlakes; i++){
    // Calculate new positions
    newy = flakeY[i] + sink[i];
    newx = flakeX[i] + sink[i] * cos[theta[i]];

    // Check bounds
    if (newx >= viewwidth || newx <= -20 || newy >= viewheight) {
      // Out of bounds: replace at top of screen with old size and new speed
      startFlake(i);
    } else {
      flakeY[i] = newy;
      flakeX[i] = newx;
    }

    // Move flake to new position
    flakeStyle[i].top = flakeY[i] + viewTop() + pix;
    flakeStyle[i].left = flakeX[i] + viewLeft() + pix;

    // Prepare for next round
    theta[i] = (theta[i] + drift[i]) % cosMax;
  }
  // Wait and call next step
  if (snowing) {
    setTimeout(snow,timeout);
  }
}


// Initialize after loading, handle window scrolling and resizing
if (window.addEventListener){
  window.addEventListener("resize",winsize,false);
  window.addEventListener("load",init,false);
}  
else if (window.attachEvent){
  window.attachEvent("onresize",winsize);
  window.attachEvent("onload",init);
} 


