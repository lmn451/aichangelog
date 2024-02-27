import fs from "fs";
import OpenAI from "openai";
import { exec } from "node:child_process";
import semver from "semver";

const args = process.argv;
const [, , path = "."] = args;
const apiKey = process.env.OPENAI_KEY;

const openai = new OpenAI({ apiKey });
const packageJsonPath = "package.json";
const changelogFilename = `CHANGELOG_test.md`;

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd: path, maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(new Error(stderr));
        resolve(stdout.trim());
      }
    );
  });
}

async function sendToOpenAI(diff) {
  const messages = [
    {
      role: "system",
      content:
        "You are a principal dev who loves and knows how to write concise and descriptive changelogs informative for business.",
    },
    {
      role: "user",
      content: `Extract a concise and informative changelog from the following diff:\n${diff}
        ### Version {{ version }}
#### Changes in {{filename}}
- {{changes}}
- {{changes}}

#### Changes in {{anotherfile}}
- {{changes}}
- {{changes}}

TLDR: {{ concise description of changes}}`,
    },
  ];

  return openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      messages,
    })
    .then((response) => response.choices[0].message.content)
    .catch((error) => {
      console.error("Error sending data to OpenAI:", error);
      throw error;
    });
}
const commitsString = await executeCommand(
  `git log -p -G'"version": "[0-9]+\\.[0-9]+\\.[0-9]+"' --pretty=format:"%H" -- ${packageJsonPath} | grep -oE '^[a-f0-9]{40}$'`
);
const hashes = commitsString.split("\n").filter(Boolean).reverse();
const changelogEntries = await Promise.all(
  hashes.slice(0, -1).map(async (currentCommit, i) => {
    const nextCommit = hashes[i + 1];
    const packageJsonString = await executeCommand(
      `git show ${nextCommit}:${packageJsonPath}`
    );
    const packageJson = JSON.parse(packageJsonString);
    const diff = await executeCommand(
      `git diff ${currentCommit} ${nextCommit} -- . ':(exclude)*lock*' ':(exclude)*changelog*'`
    );
    const changelogEntry = await sendToOpenAI(diff);
    return { version: packageJson.version, content: changelogEntry };
  })
);

const sortedChangelogEntries = changelogEntries.sort((a, b) =>
  semver.compare(b.version, a.version)
);
const changelogContent = sortedChangelogEntries
  .map((entry) => entry.content)
  .join("\n\n");

fs.writeFileSync(
  changelogFilename,
  `# Changelog  [created by aichangelog](https://github.com/lmn451/aichangelog) \n\n${changelogContent}`
);
