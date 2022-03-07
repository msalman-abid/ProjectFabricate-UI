from flask import Flask
from flask import request, json
from PIL import Image
import PIL
import os , io , sys
import numpy as np
import base64
import cv2
from skimage import transform
from tensorflow.keras.models import load_model
import tensorflow as tf


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from flowers_quilting.main import augment

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

model = load_model('./model_1500.h5')
print("[+] Model loaded successfully.")

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
    rawBytes = io.BytesIO()
    img.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    return {'status':str(img_base64), 'predicted': True}

@app.route('/api/augment', methods=['POST'])
def augment_me():

    file = request.files['image']
    image = Image.open(file)
    new_image = Image.new("RGBA", image.size, "WHITE") # Create a white rgba background
    new_image.paste(image, (0, 0), image)              # Paste the image on the background. Go to the links given below for details.
    new_image.convert('RGB')

    #convert PIL image to cv2
    img = np.array(new_image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    img = augment(img)
    print("[+] Image augmentation successful!")
    rawBytes = io.BytesIO()
    img.save(rawBytes, "JPEG")
    rawBytes.seek(0)
    img_base64 = base64.b64encode(rawBytes.read())
    return {'status':str(img_base64), 'augmented': True}

if __name__ == '__main__':
    app.run()    


