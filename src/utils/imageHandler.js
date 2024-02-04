const sharp = require("sharp");
const path = require("path");

const resizeImage = async (width, height, imagePath, outputImagePath = null) => {
    if(!outputImagePath) {
        const directory = path.dirname(imagePath);
        const extension = path.extname(imagePath);
        const filenameWithoutExtension = path.basename(imagePath, extension);

        // Construct the new filename with the "resized" suffix
        const resizedFilename = `${filenameWithoutExtension}-resized${extension}`;

        // Construct the full path for the resized image
        outputImagePath = path.join(directory, resizedFilename);
    }

    const convertedImagePath = await sharp(imagePath)
        .resize(width, height)
        .toFile(outputImagePath);

    if(convertedImagePath) {
        return outputImagePath;
    }

    return null;
};

module.exports = { resizeImage };