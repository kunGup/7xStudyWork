const Joi = require("joi");
module.exports.newClassSchema = Joi.object()
  .keys({
    title: Joi.string().required(),
    subject: Joi.string().required(),
    date: Joi.string().required(),
    endby: Joi.string().required(),
    student: Joi.alternatives().try(Joi.string(), Joi.array()),
    wdays: Joi.alternatives().try(Joi.string(), Joi.array()),
  })
  .unknown(true);

module.exports.updateClassSchema = Joi.object()
  .keys({
    title: Joi.string().required(),
    subject: Joi.string().required(),
    date: Joi.string().required(),
  })
  .unknown(true);

module.exports.userSchema = Joi.object({
  role: Joi.string().required().valid("teacher", "student"),
  apikey: Joi.alternatives().conditional("role", {
    is: "teacher",
    then: Joi.string().required(),
    otherwise: Joi.any(),
  }),
  apisecret: Joi.alternatives().conditional("role", {
    is: "teacher",
    then: Joi.string().required(),
    otherwise: Joi.any(),
  }),
  standard: Joi.alternatives().conditional("role", {
    is: "student",
    then: Joi.string().required(),
    otherwise: Joi.any(),
  }),
});

module.exports.changeTeacherSchema = Joi.object({
  teacher: Joi.string().required(),
});

module.exports.reviewSchema = Joi.object()
  .keys({
    rating: Joi.number().required().min(1).max(5),
  })
  .unknown(true);
