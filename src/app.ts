import express from "express";
import { log } from "./log.js";
import { boatMetrics } from "./boatdata.js";

const port = process.env.PORT || 8880;
let app = express();
app.disable("x-powered-by");

app.get("/metrics", (req, res) => {
  boatMetrics(res);
});

app.listen(port);
log("Listening on port " + port);
