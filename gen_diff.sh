#!/bin/bash

# Path to the changes.txt file with commit hashes
changes_file="changes.txt"

# Read commit hashes from file into an array
commit_hashes=()

# Read commit hashes from file into an array
while IFS= read -r line; do
    commit_hashes+=("$line")
done < "$changes_file"

# Loop through the commit hashes and generate diffs
for (( i=0; i < ${#commit_hashes[@]} - 1; i++ )); do
    # Get the current and next commit hashes
    current_commit="${commit_hashes[$i]}"
    next_commit="${commit_hashes[$i+1]}"

    # Get the version number from package.json at the next commit
    next_version=$(git show "$next_commit":package.json | grep '"version":' | sed -E 's/.*"version": *"([^"]+)".*/\1/')

    # Generate the diff and output to a file named diff_[version].txt, where [version] is the version number from package.json
    diff_filename="diff_${next_version}.txt"
    git diff "$current_commit" "$next_commit" -- . ':(exclude)*lock*' > "$diff_filename"
    echo "$diff_filename"
done

echo "Generated diffs for all consecutive versions listed in changes.txt."