import * as express from "express";

const port = process.env.PORT || 8880;
let app = express();
app.disable("x-powered-by");

app.get("/metrics", (req, res) => {
  res.send("# Data");
});

app.listen(port);
console.log("Listening on port " + port);