# Satellite to street maps

This is a website viewer of a pix2pix GAN model trained to convert satellite images to street maps.

The website is showing a section of New York City but you can move freely to anywhere in the globe.

You can move the preview with the arrow keys.

Demo: https://aidanblumlevine.github.io/satellitemaps

This repo also contains the code used to collect the satellite and street map pairs for training.

The model definitely needs to be trained longer for good results, but it is still interesting:

![example](https://github.com/AidanBlumLevine/satellitemaps/blob/main/map2.png)

If you run server.js and go to localhost:5000/generate, it will download a zip with 500 random pairs from around NYC.

In this example, you can notice that some tiles are strangely accurate. This is because this model was trained on random tiles from New York City, so once in a while it has seen one of these tiles before:
![example](https://github.com/AidanBlumLevine/satellitemaps/blob/main/map2.png)
