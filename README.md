# react-widget-setup-2021

A boilerplate for creating a React widget (UMD library).

[1. About](#1-about)  
[2. How It Works](#2-how-it-works)  
&nbsp; &nbsp; [2-1. UMD Library](#2-1-umd-library)  
&nbsp; &nbsp; [2-2. APIPlugin - Using Webpack Hash](#2-2-apiplugin---using-webpack-hash)  
&nbsp; &nbsp; [2-3. App Structure](#2-3-app-structure)  
&nbsp; &nbsp; &nbsp; &nbsp; [(a) Basic Entry](#a-basic-entry)  
&nbsp; &nbsp; &nbsp; &nbsp; [(b) Calling from Other React Apps](#b-calling-from-other-react-apps)  
[3. What I Did](#3-what-i-did)  
&nbsp; &nbsp; [3-1. Installed NPM Packages All](#3-1-installed-npm-packages-all)  
&nbsp; &nbsp; [3-2. Babel](#3-2-babal)  
&nbsp; &nbsp; [3-3. Webpack](#3-3-webpack)  
&nbsp; &nbsp; [3-4. Loaders](#3-4-loaders)  
&nbsp; &nbsp; [3-5. Other Build Tools](#3-5-other-build-tools)  
&nbsp; &nbsp; [3-6. Emotion](#3-6-emotion)  
&nbsp; &nbsp; [3-7. Other Dependencies](#3-7-other-dependencies)  
[4. Dev + Build](#4-dev--build)  
[5. Notes](#5-notes)  
&nbsp; &nbsp; [5-1. Issues: webpack-dev-server](#5-1-issues-webpack-dev-server)  
&nbsp; &nbsp; [5-2. Issues: Tailwind](#5-2-issues-tailwind)  
[6. LICENSE](#6-license)

![screenshot](screenshot.png)

[View Demo](http://tokyo800.jp/mina/react-widget-setup-2021/)

<a id="about"></a>

## 1. About

#### Embedded React Widget

This is a recap of
[the previous version](https://github.com/minagawah/react-widget-airport)
but made it simpler.

This is an attempt to show how you can bundle your React app into a widget (UMD library).  
Instead of being _"installed"_, this app is to be _"embedded"_ in other apps.  
(or, you can totally call it from another React apps.
_[See Example](#c-calling-from-other-react-apps)_)

It exposes the widget globally (in our case `Gradient`).  
So, this is how embedding is done:

```html
<script
  crossorigin
  src="https://unpkg.com/react@17/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
></script>

<script type="text/javascript" src="./gradient.app.js"></script>

<script type="text/javascript">
  Gradient.app.init();
</script>
```

Notice this app depends on external `react` and `react-dom`.  
Although it is not strictly necessary,
it is better that we define `peerDependencies` in `package.json`:

`package.json`

```
  "peerDependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  }
```

#### SharedWorker

As you can see, it outputs 2 bundle files (you can output 1).
For this app, one of the files is for
_[SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker),_
and it allows the caller of the widget to send messages to the widget.  
Here is how a caller can send messages to its widget:

```js
const worker = new SharedWorker('./gradient.worker.js');

worker.port.postMessage({
  action: 'resize',
  payload: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
});
```

&nbsp;

### # Issues

Yeah. I have some issues. We all fail, right?

- `webpack-dev-server` fails ([see "5-2. Issues: webpack-dev-server"](#5-2-issues-webpack-dev-server))
- `twin.macro` (Tailwind macro) fails at runtime ([see notes](#5-3-issues-tailwind)).

&nbsp;

## 2. How It Works

### 2-1. UMD Library

Building an UMD library is relatively easy.  
It's just that we frequently bump into problems when working with `babel`...

`webpack.base.js`

```js
  entry: {
    app: './src/index.jsx',
    worker: './src/worker.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'gradient.[name].js?[hash]',
    library: ['Gradient', '[name]'],
    libraryTarget: 'umd',
  },
```

I have 2 entries in the above, but you can totally have only 1.  
I have 2 because one of them is for `SharedWorker`,
and it has to be an independent file.

To output only 1, you would do:

```js
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'gradient.js?[hash]',
    library: 'Gradient',
    libraryTarget: 'umd',
  },
```

`[hash]` isn't needed either.  
I am adding `[hash]` so that I don't have to hard reload browsers when making changes.

Now, back to UMD library.

The entry for the library look like this:

`src/index.jsx`

```jsx
export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('gradient')
  );
};
```

As you can see, it exports `init`.  
If you want to use `export default`,
then _[you need a special setup for babel](#5-1-issues-module-exportss)_.

The module is now exposed globally as `Gradient`.

When people want to use the widget,
they would download files from `dist` directory,
and embed them in their HTML pages:

- [gradient.app.js](dist/gradient.app.js) (173 KB)
- [gradient.worker.js](dist/gradient.worker.js) (50 KB)

For this project, I use `html-webpack-plugin` for a static page
so that I can test the widget.  
As far as creating a widget, you don't need this,
but for this time, this is for a testing purpose.

`src/index.html`

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="gradient"></div>

    <script
      crossorigin
      src="https://unpkg.com/react@17/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
    ></script>

    <script
      type="text/javascript"
      src="<%= htmlWebpackPlugin.files.js[0] %>"
    ></script>

    <script type="text/javascript">
      Gradient.app.init({
        WHATEVER_PARAMS_YOU_WANT,
      });
    </script>
  </body>
</html>
```

Notice in the above that

```html
<%= htmlWebpackPlugin.files.js[0] %>
```

is replaced with:

```html
/gradient.app.js?[WHATEVER_THE_HASH_GENERATED]
```

Once again, having HTML is only for testing reason.
Also, I didn't have to use `html-webpack-plugin` to generate the HTML page
but I could simply serve the HTML page statically.
I use `html-webpack-plugin` only because
I wanted to append a _"hash"_ to the resources
so that I don't have to worry about browser cache when developing.

### 2-2. APIPlugin - Using Webpack Hash

Alright. This has nothing to do with UMD library.
This is about sharing _"hash"_ generated between two files.
I told you in the previous that I use _"hash"_.
For the same _"hash"_ that is appended to `gradient.app.js`,
I want the same for `gradient.worker.js`.
Instead of having this:

```js
const worker = new SharedWorker('./my_worker.js');
```

we want something like this:

```js
const worker = new SharedWorker('./my_worker.js?4e066ad15f78a871e174');
```

This is where `APIPlugin` of Webpack's comes in.
`APIPlugin` exposes the hash generated by Webpack
as a special global variable `__webpack_hash__`,
and you can use the hash at runtime in your application.

`webpack.base.js`

```js
const APIPlugin = require('webpack/lib/APIPlugin');

module.exports = {
  ...
  ...
  plugins: [
    new APIPlugin(),
  ],
};
```

and it allows you to use the hash:

```js
const worker = new SharedWorker(`./my_worker.js?{__webpack_hash__}`);
```

&nbsp;

### 2-3. App Structure

It is probably worth describing how the app work.  
If you are only interested in UMD library, you may stop reading.

#### (a) Basic Entry

So, the app starts when it renders React app into a designated DOM:

`src/index.html`

```html
<div id="gradient"></div>

<script
  crossorigin
  src="https://unpkg.com/react@17/umd/react.production.min.js"
></script>
<script
  crossorigin
  src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
></script>

<script type="text/javascript" src="./gradient.app.js"></script>
```

`src/index.jsx`

```jsx
import { Widget } from './widget';

export const init = config => {
  ReactDOM.render(
    <Widget config={config} />,
    document.getElementById('gradient')
  );
};
```

Here, the prop `config` is _static_, and it is given from whoever passes.  
By saying _static_, it means, React will **_not_** pick up the changes
even when the starter change the content of the prop.

#### (b) Calling from Other React Apps

So, instead of embedding the widget in HTML pages,
you want to call it from other React apps?  
Here is an example from one of my working apps:

```jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import tw, { css } from 'twin.macro';

import { useDeviceSize } from '@/hooks/device';
import { useDebounce } from '@/hooks/debounce';
import { Layout } from '@/components/layout';

const MIN_WIDTH = 580;
const DEBOUNCE_MSEC = 1000;
const WORKER_FILE_PATH = '/assets/gradient.worker.js';

const layoutStyles = {
  header: tw`bg-black text-white`,
  content: tw`bg-black text-white`,
};

const contentStyle = css`
  min-height: 30vh;
  ${tw`p-4 flex flex-col justify-start items-start`}
`;

export const GradientDemo = () => {
  const { width: dw, height: dh } = useDeviceSize(null);
  const { t } = useTranslation();
  const [worker, setWorker] = useState();

  const dwDelay = useDebounce(dw, DEBOUNCE_MSEC);
  const dhDelay = useDebounce(dh, DEBOUNCE_MSEC);

  const resize = () => {
    let w = dw * 0.75;
    if (w < MIN_WIDTH) {
      w = MIN_WIDTH;
    }
    if (worker) {
      worker.port.postMessage({
        action: 'resize',
        payload: {
          width: w,
          height: w * 0.85,
        },
      });
    }
  };

  useEffect(() => {
    Gradient.app.init({ worker_file_path: WORKER_FILE_PATH });

    if (!worker) {
      // Set it only when don't have the worker to prevent from
      // another port being created when it is already mounted.
      setWorker(new SharedWorker(WORKER_FILE_PATH));
    }
  }, []);

  useEffect(() => {
    if (worker && worker.port) {
      resize();
    }
  }, [dwDelay, dhDelay, worker]);

  return (
    <Layout styles={layoutStyles}>
      <div id="content" css={contentStyle}>
        <div id="gradient"></div>
      </div>
    </Layout>
  );
};
```

&nbsp;

## 3. What I Did

### 3-1. Installed NPM Packages All

```
yarn add @emotion/react ramda

yarn add --dev @babel/core @babel/preset-env @babel/preset-react @babel/cli core-js@3 @babel/runtime-corejs3 babel-plugin-macros babel-loader file-loader style-loader css-loader postcss-loader webpack webpack-cli clean-webpack-plugin html-webpack-plugin copy-webpack-plugin license-webpack-plugin @emotion/babel-plugin-jsx-pragmatic autoprefixer prettier http-server
```

### 3-2. Babel

For `@babel/polyfill` has been deprecated, we use `core-js`.

- @babel/core
- @babel/preset-env
- @babel/cli
- core-js@3
- @babel/runtime-corejs3
- @babel/preset-react

```
yarn add --dev @babel/core @babel/preset-env @babel/cli core-js@3 @babel/runtime-corejs3 @babel/preset-react
```

### 3-3. Webpack

- webpack
- webpack-cli

```
yarn add --dev webpack webpack-cli
```

### 3-4. Loaders

- babel-loader
- file-loader
- style-loader
- css-loader
- postcss-loader

```
yarn add --dev babel-loader file-loader style-loader css-loader postcss-loader
```

### 3-5. Other Build Tools

- clean-webpack-plugin
- html-webpack-plugin (only for testing)
- copy-webpack-plugin
- license-webpack-plugin
- autoprefixer
- prettier

```
yarn add --dev clean-webpack-plugin html-webpack-plugin copy-webpack-plugin license-webpack-plugin autoprefixer prettier
```

See [issues with "webpack-dev-server"](#5-1-issues-webpack-dev-server).

&nbsp;

### 3-6. Emotion

- babel-plugin-macros
- @emotion/babel-plugin-jsx-pragmatic
- @emotion/react (for `dependencies`)

```
yarn add --dev babel-plugin-macros @emotion/babel-plugin-jsx-pragmatic

yarn add @emotion/react
```

&nbsp;

### 3-7. Other Dependencies

- ramda
- http-server

```
yarn add ramda

yarn add --dev http-server
```

&nbsp;

## 4. Dev + Build

Note: `chrome://inspect/#workers` to inspect running workers.

### Build for DEV

```
yarn start
```

### Build for PROD

```
yarn build
```

### Serve the built files

```
yarn serve
```

&nbsp;

## 5. Notes

### 5-1. Issues: webpack-dev-server

As [mentioned](#1-about), `webpack-dev-server` does not work,
and it is due to Webpack v5 release on 10/10/2020.
I had mainly 2 issues.
The first issue was that the bundled library exporting an empty object when using `webpack-dev-server`.
For this project, specifically, `Gradient.app` became `{}`.
It was a bug, and a
[solution](https://github.com/webpack/webpack-dev-server/issues/2484#issuecomment-749497713)
was to use `webpack-dev-server@4.0.0-beta.0`.
The second issue is associated with _SharedWorker_, and `window` becomes undefined.
For this, I still have no solutions.

&nbsp;

### 5-2. Issues: Tailwind

Attempt to use `twin.macro` (Tailwind macro, or Twin) fails.  
There are 2 reasons:  
(1) `twin.macro` uses CommonJS style libraries internally,
and Webpack 5 does not like that.  
(2) Runtime error for `__cssprop`

For (1) is not an issue with Webpack 4, and I will talk about it later.  
For (2), it has to do with the recent release of Twin v2 which supports:

- tailwind@2 ([released on Nov. 19, 2020](https://github.com/ben-rogerson/twin.macro/releases/tag/2.0.0))
- emotion@11 ([released on Nov. 12, 2020](https://emotion.sh/docs/emotion-11))

They give a bit of migration tips in the release note,
but it seems to fail for UMD libraries.
It builds fine, but I get the following runtime error:

```
index.jsx:13 Uncaught ReferenceError: __cssprop is not defined
```

Let's talk about (1).  
So, with Webpack 5, I get the error at build time:

```
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.
```

This is because Webpack 5 no longer supports automatic polyfill for Node.js modules,
and you have to manually resolve the modules in use (one by one).

Here is how you polyfill by yourself, but remember, it still fails at runtime...
If anyone figured out a solution for using `twin.macro` in UMD library,
please, let me know!

```
yarn add --dev util path-browserify url os-browserify process imports-loader
```

`webpack.base.js`

```
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.join(__dirname, 'src'),
    },
    fallback: {
      util: require.resolve('util/'),
      path: require.resolve('path-browserify'),
      url: require.resolve('url/'),
      os: require.resolve('os-browserify/browser'),
      fs: false,
      module: false,
    },
  },
  ...
  ...
  module: {
    rules: [
      ...
      ...
      {
        test: /node_modules\/resolve\/lib\/core\.js$/,
        use: [{
          loader: 'imports-loader',
          options: {
            type: 'commonjs',
            imports: ['single process/browser process'],
          },
        }],
      },
```

This
[issue](https://github.com/vfile/vfile/issues/38#issuecomment-640479137)
describes the problem in depth, and here is another
[issue](https://github.com/vfile/vfile/issues/38#issuecomment-683198538).

In case you solved the issue, remember that you also need
to configure `babel-plugin-macros.config.js` to use Tailwind:

`babel-plugin-macros.config.js`

```
module.exports = {
  twin: {
    styled: {
      import: 'default',
      from: '@emotion/styled',
    },
    css: {
      import: 'css',
      from: '@emotion/react',
    },
    global: {
      import: 'Global',
      from: '@emotion/react',
    },
    config: './src/tailwind.config.js', // <-- HERE
    dataTwProp: true, // <-- HERE
    debugPlugins: false,
    debug: false,
  },
};
```

&nbsp;

## 6. License

Dual-licensed under either of the followings.  
Choose at your option.

- The UNLICENSE ([LICENSE.UNLICENSE](LICENSE.UNLICENSE))
- MIT license ([LICENSE.MIT](LICENSE.MIT))
