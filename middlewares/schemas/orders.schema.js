import Joi from "joi";

export default {
  create: Joi.object({
    OrderNumber: Joi.number().integer().min(1).required(),
    PersonID: Joi.number().integer().positive().required(),
  }),
  idParam: Joi.object({ id: Joi.number().integer().positive().required() }),
};
