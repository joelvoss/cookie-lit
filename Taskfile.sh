#!/bin/bash
PATH=./node_modules/.bin:$PATH

# //////////////////////////////////////////////////////////////////////////////

# Default task (executed when no <task> argument was given)
function default {
  validate
  build
}

function start {
  node ./dist/index.js
}

function build {
  jvdx build rollup 'src/index.ts' -f cjs,esm -c
}

function format {
  jvdx format "${@:1}"
}

function lint {
  jvdx lint "${@:1}"
}

function test {
  jvdx test
}

function validate {
  format "${@:1}"
  lint "${@:1}"
  test
}

function clean {
  jvdx clean dist "${@:1}"
}

# //////////////////////////////////////////////////////////////////////////////

function help {
  printf "$(_now) Usage: $0 <task> <args>\n\n"
}

function _now {
  time=$(date +'%H:%M:%S')
  printf "\e[2m[$time]\e[0m"
}

function _checkmark {
  printf "\e[1m\e[32m✓\e[0m"
}

TASK=${@:-default}

printf "$(_now) \e[1m\e[96mTaskfile\e[0m $TASK\n\n"
${@:-default}
printf "\n"