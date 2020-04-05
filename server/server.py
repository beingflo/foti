import os
import base64
from io import BytesIO
from PIL import Image
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
    idx = 0
    while True:
        request = int(await websocket.recv())
        for _ in range(request):
            print("Sending ", idx)

            imagename = os.path.join(l2_directory, l2_images[idx][0], l2_images[idx][1])
            image = Image.open(imagename)

            await websocket.send(to_base64(image).decode("ascii"))
            idx += 1
