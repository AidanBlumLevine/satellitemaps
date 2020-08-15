# Satellite to street maps

This is a website viewer of a pix2pix GAN model trained to convert satellite images to street maps.

The website is showing a section of New York City but you can move freely to anywhere in the globe.

You can move the preview with the arrow keys.

Demo: https://aidanblumlevine.github.io/satellitemaps

This repo also contains the code used to collect the satellite and street map pairs for training
If you run server.js and go to localhost:5000/generate, it will download a zip with 500 random pairs from around NYC
