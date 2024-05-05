// Chatbot messaging functionality
function getBotResponse() {
  var rawText = $("#textInput").val();
  var ttsButton = "'<button onclick=\"speakText(this)\">Speak</button>'";
  var userHtml = '<p class="userText"><span>' + rawText + "</span></p>";
  $("#textInput").val("");
  $("#chatbox").append(userHtml);
  $("#chatbox").append(ttsButton);
  document
    .getElementById("userInput")
    .scrollIntoView({ block: "start", behavior: "smooth" });
  $.get("/get", { msg: rawText }).done(function (data) {
    var botHtml = '<p class="botText"><span>' + data + "</span></p>";
    $("#chatbox").append(botHtml);
    $("#chatbox").append(ttsButton);
    document
      .getElementById("userInput")
      .scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

$("#textInput").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
    getBotResponse();
  }
}
);


// Audio recording functionality
window.onload = function() {
  document.getElementById('recordButton').addEventListener('click', startRecording);
  document.getElementById('stopButton').addEventListener('click', stopRecording);

  setupMediaRecorder(); // Initialize the media recorder setup
};

let mediaRecorder;
let audioChunks = [];
async function setupMediaRecorder() {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
      } else {
          console.log('webm not supported, using default MIME type.');
      }
      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = function(e) {
          audioChunks.push(e.data);
      };

      mediaRecorder.onstop = function() {
          handleAudioStop();
          const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = document.getElementById('audioPlayback');
          audio.src = audioUrl;
          audioChunks = []; // Clear the array for the next recording
      };
  } catch (error) {
      console.error('Error accessing microphone:', error);
  }
}


function startRecording() {
  if (!mediaRecorder) {
      alert('Microphone not ready or not available.');
      return;
  }
  mediaRecorder.start();
  document.getElementById('recordButton').disabled = true;
  document.getElementById('stopButton').disabled = false;
  console.log('Recording started...');
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      document.getElementById('recordButton').disabled = false;
      document.getElementById('stopButton').disabled = true;
      console.log('Recording stopped.');
  }
}



// Send to Backend for processing
function handleAudioStop() {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  const formData = new FormData();
  formData.append('audioFile', audioBlob);
  console.log('Audio recording stopped, sending to backend for processing...');
  fetch('/upload-audio', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      displayTranscription(data.transcript);
      console.log(
        "Transcription: ",
        data.transcript, 
      )
  })
  .catch(error => console.error('Error:', error));
}

function displayTranscription(text) {
  const messageArea = document.getElementById('textInput'); // Assuming this is your chat area
  messageArea.value += text;
}


// tts functionality
function speakText(element) {
  var text = element.previousElementSibling.textContent; // Gets the text from the <p> tag before the button
  console.log('Speaking text:', text);

  // Send text to Azure TTS service for synthesis
  fetch('/azure-text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: text })
  });
}
