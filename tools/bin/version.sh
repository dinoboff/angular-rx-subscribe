#!/usr/bin/env bash
#
# !!! Assumed to be run via a npm run command !!!
# 
set -e

cd tools/assets/dist
npm version --no-git-tag-version "$npm_package_version"
git add package.json