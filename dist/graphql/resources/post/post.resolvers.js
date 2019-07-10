"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphqlFields = require("graphql-fields");
const utils_1 = require("../../../helpers/utils");
const composable_resolver_1 = require("../../composable/composable.resolver");
const auth_resolver_1 = require("../../composable/auth.resolver");
exports.postResolvers = {
    Post: {
        author: (post, args, { dataloaders: { userLoader } }, info) => {
            return userLoader
                .load({
                key: post.get('author'),
                info
            })
                .catch(utils_1.handleError);
        },
        comments: (post, { limit = 10, offset = 0 }, { db }) => {
            return db.Comment
                .findAll({
                where: {
                    post: post.get('id')
                },
                limit: limit,
                offset: offset
            })
                .catch(utils_1.handleError);
        },
    },
    Query: {
        posts: (post, { limit = 10, offset = 0 }, context, info) => {
            let attributes = Object.keys(graphqlFields(info));
            return context.db.Post
                .findAll({
                limit: limit,
                offset: offset,
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            })
                .catch(utils_1.handleError);
        },
        post: (post, { id }, context, info) => {
            id = parseInt(id);
            return context.db.Post
                .findById(id, {
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            })
                .then((user) => {
                if (!user)
                    throw new Error(`User with id ${id} not found`);
                return user;
            })
                .catch(utils_1.handleError);
        }
    },
    Mutation: {
        createPost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((post, { input }, { db, authUser }) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t) => {
                return db.Post
                    .create(input, { transaction: t });
            })
                .catch(utils_1.handleError);
        }),
        updatePost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((post, { id, input }, { db, authUser }) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post with id ${id} not found`);
                    utils_1.throwError(post.get('author') !== authUser.id, `Unauthorized! You can only edit posts by yourself.`);
                    input.author = authUser.id;
                    return post.update(input, { transaction: t });
                });
            })
                .catch(utils_1.handleError);
        }),
        deletePost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((post, { id }, { db, authUser }) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post with id ${id} not found`);
                    utils_1.throwError(post.get('author') !== authUser.id, `Unauthorized! You can only delete posts by yourself.`);
                    return post.destroy({ transaction: t });
                });
            })
                .catch(utils_1.handleError);
        })
    }
};
