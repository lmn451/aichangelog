# AI-Powered Changelog Generator

This script leverages the power of OpenAI's language model to assist in generating a concise and informative changelog from your project's git history.

## Features
- Fetches commit history and interprets changes using OpenAI's language model. (Feel free to add another options)
- Filters out non-version commits for brevity.
- Generates a human-readable changelog file.

## Requirements
- Node.js installed on your system.
- An OpenAI API key set as an environment variable (`OPENAI_KEY`). (Feel free to add another options)
- A Git repository with commits following semantic versioning in `package.json`.

 ## How It Works
 
- Reads through Git commit history to find commits where the `version` field in `package.json` has changed.
- Uses OpenAI to interpret the diff between these version-related commits to human-readable changelog entries.
- Creates or updates `CHANGELOG_test.md` with the sorted entries. (Feel free to add another options)
