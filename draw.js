var canvas;
var ctx;

var tempCanvas=document.createElement("canvas");
var tctx=tempCanvas.getContext("2d");

// last known position
var pos = { x: 0, y: 0 };

// isdrawing
var isDrawing = true;

function drawLoad() {
  canvas = document.getElementById("myCanvas");

  // get canvas 2D context and set him correct size
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mousedown', setPosition);
  canvas.addEventListener('mouseenter', setPosition);

  canvas.addEventListener('touchstart', setTouchPosition);
  canvas.addEventListener('touchmove', touchDraw );
  canvas.addEventListener('touchend', stopTouchDraw);
  setTimeout(resize, 500);
}

// new position from mouse event
function setPosition(e) {
  pos.x = e.pageX - e.currentTarget.offsetLeft;
  pos.y = e.pageY - e.currentTarget.offsetTop;
}

function resize(){
  var canvasContainer = document.getElementById("myCanvasContainer");

  //console.log(canvas.toDataURL());
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  
  tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
  
  canvas.width = 1;
  canvas.height = 1;
  
  canvas.width = canvasContainer.offsetWidth;
  canvas.height = canvasContainer.offsetHeight;

  canvas.getContext('2d').drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  repositionBubbleList();
}

function setDraw(draw){
  isDrawing = draw;
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin
  ctx.lineCap = 'round';

  if(isDrawing){
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
  }
  else{
    ctx.strokeStyle = "#d1d1d1";
    ctx.lineWidth = 20;
  }

  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to

  ctx.stroke(); // draw it!
}

function touchDraw(e){
  if(e.touches.length == 2){
    //document.getElementById('myCanvas').setAttribute("style", "touch-action: auto");
    //return;
  }

  document.getElementById('myCanvas').setAttribute("style", "touch-action: none");
  
  var touch = e.touches[0];
    ctx.beginPath(); // begin
  ctx.lineCap = 'round';

  if(isDrawing){
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
  }
  else{
    ctx.strokeStyle = "#d1d1d1";
    ctx.lineWidth = 20;
  }

  ctx.moveTo(pos.x, pos.y); // from
  setTouchPosition(e);
  ctx.lineTo(pos.x, pos.y); // to

  ctx.stroke(); // draw it!
}

function setTouchPosition(e){
    var touch = e.touches[0];
  pos.x = touch.pageX - document.getElementById('myCanvas').offsetLeft;
  pos.y = touch.pageY - document.getElementById('myCanvas').offsetTop;
}

function stopTouchDraw(e){
  if(e.touches.length == 1){
    document.getElementById('myCanvas').setAttribute("style", "touch-action: auto");
  }
}