const app = require('../dist/server.cjs');

module.exports = (req, res) => {
  const handler = app.default || app;
  return handler(req, res);
};
