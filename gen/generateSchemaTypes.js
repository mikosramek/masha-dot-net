const path = require("path");
const { MNPG } = require("@mikosramek/mnpg");
require("dotenv").config();

const fileGen = require("./utils/gen-utils");

const prismicName = process.env.PRISMIC_NAME ?? "";
const secret = process.env.PRISMIC_ACCESS_TOKEN ?? "";

const client = new MNPG(prismicName, secret);

const getSchema = async () => {
  await client.createFragments(fileGen.schemaPath);
};

getSchema();
