#!/usr/bin/env bash
set -e

# Colima uses a non-default socket; SAM CLI needs DOCKER_HOST to find it.
# Docker Desktop users can leave DOCKER_HOST unset.
if [ -z "${DOCKER_HOST}" ] && [ -S "${HOME}/.colima/default/docker.sock" ]; then
  export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
fi

sam build && sam local start-api
