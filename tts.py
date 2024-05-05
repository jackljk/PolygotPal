import azure.cognitiveservices.speech as speechsdk
import os

# Creates an instance of a speech config with specified subscription key and service region.
speech_key = os.getenv("AZURE_TTS")
service_region = "eastus"

speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
# Note: the voice setting will not overwrite the voice element in input SSML.
speech_config.speech_synthesis_voice_name = "ja-JP-NanamiNeural"

# Define the audio file name
file_name = "outputaudio.wav"

# Create an audio output configuration using the audio file
file_config = speechsdk.audio.AudioOutputConfig(filename=file_name)

# Create a speech synthesizer with the speech and audio configurations
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=file_config)

def get_audio(text):
    result = speech_synthesizer.speak_text_async(text).get()
    # Check result
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized for text [{}]".format(text))
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print("Speech synthesis canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details: {}".format(cancellation_details.error_details))
    return result