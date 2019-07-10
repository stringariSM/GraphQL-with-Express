import { handleError } from "../helpers/utils";

export const genericGetAll = (model: any, limit: number, offset: number) => {
    return model
        .findAll({
            limit: limit,
            offset: offset
        })
        .catch(handleError)
}

export const genericGetById = (model: any, id: number) => {
    return model
        .findById(id)
        .then((user: any) => {
            if (!user) throw new Error(`User with id ${id} not found`)
            return user;
        })
        .catch(handleError)
}