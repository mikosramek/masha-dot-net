import fetch from "node-fetch";

// send out newsletter
export const handler = async (event, context) => {
  try {
    console.log(event, context);

    const secret = process.env.WEBHOOK_FOR_EMAIL;
    const url = process.env.SITE_URL ?? "http://localhost:8888";

    const response = await fetch(`${url}/newsletter/`);
    const body = await response.text();

    // body is just the html

    return {
      statusCode: 200,
      body,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "error",
        error,
      }),
    };
  }
};
