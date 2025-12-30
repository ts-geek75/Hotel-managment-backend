import express from "express";
import { postgraphile } from "postgraphile";
import dotenv from "dotenv";
import { LoginPlugin , RegisterPlugin } from "./plugin/auth"
import cors from "cors";
import BookingPlugin from "./plugin/booking";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in your environment variables");
}

app.use(
  postgraphile(databaseUrl, "public", {
    appendPlugins: [LoginPlugin, RegisterPlugin , BookingPlugin],
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    pgDefaultRole: "postgres",
    disableQueryLog: false,   
    ignoreRBAC: false,          
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  console.log(`🔍 GraphiQL interface available at http://localhost:${PORT}/graphiql`);
});
