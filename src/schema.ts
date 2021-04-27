import { loadSchemaSync } from "@graphql-tools/load";
import { addResolversToSchema } from '@graphql-tools/schema';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { GraphQLUpload } from 'graphql-upload';

import { getUser, checkPasswordResetCode, updateUser, requestPasswordReset, resetPassword } from "./queries/user";
import { getUserDepartures } from "./queries/terminals";
import { uploadAvatar } from "./queries/account";

export const schema = addResolversToSchema({
  schema: loadSchemaSync('./src/types/*.graphql', { // load from multiple files using glob
    loaders: [
      new GraphQLFileLoader()
    ]
  }),
  resolvers: {
    Query: {
      getUser,
      getUserDepartures,
      checkPasswordResetCode
    },
    Mutation: {
      updateUser,
      requestPasswordReset,
      resetPassword,
      uploadAvatar
    },
    Upload: GraphQLUpload
  },
});
