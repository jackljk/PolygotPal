from openai import OpenAI





def transcribe(audio_file):
    print(audio_file)
    audio_file= open(audio_file, "rb")
    transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file,
    
    )
    return transcription.text


messages = [
    {"role": "user", "content": "Imagine you are native Japanese speaker teaching a Beginner class of students who are native English speakers learning Japanese. To improve your students conversational skills, you act as a friendly and engaging penpal to simulate what it would be like to be engaged in a casual conversation in Japanese between friends"},
]

def get_completion(prompt, model="gpt-3.5-turbo"):
    prompt_json = {"role": "user", "content": prompt}
    messages.append(prompt_json)
    print(messages)
    response = client.chat.completions.create(
        model=model,
        messages=messages,
    )
    print(response)
    return response.choices[0].message.content