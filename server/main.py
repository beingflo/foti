import asyncio
import datetime
import random
import websockets
from PIL import Image
import os, os.path
import base64
from io import BytesIO

l2_directory = "/home/florian/.cache/photos/"
l1_directory = "/home/florian/Pictures"

l2_images = []
l1_images = []

def load_images(path):
    images = []
    for root, _, files in os.walk(path):
        for f in files:
            ext = os.path.splitext(f)[1]
            if ext.lower() != ".jpg":
                continue
            folder = root[len(path):]
            filename = f
            images.append((folder, filename))

    images = sorted(images, key=lambda x: x[1])
    images.reverse()
    return images

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

            imagename = os.path.join(l2_directory, l2_images[idx][0], l2_images[idx][1])
            image = Image.open(imagename)

            await websocket.send(to_base64(image).decode("ascii"))
            idx += 1

l2_images = load_images(l2_directory)

start_server = websockets.serve(time, "192.168.1.196", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()