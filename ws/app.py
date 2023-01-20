from fastapi import FastAPI
from fastapi.websockets import WebSocket, WebSocketDisconnect
from datetime import datetime

app = FastAPI()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        await websocket.send_text("Connection established!")

        while True:
            data = await websocket.receive_bytes()
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            await websocket.send_text(f"Time: {current_time}")
    except WebSocketDisconnect:
        print("Client disconnect")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)