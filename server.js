const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

// routes
const contactRoute = require("./routes/contactRoute");

// body parsing
app.use(express.json());

// cors
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.get("/", (req, res) => {
  res.status(200).send("Server up");
});

// contact
app.use("/lfish/contact", contactRoute);

app.listen(process.env.PORT, () =>
  console.log(`app listen on port ${process.env.PORT}`)
);
