/*
List of all bubbles for the page

Each bubble has the following structure:

Bubble:
  - bubbleID
  - page
  - xPercent
  - yPercent
*/
var bubbleInfoList = [];

/*
Indicates which bubble the user is currently selected.
Should adjust the side panel to match the information associated with the bubble.
*/
var currentBubbleID = null;

function bubbleLoad() {
}

/*
The state of the pdf renderer.
*/
var myState = {
    pdf: null,
    currentPage: 1,
    zoom: 1
}

pdfjsLib.getDocument('ap21-frq-calculus-bc.pdf').then((pdf) => {
    myState.pdf = pdf;
    render();
});

function render() {
    myState.pdf.getPage(myState.currentPage).then((page) => {
        var canvas = document.getElementById("pdf_renderer");
        var ctx = canvas.getContext('2d');

        var viewport = page.getViewport(myState.zoom);
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({
            canvasContext: ctx,
            viewport: viewport
        });
    });

  // Only show the bubbles of the current page
  loadData(sessionID);
}

function nextPage(){
  myState.currentPage++;
  if(myState.currentPage > myState.pdf.numPages){
    myState.currentPage = myState.pdf.numPages;
  }
  render();
}

function previousPage(){
  myState.currentPage--;
  if(myState.currentPage < 1){
    myState.currentPage = 1;
  }
  render();
}


function createBubbleClick(e) {
    createBubble(e.pageX, e.pageY);
}

function newBubble(x, y){
  // First clear the side panel
  clearSidePanel();

  // Create a new bubble
  var id = createBubble(x, y, "needs_id");

  // Assign this bubble as the "current" bubble
  currentBubbleID = "needs_id";

  // Send this new bubble to the server
  updateCurrentBubble(true);
}

function clearSidePanel(){
  // Clear the text
  document.getElementById('textArea').value = "";

  // Clear the canvas
  const context = document.getElementById('myCanvas').getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function createBubble(xPercent, yPercent, id) {
  // Create a new id for the bubble

  // Make a bubble object which will be stored by the list
  var newBubble = {
    bubbleID: id,
    page: myState.currentPage,
    xPercent: xPercent,
    yPercent: yPercent
  };

  // Save the bubble into the dictionary
  // The key is it's ID
  bubbleInfoList[id] = newBubble;

  var rendererDiv = document.getElementById('pdf_renderer');
  var rendererOffset = getOffset(rendererDiv);

  var newX = (xPercent * rendererDiv.offsetWidth) + rendererOffset.left;
  var newY = (yPercent * rendererDiv.offsetHeight) + rendererOffset.top;

  var coordinates = toPageCoordinates(xPercent, yPercent);

  // Make the div for the bubble
  createBubbleDiv(coordinates.newX, coordinates.newY, id);

  return newBubble.bubbleID;
}

function toPageCoordinates(xPercent, yPercent){
  var rendererDiv = document.getElementById('pdf_renderer');
  var rendererOffset = getOffset(rendererDiv);

  var newX = (xPercent * rendererDiv.offsetWidth) + rendererOffset.left;
  var newY = (yPercent * rendererDiv.offsetHeight) + rendererOffset.top;

  return {
    newX: newX,
    newY: newY
  };
}

function createBubbleDiv(x, y, id){
  // Create a new div with class name "bubble"
  var bubble = document.createElement('div');
  bubble.className = 'bubble';
  document.body.appendChild(bubble);

  // Assign the position of the div
  bubble.style.left = x + "px";
  bubble.style.top = y + "px";

  // Assign the appropriate event listeners to the div
  bubble.addEventListener('mousedown', startDragging);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('mousemove', dragBubble);

  // set the id of the div
  bubble.id = id;
  
  return bubble;
}

var draggingBubbleId = null;
var selectedBubbleId = null;

function startDragging(e){
  // Update the visuals of the bubble
  if(selectedBubbleId != null){
    var element = document.getElementById(selectedBubbleId);

    if(element != null){
      element.className = "bubble";
    }
  }

  // Set the dragging and selected bubbles
  draggingBubbleId = e.target.id;
  selectedBubbleId = e.target.id;

  // Set the current bubble to the div that was just clicked
  currentBubbleID = e.target.id;
  
  document.getElementById(draggingBubbleId).className = "bubble_dragged";
}

function stopDragging(e){
  // If a bubble was actually being dragged
  if(draggingBubbleId != null){
    var element = document.getElementById(draggingBubbleId);
    // Set the class name so it's only "selected," not "dragged"
    element.className = "bubble_selected";

    // Send current position to server
    updateCurrentBubblePosition();
    
    draggingBubbleId = null;
    console.log("bubble moved");
  }
}

function dragBubble(e) {
  if(draggingBubbleId == null){
    return;
  }
  var element = document.getElementById(draggingBubbleId);
  element.style.left = (e.pageX - element.offsetWidth / 2) + "px";
  element.style.top = (e.pageY - element.offsetHeight / 2) + "px";
}

function repositionBubbleList(){
  for(var i = 0; i < bubbleInfoList.length; i++){
    var bubbleInfo = bubbleInfoList[i];
    var coordinates = toPageCoordinates(bubbleInfo.xPercent, bubbleInfo.yPercent);

    var element = document.getElementById(bubbleInfo.bubbleID);
    element.style.top = coordinates.newY + "px";
    element.style.left = coordinates.newX + "px";
  }
}