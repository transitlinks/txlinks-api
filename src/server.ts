import express from 'express';
import expressSession from 'express-session';
import pgSessionStore from 'connect-pg-simple';
import { Pool } from 'pg';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginUsageReportingDisabled } from 'apollo-server-core';
import { createServer } from 'http';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import { schema } from './schema';
import User from './models/User';

const app = express();

const pgSession = pgSessionStore(expressSession);
const poolSettings: { [key: string ]: string | number | object } = {
  max: 10,
  connectionString: process.env.DB_URL!
};

if (process.env.APP_ENV === 'stage') {
  poolSettings.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolSettings);
app.use(expressSession({
  store: new pgSession({
    pool
  }),
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use("*", cors());
app.use(helmet({ contentSecurityPolicy: (process.env.APP_ENV === 'stage') ? undefined : false }));
app.use(compression());

const getUser = async (req: any) => {
  const uuid = req.session?.passport?.user;
  let user;
  if (req.session?.passport?.user) {
    user = await User.findOne({ where: { uuid } });
  }
  return user;
};

const server = new ApolloServer({
  schema,
  apollo: {
    key: process.env.APOLLO_KEY
  },
  plugins: [ApolloServerPluginUsageReportingDisabled()],
  context: async ({ req }) => {
    const user = await getUser(req);
    return { user: user?.json() };
  },
});

server.applyMiddleware({ app, path: '/v2/graphql' });
const httpServer = createServer(app);


const HTTP_PORT = process.env.HTTP_PORT || 7000;
httpServer.listen({ port: HTTP_PORT }, (): void =>
  console.log(`🚀GraphQL-Server is running on http://localhost:${HTTP_PORT}/graphql`)
);
