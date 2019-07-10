"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../helpers/utils");
exports.genericGetAll = (model, limit, offset) => {
    return model
        .findAll({
        limit: limit,
        offset: offset
    })
        .catch(utils_1.handleError);
};
exports.genericGetById = (model, id) => {
    return model
        .findById(id)
        .then((user) => {
        if (!user)
            throw new Error(`User with id ${id} not found`);
        return user;
    })
        .catch(utils_1.handleError);
};
