import * as graphqlFields from 'graphql-fields'

import { DataLoaders } from './../../../interfaces/DataLoadersInterface';
import { AuthUser } from './../../../interfaces/AuthUserInterface';
import { PostInstance } from './../../../models/PostModel';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';
import { Transaction } from 'sequelize';
import { handleError, throwError } from '../../../helpers/utils';
import { genericGetAll, genericGetById } from '../../generic';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { GraphQLResolveInfo } from 'graphql';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const postResolvers = {

    Post: {
        author: (post: PostInstance, args, { dataloaders: { userLoader } }: { db: DbConnection, dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
            return userLoader
                .load({
                    key: post.get('author'),
                    info
                })
                .catch(handleError)
        },

        comments: (post: PostInstance, { limit = 10, offset = 0 }, { db }: { db: DbConnection }) => {
            return db.Comment
                .findAll({
                    where: {
                        post: post.get('id')
                    },
                    limit: limit,
                    offset: offset
                })
                .catch(handleError)
        },
    },

    Query: {
        posts: (post: PostInstance, { limit = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            let attributes = Object.keys(graphqlFields(info))

            return context.db.Post
                .findAll({
                    limit: limit,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, {keep: ['id'], exclude: ['comments']})
                })
                .catch(handleError)
        },

        post: (post: PostInstance, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return context.db.Post
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .then((user: any) => {
                    if (!user) throw new Error(`User with id ${id} not found`)
                    return user;
                })
                .catch(handleError)
        }
    },

    Mutation: {
        createPost: compose(...authResolvers)((post: PostInstance, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            input.author = authUser.id
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t })
            })
                .catch(handleError)
        }),

        updatePost: compose(...authResolvers)((post: PostInstance, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) => {
                        throwError(!post, `Post with id ${id} not found`)
                        throwError(post.get('author') !== authUser.id, `Unauthorized! You can only edit posts by yourself.`)

                        input.author = authUser.id
                        return post.update(input, { transaction: t })
                    })
            })
                .catch(handleError)
        }),

        deletePost: compose(...authResolvers)((post: PostInstance, { id }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) => {
                        throwError(!post, `Post with id ${id} not found`)
                        throwError(post.get('author') !== authUser.id, `Unauthorized! You can only delete posts by yourself.`)

                        return post.destroy({ transaction: t })
                    })
            })
                .catch(handleError)
        })
    }

}