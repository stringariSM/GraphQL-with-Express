import { RequestedField } from './../ast/RequestedField';
import { DataLoaderParam } from './../../interfaces/DataLoaderParamInterface';
import { UserModel, UserInstance } from "../../models/UserModel";

export class UserLoader {

    static batchUsers(User: UserModel, params: DataLoaderParam<number>[], requestedFields: RequestedField): Promise<UserInstance[]> {

        let ids: number [] = params.map(param => param.key)

        return Promise.resolve(
            User.findAll({
                where: {
                    id: {
                        $in: ids
                    }
                },
                attributes: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['posts'] })
            })
                .then(rows => ids.map(id => rows.find(x => x.id === id)))
        )
    }
}