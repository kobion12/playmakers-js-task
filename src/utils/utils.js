const buildResponse = (status, message = null, data = null) => {
    return { status, message, data };
}

exports.sendErrorResponse = (res, message, data, status = 500) => {
    return res.status(status).json(buildResponse("error", message, data));
}
exports.sendSuccessResponse = (res, message, data, status = 200) => {
    return res.status(status).json(buildResponse("success", message, data));
};