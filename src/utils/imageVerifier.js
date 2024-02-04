const Vibrant = require("node-vibrant");
const Jimp = require("jimp");

// Helper function to determine if an image is "happy"
const isImageHappy = async (imagePath) => {
    try {
        const palette = await Vibrant.from(imagePath).getPalette();

        // For simplicity, this example checks for the presence of vibrant and warm colors
        const vibrantSwatch = palette.Vibrant;
        const isHappy = vibrantSwatch && vibrantSwatch.population > 0;

        return isHappy;
    } catch (error) {
        console.error("Error processing image:", error);
        return false;
    }
};

// Verify that all non-transparent pixels fall within a circle
const verifyAllPixelsInCircle = async (imagePath) => {
    try {
        const image = await Jimp.read(imagePath);

        // Trim the image to remove transparent pixels
        image.autocrop({ cropOnlyFrames: false });

        // Check if not a perfect circle after trim
        if (image.bitmap.height != image.bitmap.width) {
            console.log("Not a perfect circle, some pixels fell out of the circle.");
            return false;
        }

        // Calculate the radius based on half of the trimmed image's width
        const radius = Math.floor(image.bitmap.width / 2);

        const centerX = image.bitmap.width / 2; // Replace with the center X coordinate of your circle
        const centerY = image.bitmap.height / 2; // Replace with the center Y coordinate of your circle

        for (let y = 0; y < image.bitmap.height; y++) {
            for (let x = 0; x < image.bitmap.width; x++) {
                const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));

                // Calculate the distance between the current pixel and the circle's center
                const distanceToCenter = Math.sqrt(
                    (x - centerX) ** 2 + (y - centerY) ** 2
                );

                // Check if the pixel is outside the circle and non-transparent
                if (distanceToCenter > (radius + 3) && pixelColor.a !== 0) {
                    // Because it's a circle, we need to allow up to ~3px margin of error to handle the
                    // touching points, by taking into account a rounded dpi-ratio of 72px/25.4mm ~ 2.84
                    return false;
                }
            }
        }

        // All non-transparent pixels are inside the circle
        console.log('Image is valid.');
        return true;
    } catch (err) {
        console.error("Error processing image:", err);
        return false;
    }
};

module.exports = { verifyAllPixelsInCircle, isImageHappy };