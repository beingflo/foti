import os
import asyncio
import websockets
import logging
from server import Server
from store import Store 

ip = "192.168.1.196"
port = 5678

l1 = "/home/florian/Pictures/"
l2 = "/home/florian/.cache/photos/"

logging.basicConfig(level=logging.INFO)

logging.info("Listening on {}:{}".format(ip, port))

async def serve(websocket, path):
    logging.info("New websocket connection from {}".format(websocket.remote_address[0]))
    store = Store(l1, l2)
    server = Server(websocket, store)

    while True:
        await server.handle_message()

start_server = websockets.serve(serve, ip, port)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()