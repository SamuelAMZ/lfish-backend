const express = require("express");
const contactRoute = express.Router();
const axios = require("axios");
require("dotenv").config();

contactRoute.post("/", async (req, res) => {
  const { name, email, message, captcha, page, date } = req.body;

  //   validate
  const Joi = require("@hapi/joi");
  const schema = Joi.object({
    name: Joi.string().max(24).required(),
    email: Joi.string().required().email().max(50).lowercase(),
    message: Joi.string().required().max(1240),
    captcha: Joi.string(),
  });

  try {
    const validation = await schema.validateAsync({
      name,
      email,
      message,
      captcha,
    });
  } catch (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  // check captacha is valid
  let secretKey = process.env.CAPTCHA_SELF_SECRET;
  let captchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
  axios
    .get(captchaUrl)
    .then((res) => {
      if (res.data.success !== true) {
        return res.status(400).json({ message: "erreur" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "erreur" });
    });

  // message to send
  let messageLfish = `
  <html>
  <head>
  <style>
      body {
        padding: 0;
        margin: 0;
        background-color: #d0d0d05a;
        padding: 2rem;
      }
      div {
        padding: 0;
      }
    </style>
  </head>
  <body>
    <h2>Nouveau message venant du formulaire de contact du portfolio site</h2>
    <div>
      <p>Nom: ${name}</p>
      <p>Email: ${email}</p>
      <p>Message: ${message}</p>
      <br>
      ----------------
      <br>
      <p>Page: ${page}</p>
      <p>Date: ${date}</p>
    </div>
  </body>
</html>
  `;

  // send email
  let url = "https://api.sendgrid.com/v3/mail/send";
  let config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  };

  axios
    .post(
      url,
      {
        personalizations: [
          {
            to: [
              { email: "samueldevpro09@gmail.com", name: "Portfolio contact" },
            ],
            subject: "Portfolio Site new contact",
          },
        ],
        content: [{ type: "text/html", value: messageLfish }],
        from: { email: "lfish-cheznous@lfishtogo.com", name: "lfish" },
        reply_to: { email: `${email}`, name: `${name}` },
      },
      config
    )
    .then(function (response) {
      return res.status(200).json({ message: "success" });
    })
    .catch(function (error) {
      return res.status(400).json({ message: "error" });
    });
});

module.exports = contactRoute;
