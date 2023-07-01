import express from "express";

export function listen() {
  const app = express();
  const port = 8081;
  app.use(express.static("static"));

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
