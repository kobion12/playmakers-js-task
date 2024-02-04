const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { resizeImage } = require("../utils/imageHandler");
const { isImageHappy, verifyAllPixelsInCircle } = require("../utils/imageVerifier");
const { BADGE_DEFAULTS, PUBLIC_DIR } = require("../config");
const { sendErrorResponse, sendSuccessResponse } = require("../utils/utils");

// Gets an image path and sets an output object with the parsed image and its info
const parseImage = async (imagePath, outputObject) => {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    outputObject.image = image;
    outputObject.height = metadata.height;
    outputObject.width = metadata.width;
    outputObject.format = metadata.format;
}

exports.handleBadgeUpload = async (req, res) => {
    if (!req.files || !req.files.image) {
        return sendErrorResponse(res, "No image uploaded.", null, 400);
    }

    if (!req.body.user_id) {
        return sendErrorResponse(res, "No user ID provided.", null, 400);
    }

    try {
        let imagePath = req.files.image.tempFilePath;
        const parsedImage = {};
        await parseImage(imagePath, parsedImage);

        // Verifying badge format and convert to PNG if needed
        if (parsedImage.format !== BADGE_DEFAULTS.format) {
            console.log(`Image is in ${parsedImage.format} format, converting it to ${BADGE_DEFAULTS.format}.`);
            const newPath = imagePath.replace(/\.\w+$/, `.${BADGE_DEFAULTS.format}`); // Change file extension to default badge format
            imagePath = await parsedImage.image.toFormat(BADGE_DEFAULTS.format).toFile(newPath); // Do the conversion
            await parseImage(imagePath, parsedImage); // reparse the new image path
        }

        // Verify that all pixels are within a circle
        const isVerifiedCircle = await verifyAllPixelsInCircle(imagePath);
        if (!isVerifiedCircle) {
            return sendErrorResponse(res, "All image's pixels must fall within a circle.", { code: 'EXCEEDED_CIRCLE' });
        }

        // Verifying badge size
        if (parsedImage.width !== BADGE_DEFAULTS.width || parsedImage.height !== BADGE_DEFAULTS.height) {
            console.log("Image size is not 512x512, resizing it.");
            const convertedImagePath = await resizeImage(BADGE_DEFAULTS.width, BADGE_DEFAULTS.height, imagePath);
            if (!convertedImagePath) {
                return sendErrorResponse(res, "Could not resize image to valid dimensions.", { code: 'RESIZE_FAILED' });
            }
            imagePath = convertedImagePath;
            await parseImage(imagePath, parsedImage); // reparse the new image path
            console.log("Image has been successfully resized.");
        }

        // Verify that the image's colors are "happy"
        const imageHappy = await isImageHappy(imagePath);
        if (!imageHappy) {
            return sendErrorResponse(res, "Image's colors are not happy enough, try more vibrant or warmer colors.", { code: 'NOT_HAPPY' });
        }

        // Save the badge
        const targetDir = path.join(__dirname, `../../public/uploads/badges/${req.body.user_id}/`);
        fs.mkdir(targetDir, { recursive: true }, async (err) => {
            if (err) {
                console.error("Error creating the badge's directory: ", err);
                return sendErrorResponse(res, "Error processing the image.", { code: 'GENERAL' });
            }

            const targetPath = path.join(targetDir, `badge.${BADGE_DEFAULTS.format}`);
            fs.rename(imagePath, targetPath, (err) => {
                if (err) {
                    console.error("Error saving the badge: ", err);
                    return sendErrorResponse(res, "Error processing the image.", { code: 'GENERAL' });
                }
                const relativePath = path.relative(PUBLIC_DIR, targetPath);
                return sendSuccessResponse(res, "Image successfully uploaded and verified as a valid badge.", { imageUrl: relativePath });
            });
        });
    } catch (error) {
        console.error(error);
        return sendErrorResponse(res, "Error processing the image.", { code: 'GENERAL' });
    }
};
