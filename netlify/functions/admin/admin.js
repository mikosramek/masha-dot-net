const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dovecot Press Admin</title>
  </head>
  <body>
    <h1>Dovecot Press Admin</h1>
    <a href="${process.env.DEPLOY_URL}/newsletter/" target="_blank"
      >Current Newsletter</a
    >

    <h2>Preview Newsletter</h2>
    <button id="preview">Send Preview Newsletter</button>
    <p id="preview-message"></p>

    <h2>Production Newsletter</h2>
    <button id="production">Send Production Newsletter</button>
    <p id="main-message"></p>

    <script>
      const setMessage = (id, message) => {
        document.querySelector(id).innerText = message;
        setTimeout(() => {
          document.querySelector(id).innerText = "";
        }, 5000);
      };

      // PREVIEW
      document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("#preview").addEventListener("click", () => {
          const send = confirm("Send preview newsletter?");
          if (!send) {
            setMessage("#preview-message", "Preview not sent");
            return;
          }
          setMessage("#preview-message", "Sending...");

          fetch("${process.env.DEPLOY_URL}/.netlify/functions/newsletter", {
            method: "POST",
            headers: {
              passkey: "${process.env.ADMIN_PASSWORD}",
              mode: "preview",
            },
          })
            .then((res) => {
              setMessage("#preview-message", "Preview sent!");
            })
            .catch((error) => {
              console.error(error);
              setMessage("#preview-message", "An error occured");
            });
        });

        // PRODUCTION
        document.querySelector("#production").addEventListener("click", () => {
          const send = confirm("Send production newsletter?");
          if (!send) {
            setMessage("#main-message", "Newsletter not sent");
            return;
          }
          setMessage("#main-message", "Sending...");

          fetch("${process.env.DEPLOY_URL}/.netlify/functions/newsletter", {
            method: "POST",
            headers: {
              passkey: "${process.env.ADMIN_PASSWORD}",
              mode: "production",
            },
          })
            .then((res) => {
              setMessage("#main-message", "Newsletter sent!");
            })
            .catch((error) => {
              console.error(error);
              setMessage("#main-message", "An error occured");
            });
        });
      });
    </script>
  </body>
</html>

`;

export const handler = async (event, context) => {
  const pass = process.env.ADMIN_PASSWORD;

  // const newsletterURL = `${process.env.DEPLOY_URL}/.netlify/functions/newsletter`;

  // https://www.fabiofranchino.com/log/get-the-path-parameter-from-a-netlify-function/
  const providedPass = event.path
    .replace("/.netlify/functions/admin/admin", "")
    .replace(/\//gim, "");

  if (pass === providedPass) {
    return {
      statusCode: 200,
      body: html,
    };
  } else {
    return {
      statusCode: 403,
      body: "Nuhuh",
    };
  }
};
