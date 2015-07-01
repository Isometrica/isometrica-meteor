#!/bin/bash

#
# Easily rename html templates from our old Isometrica code base.
#
# # Usage
# - `private/shell/htmlExtRn.sh <module-name>`
#
# # Requirements
# - `rename`: `brew install rename`
#
# @author Steve Fortune
#

MODULE_NAME=$1

if [[ -n $MODULE_NAME ]]; then
  rename 's/.html$/.ng.html/' $(pwd)/client/$1/**/*.html
else
  echo "First arg required !";
  exit 1;
fi
