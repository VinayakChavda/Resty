from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # dictionary store karega: { restaurant_id: [list of active websockets] }
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, restaurant_id: int):
        await websocket.accept()
        if restaurant_id not in self.active_connections:
            self.active_connections[restaurant_id] = []
        self.active_connections[restaurant_id].append(websocket)

    def disconnect(self, websocket: WebSocket, restaurant_id: int):
        if restaurant_id in self.active_connections:
            self.active_connections[restaurant_id].remove(websocket)

    async def send_notification(self, restaurant_id: int, message: dict):
        if restaurant_id in self.active_connections:
            for connection in self.active_connections[restaurant_id]:
                await connection.send_json(message)

manager = ConnectionManager()