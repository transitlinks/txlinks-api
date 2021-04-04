#!/bin/bash
cd /transitlinks/txlinks-api
if [ ! -z "$GIT_BRANCH" ]
then
  git checkout $GIT_BRANCH
fi
if [ ! -z "$GIT_UPDATE" ]
then
  if [ ! -z "$GIT_SHA1" ]
  then
    git reset --hard $GIT_SHA1
  else
    git pull
  fi
  yarn build
fi
yarn start
