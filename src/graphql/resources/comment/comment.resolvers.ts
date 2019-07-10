import { AuthUser } from './../../../interfaces/AuthUserInterface';
import { CommentInstance } from './../../../models/CommentModel';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';
import { Transaction } from 'sequelize';
import { handleError, throwError } from '../../../helpers/utils';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { DataLoaders } from '../../../interfaces/DataLoadersInterface';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';
import { GraphQLResolveInfo } from 'graphql';

export const commentResolvers = {

    Comment: {
        user: (comment: CommentInstance, args, { dataloaders: { userLoader } }: { db: DbConnection, dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
            return userLoader
                .load({ key: comment.get('user'), info })
                .catch(handleError)
        },

        post: (comment: CommentInstance, args, { db, dataloaders: { postLoader } }: { db: DbConnection, dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
            return postLoader
                .load({ key: comment.get('post'), info})
                .catch(handleError)
        },
    },

    Query: {
        commentsByPost: (comment, { postId, limit = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            postId = parseInt(postId)
            return context.db.Comment
                .findAll({
                    where: {
                        post: postId
                    },
                    limit: limit,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info)
                })
                .catch(handleError)
        },
    },

    Mutation: {
        createComment: compose(...authResolvers)((comment: CommentInstance, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            input.user = authUser.id
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t })
            })
                .catch(handleError)
        }),

        updateComment: compose(...authResolvers)((comment: CommentInstance, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found`)
                        throwError(comment.get('user') !== authUser.id, `Unauthorized! You can only edit comment by yourself.`)

                        input.user = authUser.id
                        return comment.update(input, { transaction: t })
                    })
            })
                .catch(handleError)
        }),

        deleteComment: compose(...authResolvers)((comment: CommentInstance, { id }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment with id ${id} not found`)
                        throwError(comment.get('user') !== authUser.id, `Unauthorized! You can only delete comment by yourself.`)

                        return comment.destroy({ transaction: t })
                    })
            })
                .catch(handleError)
        })
    }

}