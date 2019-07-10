import { userMutations } from "./resources/user/user.schema";
import { postMutations } from "./resources/post/post.schema";
import { commentMutations } from "./resources/comment/comment.schema";
import { tokenMutations } from "./token/token.schema";

const Mutation = `
    type Mutation {
        ${tokenMutations}
        ${userMutations}
        ${postMutations}
        ${commentMutations}
    }
`

export {
    Mutation
}