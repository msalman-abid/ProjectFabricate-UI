from .object_detection import object_detection
from .retrieve import retrieval
# from binpacking import quilt
from .New_patching import patch_img
import os
import shutil
import numpy as np
from PIL import Image


def augment(img, objRetrieval, style):
    patches=15
    path = os.getcwd()+"\\detected_objects"
    shutil.rmtree(path,ignore_errors=True)
    os.mkdir(path)
    object_detection(img)
    retrieved=retrieval()
    texture = patch_img(retrieved,patches,objRetrieval,style,5)
    return texture
    
if __name__ == "__main__":
    img = Image.open("test.jpg")
    augment(img).show()


