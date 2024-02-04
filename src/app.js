const express = require("express");
const uploadMiddleware = require("./middleware/uploadMiddleware");
const badgeController = require("./controllers/badgeController");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.post("/badge/", uploadMiddleware, badgeController.handleBadgeUpload);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
