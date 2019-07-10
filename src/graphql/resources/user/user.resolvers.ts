import { RequestedField } from './../../ast/RequestedField';
import { AuthUser } from './../../../interfaces/AuthUserInterface';
import { genericGetAll, genericGetById } from './../../generic';
import { UserInstance } from './../../../models/UserModel';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';
import { Transaction } from 'sequelize';
import { handleError, throwError } from '../../../helpers/utils';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';
import { GraphQLResolveInfo } from 'graphql';

export const userResolvers = {

    User: {
        posts: (user: UserInstance, { limit = 10, offset = 0 }, context: ResolverContext, info) => {
            return context.db.Post
                .findAll({
                    where: {author: user.id},
                    limit: limit,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})
                })
                .catch(handleError)
        },
    },

    Query: {
        users: (user: UserInstance, { limit = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
                .findAll({
                    limit: limit,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .catch(handleError)
        },

        user: (user: UserInstance, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return context.db.User
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .then((user: any) => {
                    if (!user) throw new Error(`User with id ${id} not found`)
                    return user;
                })
                .catch(handleError)
        },

        currentUser: compose(...authResolvers)((user: UserInstance, args, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            return db.User
                .findById(authUser.id)
                .then((user: any) => {
                    throwError(!user, `User with id ${authUser.id} not found`)
                    return user;
                })
                    .catch(handleError)
        }),
    },

    Mutation: {
        createUser: (user: UserInstance, { input }, { db }: { db: DbConnection }) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, { transaction: t })
            })
                .catch(handleError)
        },

        updateUser: compose(...authResolvers)((user: UserInstance, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`)
                        return user.update(input, { transaction: t })
                    })
            })
                .catch(handleError)
        }),

        updateUserPassword: compose(...authResolvers)((user: UserInstance, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`)
                        return user.update(input, { transaction: t })
                            .then((user: UserInstance) => {
                                return !!user
                            })
                    })
            })
                .catch(handleError)
        }),

        deleteUser: compose(...authResolvers)((user: UserInstance, args, { db, authUser }: { db: DbConnection, authUser: AuthUser }) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`)
                        return user.destroy({ transaction: t })
                    })
            })
                .catch(handleError)
        })
    }

}