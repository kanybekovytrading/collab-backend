"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponse = apiResponse;
exports.apiError = apiError;
function apiResponse(data, message = 'Success') {
    return { success: true, message, data, errors: null };
}
function apiError(message, errors = null) {
    return { success: false, message, data: null, errors };
}
//# sourceMappingURL=api-response.js.map