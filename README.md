# Un-CNN

# Inspiration
The advancement of image classification, notably in facial recognition, has some very interesting applications. Microsoft and Amazon currently provide facial recognition services to parties ranging from corporations checking on their employees, to law enforcement officials locating serious criminals. This invasive method of facial recognition is problematic ethically, but brings forward an interesting concept:

With an increasing dependence on ML/DL and computer vision, is there a method whereby state-of-the-art system can be fooled? Inversely, is there a method to help future facial recognition models overcome spoofing?

We are a team of students with an interest in Deep Learning and Computer Vision, as well as academic researcher experience in the field (ML applied to Astrophysics, Engineering, etc.). As such, we were interested in exploring projects that expanded our views on these topics with some real-world application.

We wanted to create software to mask the identity of a person's photo to current image/facial recognition systems, as well as help future models overcome masking.

We looked at two major objectives for this project:

1) Allow people to maintain their privacy.

An employer may search a job candidate's LinkedIn photo using existing facial recognition software to see appearances in in crime databases, or other online sources. Personal and Professional personas often differ, and as such, there should be a method to restrict invasive image or facial recognition. Our software should pass a person's photo through a model to add perturbations to the image and return an image that looks the same to the human-eye, but is unrecognizable to a computer-vision algorithm.

2) Help developers build more robust image classification models.

A tool to trick existing models can be applied to improve future models. Developers may use this tool to include some spoofed images in their train set to help the model not be tricked. As a library, this could be a useful data augmentation tool is something we are considering.

When first looking for academic inspiration, we referred to this paper, which looks at how changing certain pixels shifts the image's classification in vector space after being processed through a model; this may force a network to provide the incorrect classification, without significantly changing how the photo itself looks. We also looked at this article which points out how using a gradient method may help intentionally misclassify an image by applying adversarial perturbations, and limiting their viability with a constraint. The classic example is classifying a Panda as a Vulture using the GoogLeNet model. The original source of the article is this paper

# How it Works
Fast Gradient Sign Method

Traditional neural networks update and improve through gradient descent and backpropagation -- a process whereby an input is fed into a randomly initialized network, the model's prediction for the input is compared to the true value for the input, and the network's weights/biases are updated to more closely match the desired (correct) output. This process is repeated thousands of times over many inputs to train a model.

To trick an image recognition model, the above process can be applied not to the model, but to the picture. An image may be passed into the model, and the output can be compared to a desired output. After this comparison, the photo may be tweaked (gradient descent) through adversarial perturbations many thousands of times (backpropagation) to create an image mask that the network identifies as the desired output. This image often is a noise of pixels that is not understandable to humans. As such, it acts as a mask, or a filter, that can be partially applied to the original image. A constraint restricts how visible the mask is, to ensure the image looks similar to the original to humans. The data may be inserted, but the mask would not be visible.

An example of this is in the below figure. A photo of a panda that is passed into a model can be compared to the output of a nematode classification. Using the Fast Gradient Sign Method, the nematode filter is applied to the panda image. The resulting composite image may look the same due to the constraint on the filter, but the image recognition network will grossly misclassify it.

