#!/bin/bash
docker rmi vhalme/txlinks-api:latest
if [ -z "$1" ] && [ -z "$2" ]
then
  docker build -t vhalme/txlinks-api .
  exit
fi

if [ "$1" == "--no-cache" ]
then
  docker build -t vhalme/txlinks-api --no-cache .
  exit
fi

docker build -t vhalme/txlinks-api:$1 .
if [ ! -z "$2" ]
then
  if [ "$2" == "--no-cache" ]
  then
    docker build -t vhalme/txlinks-api:$1 --no-cache .
    exit
  fi
  docker tag vhalme/txlinks-api:$1 vhalme/txlinks-api:$2 $3 .
fi
