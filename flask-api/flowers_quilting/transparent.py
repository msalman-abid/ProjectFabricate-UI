from PIL import Image
import cv2
import glob
import os
import numpy as np
def convertImage(img,action="sketches"):
   
    img = img.convert("RGBA")
    
    datas = img.getdata()
    newData = []
    if action=='sketches':
        for item in datas:
            
            # print(item)
            if item[0] >200 and item[1] >200 and item[2] >200:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
    if action=='dupatta':
         for item in datas:
            # print(item)
            if item[0] == 0 and item[1] == 0 and item[2] == 0:
                
                newData.append((255, 255, 255,0))
            else:
                newData.append(item)
            
  
    img.putdata(newData)

    return img
