#!/usr/bin/env bash

set -e
set -o pipefail

# https://unix.stackexchange.com/a/92907
case $(sed --help 2>&1) in
  *GNU*) safe_sed () { sed -i "$@"; };;
  *) safe_sed () { sed -i '' "$@"; };;
esac

safe_sed \
  's/@slate-yjs\/core/@alineco\/slate-yjs-core/g; s/@slate-yjs\/react/@alineco\/slate-yjs-react/g' \
  $(git ls-files | grep -v '\.gif\|replace-package-names\.sh')

COUNT=$(git diff --name-only | wc -l | bc)

echo "Replaced @slate-yjs/core with @alineco/slate-yjs-core and @slate-yjs/react with @alineco/slate-yjs-react in $COUNT files" > /dev/stderr
echo > /dev/stderr
printf "\e[0;33mThis script is only intended to be used as part of the release.yml GitHub Actions workflow. If you ran it by mistake, use \`git checkout -- .\` to undo these changes. Do not commit any files with the replaced package names to Git.\e[0m\n" > /dev/stderr
