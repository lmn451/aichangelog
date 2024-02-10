const fs = require("fs");
const path = require("path");
const semver = require("semver");

// Define the path to the directory with changelog files
const changelogDir = "./"; // Change this to the path of your changelog files directory
const compiledChangelogPath = path.join(changelogDir, "COMPILED_CHANGELOG.md");

// Function to compile changelogs
function compileChangelogs(dirPath) {
  // Initialize the content of the compiled changelog file
  let compiledChangelog =
    "# Changelog  [created by aichangelog](https://github.com/lmn451/aichangelog) \n\n";

  // Read the directory for changelog files
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.startsWith("changelog_") && file.endsWith(".txt"));

  files
    .map((file) => ({
      filename: file,
      version: file.match(/^changelog_(.*?)\.txt$/)[1], // Extract version
    }))
    .sort((a, b) => semver.compare(b.version, a.version))
    .forEach((file) => {
      // Extract the version number from the file name
      const version = file.filename.match(/changelog_(.*?)\.txt/)[1];

      // Read the content of the changelog file
      const changelogContent = fs.readFileSync(
        path.join(dirPath, file.filename),
        {
          encoding: "utf8",
        }
      );

      // Append a heading with the version and the content to the compiled changelog
      compiledChangelog += `## Version ${version}\n\n`;
      compiledChangelog += `${changelogContent}\n\n`;
    });

  // Write the compiled changelog to a file
  fs.writeFileSync(compiledChangelogPath, compiledChangelog);
  console.log(`Compiled changelog written to ${compiledChangelogPath}`);
}

// Run the function to compile changelogs
compileChangelogs(changelogDir);
