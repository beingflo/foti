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
        if request['type'] == 'filter':
            logging.info("Received filter: {}".format(request['filter']))
            response = self.imagelist_response(request)
            await self.websocket.send(json.dumps(response))

        # Specific file is querried
        elif request['type'] == 'image':
            logging.info("Received image request: {}: {}".format(request['level'], request['name']))
            response = self.image_response(request)
            await self.websocket.send(json.dumps(response))
        
        # Logging message is sent
        elif request['type'] == 'info':
            logging.info(request['info'])
        
    def imagelist_response(self, request):
        files = []
        for folder, file in self.store.get_imagelist():
            name = os.path.join(folder, file)
            if request['filter'] in name:
                files.append({ 'name': name })
        
        logging.info("Sending file list of {} entries".format(len(files)))
        return { 'type': 'filterresponse', 'files': files }
    
    def image_response(self, request):
        name = request['name']
        level = request['level']

        try:
            if level == 'l2':
                image = self.store.get_image_l2(name)
            elif level == 'l1':
                image = self.store.get_image_l1(name)

            return { 'type': 'imageresponse', 'name' : name, 'level' : level, 'image' : to_base64(image).decode("ascii") }
        except FileNotFoundError:
            logging.error('File not found: ' + name)
            return { 'type': 'error', 'description': 'File not found' }

def to_base64(img):
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue())