const { fail } = require('../utils/response');

// Uso: router.post('/', validate(miEsquemaZod), controller)
const validate = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body);
  if (!resultado.success) {
    return fail(res, 400, 'Datos inválidos.', resultado.error.flatten().fieldErrors);
  }
  req.body = resultado.data;
  next();
};

module.exports = validate;
