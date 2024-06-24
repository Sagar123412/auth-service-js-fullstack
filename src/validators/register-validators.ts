import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    errorMessage: 'Email is required!',
    notEmpty: true,
    trim: true,
  },
});

//we can also do validation using validation chain
// export default [body("email").notEmpty().withMessage("Email is required!")];
