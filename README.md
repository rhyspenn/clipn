# Clipn

A Raycast extension for clipboard and image management.

## Features

### Clipn Command
Get the newest cached file path from Raycast clipboard and copy it to your clipboard.

### Upload Image to Cloudinary
Upload image files to Cloudinary and get the URL copied to your clipboard.

### Get Terminal Path
Get the current working directory path from your terminal window and copy it to clipboard.

## Setup

### Cloudinary Configuration
To use the image upload feature, you need to configure your Cloudinary credentials:

1. Go to [Cloudinary](https://cloudinary.com) and create an account
2. Get your API credentials from the dashboard
3. In Raycast, go to Extensions → Clipn → Configure Extension
4. Enter your Cloudinary credentials:
   - **Cloud Name**: Your Cloudinary cloud name
   - **API Key**: Your Cloudinary API key  
   - **API Secret**: Your Cloudinary API secret

## Usage

### Clipn
1. Run the "Clipn" command
2. The newest cached file path will be copied to your clipboard

### Upload Image to Cloudinary  
1. Copy an image to your clipboard (either as a file path or directly copy an image)
2. Run the "Upload Image to Cloudinary" command
3. The image will be uploaded to Cloudinary
4. The secure URL will be copied to your clipboard

**Supported methods:**
- Copy image file path (e.g., `/path/to/image.png`)
- Copy image directly from applications (screenshots, etc.)
- Copy text containing image file path

### Get Terminal Path
1. Open iTerm2 or Terminal.app and navigate to any directory
2. Run the "Get Terminal Path" command
3. The current working directory path will be copied to your clipboard

**Supported terminals:**
- iTerm2 (recommended)
- Terminal.app (macOS built-in)
- Automatic detection of frontmost terminal

## Requirements

- Raycast
- Cloudinary account (for image upload feature)