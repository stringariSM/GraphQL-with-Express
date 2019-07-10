import { DataLoaderParam } from './../../interfaces/DataLoaderParamInterface';
import { RequestedField } from './../ast/RequestedField';
import { UserInstance } from './../../models/UserModel';
import * as DataLoader from 'dataloader'

import { DataLoaders } from './../../interfaces/DataLoadersInterface';
import { DbConnection } from './../../interfaces/DbConnectionInterface';
import { UserLoader } from './UserLoader';
import { PostInstance } from '../../models/PostModel';
import { PostLoader } from './PostLoader';

export class DataLoaderFactory {

    constructor(
        private db: DbConnection,
        private requestedFields: RequestedField
    ) {}

    getLoaders(): DataLoaders {
        return {
            userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
                (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),
                {   cacheKeyFn: (param: DataLoaderParam<number>[]) => param.keys  }
            ),
            postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
                (params: DataLoaderParam<number>[]) => PostLoader.batchPosts(this.db.Post, params, this.requestedFields),
                { cacheKeyFn: (param: DataLoaderParam<number>[]) => param.keys }
            )
        }
    }

}