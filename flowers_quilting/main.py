from .object_detection import object_detection
from .retrieve import retrieval
from .Patching import quilt
import os
import shutil


def augment(img):
    # num_block=input ("number of blocks you want :")
    num_block=10
    path = os.getcwd()+"\\detected_objects"
    shutil.rmtree(path,ignore_errors=True)
    os.mkdir(path)
    object_detection(img)
    # object_detection('Textures/sample5.png')
    retrieved=retrieval()
    texture=quilt(retrieved, (int(num_block), int(num_block)),True)
    # texture.show()
    return texture

if __name__ == "__main__":
    augment()

