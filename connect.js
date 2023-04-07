function sendSessionID(){
  var sessionID = document.getElementById("sessionID_textarea").value;

  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://FRQ-Coop-Server.spirou7.repl.co/join-session", true);
  xhttp.setRequestHeader('Content-type', 'application/json');

  var data = {
    sessionID: sessionID
  };

  var jsonData = JSON.stringify(data);
  xhttp.send(jsonData);

  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200){
      console.log(xhttp.responseText);
      var data = JSON.parse(xhttp.responseText);

      if(data.exists == true){
        window.location.href = "https://FRQ-Coop.spirou7.repl.co/editor.html" + "?sessionid=" + sessionID;
      }
      else{
        document.getElementById('message').innerHTML = "This session does not exist, please check that the session ID is correct."
      }
    }
  }
}

function createSession(){
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://FRQ-Coop-Server.spirou7.repl.co/create-session", true);
  xhttp.setRequestHeader('Content-type', 'application/json');

  var sessionID = document.getElementById("sessionID_textarea").value;
  
  var data = {
    sessionID: sessionID,
  }
  // Create the JSON
  var jsonData = JSON.stringify(data);
  xhttp.send(jsonData);

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      window.location.href = "https://FRQ-Coop.spirou7.repl.co/editor.html" + "?sessionid=" + sessionID;
    }
  }
}