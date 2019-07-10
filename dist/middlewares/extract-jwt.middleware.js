"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../helpers/utils");
const models_1 = require("./../models");
const jwt = require("jsonwebtoken");
exports.extractJwtMiddleware = () => {
    return (req, res, next) => {
        let authorization = req.get('authorization'); //Authorization  = Bearer xxxxxxx.kkkkkk.yyyyy
        let token = authorization ? authorization.split(' ')[1] : undefined;
        req['context'] = {};
        req['context']['authorization'] = authorization;
        if (!token) {
            return next();
        }
        jwt.verify(token, utils_1.JWT_SECRET, { algorithms: ['RS256'] }, (err, payload) => {
            if (err)
                return next();
            models_1.default.User.findById(payload.sub, {
                attributes: ['id', 'email']
            }).then((user) => {
                if (user) {
                    req['context']['authUser'] = {
                        id: user.get('id'),
                        email: user.get('email')
                    };
                }
                return next();
            });
        });
    };
};
