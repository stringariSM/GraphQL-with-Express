import { DataLoaders } from './DataLoadersInterface';
import { AuthUser } from './AuthUserInterface';
import { DbConnection } from './DbConnectionInterface';
import { RequestedField } from '../graphql/ast/RequestedField';

export interface ResolverContext {

    db?: DbConnection
    authorization?: string
    authUser?: AuthUser
    dataloaders?: DataLoaders
    requestedFields?: RequestedField

}