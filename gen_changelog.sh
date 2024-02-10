#!/bin/bash

# Define the path to package.json
PACKAGE_JSON_PATH='package.json'
# Define the path to the output file where the diffs will be saved
OUTPUT_FILE='version-diffs.txt'

# Get commits that touched the version field of package.json, in reverse order
# This uses git log with a regexp to target lines that started with a version number change.
commit_hashes=$(git log -p -G'"version": "[0-9]+\.[0-9]+\.[0-9]+"' --pretty=format:"%H" -- $PACKAGE_JSON_PATH | grep -oE '^[a-f0-9]{40}$' | tail -r)

# Check if commit hashes were found
if [ -z "$commit_hashes" ]; then
    echo "No commits found modifying the version in package.json."
    exit 1
fi

# Convert the list of commit hashes into an array
commit_array=()

while IFS= read -r commit_hash; do
    commit_array+="$commit_hashes"
done <<< "$commit_hashes"

# Initialize the previous commit hash
prev_commit_hash=''

# Clear or create the output file
echo "" > "$OUTPUT_FILE"

# Loop over the array of commit hashes
for commit_hash in "${commit_array[@]}"; do
    if [ -n "$prev_commit_hash" ]; then
        # Generate the diff and append to the output file
        echo "Diff between $prev_commit_hash and $commit_hash:" >> "$OUTPUT_FILE"
        git diff "$prev_commit_hash" "$commit_hash" -- $PACKAGE_JSON_PATH >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
    # Update the previous commit hash
    prev_commit_hash=$commit_hash
done

echo "Diffs between version changes saved to $OUTPUT_FILE."