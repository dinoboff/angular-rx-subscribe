#!/usr/bin/env bash
#
set -e

if [[ -z "$1" ]]; then
	echo "The release type (major, minor, patch...) is missing."
	exit 1
fi

npm run lint-no-fix
npm run test
npm run build
NEW_VERSION=`npm version "$1" | cut -d ' ' -f1`

# cd dist/
# npm publish
# cd ..

echo "git push git@github.com:dinoboff/angular-rx-subscribe.git master ${NEW_VERSION}"
git push git@github.com:dinoboff/angular-rx-subscribe.git master $NEW_VERSION