import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
//import path from 'path';
import path from 'node:path';
import { fileURLToPath } from 'url';

import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { jwt } from './utils/auth.js';

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server as any, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(' ').pop();
      if (!token) {
        console.log('No token provided');
        return { user: null };
      }

      try {
        const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
        console.log('Decoded User:', data);
        return { user: data };
      } catch (err) {
        console.log('Invalid token');
        return { user: null };
      }
    },
  }));

  // while in development, serve client/build
  if (process.env.NODE_ENV === 'production') {

    //app.use(express.static(path.join(__dirname, '../../client/dist')));
    app.use(express.static(path.join(__dirname, '../../client/dist')));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();