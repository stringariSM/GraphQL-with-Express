import { JWT_SECRET } from './../../../src/helpers/utils';
import * as jwt from 'jsonwebtoken'
import { UserInstance } from './../../../src/models/UserModel'
import { db, chai, app, handleError, expect } from "./../../test-utils"

describe('User', () => {

    let token: string;
    let userId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.User.destroy({where:{}}))
            .then((rows: number) => db.User.destroy({ where: {} }))
            .then((rows: number) => db.User.bulkCreate([
                {
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '123'
                },
                {
                    name: 'Gamora',
                    email: 'gamorra@guardians.com',
                    password: '1234'
                },
                {
                    name: 'Groot',
                    email: 'groot@guardians.com',
                    password: '1234'
                }
            ])).then((users: UserInstance[]) => {
                userId = users[0].get('id')
                const payload = {
                    sub: userId
                }
                token = jwt.sign(payload, JWT_SECRET, {
                    algorithm: 'RS256',
                })
            })
    })

    describe('Queries', ()=> {

        describe('application/json', () => {

            describe('users', () => {

                it('should return a list of users', () => {

                    let body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res) => {
                            const usersList = res.body.data.users

                            expect(res.body.data).to.be.an('object')
                            expect(usersList).to.be.an('array')
                            expect(usersList[0]).to.be.an('object')
                            expect(usersList[0]).to.not.have.keys(['id', 'photo','createdAt','updatedAt','posts'])
                            expect(usersList[0]).to.have.keys(['name', 'email'])
                        })
                        .catch(handleError)
                })

                it('should paginate a list of users', () => {

                    let body = {
                        query: `
                            query getUserLisyt($limit: Int, $offset: Int){
                                users(limit: $limit, offset: $offset) {
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            limit: 2,
                            offset: 1
                        }
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res) => {
                            const usersList = res.body.data.users

                            expect(res.body.data).to.be.an('object')
                            expect(usersList).to.be.an('array').of.length(2)
                            expect(usersList[0]).to.be.an('object')
                            expect(usersList[0]).to.not.have.keys(['id', 'photo','updatedAt','posts'])
                            expect(usersList[0]).to.have.keys(['name', 'email', 'createdAt'])
                        })
                        .catch(handleError)
                })

            })

            describe('user', () => {
                it('deve retornar somente um usuário', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!){
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: userId,
                        }
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res) => {
                            expect(res.body.data).to.be.an('object')
                            const singleUser = res.body.data.user
                            expect(singleUser).to.be.an('object')
                            expect(singleUser).to.have.keys(['id', 'name', 'email', 'posts'])
                            expect(singleUser.name).to.equal('Peter Quill')
                        })
                        .catch(handleError)
                })

                it('deve retornar somente o atributo \'name\'', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!){
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: userId,
                        }
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res) => {
                            expect(res.body.data).to.be.an('object')
                            const singleUser = res.body.data.user
                            expect(singleUser).to.be.an('object')
                            expect(singleUser).to.have.keys(['name'])
                            expect(singleUser.email).to.be.undefined
                            expect(singleUser.createdAt).to.be.undefined
                            expect(singleUser.posts).to.be.undefined
                        })
                        .catch(handleError)
                })

                it('deve retornar um erro se o usuário não existe', () => {

                    let body = {
                        query: `
                            query getSingleUser($id: ID!){
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: -1,
                        }
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res) => {
                            expect(res.body.data.user).to.be.null
                            expect(res.body.errors).to.be.an('array')
                            expect(res.body).to.have.keys(['data', 'errors'])

                        })
                        .catch(handleError)
                })
            })

        })
    })

    describe('Mutations', () => {

        describe('application/json', () => {

            describe('createUser', () => {

                it('deve criar um novo usuário', () => {

                    let body = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id,
                                    name,
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Drax',
                                email: 'drax@guardians.com',
                                password: '1234'
                            }
                        }
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res) => {
                            const createdUser = res.body.data.createUser
                            expect(createdUser).to.be.an('object')
                            expect(createdUser.name).to.equal('Drax')
                            expect(createdUser.email).to.equal('drax@guardians.com')
                            expect(parseInt(createdUser.id)).to.a('number')
                        })
                        .catch(handleError)


                })

            })

            describe('updateUser', () => {

                it('deve atualizar um usuário', () => {

                    let body = {
                        query: `
                            mutation updatingExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name,
                                    email,
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Star Lord',
                                email: 'peter@guardians.com',
                                photo: 'some_photo'
                            }
                        }
                    }

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then((res) => {
                            const updatedUser = res.body.data.updateUser
                            expect(updatedUser).to.be.an('object')
                            expect(updatedUser.name).to.equal('Star Lord')
                            expect(updatedUser.email).to.equal('peter@guardians.com')
                            expect(updatedUser.photo).to.not.be.null
                            expect(updatedUser.id).to.be.undefined
                        })
                        .catch(handleError)


                })
            })

        })

    })

})