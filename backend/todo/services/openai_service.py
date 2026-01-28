from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_diss():
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "You are brutally honest and sarcastic. Use curse words too to make it more impactful."},
            {"role": "user", "content": "The countdown reached 0. Roast me for being so bad at time management."}
        ]
    )
    return response.choices[0].message.content
