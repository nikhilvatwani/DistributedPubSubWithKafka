const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:3000"
};
require("dotenv").config();

app.use(cors(corsOptions));


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ecommerce publisher." });
});
loadApp = async () => {
  require("./app/routes/publisher.routes")(app);
}


const PORT = process.env.PORT || 9001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  loadApp();
});