const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://languagetool.org',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api/v2',
      },
    })
  );
};
