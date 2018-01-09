# Installation

```
npm install -g @angular/cli
npm install
```

## Branches
`git checkout -b x-name`

x reference to issue

## Commits

`git commit -p`

Split diff to exclude non-necesary code

#x in commit message

# Babylon

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Docker

If you want to build and use *ng serve* for development, you need to install dependencies in your local repository.
For mac user, you can skip *--user $UID:$(id -g $UID)*.
```bash
$ docker build -t insanity .
$ docker run --rm -it -v $PWD:/app --user $UID:$(id -g $UID) insanity install
```

You can now use your local repository for development and use hotswap.
```bash
$ docker run --rm -it -v $PWD:/app -p 4200:4200 insanity
```

Otherwise, you can use the base image if you don't want node_modules/ folder.
```bash
$ docker run --rm -it -p 4200:4200 insanity
```

## Npm

If you want to use npm script to use docker commands

#### Build
```bash
npm run-script build-insanity
```

#### Install
mac user

```bash
npm run-script install-insanity-mac
```

other user
```bash
npm run-script install-insanity-all
```

#### Run
```bash
npm run-script insanity
```
