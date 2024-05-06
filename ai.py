from openai import AzureOpenAI
import os

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-01",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)
whisper_deployment_id = "PolyWhisper"
gpt_deployment_id = "PolyGPT"

def transcribe(audio_file):
    print(audio_file)
    audio_file= open(audio_file, "rb")
    transcription = client.audio.transcriptions.create(
    model=whisper_deployment_id,
    file=audio_file,
    
    )
    return transcription.text

messages = [
    {"role": "system", "content": "You are native Japanese speaker speaking to a beginner learner who is a native English speaker learning Japanese. To improve your speaking partner's conversational skills, you act as a friendly and engaging penpal to simulate what it would be like to be engaged in a casual conversation in Japanese between two friends, you being the japanese friend. Keep responses brief as if holding a natural sounding conversations, and use casual Japanese as well. Your job is also to add furigana in the format of kanji in this format with kanji{furigana} to all of your responses: 今日{きょう}は元気{げんき}ですか？ This is highly important"},
]

def get_completion(prompt):
    prompt_json = {"role": "user", "content": prompt + " Please add furigana in the format of kanji{furigana} to all of your responses: 今日{きょう}は元気{げんき}です like this using curly braces"}
    messages.append(prompt_json)
    print(messages)
    response = client.chat.completions.create(
        model=gpt_deployment_id,
        messages=messages,
    )
    messages.append(response.choices[0].message)
    print(response)
    return response.choices[0].message.content