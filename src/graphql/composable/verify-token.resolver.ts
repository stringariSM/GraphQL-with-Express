import { JWT_SECRET } from './../../helpers/utils';
import { ComposableResolver } from './composable.resolver';
import * as jwt from 'jsonwebtoken'
import { ResolverContext } from '../../interfaces/ResolverContextInterface';
import { GraphQLFieldResolver } from 'graphql';

export const verifyTokenResolver: ComposableResolver<any, ResolverContext> =
    (resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {

        return (parent, args, context: ResolverContext, info) => {

            const token: string = context.authorization ? context.authorization.split(' ')[1] : undefined

            return jwt.verify(token, JWT_SECRET, { algorithms: ['RS256'] }, (err, payload: any) => {
                if (!err)
                    return resolver(parent, args, context, info)

                throw new Error(`${err.name}: ${err.message}`)
            })
        }
    }
