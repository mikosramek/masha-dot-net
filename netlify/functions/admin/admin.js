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
    <a href="/newsletter/" target="_blank"
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

          fetch("%URL%/.netlify/functions/newsletter", {
            method: "POST",
            headers: {
              passkey: "${process.env.ADMIN_PASSWORD}",
              mode: "preview",
            },
          })
            .then((res) => {
              const { status } = res;
              if (status === 200) {
                setMessage("#preview-message", "Preview sent!");
              } else {
                setMessage("#preview-message", "An error occured");
              }
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

          fetch("%URL%/.netlify/functions/newsletter", {
            method: "POST",
            headers: {
              passkey: "${process.env.ADMIN_PASSWORD}",
              mode: "production",
            },
          })
            .then((res) => {
              const { status } = res;
              if (status === 200) {
                setMessage("#preview-message", "Newsletter sent!");
              } else {
                setMessage("#preview-message", "An error occured");
              }
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

  // const newsletterURL = `%URL%/.netlify/functions/newsletter`;

  // https://www.fabiofranchino.com/log/get-the-path-parameter-from-a-netlify-function/
  const providedPass = event.path
    .replace("/.netlify/functions/admin/admin", "")
    .replace(/\//gim, "");

  const isDEV = process.env.CONTEXT === "dev";

  let deployment = "";
  if (!isDEV) {
    const data = context.clientContext?.custom?.netlify;
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    deployment = decoded.site_url ?? "";
  }
  const updatedHTML = html.replaceAll(
    "%URL%",
    isDEV ? process.env.DEPLOY_URL : deployment
  );

  if (pass === providedPass) {
    return {
      statusCode: 200,
      body: updatedHTML,
    };
  } else {
    return {
      statusCode: 403,
      body: "Nuhuh",
    };
  }
};
