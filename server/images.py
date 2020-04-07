import os, os.path

def load_images(path):
    images = []
    for root, _, files in os.walk(path):
        for f in files:
            ext = os.path.splitext(f)[1]
            if ext.lower() != ".jpg":
                continue
            folder = "/" + root[len(path):]
            filename = f
            images.append((folder, filename))

    images = sorted(images, key=lambda x: x[1])
    images.reverse()
    return images