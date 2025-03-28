// server/index.ts
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { usersTable } from "./db/schema";

const app = new Hono<{
  Bindings: {
    MY_VAR: string;
    DB: D1Database;
  };
  Variables: {
    MY_VAR_IN_VARIABLES: string;
  };
}>();

app.use(async (c, next) => {
  c.set("MY_VAR_IN_VARIABLES", "My variable set in c.set");
  await next();
  c.header("X-Powered-By", "React Router and Hono");
});

app.get("/api", async (c) => {
  const db = drizzle(c.env.DB);

  const writeResult = await db.insert(usersTable).values({
    name: "John Doe",
    age: Math.floor(Math.random() * 100),
  });
  console.log(writeResult);
  const result = await db.select().from(usersTable);
  console.log(result);

  return c.json({
    message: "Hello",
    var: c.env.MY_VAR,
    users: result,
  });
});

export default app;
