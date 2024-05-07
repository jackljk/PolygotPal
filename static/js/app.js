// Chatbot messaging functionality
function getBotResponse() {
  var rawText = $("#textInput").val();
  var ttsButton =
    '<button onclick="speakText(this)" class="TTS-button"><i class="fa-solid fa-volume-high"></i></button>';
  var userHtml =
    '<div id="userTextWrapper"><p class="userText"><span>' +
    rawText +
    "</span></p>" +
    ttsButton +
    "</div>";
  $("#textInput").val("");
  $("#chatbox").append(userHtml);

  // push the loading indicator to the bottom of the chatbox
  $("#chatbox").append($("#loadingIndicator"));

  // Show loading indicator
  $("#loadingIndicator").show();

  // Scroll to the bottom of the chatbox
  document
    .getElementById("userInput")
    .scrollIntoView({ block: "end", behavior: "smooth" });

  $.get("/get", { msg: rawText })
    .done(function (data) {
      var botHtml =
        '<div id="botTextWrapper"><p class="botText"><span>' +
        data +
        "</span></p>" +
        ttsButton +
        "</div>";
      $("#chatbox").append(botHtml);
      document
        .getElementById("userInput")
        .scrollIntoView({ block: "end", behavior: "smooth" });
    })
    .fail(function (error) {
      console.error("Error getting bot response: ", error);
      var botHtml =
        '<div id="botTextWrapper"><p class="botText"><span>Sorry, there was an error processing your request. Please try again later.</span></p>' +
        ttsButton +
        "</div>";
      $("#chatbox").append(botHtml);
      document
        .getElementById("userInput")
        .scrollIntoView({ block: "end", behavior: "smooth" });
    })
    .always(function () {
      // Hide loading indicator
      $("#loadingIndicator").hide();
    });
}

$("#textInput").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
    getBotResponse();
  }
});

$("#submit-btn").click(function () {
  getBotResponse();
});


// Audio recording functionality
window.onload = function () {
  document
    .getElementById("recordButton")
    .addEventListener("click", startRecording);
  document
    .getElementById("stopButton")
    .addEventListener("click", stopRecording);

  setupMediaRecorder(); // Initialize the media recorder setup


  // Message to write on load
  var ttsButton =
    '<button onclick="speakText(this)" class="TTS-button"><i class="fa-solid fa-volume-high"></i></button>';
  var botHtml =
        '<div id="botTextWrapper"><p class="botText"><span>' +
        "Hi Welcome to PolyGlot Pal please response with your language of choice and level" +
        "</span></p>" +
        ttsButton +
        "</div>";
      $("#chatbox").append(botHtml);
      document
        .getElementById("userInput")
        .scrollIntoView({ block: "start", behavior: "smooth" });
};

let mediaRecorder;
let audioChunks = [];
async function setupMediaRecorder() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let options = {};
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      options = { mimeType: "audio/webm" };
    } else {
      console.log("webm not supported, using default MIME type.");
    }
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = function (e) {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = function () {
      handleAudioStop();
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
    };
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
}

function startRecording() {
  if (!mediaRecorder) {
    alert("Microphone not ready or not available.");
    return;
  }
  mediaRecorder.start();
  document.getElementById("recordButton").disabled = true;
  document.getElementById("recordButton").style.display = "none";
  document.getElementById("stopButton").style.display = "inline-block";
  document.getElementById("stopButton").disabled = false;
  console.log("Recording started...");
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    document.getElementById("recordButton").disabled = false;
    document.getElementById("recordButton").style.display = "inline-block";
    document.getElementById("stopButton").style.display = "none";
    document.getElementById("stopButton").disabled = true;
    console.log("Recording stopped.");
  }
}

// Send to Backend for processing
function handleAudioStop() {
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("audioFile", audioBlob);
  console.log("Audio recording stopped, sending to backend for processing...");
  fetch("/upload-audio", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      displayTranscription(data.transcript);
      console.log("Transcription: ", data.transcript);
    })
    .catch((error) => console.error("Error:", error));
}

function displayTranscription(text) {
  const messageArea = document.getElementById("textInput"); // Assuming this is your chat area
  messageArea.value += text;
}

// tts functionality
function speakText(element) {
  // get content including html tags
  var text = element.previousElementSibling.textContent; 
  var textWithoutFurigana = removeFurigana(text);
  console.log(textWithoutFurigana)
  console.log("Speaking text:", textWithoutFurigana);

  // add a loading indicator
  var loadingIndicator = document.createElement("img");
  loadingIndicator.className = "loading";
  loadingIndicator.textContent = "Loading...";
  loadingIndicator.src = "/static/assets/loading/tts-loading.svg";
  element.parentNode.appendChild(loadingIndicator);

  // hide the TTS button
  element.style.display = "none";

  // Send text to Azure TTS service for synthesis
  fetch("/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: textWithoutFurigana}),
  })
    .then((response) => response.json()) // Assuming the server sends back JSON with the audio file URL
    .then((data) => {
      if (data.url) {
        console.log("Audio URL:", data.url);
        var audio = new Audio(data.url);
        audio.play();
        // Add an event listener for the 'ended' event
        audio.addEventListener("ended", function () {
          // Hide the loading indicator when the audio is finished playing
          loadingIndicator.style.display = "none";

          // Show the TTS button again
          element.style.display = "";
          console.log("Audio playback finished.");

          // delete the audio file after playback
          fetch('/delete/' + data.url, {
            method: "DELETE",
          }).then((response) => {
            console.log("Audio file deleted.");
          }
          );
        });
      } else {
        console.error("Audio URL not provided.");
      }
    })
    .catch(function (error) {
      console.error(
        "There was a problem with the fetch operation: " + error.message
      );
    });
}

function removeFurigana(text){
  //remove text within rt tags, and then remove all html tags
  //input <ruby>最近<rt>さいきん</rt></ruby>、<ruby>忙<rt>いそが</rt></ruby>しい</ruby>ですね。お<ruby>忙<rt>いそが</rt></ruby>しいですか？
  //returns 最近、忙しいですね。お忙しいですか？
  return text.replace(/<rt>.*?<\/rt>/g, '').replace(/<.*?>/g, '');
}
