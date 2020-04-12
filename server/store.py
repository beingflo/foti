import os, os.path
import logging
from PIL import Image, ExifTags

RESIZE_FACTOR = 8

class Store:
    def __init__(self, l1, l2):
        self.l1 = l1
        self.l2 = l2

        self.imagelist = self.load_imagelist()
        self.check_directories()
    
    def get_image_l2(self, name):
        name = os.path.join(self.l2, name)

        image = Image.open(name)

        return image

    def get_image_l1(self, name):
        name = os.path.join(self.l1, name)

        image = Image.open(name)

        return image

    def get_imagelist(self):
        return self.imagelist

    def check_directories(self):
        images_dict_l2 = {}

        for root, _, files in os.walk(self.l2):
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext.lower() != ".jpg":
                    continue
                folder = root[len(self.l2):]
                name = folder + "/" + f

                images_dict_l2[name] = 0
        
        for folder, file in self.imagelist:
            name = folder + "/" + file
            if not name in images_dict_l2:
                self.generate_l2(folder, file)

        logging.info("Checking L2 cache complete")

    def generate_l2(self, path, file):
        abs_path_l1 = os.path.join(self.l1, path)
        abs_file_l1 = os.path.join(abs_path_l1, file)

        abs_path_l2 = os.path.join(self.l2, path)
        abs_file_l2 = os.path.join(abs_path_l2, file)

        logging.info("Generating l2 image for {}".format(abs_file_l1))
        
        if not os.path.exists(abs_path_l2):
            os.makedirs(abs_path_l2)

        image = Image.open(abs_file_l1)

        new_size = (int(image.size[0] / RESIZE_FACTOR), int(image.size[1] / RESIZE_FACTOR))

        image = image.resize(new_size,Image.ANTIALIAS)
        exif = dict(image.getexif())
        exif = dict((ExifTags.TAGS[k], v) for k, v in exif.items() if k in ExifTags.TAGS)

        if exif['Orientation'] == 3:
            image=image.rotate(180, expand=True)
        elif exif['Orientation'] == 6 : 
            image=image.rotate(270, expand=True)
        elif exif['Orientation'] == 8 : 
            image=image.rotate(90, expand=True)

        #print(exif['DateTimeOriginal'])
        #print(exif['Orientation'])

        image.save(abs_file_l2, optimize=True, quality=90)

    def load_imagelist(self):
        images = []
        for root, _, files in os.walk(self.l1):
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext.lower() != ".jpg":
                    continue
                folder = root[len(self.l1):]
                images.append((folder, f))

        images = sorted(images, key=lambda x: get_date(os.path.join(self.l1, x[0], x[1])))
        images.reverse()

        return images

def get_date(image):
    file = Image.open(image)

    exif = dict(file.getexif())
    exif = dict((ExifTags.TAGS[k], v) for k, v in exif.items() if k in ExifTags.TAGS)

    return exif['DateTime']