import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from '@graphql-tools/schema';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

import { getUser, checkPasswordResetCode, updateUser, requestPasswordReset, resetPassword } from "./queries/user";

export const schema = addResolversToSchema({
  schema: loadSchemaSync('./src/types/*.graphql', { // load from multiple files using glob
    loaders: [
      new GraphQLFileLoader()
    ]
  }),
  resolvers: {
    Query: {
      getUser,
      checkPasswordResetCode
    },
    Mutation: {
      updateUser,
      requestPasswordReset,
      resetPassword
    }
  },
});
