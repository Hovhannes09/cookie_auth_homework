import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import morgan from "morgan";

import { migrate } from "./migrate.js";
import router from "./routes/index.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

await migrate();

app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
