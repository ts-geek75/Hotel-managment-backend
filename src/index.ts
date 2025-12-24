import express from "express";
import { postgraphile } from "postgraphile";
import dotenv from "dotenv";
import { LoginPlugin , RegisterPlugin } from "./plugin/auth"

dotenv.config();

const app = express();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in your environment variables");
}

app.use(
  postgraphile(databaseUrl, "public", {
    appendPlugins: [LoginPlugin, RegisterPlugin],
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    pgDefaultRole: "postgres", // optional: your default DB role
    disableQueryLog: false,     // optional: show queries in console
    ignoreRBAC: false,          // optional: enforce role-based access
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  console.log(`🔍 GraphiQL interface available at http://localhost:${PORT}/graphiql`);
});
