const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const { sentJwtToClient } = require("../helpers/authorization/tokenHelpers");
const {
  validateUserInput,
  comparePassword,
} = require("../helpers/input/inputHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");

const register = asyncErrorWrapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  //console.log("Response under register.... "+res.json());
  sentJwtToClient(user, res);
});

const login = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!validateUserInput(email, password)) {
    return next(
      new CustomError(
        "Please make sure you both entered email and password correctly",
        400
      )
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please check your credentials", 400));
  }
  sentJwtToClient(user, res);
});

const logout = asyncErrorWrapper(async (req, res, next) => {
  const { NODE_ENV } = process.env;
  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout successful",
    });
});

const getUser = (req, res, next) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
    },
  });
};

const imageUpload = asyncErrorWrapper(async (req, res, next) => {
  //Image upload success
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profile_image: req.savedProfileImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Image upload successful",
    data: user,
  });
});

//forgat password

const forgotpassword = asyncErrorWrapper(async (req, res, next) => {
  const resetEmail = req.body.email;
  const user = await User.findOne({ email: resetEmail });
  if (!user) {
    return next(new CustomError("There is no user with that email", 400));
  }

  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = `
  
<h3> Reset Your Password </h3>
<p> This <a href='${resetPasswordUrl}' target='_blank'>Link</a> will expire in 1 hour</p> `;

  const { SMTP_USER } = process.env;
  try {
    await sendEmail({
      from: SMTP_USER,
      to: resetEmail,
      subject: "Reset your Password",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Token sent to your email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new CustomError("Email could not be sent", 400));
  }
});

const resetpassword =  asyncErrorWrapper(async (req, res, next) => {

  const {resetPasswordToken} = req.query;
  const {password} =req.body;

  if(!resetPasswordToken) {
    return next(new CustomError("Please provide a valid token",400));
  }

  let user = await User.findOne({   // the date from mongodb

    resetPasswordToken : resetPasswordToken,  
    resetPasswordExpire : {$gt : Date.now()}  // we set the expre time to 1 hour so it should be greater that now 

  });
  if(!user) {
    return next(new CustomError("Invalid token or session expired",404));
  }

  user.password = password;  // after resetting set the values to undefined again
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res.status(200)
  .json({
    success: true,
    message: 'Reset password process is successful'
  })

});

const editDetails = asyncErrorWrapper(async (req, res, next) => {

  const editInformation = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, editInformation,{
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    success: true,
    data : user
  })
});
  // const errorTest = (req, res, next) => {
  //   // some code
  //   return next(new TypeError("Type Error Message",400));
  //   //some code
  // };

  module.exports = {
    register,
    getUser,
    login,
    logout,
    imageUpload,
    forgotpassword,
    resetpassword,
    editDetails
  };
// module.exports = { register, errorTest };

// await User.create({
//     name: name,
//     email: email,
//     password: password
// })
/* Key ve value isimleri aynı olduğu için ES6'da yalnızca key kısmını yazmak, diper tarafında aynı
    oldugunu kabul eder, bu nedenle şöyle yazabiliriz: */

// async await
