from flask import Flask,render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import requests
from ai import transcribe, get_completion
from tts import get_audio


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    if 'audioFile' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['audioFile']
    print(file)
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    filepath = filepath + '.webm'
    file.save(filepath)
    print(f'File saved at {filepath}')
    transcript = transcribe_audio(filepath)
    return jsonify({'message': 'File uploaded and processed.', 'transcript': transcript})

def transcribe_audio(filepath):
    # Assuming you have Whisper API set up and have the necessary client
    # Here is a pseudo code, adjust according to the specific API you are using
    # Read the file and send it to the Whisper API
    response = transcribe(filepath)
    print(response)
    return response


@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data['text']
    print(f'Text to speech: {text}')
    # Assuming you have the TTS API set up and have the necessary client
    # Here is a pseudo code, adjust according to the specific API you are using
    # Send the text to the TTS API
    response, url = get_audio(text)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'tts-audio.webm')
    return jsonify({'message': 'Text to speech generated.', 'url': filepath})


@app.route("/")
def home():    
    return render_template("index.html")


@app.route("/get")
def get_bot_response():    
    userText = request.args.get('msg')  
    print(userText)
    response = get_completion(userText)  
    print(response)
    #return str(bot.get_response(userText)) 
    return response


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)


if __name__ == "__main__":
    app.run(debug=True)