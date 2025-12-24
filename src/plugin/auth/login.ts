import { makeExtendSchemaPlugin, gql } from "graphile-utils";
import { Build, Context } from "postgraphile";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface LoginUserArgs {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

const LoginPlugin = makeExtendSchemaPlugin((build: Build) => {
  return {
    typeDefs: gql`
      extend type Mutation {
        loginUser(email: String!, password: String!): String
      }
    `,
    resolvers: {
      Mutation: {
        loginUser: async (_query: any, args: LoginUserArgs, context: Context<any>) => {
          const { email, password } = args;
          const { pgClient } = context;

          const { rows } = await pgClient.query(
            "SELECT id, email, password, role FROM users WHERE email = $1",
            [email]
          );
          const user = rows[0];

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            throw new Error("Invalid email or password");
          }

      
          const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" } 
          );

          return token;
        },
      },
    },
  };
});

export default LoginPlugin;
