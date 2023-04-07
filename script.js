function setSessionID(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var id = urlParams.get('sessionid');
  if(id != null)
  {
    return urlParams.get('sessionid');
  }
  return "";
}

var sessionID = setSessionID();

window.addEventListener('load', function() {
  drawLoad();
  bubbleLoad();
  loadData(sessionID);
});

function sendData(data) {
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://FRQ-Coop-Server.spirou7.repl.co/send-data", true);
  xhttp.setRequestHeader('Content-type', 'application/json');

  // Create the JSON
  var jsonData = JSON.stringify(data);
  xhttp.send(jsonData);

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      try{
      var data = JSON.parse(xhttp.responseText);

      // Check if the server has an ID for the "needs_id" bubble
      if (data.newId != null) {
        console.log("WERE UPDATING IT HOLD ON");
        document.getElementById("needs_id").id = data.newId;

        // Update the array
        var bubble = bubbleInfoList["needs_id"];
        delete bubbleInfoList['needs_id'];
        bubbleInfoList[data.newId] = bubble;
        bubble.bubbleID = data.newId;
      }
      else {
        // Check if the server wants client to refresh
        updateWithSessionData(data);
      }
      }
      catch{
        
      }
    }
  }
}

function loadData(sessionID) {
  document.getElementById('sessionID').innerHTML = "Session ID: " + sessionID;
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://FRQ-Coop-Server.spirou7.repl.co/get-data", true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  var jsonData = JSON.stringify({
    sessionID: sessionID
  });
  xhttp.send(jsonData);

  // When the server responds with data
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      // Save the data into a variable
      try {
        var data = JSON.parse(xhttp.responseText);

        console.log(Object.keys(bubbleInfoList));

        updateWithSessionData(data);
      }
      catch {

      }
    }
  }
}

function updateWithSessionData(sessionData) {
  // Clear the bubbles
  var keys = Object.keys(bubbleInfoList);
  for (var i = 0; i < keys.length; i++) {
    document.getElementById(keys[i]).remove();
  }
  bubbleInfoList = [];

  var panelBubble = null;

  // Loop through every bubble and add it to the screen
  for (var i = 0; i < sessionData.bubbles.length; i++) {
    // If there is a bubble on the current page
    if (sessionData.bubbles[i].page == myState.currentPage) {
      var xPosition = parseFloat(sessionData.bubbles[i].xPosition);
      var yPosition = parseFloat(sessionData.bubbles[i].yPosition);


      createBubble(xPosition, yPosition, sessionData.bubbles[i].bubbleID);
      if (currentBubbleID != null) {
        if (sessionData.bubbles[i].bubbleID == currentBubbleID) {
          document.getElementById(currentBubbleID).className = "bubble_selected";
          panelBubble = sessionData.bubbles[i];
        }
      }
    }
  }

  if (panelBubble != null) {
    //Set the text area to be the text of the bubble
    document.getElementById("textArea").value = panelBubble.text;

    var img = new Image;
    img.addEventListener("load", function() {
      var myCanvas = document.getElementById('myCanvas');
      var ctx = myCanvas.getContext('2d');
      ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
      ctx.drawImage(img, 0, 0, myCanvas.width, myCanvas.height);
    });
    img.src = panelBubble.image;
  }


}

function updateCurrentBubblePosition() {
  var currentBubbleDiv = document.getElementById(currentBubbleID);
  var bubbleOffset = getOffset(currentBubbleDiv);

  var rendererDiv = document.getElementById('pdf_renderer');
  var rendererOffset = getOffset(rendererDiv);

  var newX = (bubbleOffset.left * 1.0 - rendererOffset.left) / rendererDiv.offsetWidth;
  var newY = (bubbleOffset.top * 1.0 - rendererOffset.top) / rendererDiv.offsetHeight;
  var data = {
    updatePosition: true,
    sessionID: sessionID,
    bubbleID: currentBubbleID,
    xPosition: newX,
    yPosition: newY,
  };

  sendData(data);
}

function updateCurrentBubble(requestNewId) {
  var currentBubbleDiv = document.getElementById(currentBubbleID);
  var bubbleOffset = getOffset(currentBubbleDiv);

  var text = document.getElementById("textArea").value;
  var imageData = document.getElementById("myCanvas").toDataURL();

  var rendererDiv = document.getElementById('pdf_renderer');
  var rendererOffset = getOffset(rendererDiv);

  var newX = (bubbleOffset.left * 1.0 - rendererOffset.left) / rendererDiv.offsetWidth;
  var newY = (bubbleOffset.top * 1.0 - rendererOffset.top) / rendererDiv.offsetHeight;

  if (requestNewId) {
    currentBubbleID = "needs_id";
  }

  console.log("current Bubble ID: " + currentBubbleID);

  sendData({
    bubbleID: currentBubbleID,
    xPosition: newX,
    yPosition: newY,
    sessionID: sessionID,
    page: myState.currentPage,
    text: text,
    image: imageData
  });

  console.log("bubble saved");
}

function deleteCurrentBubble() {
  sendData({
    sessionID: sessionID,
    deleteBubbleID: currentBubbleID,
  });

  document.getElementById(currentBubbleID).remove();
  delete bubbleInfoList[currentBubbleID];
}
function loadEdits() {
  loadData(sessionID);
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}