import { UserModel } from './UserModel';
import { BaseModelInterface } from './../interfaces/BaseModelInterface';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import * as Sequelize from 'sequelize';
import { ModelsInterface } from '../interfaces/ModelsInterface';

export interface CommentAttributes {
    id?: number;
    comment?: string;
    post?: number;
    user?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CommentInstance extends Sequelize.Instance<CommentAttributes>, CommentAttributes { }

export interface CommentModel extends BaseModelInterface, Sequelize.Model<CommentInstance, CommentAttributes> { }

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): CommentModel => {
    const Comment: CommentModel =
        sequelize.define('Comment', {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            comment: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
        }, {
            tableName: 'comments'
        })

    Comment.associate = (models: ModelsInterface): void => {
        Comment.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'user',
                name: 'user'
            }
        })
        Comment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false,
                field: 'post',
                name: 'post'
            }
        })
    }

    Comment.prototype.isPassword = (encodedPassword: string, password: string): boolean => {
        return compareSync(password, encodedPassword)
    }

    return Comment;
}