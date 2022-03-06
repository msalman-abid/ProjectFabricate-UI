from object_detection import object_detection
from retrieve import retrieval
from Patching import quilt
import os
import shutil


def main():
    # num_block=input ("number of blocks you want :")
    num_block=10
    path = os.getcwd()+"\\detected_objects"
    shutil.rmtree(path,ignore_errors=True)
    os.mkdir(path)
    object_detection('textures/sample5.png')
    retrieved=retrieval()
    texture=quilt(retrieved, (int(num_block), int(num_block)),True)
    texture.show()
    











main()

