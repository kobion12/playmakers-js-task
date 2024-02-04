const fileUpload = require("express-fileupload");

// Middleware for handling file uploads
const uploadMiddleware = fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
});

module.exports = uploadMiddleware;