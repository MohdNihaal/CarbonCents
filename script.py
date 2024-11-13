from clarifai.client import Model

# Your Personal Access Token (PAT)
pat = "74a15755efff4b7bbbb268b54716c96c"  # Make sure it's correct

# Clarifai Model URL
model_url = "https://clarifai.com/clarifai/main/models/general-image-recognition"

# Image URL to analyze
image_url = "https://s3.amazonaws.com/samples.clarifai.com/featured-models/image-captioning-statue-of-liberty.jpeg"

# Predicting the image using the Clarifai model
model_prediction = Model(url=model_url, pat=pat).predict_by_url(image_url, input_type="image")

# Get the output and print the concepts
print(model_prediction.outputs[0].data.concepts)
