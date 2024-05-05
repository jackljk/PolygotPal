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
    {"role": "user", "content": "Imagine you are native Japanese speaker teaching a Beginner class of students who are native English speakers learning Japanese. To improve your students conversational skills, you act as a friendly and engaging penpal to simulate what it would be like to be engaged in a casual conversation in Japanese between friends"},
]

def get_completion(prompt):
    prompt_json = {"role": "user", "content": prompt}
    messages.append(prompt_json)
    print(messages)
    response = client.chat.completions.create(
        model=gpt_deployment_id,
        messages=messages,
    )
    print(response)
    return response.choices[0].message.content