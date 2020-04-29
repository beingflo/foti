import os, os.path
import logging
from PIL import Image, ExifTags

L2_RESIZE_FACTOR = 8
L1_RESIZE_FACTOR = 2

class Store:
    def __init__(self, l0, l1, l2):
        self.l0 = l0
        self.l1 = l1
        self.l2 = l2

        self.imagelist = self.load_imagelist()
    
    def get_image_l1(self, name):
        name = os.path.join(self.l1, name)

        image = Image.open(name)

        return image

    def get_image_l2(self, name):
        name = os.path.join(self.l2, name)

        image = Image.open(name)

        return image

    def get_imagelist(self):
        return self.imagelist

    def generate_store(self):
        images_dict_l1 = {}
        images_dict_l2 = {}

        for root, _, files in os.walk(self.l1):
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext.lower() != ".jpg":
                    continue
                folder = root[len(self.l1):]
                name = folder + "/" + f

                images_dict_l1[name] = 0

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
            if not name in images_dict_l1:
                self.generate_l1(folder, file)
            if not name in images_dict_l2:
                self.generate_l2(folder, file)

        logging.info("Checking caches complete")

    def generate_l1(self, path, file):
        self.generate_compressed(path, file, 'l1')

    def generate_l2(self, path, file):
        self.generate_compressed(path, file, 'l2')
    
    def generate_compressed(self, path, file, level):
        if level == 'l1':
            lpath = self.l1
            quality = 80
            resize_factor = L1_RESIZE_FACTOR
        elif level == 'l2':
            lpath = self.l2
            quality = 90
            resize_factor = L2_RESIZE_FACTOR

        abs_path_l0 = os.path.join(self.l0, path)
        abs_file_l0 = os.path.join(abs_path_l0, file)

        abs_path_lx = os.path.join(lpath, path)
        abs_file_lx = os.path.join(abs_path_lx, file)

        logging.info("Generating {} image for {}".format(level, abs_file_l0))
        
        if not os.path.exists(abs_path_lx):
            os.makedirs(abs_path_lx)

        image = Image.open(abs_file_l0)

        new_size = (int(image.size[0] / resize_factor), int(image.size[1] / resize_factor))
        image = image.resize(new_size, Image.ANTIALIAS)

        exif = dict(image.getexif())
        exif = dict((ExifTags.TAGS[k], v) for k, v in exif.items() if k in ExifTags.TAGS)

        if exif['Orientation'] == 3:
            image=image.rotate(180, expand=True)
        elif exif['Orientation'] == 6 : 
            image=image.rotate(270, expand=True)
        elif exif['Orientation'] == 8 : 
            image=image.rotate(90, expand=True)

        image.save(abs_file_lx, optimize=True, quality=quality)

    def load_imagelist(self):
        images = []
        for root, _, files in os.walk(self.l0):
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext.lower() != ".jpg":
                    continue
                folder = root[len(self.l0):]
                images.append((folder, f))

        images = sorted(images, key=lambda x: get_date(os.path.join(self.l0, x[0], x[1])))
        images.reverse()

        return images

def get_date(image):
    file = Image.open(image)

    exif = dict(file.getexif())
    exif = dict((ExifTags.TAGS[k], v) for k, v in exif.items() if k in ExifTags.TAGS)

    if 'DateTimeOriginal' in exif:
        return exif['DateTimeOriginal']
    else:
        return exif['DateTime']
