import { checkSchema } from 'express-validator';

export default checkSchema({
  email: {
    errorMessage: 'Email is required!',
    notEmpty: {
      errorMessage: 'Email is required',
    },
    trim: true,
    isEmail: {
      errorMessage: 'Please enter a valid email',
    },
    normalizeEmail: true,
    escape: true,
  },
  password: {
    trim: true,
    errorMessage: 'Password is required!',
    notEmpty: {
      errorMessage: 'Password cannot be empty.',
    },
    isLength: {
      errorMessage: 'Password must be at least 8 characters long.',
      options: { min: 8 },
    },
    matches: {
      errorMessage:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/,
    },
  },
});

//we can also do validation using validation chain
// export default [body("email").notEmpty().withMessage("Email is required!")];
