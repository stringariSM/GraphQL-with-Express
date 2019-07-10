const postTypes = `

    # Post definition type
    type Post {
        id: ID!
        title: String!
        content: String!
        photo: String!
        createdAt: String!
        updatedAt: String!
        author: User!
        comments(limit: Int, offset: Int): [ Comment! ]!
    }

    input PostInput {
        title: String!
        content: String!
        photo: String!
    }

`

const postQueries = `
    posts(limit: Int, offset: Int): [ Post! ]!
    post(id: ID!): Post
`

const postMutations = `
    createPost(input: PostInput!): Post
    updatePost(id: ID!, input: PostInput!): Post
    deletePost(id: ID!): Boolean
`

export {
    postTypes,
    postQueries,
    postMutations
}