// send out newsletter
export const handler = async () => {
  try {
    const html = require("../../build/newsletter/raw/index.html");

    return {
      statusCode: 200,
      body: JSON.stringify({ html }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "error",
        error,
      }),
    };
  }
};
