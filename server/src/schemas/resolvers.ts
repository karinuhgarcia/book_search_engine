import User from '../models/User.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

interface AddUserInput {
    username: string;
    email: string;
    password: string;
    savedBooks: [];
}

interface LoginUserArgs {
    email: string;
    password: string;
}

interface UserArgs {
    username: string;
}

interface BookInput {
    bookId: string;
    title: string;
    authors: string[];
    description: string;
    image: string;
    link: string;
}

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: any) => {
            // console.log(context);
            console.log('Context User:', context.user);
            if (!context.user) {
                console.log(context.user)
                throw new AuthenticationError('You need to be logged in!');
            }
            const user = await User.findById(context.user._id).populate('savedBooks');
            console.log('Found User:', user);

            //return user;
            if (!user) {
                throw new Error("User not found");
            }
            return {
                ...user.toObject(),
                bookCount: user.savedBooks.length, // Explicitly include bookCount
            };
        },
        getUser: async (_parent: unknown, { username }: UserArgs) => {
            return User.findOne({ username });
        },
    },
    Mutation: {
        addUser: async (_parent: any, input: AddUserInput) => {
            console.log(input);
            const user = await User.create(input);
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        login: async (_parent: unknown, { email, password }: LoginUserArgs) => {
            console.log(email);
            console.log(password);
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent: unknown, { book }: { book: BookInput }, context: any) => {
            console.log('Context User:', context.user);
            console.log('Book to Save:', book);
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        },
        removeBook: async (_parent: unknown, { bookId }: { bookId: string }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            const updatedUser = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            if (!updatedUser) {
                throw new Error("Couldn't find user with this id!");
            }
            return updatedUser;
        },
    },
};

export default resolvers;