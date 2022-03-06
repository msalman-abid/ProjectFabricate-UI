import numpy as np
from skimage import util
import heapq
from PIL import Image
from .object_detection import *
import glob
from resizeimage import resizeimage
import random

import cv2

def paddedzoom2(img, zoomfactor=0.8):
    
    ' does the same thing as paddedzoom '
    
    h,w ,_= img.shape
    M = cv2.getRotationMatrix2D( (w/2,h/2), 0, zoomfactor) 
    
    return cv2.warpAffine(img, M, (h,w), borderValue=(1,1,1))

def randomPatch(texture, block_size):
    h, w,_ = texture.shape
    i = np.random.randint(h - block_size)
    j = np.random.randint(w - block_size)
    patch=texture[i:i+block_size, j:j+block_size]
    choice=np.random.randint(1,6)
    if choice==1:
        # pat=paddedzoom2(patch)
        pat=np.flipud(patch)
    if choice==2:
        # pat=paddedzoom2(patch)
        pat=np.fliplr(patch)
    if choice==3:
        pat=paddedzoom2(np.flipud(np.fliplr(patch)))
    if choice==4:
        # pat=paddedzoom2(patch)
        pat= np.rot90(np.fliplr(patch))
    if choice==5:
        pat=paddedzoom2(patch)

    return pat
    # return texture[i:i+block_size, j:j+block_size]

def L2OverlapDiff(patch, block_size, overlap, res, y, x):
    error = 0
    if x > 0:
        left = patch[:, :overlap] - res[y:y+block_size, x:x+overlap]
        error += np.sum(left**2)

    if y > 0:
        up   = patch[:overlap, :] - res[y:y+overlap, x:x+block_size]
        error += np.sum(up**2)

    if x > 0 and y > 0:
        corner = patch[:overlap, :overlap] - res[y:y+overlap, x:x+overlap]
        error -= np.sum(corner**2)

    return error
 

def randomBestPatch(texture, block_size, overlap, res, y, x):
    h, w ,_= texture.shape
    errors = np.zeros((h - block_size, w - block_size))

    for i in range(h - block_size):
        for j in range(w - block_size):
            patch = texture[i:i+block_size, j:j+block_size]
    
            e = L2OverlapDiff(patch, block_size, overlap, res, y, x)
            errors[i, j] = e

    i, j = np.unravel_index(np.argmin(errors), errors.shape)
    patch=texture[i:i+block_size, j:j+block_size]
    choice=np.random.randint(1,5)
    if choice==1:
        pat=np.flipud(patch)
    if choice==2:
        pat=np.fliplr(patch)
    if choice==3:
        pat=np.fliplr(patch)
        pat=np.flipud(patch)
    if choice==4:
        pat= np.rot90(np.fliplr(patch))

    return pat
    



def minCutPath(errors):
    # dijkstra's algorithm vertical
    pq = [(error, [i]) for i, error in enumerate(errors[0])]
    heapq.heapify(pq)

    h, w = errors.shape
    seen = set()

    while pq:
        error, path = heapq.heappop(pq)
        curDepth = len(path)
        curIndex = path[-1]

        if curDepth == h:
            return path

        for delta in -1, 0, 1:
            nextIndex = curIndex + delta

            if 0 <= nextIndex < w:
                if (curDepth, nextIndex) not in seen:
                    cumError = error + errors[curDepth, nextIndex]
                    heapq.heappush(pq, (cumError, path + [nextIndex]))
                    seen.add((curDepth, nextIndex))

                    
def minCutPatch(patch, block_size, overlap, res, y, x):
    patch = patch.copy()
    dy, dx,_ = patch.shape
    minCut = np.zeros_like(patch, dtype=bool)

    if x > 0:
        left = patch[:, :overlap] - res[y:y+dy, x:x+overlap]
        leftL2 = np.sum(left**2, axis=2)
        for i, j in enumerate(minCutPath(leftL2)):
            minCut[i, :j] = True

    if y > 0:
        up = patch[:overlap, :] - res[y:y+overlap, x:x+dx]
        upL2 = np.sum(up**2, axis=2)
        for j, i in enumerate(minCutPath(upL2.T)):
            minCut[:i, j] = True

    np.copyto(patch, res[y:y+dy, x:x+dx], where=minCut)

    return patch


