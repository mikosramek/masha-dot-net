// send out newsletter
export const handler = async () => {
  try {
    // const body = await attemptMail();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "correct" }),
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
