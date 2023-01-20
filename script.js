let ws;
let mediaRecorder;
let stream;
const micButton = document.getElementById("mic-button");
let recording = false;
let recordingInterval;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(mediaStream => {
    stream = mediaStream;
    micButton.addEventListener("click", function() {
        if (recording) {
          console.log("STOP RECORDING");
          clearInterval(recordingInterval);
          mediaRecorder.stop();
          micButton.innerHTML = '<i class="fas fa-microphone"></i>';
          clearInterval(recordingInterval); // clear the interval
          ws.onclose = () => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            stream.getTracks().forEach(track => track.stop());
            ws.close(); // close the WebSocket connection
          };
          recording = false;
        } else {
          console.log("START RECORDING");
          ws = new WebSocket('ws://localhost:5005/ws');
          stream = mediaStream;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          micButton.innerHTML = '<i class="fas fa-stop"></i>';
          recording = true;
          ws.onopen = () => {
                recordingInterval = setInterval(() => {
                    mediaRecorder.ondataavailable = event => {
                        console.log("tic");
                        ws.send(event.data);
                    };
                    ws.onmessage = function(event) {
                        console.log("tac");
                        document.getElementById("text-output").innerHTML = event.data;
                    }
                }, 1000);
          };
        }
    });
  })
  .catch(error => {
    console.error('Error accessing microphone: ', error);
  });
