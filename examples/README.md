This directory includes demo projects which can be used to profile the performance differences between different ways of using nfa-map.

## Getting started

Run `npm install` in each example project;

```sh
npm run install-all
```

Run 10 iterations of a performance test against each example project and report the results;

```sh
npm test
```

### Individual examples

e.g.

```sh
cd simple-html-consumer/
```

Build;

```sh
npm run build
```

Run a single iteration of a performance test and report the results;

```sh
npm test
```

Run a production-like server from the dist directory;

```sh
npm run serve-dist
```
