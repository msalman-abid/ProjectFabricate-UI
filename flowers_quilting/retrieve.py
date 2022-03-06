# Import the libraries
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.models import Model
from pathlib import Path
from PIL import Image
import os
import matplotlib.pyplot as plt
import numpy as np
from resizeimage import resizeimage

def make_square(im, min_size=224, fill_color=(255, 255, 255)):
    x, y = im.size
    size = max(min_size, x, y)
    new_im = Image.new('RGB', (size, size), fill_color)
    new_im.paste(im, (int((size - x) / 2), int((size - y) / 2)))
    return new_im
class FeatureExtractor:
    def __init__(self):
        # Use VGG-16 as the architecture and ImageNet for the weight
        base_model = VGG16(weights='imagenet')
        # Customize the model to return features from fully-connected layer
        self.model = Model(inputs=base_model.input, outputs=base_model.get_layer('fc1').output)
    def extract(self, img):
        # Resize the image
        img=make_square(img)
        # img = img.resize((224, 224))

        # Convert the image color space
        img = img.convert('RGB')
        # Reformat the image
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        # Extract Features
        feature = self.model.predict(x)[0]
        return feature / np.linalg.norm(feature)
      

from PIL import Image
#from feature_extractor import FeatureExtractor
from pathlib import Path
import numpy as np
count = 0 
# if __name__ == '__main__':
#     fe = FeatureExtractor()

    # for img_path in sorted(Path("C:/Users/aiman/OneDrive/Desktop/fyp/sketchy/").glob("*.png")):
    #     count+=1 
    #     feature = fe.extract(img=Image.open(img_path))
    #     feature_path = Path("C:/Users/aiman/OneDrive/Desktop/fyp/Image-Quilting/flowers_feature_array/") / (img_path.stem + ".npy")  
    #     np.save(feature_path, feature)
    # print(count)



# Import the libraries
import matplotlib.pyplot as plt
import numpy as np
import glob
# Insert the image query

def retrieval(folder='C:\\Users\\Salman\\Documents\\GitHub\\ProjectFabricate-UI\\flowers_quilting\\detected_objects'):
    fe = FeatureExtractor()
    features = []
    img_paths = []
    lst=[]
    images=[]
    for feature_path in Path("C:\\Users\\Salman\\Documents\\GitHub\\ProjectFabricate-UI\\flowers_quilting\\flowers_feature_array\\").glob("*.npy"):
        features.append(np.load(feature_path))
        img_paths.append("C:\\Users\\Salman\\Documents\\GitHub\\ProjectFabricate-UI\\flowers_quilting\\sketchy\\"+feature_path.stem + ".png")

    features = np.array(features)
    for image in glob.iglob(f'{folder}/*'):
        images.append(image)
        print(image)
    
    for image in images:
        img = Image.open(image)
        # plt.imshow(img)
        # Extract its features
        query = fe.extract(img)
        # Calculate the similarity (distance) between images
        dists = np.linalg.norm(features - query, axis=1)
        # Extract 30 images that have lowest distance
        ids = np.argsort(dists)[:2]
        scores = [(dists[id], img_paths[id]) for id in ids]
        for i in scores:
            lst.append(i[1])
    return lst

if __name__ == "__main__":
    retrieval()