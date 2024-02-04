const path = require("path");

const BADGE_DEFAULTS = {
    width: 512,
    height: 512,
    format: 'png',
};

const PUBLIC_DIR = path.join(__dirname, "../public");

module.exports = { BADGE_DEFAULTS, PUBLIC_DIR };
