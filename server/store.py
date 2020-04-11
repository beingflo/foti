import os, os.path
from PIL import Image

class Store:
    def __init__(self, l1, l2):
        self.l1 = l1
        self.l2 = l2

        self.imagelist = self.load_imagelist()
        self.check_directories()

        self.cache = {}
    
    def get_image(self, path, file):
        name = os.path.join(self.l2, path, file)

        if(not name in self.cache):
            image = Image.open(name)
            self.cache[name] = image

        return self.cache[name]

    def get_imagelist(self):
        return self.imagelist

    def check_directories(self):
        pass

    def generate_l2(self, path):
        pass

    def load_imagelist(self):
        images = []
        for root, _, files in os.walk(self.l2):
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext.lower() != ".jpg":
                    continue
                folder = "/" + root[len(self.l2):]
                filename = f
                images.append((folder, filename))

        images = sorted(images, key=lambda x: x[1])
        images.reverse()

        return images
