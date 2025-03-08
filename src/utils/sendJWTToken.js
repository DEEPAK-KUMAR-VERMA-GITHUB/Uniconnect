export const sendJWTToken = (user, statusCode, reply) => {
  const { accessToken, refreshToken } = user.getSignedJwtToken();

  const accessTokenOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_ACCESS_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  const refreshTokenOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_REFRESH_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  return reply
    .code(statusCode)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .send({ success: true, accessToken, refreshToken });
};
