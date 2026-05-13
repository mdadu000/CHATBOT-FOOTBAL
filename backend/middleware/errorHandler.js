// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err);
  const status = err.status || err.statusCode || 500;
  const message =
    status >= 500 ? 'Something went wrong. Please try again.' : err.message || 'Request failed';
  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

module.exports = { errorHandler, notFound };
