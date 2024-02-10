const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const apiKey = process.env.OPENAI_KEY;

const openai = new OpenAI({
  apiKey,
});

async function sendToOpenAI(diff) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are principal dev who loves and knows how to write concise and descriptive changelogs",
      },
      {
        role: "user",
        content: `Extract a changelog from the following diff:\n${diff}`,
      },
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // adjust for specific model
      messages: messages,
    });
    return response.choices[0].message.content; // extract changelog
  } catch (error) {
    console.error("Error sending data to OpenAI:", error);
    // Handle API-specific errors here
  }
}

// Function to get a list of all diff files
function getDiffFiles(dirPath) {
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.startsWith("diff_"))
    .map((file) => path.join(dirPath, file));
}

// Function to read file content
function getFileContent(filePath) {
  return fs.readFileSync(filePath, { encoding: "utf8" });
}

// The main function to generate changelog
async function generateChangelog() {
  const diffFiles = getDiffFiles("."); // Adjust the path if necessary

  for (const file of diffFiles) {
    const diff = getFileContent(file);
    const filename = file.substring(file.lastIndexOf("diff"));
    const changelog = await sendToOpenAI(diff);
    const changelogFilename = `changelog_${filename.replace("diff_", "")}`;

    // Write the changelog to a file
    fs.writeFileSync(changelogFilename, changelog);
  }
}

generateChangelog();
