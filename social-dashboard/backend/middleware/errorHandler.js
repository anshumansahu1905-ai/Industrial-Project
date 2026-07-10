function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Something went wrong on our end.' });
}

module.exports = errorHandler;