(https://brunolopezgarcia.github.io/img/adversarial_faces/panda_adversarial.png)

However, this approach is time-consuming as it requires multiple cycles to add perturbations to an image. It also requires a pointer to another class to adapt the input image to. Lastly, it is also quite possible to overcome this method by simply adding images with perturbations to a training set when creating a model. At a high-level, an algorithm can be constructed with inspiration from this paper:

Algorithm: Gradient Method

y = input vector

n = gradient of y

nx = sign of gradient at each pixel

x = x+f(nx) which generates adversarial input

return x _

This method works as neural networks are vulnerable to adversarial perturbation due to their linear nature. These linear deep models are significantly impacted by a large number of small variations in higher dimensions, such as that of the input space. These facial recognition models have not been proven to understand the task at hand, and are instead simply "overly confident at points that do not occur in the data distribution" (from Goodfellow's paper).

Generative Adversarial Networks

A cleverer solution can be applied with the use of GANs, which are a huge area of research in machine vision currently. At a high level, GANs can piece together an image based on other images and textures. After applying an imperceptible perturbation with a GAN, it is possible for an image recognition model to completely misclassify an image by maximizing prediction error. There are many ways to approach this, such as adding a new object to an image that seems to fit in to distort the classifying algorithm, or by implementing some mask-like approach as seen above into the image that retains the original image's characteristics. The approach we chose to look at would take an adversarial gradient computed using the above method in addition to a GAN and apply it to create a new image from the original and the mask.

GANs are extremely interesting but can be computationally expensive to compute and implement. One potential implementation outlined here.

# Our Implementation
Image/Facial Recognition

The image recognition is done using an implementation of Inception-v3, ImageNet and Facenet.The paper of this pre-trained algorithm is found here. Inception is a CNN model that has proven to be quite robust. Trained on ImageNet, the baseline image recognition model V3 has been trained on over a thousand different classes. Facenet uses the Inception model, and we applied transfer learning from the ImageNet application to Facenet, which has learned over 10K identities based on over 400K face images. We also added the face of Drake (the musician) to this model. This model, made in Python using _ Keras _ (TensorFlow backend) allows the text classification/recognition of an input image, and serves as the baseline model that we chose to attack and exploit. When calling the function to classify an image, the image is loaded and resized to 300x300 pixels and intensities are scaled. Thereafter, a dimension is added to the image to work with it in Keras. The image is then passed through our modified Inception_ImageNet_Facenet model, and a class outputted, along with a confidence. Please note that the pre-trained model in the GitHub code uses the default Inception model, as the size of the model and execution time were factors that crashed our NodeJS implementation. Our custom model will be demoed and available later.

Modifier

In Python, Keras, Numpy and the Python Image Library were used to implement the Fast Gradient Sign Method to modify photos of a person's face. The first and last layers of the facial recognition CNN are referenced, a baseline object chosen to match gradients with (we use a Jigsaw piece because it was efficient at finding gradients for human faces), and the image to transform is loaded. The input image is appropriately scaled, and the constraints defined. A copy of the image made, and a learning rate is defined. We chose a learning rate of 5, which is extremely high, but allows for quick execution and output. A lower learning rate will likely result in a slower but better mask. Keras is used to define cost a gradient calculation functions, and the resultant master function is called in a loop until the cost exceeds a threshold. At each iteration, the model prints the cost. After the mask is chosen and applied to the image of a person's face with constraints, the image is normalized once again, and returned to the user. The output is relatively clean and maintains the person's facial features and the general look of the image. We decided not to implement a GAN as it was extremely difficult to train, and to meaningfully implement. Moreover, it did not provide results superior to the Fast Gradient Sign Method. A potential implementation of the model is a first a boundary equilibrium GAN to generate photos from the source image, then a conditional GAN, and finally a Pix2Pix translation to translate the mask onto a new image. The code to implement this solution is available, but not well-developed.

User Interface

We used HTML and CSS to create an extremely basic front-end to allow a user to drag and drop and image into the model. The image is first classified, then the modifications made, and the final classification outputted after modification. The image is also returned. The back-end of the application is in NodeJS and ExpressJS. The model takes a considerably long time to compile, and this underdeveloped front-end may exceed the 60s time the NodeJS server may run for, for some images.

# Challenges we ran into
Finding and training a facial recognition model proved difficult. Most high-quality models by companies such as Amazon and Microsoft that are state-of-the-art and applied in industry are closely guarded secrets. As such, we needed to find a model that worked generally well at facial recognition. We found Inception V3 to be a good baseline to know 1000 general classes, and Facenet to be a great application of transferring learning from this base to facial recognition. As such, our initial problem was solved.

Second, we ran into the problem of how to modify the images. The initial approaches we took with logistic regression and pixel removal were slow, or modified the image too heavily to the point that it lost meaning, and human tests would also fail to classify the image. We had to work to tune parameters of our model to get a version that worked effectively for face classification.

Lastly, working with GANs proved difficult. Training these models requires extensive computational power and time. As such, we were unable to effectively train a GAN model in the time allotted.

# Accomplishments that we're proud of
We used a recognizable face to test that we could trick a CNN. Aubrey Graham (Drake) is a Toronto-based musician that is also an alum at my high school. He has strong facial features making him recognizable to the human eye. Drake's face was detected at 97.22% confidence through our modified Inception model's initial predictions. A reconstructed image through our model can be passed into the Inception model and will yield 4.12% confidence that the image is a bassoon (the highest likelihood). Although the two are in the music sub-genre, we are proud to see that our model can change an image's data enough to misclassify it without making it look significantly different to the human eye.

# What we learned
We expanded our knowledge on machine vision and CNN-based deep learning. We were exposed to the concept of GANs and their implementations. We also learned that exploitation and tricking of current image recognition and general neural network models is an area of intense research, as it has the capacity to cause damage. For example, if one were to apply a filter or a mask to the video feed of a self-driving car, it is possible that the machine vision model used to drive may misinterpret a red light for a green light, and crash. Exploring this area will be very interesting in the coming months.

# What's next for Un-CNN
We want to further explore GAN implementations, and speed up the model. GANs seem to be an extremely powerful tool for this application, that could be robust in fooling models while maintaining recognizably. Also, it would be interesting to reverse engineer current state-of-the-art facial recognition models such as Microsoft's Face API Model, which is used by corporates and law enforcement in the real-world. In doing so, we could use that model to calculate gradients and modify images to fool it.

# Research
https://arxiv.org/pdf/1412.6572.pdf https://brunolopezgarcia.github.io/2018/05/09/Crafting-adversarial-faces.html https://medium.com/@ageitgey/machine-learning-is-fun-part-8-how-to-intentionally-trick-neural-networ-97a379b2 https://medium.com/@mahendrakariya/paper-discussion-explaining-and-harnessing-adversarial-examples-908a1b7123b5 https://github.com/akshaychawla/Adversarial-Examples-in-PyTorch https://arxiv.org/pdf/1801.00349.pdf


