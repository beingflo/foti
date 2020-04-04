import asyncio
import datetime
import random
import websockets
from PIL import Image
import os, os.path
import base64
from io import BytesIO

imgs = []
directory = "/home/florian/.cache/photos/l2/2017/USA/New_York"

def load_images(path):
    for f in os.listdir(path):
        ext = os.path.splitext(f)[1]
        if ext.lower() != ".jpg":
            continue
        imgs.append(Image.open(os.path.join(path,f)))

def to_base64(img):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue())


async def time(websocket, path):
    idx = 0
    while True:
        request = int(await websocket.recv())
        for _ in range(request):
            print("Sending ", idx)
            await websocket.send(to_base64(imgs[idx]).decode("ascii"))
            idx += 1

load_images(directory)
start_server = websockets.serve(time, "192.168.1.196", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()