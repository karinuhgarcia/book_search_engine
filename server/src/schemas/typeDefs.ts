
const typeDefs = `
type User {
_id: ID
username: String
email: String
bookCount: Int
password: String
savedBooks: [Book]!

}
type Book {
bookId: String!
title: String!
authors: [String]!
description: String!
image: String
link: String
}

type Auth {
token: String!
user: User!
}

type Query {
getUser (id:ID!): User
me: User
}

type Mutation {
  addUser(username: String!, email: String!, password: String!): Auth
  login(email: String!, password: String!): Auth
  saveBook(book: BookInput!): User
  removeBook(bookId: String!): User
}

input BookInput {
  bookId: String!
  title: String!
  authors: [String!]!
  description: String!
  image: String
  link: String
}
`;
export default typeDefs;