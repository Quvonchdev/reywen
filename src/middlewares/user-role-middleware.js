const jwt = require("jsonwebtoken");
const ReturnResult = require("../helpers/return-result");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// we don't need try catch block here because we are using express-async-errors
module.exports = function auth(req, res, next) {
    const accessToken = req.headers.Authorization.split(" ")[1];
    if (!accessToken) {
      return res
        .status(401)
        .json(
          ReturnResult.errorMessage(
            "Token not found. Authentication failed. Please login again"
          )
        );
    }
    const decodedToken = jwt.verify(accessToken, JWT_SECRET_KEY);

    if (!decodedToken.isVerified) {
      return res
        .status(401)
        .json(
          ReturnResult.errorMessage(
            "Unauthorized access. Please verify your account"
          )
        );
    }
    req.userData = {
        fullName: decodedToken.fullName,
      _id: decodedToken._id,
      email: decodedToken.email,
      phoneNumber: decodedToken.phoneNumber,
      password: decodedToken.password,
      confirmPassword: decodedToken.confirmPassword,
      userRoles: decodedToken.userRoles,
      isVerified: decodedToken.isVerified,
    };

    next();
};
