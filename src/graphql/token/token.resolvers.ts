import { JWT_SECRET } from '../../helpers/utils';
import { UserInstance } from './../../models/UserModel';
import { DbConnection } from "../../interfaces/DbConnectionInterface";
import * as jwt from 'jsonwebtoken'


export const tokenResolvers = {

    Mutation: {
        createToken: (token, { email, password }, { db }: { db: DbConnection }) => {
            return db.User.findOne({
                where: {
                    email: email
                },
                attributes: ['id', 'password']
            }).then((user: UserInstance) => {
                let errorMessage: string = 'Não autorizado! E-mail ou senha incorretos'
                if (!user || !user.isPassword(user.get('password'), password))
                    throw new Error(errorMessage)

                const payload = {
                    sub: user.get('id')
                }

                return {
                    token: jwt.sign(payload, JWT_SECRET, {
                        algorithm: 'RS256',
                        // expiresIn: "7d"
                    })
                }
            })
        },
    }

}