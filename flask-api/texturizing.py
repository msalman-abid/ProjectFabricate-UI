# SPDX-FileCopyrightText: (c) 2021 Artyom Galkin <github.com/rtmigo>
# SPDX-License-Identifier: MIT
from math import floor
import os
from pathlib import Path
from typing import Tuple
import cv2
import numpy as np
import random
from PIL import Image, ImageDraw
import extcolors
from flowers_quilting import object_detection
import glob
from resizeimage import resizeimage

from PIL import Image  # importing with tweaked options


# todo Find a way to add dithering noise to 8-bit grading
#
# It looks like in 2021 Pillow cannot alpha-blend 16-bit or 32-bit images.
# So we need to keep our gradient mask in 8 bit.
#
# To avoid banding, we may want to create 16 or 32 bit gradient, and then
# convert it to dithered 8-bit version. But it seems, Pillow cannot do such
# conversion either (https://github.com/python-pillow/Pillow/issues/3011)
#
# So all colors are 8 bit now. Maybe we should find a way to add some random
# noise to out gradient. But Pillow will not create noise, we need to generate
# it pixel-by-pixel, and probably not in native Python


def horizontal_gradient_256_scaled(size: Tuple[int, int],
                                   reverse=True) -> Image:
    gradient = Image.new('L', (256, 1), color=None)
    for x in range(256):
        if reverse:
            gradient.putpixel((x, 0), x)
        else:
            gradient.putpixel((x, 0), 255 - x)

    return gradient.resize(size)


def vertical_gradient_256_scaled(size: Tuple[int, int], reverse=True) -> Image:
    gradient = Image.new('L', (1, 256), color=None)
    for x in range(256):
        if reverse:
            gradient.putpixel((0, x), x)
        else:
            gradient.putpixel((0, x), 255 - x)

    return gradient.resize(size)


def stripe_size(full_size: int, pct: float) -> int:
    if not 0 <= pct <= 0.5:
        raise ValueError(pct)
    result = floor(full_size * pct)
    assert result * 2 <= full_size
    return result


class Mixer:
    def __init__(self, source: Image, pct=1.0 / 3):
        self.source = source
        self.pct = pct

    @property
    def src_width(self) -> int:
        return self.source.size[0]

    @property
    def src_height(self) -> int:
        return self.source.size[1]

    @property
    def horizontal_stripe_width(self) -> int:
        return stripe_size(self.src_width, self.pct)

    @property
    def vertical_stripe_height(self) -> int:
        return stripe_size(self.src_height, self.pct)

    def _left_stripe_image(self):
        return self.source.crop(
            (0, 0, self.horizontal_stripe_width, self.src_height))

    def _right_stripe_image(self):
        return self.source.crop(
            (self.src_width - self.horizontal_stripe_width, 0,
             self.src_width, self.src_height))

    def _bottom_stripe_image(self):
        return self.source.crop(
            (0, self.src_height - self.vertical_stripe_height,
             self.src_width, self.src_height))

    def _to_rgba(self, image: Image) -> Image:
        if image.mode != 'RGBA':
            converted = image.convert('RGBA')
            assert converted is not None
            return converted
        return image

    def make_seamless_h(self) -> Image:
        stripe = self._to_rgba(self._right_stripe_image())
        stripe.putalpha(
            horizontal_gradient_256_scaled(stripe.size, reverse=False))

        overlay = Image.new('RGBA', size=self.source.size, color=0x00)
        overlay.paste(stripe, box=(0, 0))

        comp = Image.alpha_composite(self._to_rgba(self.source),
                                     overlay)

        comp = comp.crop((0,
                          0,
                          comp.size[0] - self.horizontal_stripe_width,
                          comp.size[1]))
        return comp

    def make_seamless_v(self) -> Image:
        stripe = self._to_rgba(self._bottom_stripe_image())
        stripe.putalpha(
            vertical_gradient_256_scaled(stripe.size, reverse=False))

        overlay = Image.new('RGBA', size=self.source.size, color=0x00)
        overlay.paste(stripe, box=(0, 0))

        comp = Image.alpha_composite(self._to_rgba(self.source),
                                     overlay)

        comp = comp.crop((0,
                          0,
                          comp.size[0],
                          comp.size[1] - self.vertical_stripe_height))
        return comp


def img2tex(src: Image, pct=0.25):
    mixer1 = Mixer(src, pct=pct)
    result = mixer1.make_seamless_h()

    mixer2 = Mixer(result, pct=pct)
    result = mixer2.make_seamless_v()
    if result.mode != "RGB":
        result = result.convert("RGB")
    
    return result

