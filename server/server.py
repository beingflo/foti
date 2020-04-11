import os
import base64
from io import BytesIO
import json
from store import Store 

l1 = "/home/florian/Pictures/"
l2 = "/home/florian/.cache/photos/"

class Server:
    def __init__(self, websocket):
        self.websocket = websocket
        self.store = Store(l1, l2) 
    
    async def handle_message(self):
        request_raw = await self.websocket.recv()
        request = json.loads(request_raw)
        print("Received request: ", request)

        # Available images are queried
        if request['type'] == 'query':
            response = self.imagelist_response(request)
            await self.websocket.send(json.dumps(response))

        # Specific file is querried
        elif request['type'] == 'image':
            response = self.image_response(request)
            await self.websocket.send(json.dumps(response))
        
    def imagelist_response(self, request):
        files = []
        for folder, file in self.store.get_imagelist():
            if request['query'] in folder:
                files.append({ 'dir': folder, 'name': file })
        
        print("Sending file list of {} entries".format(len(files)))
        return { 'files': files }
    
    def image_response(self, request):
        folder = request['dir'][1:]
        file = request['file']

        image = self.store.get_image(folder, file)

        return { 'filename' : file,'image' : to_base64(image).decode("ascii") }

def to_base64(img):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue())