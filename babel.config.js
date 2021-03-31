module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    [
      '@emotion/babel-plugin-jsx-pragmatic',
      {
        export: 'jsx',
        import: '__cssprop',
        module: '@emotion/react',
      },
    ],
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: '__cssprop',
        pragmaFrag: 'React.Fragment',
      },
    ],
  ],
};
