const CustomError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const asyncErrorWrapper = require("express-async-handler");
const {
  isTokenIncluded,
  getAccessTokenFromHeader,
} = require("../../helpers/authorization/tokenHelpers");
const User = require("../../models/User");
const Question = require("../../models/Question");

const getAccessToRoute = (req, res, next) => {
  //Token
  const { JWT_SECRET_KEY } = process.env;

  // 401 unauthorized
  // 403 forbidded

  // console.log("token included ? :"+ !isTokenIncluded(req) );

  if (!isTokenIncluded(req)) {
    // no token included to header
    return next(
      new CustomError( 
        "token is not there, You are not authorized to access this route ",
        401
      )
    );
  }

  const accessToken = getAccessTokenFromHeader(req).trim();
  // console.log("This is the result of accessToken:",accessToken);

  jwt.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
    // console.log(decoded);
    if (err) {
      return next(
        new CustomError(
          "Token expired, you are not authorized to access this route",
          401
        )
      );
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
    };

    next();
  });
};

const getAdminAccess = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.role !== "admin") {
    return next(new CustomError("Only admin can access to this route", 400));
  }

  next();
});
const getQuestionOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
  const userId  = req.user.id;
  const questionId  = req.params.id;
  const question = await Question.findById(questionId);

  // console.log("______________________");
  // console.log("User Id is:", userId);
  
  // console.log("user is:", question.user );

  // console.log("question Id is:", questionId);
  // console.log("______________________");

  if(question.user != userId) {
    return next(new CustomError("Only owner can handle this operation", 403))
  }
  next();
});

module.exports = {
  getAccessToRoute,
  getAdminAccess,
  getQuestionOwnerAccess
};
