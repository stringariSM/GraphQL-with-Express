import { UserInstance } from './../models/UserModel';
import { JWT_SECRET } from './../helpers/utils';
import db from './../models'
import { RequestHandler, Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken'

export const extractJwtMiddleware = (): RequestHandler => {

    return (req: Request, res: Response, next: NextFunction): void => {
        let authorization: string = req.get('authorization') //Authorization  = Bearer xxxxxxx.kkkkkk.yyyyy
        let token: string = authorization ? authorization.split(' ')[1] : undefined

        req['context'] = {}
        req['context']['authorization'] = authorization

        if(!token) {
            return next()
        }

        jwt.verify(token, JWT_SECRET, { algorithms: ['RS256'] }, (err, payload: any) => {
            if(err) return next()

            db.User.findById(payload.sub, {
                attributes: ['id', 'email']
            }).then((user: UserInstance) => {

                if(user) {
                    req['context']['authUser'] = {
                        id: user.get('id'),
                        email: user.get('email')
                    }
                }

                return next()
            })
        })
    }

}