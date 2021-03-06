# -*- coding: utf-8 -*-
"""
Created on Sun Nov 25 00:57:24 2018

@author: Drew
"""

import numpy as np
from keras.preprocessing import image
from keras.applications import inception_v3

# Load pre-trained image recognition model
model = inception_v3.InceptionV3()

# Load the image file and convert it to a numpy array
img = image.load_img("C:/Users/Drew/Desktop/Un-CNN/hacked-image.png", target_size=(299, 299))
input_image = image.img_to_array(img)

# Scale the image so all pixel intensities are between [-1, 1] as the model expects
input_image /= 255.
input_image -= 0.5
input_image *= 2.

# Add a 4th dimension for batch size (as Keras expects)
input_image = np.expand_dims(input_image, axis=0)

# Run the image through the neural network
predictions = model.predict(input_image)

# Convert the predictions into text and print them
predicted_classes = inception_v3.decode_predictions(predictions, top=1)
imagenet_id, name, confidence = predicted_classes[0][0]
print("This is a {} with {:.4}% confidence!".format(name, confidence * 100))