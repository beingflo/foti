import os
import threading
import asyncio
import argparse
import websockets
import logging
from server import Server
from store import Store 

ip = "0.0.0.0"
port = 5678

# Original images
l0 = "/home/florian/Pictures/"
# Lightly compressed images with original resolution
l1 = "/home/florian/.cache/photos/l1/"
# Heavily compressed images with reduced resolution
l2 = "/home/florian/.cache/photos/l2/"
# Small square cropped thumbnails for multi column view
l3 = "/home/florian/.cache/photos/l3/"

logging.basicConfig(level=logging.INFO)

parser = argparse.ArgumentParser(description="Photos server")
parser.add_argument('--no-thumbnails', action='store_true')

args = parser.parse_args()

store = Store(l0, l1, l2)

if not args.no_thumbnails:
    handle = threading.Thread(target=store.generate_store)
    handle.start()

async def serve(websocket, path):
    logging.info("New websocket connection from {}".format(websocket.remote_address[0]))
    server = Server(websocket, store)

    while True:
        await server.handle_message()

logging.info("Listening on {}:{}".format(ip, port))
start_server = websockets.serve(serve, ip, port)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()