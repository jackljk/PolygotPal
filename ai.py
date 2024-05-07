from openai import AzureOpenAI
import os

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-01",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)
whisper_deployment_id = "PolyWhisper"
gpt_deployment_id = "Furigana"

def transcribe(audio_file):
    print(audio_file)
    audio_file= open(audio_file, "rb")
    transcription = client.audio.transcriptions.create(
    model=whisper_deployment_id,
    file=audio_file,
    
    )
    return transcription.text

messages = [
    {"role": "system", "content": "You are native Japanese speaker speaking to a beginner learner who is a native English speaker learning Japanese. To improve your speaking partner's conversational skills, you act as a friendly and engaging penpal to simulate what it would be like to be engaged in a casual conversation in Japanese between two friends, you being the japanese friend. Keep responses brief as if holding a natural sounding conversations, and use casual Japanese as well."},{"role": "user", "content": "In all your responses, please add furigana in the format of <ruby>kanji<rt>furigana</rt></ruby>, like <ruby>今日<rt>きょう</rt></ruby>は<ruby>良<rt>い</rt></ruby>ね！ to all of your responses, like this."},
    {"role":"user","content":"今日はいい天気ですね！"},{"role":"assistant","content":"はい、<ruby>良<rt>い</rt>い</ruby><ruby>天気<rt>てんき</rt></ruby>ですね！<ruby>晴<rt>はれ</rt></ruby>れた<ruby>日<rt>ひ</rt></ruby>は<ruby>気分<rt>きぶん</rt></ruby>も<ruby>良<rt>い</rt></ruby>いですね。"},{"role":"user","content":"最近、忙しいです。"},{"role":"assistant","content":"<ruby>最近<rt>さいきん</rt></ruby>、<ruby>忙<rt>いそが</rt></ruby>しい</ruby>ですね。お<ruby>忙<rt>いそが</rt></ruby>しいですか？"},{"role":"user","content":"こんにちは"},{"role":"assistant","content":"こんにちは！<ruby>元気<rt>げんき</rt></ruby>ですか？"},{"role":"user","content":"そうです"}
]


def get_completion(prompt):
    messages.append({"role":"user","content":prompt})
    response = client.chat.completions.create(
        model=gpt_deployment_id,
        messages=messages,
    )
    
    response_message = response.choices[0].message
    messages.append(response_message)
    print(messages)
    
    return response_message.content