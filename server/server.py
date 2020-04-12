import os
import base64
import logging
import json
from io import BytesIO

class Server:
    def __init__(self, websocket, store):
        self.websocket = websocket
        self.store = store
    
    async def handle_message(self):
        request_raw = await self.websocket.recv()
        request = json.loads(request_raw)

        # Available images are queried
        if request['type'] == 'query':
            logging.info("Received query: {}".format(request['query']))
            response = self.imagelist_response(request)
            await self.websocket.send(json.dumps(response))

        # Specific file is querried
        elif request['type'] == 'image':
            logging.info("Received image request: {}".format(request['name']))
            response = self.image_response(request)
            await self.websocket.send(json.dumps(response))
        
    def imagelist_response(self, request):
        files = []
        for folder, file in self.store.get_imagelist():
            name = os.path.join(folder, file)
            if request['query'] in name:
                files.append({ 'name': name })
        
        logging.info("Sending file list of {} entries".format(len(files)))
        return { 'type': 'queryresponse', 'files': files }
    
    def image_response(self, request):
        name= request['name']

        image = self.store.get_image_l2(name)

        return { 'type': 'imageresponse', 'name' : name, 'image' : to_base64(image).decode("ascii") }

def to_base64(img):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue())