import numpy as np
import cv2
import os
import glob
from PIL import Image
def object_detection(path):
    image = cv2.imread(path)
    
    original = image.copy()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    canny = cv2.Canny(blurred, 120, 255, 1)
    kernel = np.ones((5,5),np.uint8)
    dilate = cv2.dilate(canny, kernel, iterations=1)

    # Find contours
    cnts = cv2.findContours(dilate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    # (cnts, _) = contours.sort_contours(cnts, method="left-to-right")
    num = 0
    for c in cnts:
        x,y,w,h = cv2.boundingRect(c)
        cv2.rectangle(image, (x, y), (x + w, y + h), (36,255,12), 2)
        ROI = original[y:y+h, x:x+w]
        ext='jpg' if path.split('.')[1]=='jpg' else 'png'
        base=os.path.basename(path)
        pat='detected_objects\/'
       
        img = Image.fromarray(ROI, 'RGB').save(pat+str(num)+base)
        num += 1
