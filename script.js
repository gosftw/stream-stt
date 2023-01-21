let ws;
let mediaRecorder;
let stream;
const micButton = document.getElementById("mic-button");
const wsURL = "wss://8000-gosftw-streamstt-kcwtzvs8gko.ws-us83.gitpod.io/ws";
let textOutput = document.getElementById("text-output").innerHTML;
//const wsURL = "wss://34257-gosftw-streamstt-kcwtzvs8gko.ws-us83.gitpod.io/ws";

let recording = false;
let recordingInterval;

/* navigator.mediaDevices.getUserMedia({ audio: true })
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
          ws = new WebSocket(wsURL);
          stream = mediaStream;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          micButton.innerHTML = '<i class="fas fa-stop"></i>';
          recording = true;
          ws.onopen = () => {
                recordingInterval = setInterval(() => {
                  console.log("hummm");
                    mediaRecorder.ondataavailable = event => {
                        let audioData= new Float32Array(event.data);
                        console.log("tic");
                        console.log(audioData);
                        if(audioData.length > 0) {
                          console.log("audioData > 0")
                        }
                        ws.send(audioData);
                        ws.onmessage = function(event) {
                            console.log("tac");
                            document.getElementById("text-output").innerHTML = event.data;
                        }
                    };
                }, 1000);
          };
        }
    });
  })
  .catch(error => {
    console.error('Error accessing microphone: ', error);
  });

*/
const batchSize = 10;


const startSTT = () => {
    const socket = new WebSocket(wsURL);
    let intervalId;
    
    let options = {
        audioBitsPerSecond : 16000,
        mimeType : 'audio/webm; codecs=opus'
    }

    // open connection
    socket.addEventListener('open', function() {
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(function (stream) {
            console.log("socket open");
            mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.start(1000);
            mediaRecorder.ondataavailable = event => {
                console.log("ondataavailable", event.data);
                //[event.data].toBlob((blob) => socket.send(blob), 'audio/wav');
                //#let data = new Int16Array(event.data);
                let data = new Blob([event.data], { type: 'audio/webm; codecs=opus' });
                //let data = btoa(event.data);
                //console.log(data);
                socket.send(data);
                /*const audioBlob = new Blob([event.data], { type: 'audio/ogg' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audioPlayer = document.getElementById('audioPlayer');
                audioPlayer.src = audioUrl;
                audioPlayer.play()*/
                /*let audioBlob = new Blob([event.data], { type: 'audio/wav' });
                socket.send(event.data);*/
            }
            /*intervalId = setInterval(() => {
                console.log("setInterval");
                mediaRecorder.ondataavailable = event => {
                    console.log("ondataavailable");
                    socket.send(event.data);
                    // let audioData= new Blob(event.data, { type: "audio/ogg; codecs=opus" });
                    //socket.send(event.data);
                    audioData.push(event.data);
                    //socket.send(audio_bytes);
                    if (audioData.length === batchSize) {
                        console.log("Send data");
                        //const audioBlob = new Blob(audioData);
                        let audioBytes = new Float32Array(audioData).buffer;
                        socket.send(audioBytes);
                        audioData = [];
                    }
                }
                
            }, 1000);*/
        });
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log("message received: ", event.data);
        document.getElementById("text-output").innerHTML = event.data;
    });

    // Stop the interval and video reading on close
    socket.addEventListener('close', function () {
        console.log("connection clossed");
        clearInterval(intervalId);
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    });

    return socket;
};



let socket;

micButton.addEventListener("click", function() {
    
    if (recording) {
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        if (socket) {
            socket.close();
        }
        
        recording = false;
    } else {
        
        micButton.innerHTML = '<i class="fas fa-stop"></i>';
        socket = startSTT();
        
        recording = true;
    }
    
});