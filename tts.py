import azure.cognitiveservices.speech as speechsdk
import os
import datetime

# Creates an instance of a speech config with specified subscription key and service region.
speech_key = os.getenv("AZURE_TTS")
service_region = "eastus"


# Global configuration and synthesizer initialization
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
speech_config.speech_synthesis_voice_name = "ja-JP-NanamiNeural"


def get_audio(text):
    print(f'Text to speech: {text}')
    file_name = "uploads/tts-audio" + str(datetime.datetime.now().timestamp()) + ".webm"
    file_config = speechsdk.audio.AudioOutputConfig(filename=file_name)
    speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=file_config)
    # Synthesizes the received text to speech, using pre-configured synthesizer
    result = speech_synthesizer.speak_text_async(text).get()
    return result, file_name
                
                
