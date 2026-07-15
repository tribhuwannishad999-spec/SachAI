const openrouter = require("./providers/openrouter");
const gemini = require("./providers/gemini");
const openai = require("./providers/openai");
const deepseek = require("./providers/deepseek");
const github = require("./providers/github");
const fal = require("./providers/fal");

const providers = [
  openrouter,
  gemini,
  openai,
  deepseek,
  github,
  fal,
];

async function analyzeImage(image) {
  for (const provider of providers) {
    try {
      const result = await provider.analyze(image);
      if (result) return result;
    } catch (err) {
      console.log(`${provider.name} failed`);
    }
  }

  throw new Error("All AI providers failed.");
}

module.exports = {
  analyzeImage,
};
