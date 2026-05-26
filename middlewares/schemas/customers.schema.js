import Joi from "joi";

export default {
  create: Joi.object({
    CustomerName: Joi.string().min(2).max(50).required(),
    City: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().max(50).allow("", null),
  }),
  idParam: Joi.object({ id: Joi.number().integer().positive().required() }),
};
