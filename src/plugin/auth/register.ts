import { makeExtendSchemaPlugin, gql } from "graphile-utils";
import { Build, Context } from "postgraphile";
import * as bcrypt from "bcrypt";

interface RegisterUserArgs {
  name: string;
  email: string;
  password: string;
}

const RegisterPlugin = makeExtendSchemaPlugin((build: Build) => {
  return {
    typeDefs: gql`
      extend type Mutation {
        registerUser(name: String!, email: String!, password: String!): User
      }
    `,
    resolvers: {
      Mutation: {

        registerUser: async (_query: any, args: RegisterUserArgs, context: Context<any>) => {
          const { name, email, password } = args;
          const { pgClient } = context;

          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const { rows } = await pgClient.query(
            `INSERT INTO users (name, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [name, email, hashedPassword]
          );

          return rows[0];
        },
      },
    },
  };
});

export default RegisterPlugin;