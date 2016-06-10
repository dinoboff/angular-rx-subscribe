#!/usr/bin/env bash
#
# !!! Assumed to be run via a npm run command !!!
# 
set -e

npm run lint-no-fix
npm run test
npm run build
NEW_VERSION=`npm version ${1:-preminor}`

cd dist/
npm publish

git push git@github.com:dinoboff/angular-rx-subscribe.git master $NEW_VERSION