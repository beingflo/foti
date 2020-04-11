import os
import asyncio
import websockets
from server import Server

ip = "192.168.1.196"
port = 5678

async def serve(websocket, path):
    server = Server(websocket)

    while True:
        await server.handle_message()

start_server = websockets.serve(serve, ip, port)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()