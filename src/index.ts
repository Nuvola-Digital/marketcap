import express from "express";
import cors from "cors";
import { PORT } from "./config";
import { circulatingSupply, totalSupply } from "./services/marketcap";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Up and running");
});

app.get("/nvl-totalsupply", totalSupply)
app.get("/nvl-circulatingsupply", circulatingSupply)

app.listen(PORT, () => {
  console.log("Server is running");
});
