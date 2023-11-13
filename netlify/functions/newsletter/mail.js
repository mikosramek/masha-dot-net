const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_KEY);

const sendMail = async (html, targetListID, subject) => {
  return new Promise((res, rej) => {
    const senderID = parseInt(process.env.SENGRID_SENDER_ID);
    const supGroup = parseInt(process.env.SENDGRID_SUPRESSION_LIST_ID);
    const data = {
      name: subject,
      send_to: {
        list_ids: [targetListID],
      },
      email_config: {
        subject,
        html_content: html,
        sender_id: senderID,
        suppression_group_id: supGroup,
      },
    };

    const request = {
      url: `/v3/marketing/singlesends`,
      method: "POST",
      body: data,
    };

    client
      .request(request)
      .then(([response]) => {
        const { id } = response.body;
        if (!id) {
          const e = new Error("no id for scheduled newsletter");
          console.error(e);
          return rej(e);
        }

        client
          .request({
            url: `/v3/marketing/singlesends/${id}/schedule`,
            method: "PUT",
            body: {
              send_at: "now",
            },
          })
          .then(() => {
            res();
          })
          .catch((error) => {
            console.log(error);
            console.error(error.response.body.errors);
            rej(error);
          });
      })
      .catch((error) => {
        console.error(error);
        console.error(error.response.body.errors);
        rej(error);
      });
  });
};

module.exports = sendMail;
