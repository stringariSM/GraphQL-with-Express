"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../helpers/utils");
const jwt = require("jsonwebtoken");
exports.tokenResolvers = {
    Mutation: {
        createToken: (token, { email, password }, { db }) => {
            return db.User.findOne({
                where: {
                    email: email
                },
                attributes: ['id', 'password']
            }).then((user) => {
                let errorMessage = 'Não autorizado! E-mail ou senha incorretos';
                if (!user || !user.isPassword(user.get('password'), password))
                    throw new Error(errorMessage);
                const payload = {
                    sub: user.get('id')
                };
                return {
                    token: jwt.sign(payload, utils_1.JWT_SECRET, {
                        algorithm: 'RS256',
                    })
                };
            });
        },
    }
};