def tile(source: Image,
         horizontal: int = 3, vertical: int = 3) -> None:
    """Merges multiple copies of `source` image into the `target` image
    side-by-side."""
    image = source

    w, h = image.size
    total_width = w * horizontal
    total_height = h * vertical

    new_im = Image.new('RGB', (total_width, total_height))

    for x in range(horizontal):
        for y in range(vertical):
            new_im.paste(image, (w * x, h * y))

    return new_im

def apparel_generation(pattern: Image, templatePath: str, black = True):

    pattern = cv2.cvtColor(np.array(pattern), cv2.COLOR_RGB2BGR)
    masked = cv2.imread(templatePath)

    pattern=cv2.resize(pattern, (256,256),interpolation = cv2.INTER_AREA)
    masked=cv2.resize(masked, (256,256),interpolation = cv2.INTER_AREA)
    if black:
        thresh = cv2.threshold(masked,255, 0, cv2.THRESH_TRUNC)[1]
        result = pattern.copy()
        result= np.where(thresh==255, pattern, thresh)
        result[result==[36,28,237]]=255
    else:
        gray = cv2.cvtColor(masked, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU)[1]
        result = pattern.copy()
        result[thresh==0] = (255,255,255)
    result = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
    result = Image.fromarray(result)
    return result


def complementary_designs(img: Image, direction: str):
    img = img.resize((256,256))
    colors,_ = extcolors.extract_from_image(img)
    dim=500
    final_img =Image.new('RGB',(dim,dim),colors[0][0])
    draw_final_img = ImageDraw.Draw(final_img)
    dimensions=dim
    spacing=[2,4]
    if direction=='Checked' or direction=='Diagonal-Left' or direction=='Diagonal-Right':
        dimensions=dim*2
    spacing=random.choice(spacing)
    for i in range(0, dimensions, 15):
        if i%spacing==0:
            color=colors[2]
        else:
            color=colors[3]
        if direction=='Vertical':
            draw_final_img.line([(i, 0),(i,dim)], width=3,
                    fill=color[0])
        if direction=='Horizontal':
            draw_final_img.line([(0, i),(dim,i)], width=3,
                    fill=color[0])
        if direction=='Diagonal-Left':
            draw_final_img.line([(i, 0),(i-final_img.size[0],dim)], width=2,
                    fill=color[0])
        if direction=='Diagonal-Right':
            draw_final_img.line([(0, i-final_img.size[0]),(dim,i)], width=2,
                    fill=color[0])
        if direction=='Checked':
            draw_final_img.line([(0, i-final_img.size[0]),(dim,i)], width=2,
                    fill=color[0])
            draw_final_img.line([(i, 0),(i-final_img.size[0],dim)], width=2,
                    fill=color[0])
        if direction=="Zig-Zag":
            for i in range(0,256,10):
                for j in range(0,256,10):
                    # draw_final_img.line([(0, 0), (10,10),(20,0),(30,10),(40,0)], width=2, fill="green",joint="curve")
                    draw_final_img.line([(j+10,i),(j+30,i)], width=2, fill="green",joint="curve")
                    final_img.show()
                    break

    final_img = final_img.resize((256,256))

    return final_img



def dupatta(img: Image, choice: str): 
    if choice=="lines-bg":
        final_image=complementary_designs(img, 'Vertical')

    if choice=="plain-bg":
        colors,_ = extcolors.extract_from_image(img)
        final_image = Image.new('RGB',(500,500),colors[0][0])
    
    object_detection.object_detection(img, action='dupatta', m_dir='/../detected_dupatta/')

    for i in glob.glob(os.getcwd()+"\\detected_dupatta\\*"):
        print(i)
        patch=i

    patch=Image.open(patch)
    coord_list=[(20,20),(50,180),(190,100),(256,256),(150,279),(30,400),(410,410),(320,50),(240,390),(400,150)]

    for i in coord_list:
        final_image.paste(patch, (i[0],i[1]), mask =patch)

    final_image = resizeimage.resize_cover(final_image, [256, 256])
    return final_image


def post_processing(img: Image, choose):
    if choose == 1:
        pattern = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    elif choose == 2:
        pattern = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2HLS)
    elif choose == 3:
        pattern = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2HSV)
    elif choose == 4:
        pattern = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2LAB)
    result = Image.fromarray(pattern)
    return result
