#!/usr/bin/env bash
#
# !!! Assumed to be run via a npm run command !!!
# 
set -e

DIST=dist/
OUTPUT=${DIST}/angular-rx-subscribe.js
OUTPUT_MIN=${DIST}/angular-rx-subscribe.min.js

# Clean up
rm -rf "$DIST"
mkdir -p "$DIST"

# Copy assets
cp LICENSE README.md tools/assets/dist/* "$DIST"

# Transcode and bundle tests in a format nodejs can load.
jspm build angular-rx-subscribe - angular "$OUTPUT" \
	--format umd --global-name ngRxSubscribe --global-deps "{'angular':'angular'}" \
	--skip-source-maps
jspm build angular-rx-subscribe - angular "$OUTPUT_MIN" \
	--format umd --global-name ngRxSubscribe --global-deps "{'angular':'angular'}" \
	--skip-source-maps --minify