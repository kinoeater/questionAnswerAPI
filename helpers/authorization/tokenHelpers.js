const sentJwtToClient = (user, res) => {
  //Generate JWT
  const token = user.generateJwtFromUser();
  // console.log(token);

  //Response
  const { JWT_COOKIE, NODE_ENV } = process.env;
  // console.log(parseInt(JWT_COOKIE) * 1000 )

  return res
    .status(200)
    .cookie("access_token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + parseInt(JWT_COOKIE) * 60),
      secure: NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      access_token: token,
      data: {
        name: user.name,
        email: user.email,
      },
    });
};
const isTokenIncluded = (req) => {
  // console.log("This is headers authorization: "+req.headers.authorization);
  //  console.log("This is headers Bearer check:"+req.headers.authorization.startsWith('Bearer'));

  return (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer: ")
  );
};

const getAccessTokenFromHeader = (req) => {
  const authorization = req.headers.authorization;
  //console.log("authorization is: ", req.headers.authorization);
  const access_token = authorization.split(" ")[1];
  // console.log("access token after split is: ", access_token);
  return access_token;
};
module.exports = { sentJwtToClient, isTokenIncluded, getAccessTokenFromHeader };
