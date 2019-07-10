"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../helpers/utils");
const jwt = require("jsonwebtoken");
exports.verifyTokenResolver = (resolver) => {
    return (parent, args, context, info) => {
        const token = context.authorization ? context.authorization.split(' ')[1] : undefined;
        return jwt.verify(token, utils_1.JWT_SECRET, { algorithms: ['RS256'] }, (err, payload) => {
            if (!err)
                return resolver(parent, args, context, info);
            throw new Error(`${err.name}: ${err.message}`);
        });
    };
};
