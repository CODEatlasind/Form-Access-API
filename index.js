const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
require("dotenv").config();
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB database successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
const Schema = mongoose.Schema;
const typoSchema = new Schema(
  {
    label: { type: String, required: true },
    smallDescription: { type: String, default: "" },
    Label: { type: String, default: "" },
  },
  { _id: false }
);

const attrSchema = new Schema(
  {
    required: { type: Boolean, default: false },
    minLength: { type: String, default: "" },
    maxLength: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  { _id: false }
);

const formElementSchema = new Schema(
  {
    id: { type: Number, required: true },
    type: { type: String, enum: ["heading", "email", "date"], required: true },
    attr: { type: attrSchema, required: true },
    typos: { type: typoSchema, required: true },
  }
  //   { _id: false }
);

// const formSchema = new Schema({
//   elements: [formElementSchema],
// });
const formSchema = new mongoose.Schema({
  heading: String,
  fields: Object,
});

const Form = mongoose.model("Form", formSchema);

app.post("/api/forms", async (req, res) => {
  console.log("DB access request---");
  try {
    const form = new Form({
      heading: req.body.heading,
      fields: req.body.fields,
    });

    await form.save();
    res.status(200).json({ message: "Accepted", id: form._id });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error posting form configuration", status: error });
  }
});
app.get("/api/forms/:id", async (req, res) => {
  console.log("Fetch request: ", req.params.id);
  try {
    const form = await Form.findById(req.params.id);
    if (form) {
      res.send(form);
    } else {
      res
        .status(404)
        .json({ message: "Form configuration not found", status: 404 });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching form configuration", status: error });
  }
});
app.get("/", async (req, res) => {
  res.json({
    message: "Hello World ",
    description: "Welcome to Form Access API // Made for DOTForm",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running!!!`);
});
