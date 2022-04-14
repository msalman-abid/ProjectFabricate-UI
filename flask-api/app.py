from flask import Flask
from flask import request, json
from PIL import Image
import PIL
import os , io , sys
import numpy as np
import base64
import cv2
from skimage import transform
from texturizing import tile, img2tex, apparel_generation, complementary_designs
import glob
from pathlib import Path
import random
import shutil

from tensorflow.keras.models import load_model
import tensorflow as tf


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from flowers_quilting.main import augment

def image_to_bytes(img):
    rawBytes = io.BytesIO()
    img.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    return img_base64

def load_image(file,size=[256,256]):
    pixels = tf.convert_to_tensor(file)
    pixels = tf.cast(pixels, tf.float32)
    pixels = tf.image.resize(pixels, size, method= tf.image.ResizeMethod.BILINEAR)
    
    pixels = (pixels / 127.5) - 1
    pixels = tf.expand_dims(pixels, 0)
    # pixels = np.array(file).astype('float32')/255
    # pixels= transform.resize(pixels, (size[0], size[1], 3))
    # pixels = np.expand_dims(pixels, 0)
    return pixels

model = load_model('./Updated_ImagetoImage.h5')
print("[+] Model loaded successfully.")


# create directory tmp if not exist
if not os.path.exists('./tmp'):
    os.makedirs('./tmp')

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB
print("[+] Server started succesfully.")

@app.route('/')
def main():
    return "Hello World"

@app.route('/api/predict', methods=['POST'])
def predict():
    global model
    # print(request.files, file=sys.stderr)
    file = request.files['image'].read() ## byte file
    npimg = np.fromstring(file, np.uint8)
    img = cv2.imdecode(npimg,cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


	# ######### Do preprocessing here ################

    pixels = load_image(img)
    prediction = model(pixels, training=True)
    print("[+] Model prediction successful!") 
    prediction = ((prediction + 1) / 2.0) * 255

    #################################################
    
    prediction = np.array(prediction[0], dtype=np.uint8)
    img = Image.fromarray(prediction)
    
    ### Test autoencoder ###
    # save image as jpg
    img.save('./test.jpg')

    rawBytes = io.BytesIO()
    img.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    return {'status':str(img_base64), 'predicted': True}

@app.route('/api/augment', methods=['POST'])
def augment_me():
    path = os.getcwd()+"\\detected_objects"
    shutil.rmtree(path,ignore_errors=True)
    os.mkdir(path)

    file = request.files['image']
    style = int(request.form['style'])
    retrieval = int(request.form['retrieval'])
    image = Image.open(file)
    new_image = Image.new("RGBA", image.size, "WHITE") # Create a white rgba background
    new_image.paste(image, (0, 0), image)              # Paste the image on the background. Go to the links given below for details.
    new_image.convert('RGB')

    #convert PIL image to cv2
    img = np.array(new_image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    print(style, bool(style))
    print(retrieval, bool(retrieval))
    img = augment(img, bool(retrieval), bool(style))
    print("[+] Image augmentation successful!")
    rawBytes = io.BytesIO()
    img.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    return {'status':str(img_base64), 'augmented': True}

@app.route('/api/auto_enc', methods=['POST'])
def auto_enc():

    struc_file = request.files['image_tex']
    tex_file = request.files['image_struct']
    
    
    tex_image = Image.open(tex_file).convert("RGBA")
    struc_image = Image.open(struc_file).convert("RGB") # change to RGBA if need

    new_image = Image.new("RGBA", tex_image.size, "WHITE") # Create a white rgba background
    new_image.paste(tex_image, (0, 0), tex_image)              # Paste the image on the background. Go to the links given below for details.
    tex_image = new_image.convert('RGB')

    # save tex_image as jpg in tmp directory
    tex_image.save('./tmp/tex_image.jpg')
    # save struc_image as jpg in tmp directory
    struc_image.save('./tmp/struc_image.jpg')

    ### AUTO ENCODER SCRIPT ###

    ### END ###

    print("[+] Image swapping successful!")
    rawBytes = io.BytesIO()
    tex_image.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    return {'status':str(img_base64), 'augmented': True}

@app.route('/api/tiled', methods=['POST'])
def tiled():
    file = request.files['image']
    size = request.form['size']
    overlap = request.form['overlap']
    image = Image.open(file)

    image = img2tex(image, float(overlap))
    image = tile(image, int(size), int(size))

    img_base64 = image_to_bytes(image)

    print("[+] Image tiling successful!")

    mask = apparel_generation(image, "templates\mask.png")
    mask_base64 = image_to_bytes(mask)

    mask2 = apparel_generation(image, "templates\mask3.png")
    mask2_base64 = image_to_bytes(mask2)

    cushion = apparel_generation(image, "templates\cushion2.png")
    cushion_base64 = image_to_bytes(cushion)

    comp = complementary_designs(image, "Vertical")
    comp_base64 = image_to_bytes(comp)

    comp2 = complementary_designs(image, "Horizontal")
    comp2_base64 = image_to_bytes(comp2)

    comp3 = complementary_designs(image, "Diagonal-Left")
    comp3_base64 = image_to_bytes(comp3)

    comp4 = complementary_designs(image, "Diagonal-Right")
    comp4_base64 = image_to_bytes(comp4)

    comp5 = complementary_designs(image, "Checked")
    comp5_base64 = image_to_bytes(comp5)

    return {'status':str(img_base64), 'tiled': True, \
     'mask': str(mask_base64), 'mask2': str(mask2_base64), \
        'cushion': str(cushion_base64), 'complementary': str(comp_base64), \
        'complementary2': str(comp2_base64), 'complementary3': str(comp3_base64), 
        'complementary4': str(comp4_base64), 'complementary5': str(comp5_base64)}


@app.route('/api/recomm_sketch', methods=['GET'])
def recomm_sketch():
    
    total = 10
    path = os.getcwd()+"\\detected_objects"
    shutil.rmtree(path,ignore_errors=True)
    os.mkdir(path)
    paths = glob.glob(os.getcwd()+"\\flowers_quilting\\sketchy\\*.png")
    selected_paths = random.sample(paths, total)
    for i in selected_paths:
        try:
            shutil.copy(i, path)
        except:
            print("Error")

    images = {'-_-': 'bye', 'total': total}
    paths = sorted(glob.glob(os.getcwd()+"\\detected_objects\\*"))
    for i, elem in enumerate(paths):
        temp_img = Image.open(elem)
        rawBytes = io.BytesIO()
        temp_img.save(rawBytes, "JPEG")
        rawBytes.seek(0)
        img_base64 = base64.b64encode(rawBytes.read())
        images['result'+str(i)] = str(img_base64)
    return images

@app.route('/api/augment_recomm', methods=['POST'])
def augment_recomm():
    chkd_array = request.form['chkd_array']
    chkd_array = eval(chkd_array)

    paths = sorted(glob.glob(os.getcwd()+"\\detected_objects\\*"))

    # delete items in paths where chkd_array is 0
    for i, elem in enumerate(paths):
        if chkd_array[i] == 0:
            os.remove(elem)


    # Args: img, retreival, linewise, drawn
    img = augment(None, False, False, False) 
    print("[+] Recommended image augmentation successful!")
    
    rawBytes = io.BytesIO()
    img.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    
    return {'status':str(img_base64), 'recc_augmented': True}





if __name__ == '__main__':
    app.run()