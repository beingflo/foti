import os
import base64
from io import BytesIO
from PIL import Image
import json
import images

l2_directory = "/home/florian/.cache/photos/"
l1_directory = "/home/florian/Pictures"

l2_images = []
l1_images = []

l2_images = images.load_images(l2_directory)

def to_base64(img):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue())


async def serve(websocket, path):
    while True:
        request = await websocket.recv()
        request_data = json.loads(request)
        print("Received request: ", request_data)

        # Available images are queried
        if request_data['type'] == 'dir':
            response = { 'dir': request_data['dir'], 'file': [] }
            for folder, file in l2_images:
                if folder.startswith(request_data['dir']):
                    response['file'].append(file)
            
            await websocket.send(json.dumps(response))

        # Specific file is querried
        elif request_data['type'] == 'image':
            if request_data['file'] == 'undefined':
                continue
            imagename = os.path.join(l2_directory, request_data['dir'], request_data['file'])
            image = Image.open(imagename)

            response = { 'filename' : request_data['file'],'image' : to_base64(image).decode("ascii") }
            await websocket.send(json.dumps(response))