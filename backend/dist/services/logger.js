"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = {
    error: (message, error) => {
        console.error(message, error);
    },
    info: (message, data) => {
        console.info(message, data);
    },
    debug: (message, data) => {
        console.debug(message, data);
    }
};
exports.default = logger;
