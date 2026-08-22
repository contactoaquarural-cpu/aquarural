const ok = (res, data = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, data, message });

const fail = (res, status = 400, message = 'Error', errors = null) =>
  res.status(status).json({ success: false, data: null, message, ...(errors ? { errors } : {}) });

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ok, fail, asyncHandler };
