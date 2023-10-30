const generate = require("./generate");

const run = () => {
  const [_, __, mode = "web"] = process.argv;
  generate(mode);
};

run();
