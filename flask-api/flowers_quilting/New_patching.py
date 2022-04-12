
from matplotlib import image
from numpy import asarray
import numpy as np
from datetime import datetime
import cv2
from random import randrange
from scipy import ndimage
from .object_detection import *
from skimage import util
import PIL.Image
from resizeimage import resizeimage
from PIL import ImageFilter
import random


def isRectangleOverlap(R1, R2):
    if (R1[0] >= R2[2]) or (R1[2] <= R2[0]) or (R1[3] <= R2[1]) or (R1[1] >= R2[3]):
        return False
    else:
        return True

# Drawn on UI
def total_images_drawn(image_path,retrieval=False):
    images = []
    if retrieval:
        for i in image_path[:4]:
            object_detection(i)

    folder = os.getcwd()+'\\detected_objects'
    for i in glob.iglob(f'{folder}/*'):
        images.append(i)

    return images

# Selected from UI
def total_images_selected(image_path):
    images = []
    for i in image_path:
        object_detection(i)
    folder = os.getcwd()+'\\detected_objects'
    for i in glob.iglob(f'{folder}/*'):
        images.append(i)
    return images

def randomRotation(patch):
    rotation = np.random.randint(1, 5)
    if rotation == 1:
        patch = np.flipud(patch)
    if rotation == 2:
        patch = np.fliplr(patch)
    if rotation == 3:
        patch = np.flipud(np.fliplr(patch))
    if rotation == 4:
        patch = np.rot90(np.fliplr(patch))
    return patch

def chooseSize(patch):
    sizes = np.random.randint(1, 3)
    if sizes == 2:
        size = random.randint(200, 350)
        patch = Image.fromarray(patch)
        patch = resizeimage.resize_contain(patch, [size, size])
        patch = patch.filter(ImageFilter.EDGE_ENHANCE_MORE)
        patch = asarray(patch)
    if sizes == 1:
        size = random.randint(350, 600)
        patch = cv2.resize(patch, (size, size),
                            interpolation=cv2.INTER_AREA)
    return patch

def gridStyle(images, size, img):
    block_size = round(img.shape[0]/size)
    num_block = round(img.shape[0]/block_size)
    for i in range(num_block):
        for j in range(num_block):
            y = i * (block_size-1)
            x = j * (block_size-1)
            choice = random.choice(images)
            patch = cv2.imread(choice, cv2.IMREAD_UNCHANGED)
            if patch.shape[0] >= block_size or patch.shape[1] >= block_size:
                patch = Image.fromarray(patch)
                patch = resizeimage.resize_cover(
                    patch, [block_size, block_size])
                patch = patch.filter(ImageFilter.EDGE_ENHANCE_MORE)
                patch = asarray(patch)
            else:
                patch = cv2.resize(
                    patch, (block_size, block_size), interpolation=cv2.INTER_AREA)
                patch = Image.fromarray(patch)
                patch = patch.filter(ImageFilter.EDGE_ENHANCE_MORE)
                patch = asarray(patch)

            idx = patch[:, :, 3] == 255
            p_h, p_w, _ = patch.shape
            h, w, _ = img.shape
            img[y: y + block_size, x: x + block_size, :][idx] = (0, 0, 0)
    return img

def patchStyle(img, images):
    num_block = round(img.shape[0]**2/600**2)-1
    overlapping = []
    for i in range(num_block):
        if i <= num_block:
            choice = random.choice(images)
            patch = cv2.imread(choice, cv2.IMREAD_UNCHANGED)


            patch = randomRotation(patch)
            patch = chooseSize(patch)

        idx = patch[:, :, 3] == 255
        p_h, p_w, _ = patch.shape
        h, w, _ = img.shape

        if overlapping == []:
            x = randrange(w - p_w)
            y = randrange(h - p_h)
            rect = [x, y, x+p_w, y+p_h]
            img[y: y + p_h, x: x + p_w, :][idx] = (0, 0, 0)
            overlapping.append(rect)
        else:
            exist, num = False, 0
            while not exist:
                # if num >= 30:
                #     exist = True
                #     break

                x, y  = randrange(w - p_w),  randrange(h - p_h)
                rect = [x, y, x+p_w, y+p_h]
                boxes = []
                for v in overlapping:
                    if isRectangleOverlap(v, rect):
                        boxes.append(v)
                if boxes == []:
                    exist = True
                else:
                    coord_rect = [(i, j) for i in range(x, x+p_w)
                                    for j in range(y, y+p_h)]
                    for box in boxes:
                        coord_box = [(i, j) for i in range(box[0], box[2])
                                        for j in range(box[1], box[3])]
                        intersect = set(coord_rect) & set(coord_box)

                        for i, j in intersect:
                            exist = True
                            if img[j, i].tolist() == [0, 0, 0]:
                                exist = False
                                break
                        if not exist:
                            break
                    num += 1
            # if num >= 30:
            #     continue
            rect = [x, y, x+p_w, y+p_h]
            overlapping.append(rect)
            img[y: y + p_h, x: x + p_w, :][idx] = (0, 0, 0)
    return img

def augmentation(images, num_block, grid=False, size=5):
    img = np.ones((2000, 2000, 3), dtype="uint8")
    img.fill(255)
    h, w, _ = img.shape
    if grid: 
        img = gridStyle(images, size, img)
    else:
        img = patchStyle(img, images)
    img = Image.fromarray(img)
    img = resizeimage.resize_cover(img, [256, 256])
    img = img.filter(ImageFilter.EDGE_ENHANCE_MORE)
    return img