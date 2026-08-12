import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    trim: true,
    errorMessage: "Email is required!",
    notEmpty: true,
    isEmail: {
      errorMessage: "Email should be a valid email",
    },
  },
  firstName: {
    errorMessage: "First name is required!",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "Last name is required!",
    notEmpty: true,
    trim: true,
  },
  password: {
    trim: true,
    errorMessage: "Last name is required!",
    notEmpty: true,
    isLength: {
      options: {
        min: 8,
      },
      errorMessage: "Password length should be at least 8 chars!",
    },
    matches: {
      errorMessage:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      options: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/,
    },
  },
  role: {
    errorMessage: "Role is required!",
    notEmpty: true,
    trim: true,
  },
});
