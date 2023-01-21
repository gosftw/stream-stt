from fastapi import FastAPI
from fastapi.websockets import WebSocket, WebSocketDisconnect
from datetime import datetime
import base64
import wave

import deepspeech
import numpy as np

app = FastAPI()

# Initialize the DeepSpeech model
model_path = "deepspeech-0.9.3-models.pbmm"
scorer_path = "deepspeech-0.9.3-models.scorer"
model = deepspeech.Model(model_path)
model.enableExternalScorer(scorer_path)


# Create a new WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            #audio_bytes = await websocket.receive_bytes()
            #print(audio_bytes)
            #print(type(audio_bytes))
            audio_bytes = await websocket.receive_bytes()
            offset = len(audio_bytes) % 2
            #offset = int(np.ceil(len(audio_bytes) / 2) * 2)
            # Decode the base64 string to bytes
            
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            #with wave.open(audio_bytes, 'rb') as wav_file:
                # read the audio data and convert it to the desired format
            #    audio = np.fromstring(wav_file.readframes(-1), dtype=np.int16)
            # pass the audio data to the DeepSpeech model
            audio = np.frombuffer(audio_bytes, dtype=np.int16, offset=offset, count=-1)
            # audio = audio.reshape(-1, 2)
            # audio = np.resize(audio, (-1, 2))
            
            text = model.stt(audio)
            #text = "model.stt(audio)"
            print(text)
            await websocket.send_text(f"Time: {current_time}  {text}")
    except WebSocketDisconnect as e:
        # print('connection clossed')
        pass