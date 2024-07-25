const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");

const app = express();
app.use(bodyParser.json());
const allowedOrigins = ["https://dotform-cosmic365.vercel.app"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);
require("dotenv").config();
const uri = process.env.MONGO_URI;
const sender = process.env.USER;
const senderAuth = process.env.AUTH;
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB database successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
const Schema = mongoose.Schema;

const formSchema = new Schema({
  heading: String,
  fields: Object,
});

const Form = mongoose.model("Form", formSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: sender, pass: senderAuth },
});

app.post("/api/send-email", upload.single("file"), (req, res) => {
  const { name, email } = req.body;
  const file = req.file;
  let recipient = email;
  if (!file) {
    return res.status(400).send({ message: "No file uploaded" });
  }
  const mailOptions = {
    from: sender,
    to: recipient,
    subject: "Form Submission Successful",
    text: `Hello ${name}, please find the attached PDF.`,
    attachments: [
      {
        filename: `${name}_Submission.pdf`,
        content: file.buffer,
        contentType: file.mimetype,
      },
    ],
  };

  console.log("Email Postage Initiated!!");
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res
      .status(200)
      .json({ message: "Email sent successfully: " + info.response });
    console.log("Email Sent Successfully To", recipient);
  });
});

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

// http://localhost:${PORT}/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running!!!`);
});
