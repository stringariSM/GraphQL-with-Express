"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../helpers/utils");
const composable_resolver_1 = require("../../composable/composable.resolver");
const auth_resolver_1 = require("../../composable/auth.resolver");
exports.commentResolvers = {
    Comment: {
        user: (comment, args, { dataloaders: { userLoader } }, info) => {
            return userLoader
                .load({ key: comment.get('user'), info })
                .catch(utils_1.handleError);
        },
        post: (comment, args, { db, dataloaders: { postLoader } }, info) => {
            return postLoader
                .load({ key: comment.get('post'), info })
                .catch(utils_1.handleError);
        },
    },
    Query: {
        commentsByPost: (comment, { postId, limit = 10, offset = 0 }, context, info) => {
            postId = parseInt(postId);
            return context.db.Comment
                .findAll({
                where: {
                    post: postId
                },
                limit: limit,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
                .catch(utils_1.handleError);
        },
    },
    Mutation: {
        createComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((comment, { input }, { db, authUser }) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .create(input, { transaction: t });
            })
                .catch(utils_1.handleError);
        }),
        updateComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((comment, { id, input }, { db, authUser }) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    utils_1.throwError(!comment, `Comment with id ${id} not found`);
                    utils_1.throwError(comment.get('user') !== authUser.id, `Unauthorized! You can only edit comment by yourself.`);
                    input.user = authUser.id;
                    return comment.update(input, { transaction: t });
                });
            })
                .catch(utils_1.handleError);
        }),
        deleteComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((comment, { id }, { db, authUser }) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    utils_1.throwError(!comment, `Comment with id ${id} not found`);
                    utils_1.throwError(comment.get('user') !== authUser.id, `Unauthorized! You can only delete comment by yourself.`);
                    return comment.destroy({ transaction: t });
                });
            })
                .catch(utils_1.handleError);
        })
    }
};
