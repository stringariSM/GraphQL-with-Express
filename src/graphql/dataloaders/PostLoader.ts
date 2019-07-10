import { PostModel, PostInstance } from "../../models/PostModel";
import { DataLoaderParam } from "../../interfaces/DataLoaderParamInterface";
import { RequestedField } from "../ast/RequestedField";

export class PostLoader {

    static batchPosts(Post: PostModel, params: DataLoaderParam<number>[], requestedFields: RequestedField) {

        let ids: number[] = params.map(param => param.key)

        return Post.findAll({
            where: {
                id: {
                    $in: ids
                }
            },
            attributes: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['comments'] })
        })
            .then(rows => ids.map(id => rows.find(x => x.id === id)))
    }
}