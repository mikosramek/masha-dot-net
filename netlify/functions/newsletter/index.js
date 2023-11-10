import fetch from "node-fetch";

const sendMail = require("./mail");

export const handler = async (req, context) => {
  const { mode, passkey } = req.headers;

  const isDEV = process.env.CONTEXT === "dev";

  if (mode !== "preview" && mode !== "production") {
    return {
      statusCode: 400,
      body: "mode missing or incorrect",
    };
  }
  if (passkey !== process.env.ADMIN_PASSWORD) {
    return {
      statusCode: 403,
      body: "passkey missing or incorrect",
    };
  }

  // double check if the newsletter html is there in body
  const data = await fetch(
    `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/files`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NETLIFY_TOKEN}`,
      },
    }
  );
  const body = JSON.parse(await data.text());

  let newsletterExists = false;
  for (let i = 0; i < body.length; i += 1) {
    // /newsletter/index.html
    const { id } = body[i];
    if (id === "/newsletter/index.html") {
      newsletterExists = true;
    }
  }

  if (!newsletterExists) {
    return {
      statusCode: 500,
      body: "Newsletter can't be found, check latest build for any issues",
    };
  }

  let deployment = "";
  if (!isDEV) {
    const data = context.clientContext?.custom?.netlify;
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    deployment = decoded.site_url ?? "";
  }

  // fetch that HTML from the live site
  const newsletterResponse = await fetch(
    `${isDEV ? process.env.DEPLOY_URL : deployment}/newsletter/index.html`
  );
  const newsletterHTML = await newsletterResponse.text();

  // set target
  const targetEmail =
    mode === "production"
      ? process.env.MJ_PRODUCTION_EMAIL
      : process.env.MJ_PREVIEW_EMAIL;

  // get title + set subject
  const splitHTML = newsletterHTML.split("\n");
  const titleIndex =
    splitHTML.findIndex((a) => a.includes(`id="newsletter-title"`)) + 1;
  const title = splitHTML[titleIndex].trim();

  const subject = `${
    mode === "preview" ? "PREVIEW: " : ""
  }Dovecot Press: ${title}`;

  // send mail using fetched html
  await sendMail(newsletterHTML, targetEmail, subject);

  return {
    statusCode: 200,
    body: "newsletter",
  };
};
