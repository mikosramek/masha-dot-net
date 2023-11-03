const Mailjet = require("node-mailjet");

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

const isDev = process.env.IS_DEV === "true";

const sendMail = async (html, issueTitle) => {
  return new Promise((res, rej) => {
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "newsletter@dovecotpress.com",
            Name: "Masha from Dovecot Press",
          },
          To: [
            {
              Email: process.env.MJ_MAGIC_EMAIL,
            },
          ],
          Subject: `${isDev ? "PREVIEW: " : ""}Dovecot Press; ${issueTitle}`,
          TextPart: "See the latest update from Dovecot Press!",
          HTMLPart: html,
        },
      ],
    });

    request
      .then(() => {
        res();
      })
      .catch((err) => {
        rej(err);
      });
  });
};

module.exports = sendMail;
