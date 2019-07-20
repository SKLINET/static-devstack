# SKLINET static-devstack

A webpack 4 based boilerplate for building web apps

## Features:

- [Pug](https://pugjs.org) as a template engine
- [SCSS](http://sass-lang.com) preprocessor for CSS ([autoprefixer](https://github.com/postcss/autoprefixer) included)
- JS linting with [Eslint](https://eslint.org), extends [eslint-config-standard](https://github.com/standard/eslint-config-standard), includes the following plugins:
  - [import](https://github.com/benmosher/eslint-plugin-import)
  - [node](https://github.com/mysticatea/eslint-plugin-node)
  - [promise](https://github.com/xjamundx/eslint-plugin-promise)
  - [compat](https://github.com/amilajack/eslint-plugin-compat)
- CSS linting with [Stylelint](http://stylelint.io)

## Usage:

- Clone the repo via `git clone git@github.com:SKLINET/static-devstack.git`
- `cd static-devstack`
- Run `npm i` to fetch all the dependencies
- Run `npm run dev` to start the [webpack-dev-server](https://github.com/webpack/webpack-dev-server) (`localhost:8080` will be opened automatically)
- Start developing
- When you are done, run `npm run build` to get the prod version of your app
