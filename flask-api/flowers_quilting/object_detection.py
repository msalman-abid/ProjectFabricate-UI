from tokenize import endpats
import numpy as np
import cv2
import os
import glob
from PIL import Image
import matplotlib.pyplot as plt
from .transparent import convertImage


def object_detection(path, action="sketches", m_dir='/../detected_objects/'):
    image = None
    retrieved = False

    if type(path) == type(None):
        return

    if type(path) == str:
        image = cv2.imread(path)
        retrieved = True
        print('HERE')
        print(type(image))
    else:
        # image = path # assuming image format is already RGB
        image = np.array(path) 
        # Convert RGB to BGR 
        image = image[:, :, ::-1].copy() 
        print(type(image))

    original = image.copy()

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    canny = cv2.Canny(blurred, 120, 255, 1)
    kernel = np.ones((2,2),np.uint8)
    dilate = cv2.dilate(canny, kernel, iterations=1)
   
    # Find contours
    cnts = cv2.findContours(dilate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
   
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
   
    cnts = sorted(cnts, key=lambda x: cv2.contourArea(x),reverse=True)

    num = 0
   
    cnts=cnts[:1] if action=="dupatta" else cnts
    for c in range(len(cnts)):

        original = image.copy()
        x,y,w,h = cv2.boundingRect(cnts[c])
        temp=cnts.copy()
        temp.pop(c)
        for i in range(len(temp)):
           
            cv2.drawContours(original, [temp[i]],-1,(255,255,255), thickness = cv2.FILLED)
           
        if action=="dupatta":
            mask = np.zeros(original.shape[:2],np.uint8)
            cv2.drawContours(mask, [cnts[c]],-1,(255,255,255),thickness = cv2.FILLED)
            ROI = cv2.bitwise_and(original, original, mask=mask)
        else:
            ROI = original[y:y+h, x:x+w]
   
        base=os.path.dirname(os.path.abspath(__file__))
        base = base + m_dir
        if not retrieved:
            ext = '.png'
            end_path = base + str(num)+ext
        else:
            ext='.jpg' if path.split('.')[1]=='jpg' else '.png'
            orig_name = os.path.basename(path)
            end_path = base + str(num)+ orig_name.split('.')[0] + ext


        print(num, end_path)
        # ROI=cv2.cvtColor(ROI, cv2.COLOR_BGR2RGB)
        ROI = Image.fromarray(ROI)
        ROI=convertImage(ROI)
        ROI.save(end_path)

        num += 1
    
# object_detection('ww.jpeg')