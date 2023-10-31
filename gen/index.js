const generate = require("./generate");
const newsletter = require("./newsletter");

const run = async () => {
  await generate();
  await newsletter();
};

run();
