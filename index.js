const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection. Server shut down...");
  process.exit(1);
});

dotenv.config({ path: "./.env" });

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("DB connection successful");
});

const app = require("./app");

const port = process.env.PORT || 8080;

const server = app.listen(port, () =>
  console.log(`listening on port: ${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection. Server shut down...");

  server.close(() => {
    process.exit(1);
  });
});
