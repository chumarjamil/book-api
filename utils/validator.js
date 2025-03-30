const Joi = require('joi');

module.exports = {
  validateBook: (book) => {
    const schema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().required(),
    });
    return schema.validate(book);
  },
};