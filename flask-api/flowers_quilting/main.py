from .object_detection import object_detection
from .retrieve import retrieval
# from binpacking import quilt
from .New_patching import augmentation, total_images_selected, total_images_drawn
import os
import shutil
import numpy as np
from PIL import Image
import glob


def augment(drawnImg, objRetrieval, style, draw=True):
    num_block = 15
    if draw:
        object_detection(drawnImg)
        similar_paths =retrieval()
        images = total_images_drawn(similar_paths, objRetrieval)
    else:
        images = glob.glob(os.getcwd()+"\\detected_objects\\*")
    texture = augmentation(images, num_block, style)
    return texture
    
if __name__ == "__main__":
    drawnImg = Image.open("test.jpg")
    augment(drawnImg).show()


