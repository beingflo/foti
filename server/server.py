import os
import base64
from io import BytesIO
from PIL import Image
import json
import images

l2_directory = "/home/florian/.cache/photos/"
l1_directory = "/home/florian/Pictures/"

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
            files = []
            for folder, file in l2_images:
                if folder.startswith(request_data['dir']):
                    files.append({ 'dir': folder, 'name': file })
            
            response = { 'files': files }
            await websocket.send(json.dumps(response))

        # Specific file is querried
        elif request_data['type'] == 'image':
            if request_data['file'] == 'undefined':
                continue

            folder = request_data['dir'][1:]
            file = request_data['file']
            imagename = os.path.join(l2_directory, folder, file)
            image = Image.open(imagename)

            response = { 'filename' : file,'image' : to_base64(image).decode("ascii") }
            await websocket.send(json.dumps(response))
