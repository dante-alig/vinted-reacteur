//MODULES
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors());

//pour utiliser body
app.use(express.json());

//MONGOOSE CONNECT
mongoose.connect("mongodb://localhost:27017/vinted-dev");

//IMPORTATION DES MODELS
const User = require("./models/User-model");

//WELCOME
app.get("/", (req, res) => {
  res.json({ message: "Hi" });
});

//IMPORTATION DES ROUTES
//route : signup
const publishRoutes = require("./routes/route-offer");
app.use(publishRoutes);

//route : user
const userRoutes = require("./routes/route-user");
app.use(userRoutes);

//ALL
app.all("*", (req, res) => {
  return res.status(404).json("Vous vous êtes perdu 👀");
});

//SERVEUR LISTEN
app.listen(process.env.PORT, () => {
  console.log("Server has started🔥🔥🔥🔥");
});