def isRectangleOverlap( R1, R2):
    if (R1[0]>=R2[2]) or (R1[2]<=R2[0]) or (R1[3]<=R2[1]) or (R1[1]>=R2[3]):
        return False
    else:
        return True

def make_square(im, min_size=255, fill_color=(255, 255, 255)):
    x, y = im.size
    size = max(min_size, x, y)
    new_im = Image.new('RGB', (size, size), fill_color)
    new_im.paste(im, (int((size - x) / 2), int((size - y) / 2)))
    return new_im

def quilt(image_path,num_block,random_place=False,block_size=254, mode="Best"):
    overlapping=[]
    images=[]

    for i in image_path[:4]:
        object_detection(i)
    folder='detected_objects'
    for i in glob.iglob(f'{folder}/*'):
        texture = Image.open(i)
        # texture = texture.convert("RGBA")
        # imgnp = np.array(texture)

        # white = np.sum(imgnp[:,:,:3], axis=2)
        # white_mask = np.where(white == 255*3, 1, 0)

        # alpha = np.where(white_mask, 0, imgnp[:,:,-1])

        # imgnp[:,:,-1] = alpha 

        # texture = Image.fromarray(np.uint8(imgnp))

        texture=texture.resize((255,255))
        # texture=make_square(texture)
        texture=util.img_as_float(texture)
        images.append(texture)
    overlap = block_size // 6
    num_blockHigh, num_blockWide = num_block
    h = (num_blockHigh * block_size) - (num_blockHigh - 1) * overlap
    w = (num_blockWide * block_size) - (num_blockWide - 1) * overlap
    res = np.ones((h, w,3))
    for i in range(num_blockHigh):
        for j in range(num_blockWide):
            choice=random.choice(images)
            text=choice
            y = i * (block_size - overlap)
            x = j * (block_size - overlap)

            if i == 0 and j == 0 or mode == "Best":
                patch = randomPatch(text, block_size)
            elif mode == "Best":
                patch = randomBestPatch(text, block_size, overlap, res, y, x)
            elif mode == "Cut":
                patch = randomBestPatch(text, block_size, overlap, res, y, x)
                patch = minCutPatch(patch, block_size, overlap, res, y, x)
    
            if not random_place:
                res[y:y+block_size, x:x+block_size] = patch
            else:
        
                jitter = block_size * 0.1
                y = np.random.randint(0, h - block_size)
                x = np.random.randint(0, w - block_size)
                y = np.clip(y + np.random.randint(-jitter, jitter), 0, h - block_size)
                x = np.clip(x + np.random.randint(-jitter, jitter), 0, w - block_size)
                
            ran=random.randint(0,2)
            if ran==1 :
                if overlapping==[]:
                    overlapping.append([x,y,x+block_size,y+block_size])
                else:
                    exists_x=True
                    while exists_x!=False:
                        jitter = block_size * 0.1
                        y = np.random.randint(0, h - block_size)
                        x = np.random.randint(0, w - block_size)
                        y = np.clip(y + np.random.randint(-jitter, jitter), 0, h - block_size)
                        x = np.clip(x + np.random.randint(-jitter, jitter), 0, w - block_size)
                    
                        rect=[x,y,x+block_size,y+block_size]
                        for v in overlapping:
                            if isRectangleOverlap(v,rect)==False:
                                exists_x=False
                                continue
                            else:
                                exists_x=True
                                break

                    overlapping.append([x,y,x+block_size,y+block_size])
                res[y:y+block_size, x:x+block_size] = patch
            else:
                continue

    img=Image.fromarray((res*255).astype(np.uint8))
    img=resizeimage.resize_cover(img, [256, 256])
    # img.save("output_new.png", bitmap_format='png')
    return img
