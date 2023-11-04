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
    <h2>Preview Newsletter</h2>
    <button id="preview">Build + Send Preview</button>
    <p id="preview-message"></p>
    <a href="https://preview--dove-cot-press.netlify.app/" target="_blank">preview site</a> |
    <a href="https://preview--dove-cot-press.netlify.app/newsletter/" target="_blank">preview newsletter</a>

    <h2>Production Newsletter</h2>
    <button id="production">Build + Send Newsletter</button>
    <p id="main-message"></p>
    <a href="https://dovecotpress.com/" target="_blank">dovecotpress.com</a>
    <a href="https://dovecotpress.com/newsletter/" target="_blank">newsletter</a>
    <script>
      const setMessage = (id, message) => {
        document.querySelector(id).innerText = message;
        setTimeout(() => {
          document.querySelector(id).innerText = '';
        }, 5000)
      }

      document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("#preview").addEventListener("click", () => {
          const send = confirm("Send preview?");
          if (!send) {
            setMessage('#preview-message', "Preview not sent");
            return;
          };
          setMessage('#preview-message', "Sending...");

          fetch("${process.env.PREVIEW_HOOK}", {
            method: "POST",
          })
            .then((res) => {
              setMessage("#preview-message", 'Preview sent!');
            })
            .catch((error) => {
              console.error(error);
              setMessage("#preview-message", 'An error occured');
            });
        });
        document.querySelector("#production").addEventListener("click", () => {
          const send = confirm("Send newsletter?");
          if (!send) {
            setMessage("#main-message", "Newsletter not sent");
            return;
          }
          setMessage("#main-message", "Sending...");

          fetch("${process.env.PRODUCTION_HOOK}", {
            method: "POST",
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
