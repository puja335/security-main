import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

function authenticateUser(req, res, next) {
  console.log(req.headers.authorization);
  const bearerToken = req.headers.authorization;

  const token = req.cookies.token || bearerToken.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(user, "User");
    // console.log(err,'Error');
    if (err) return res.sendStatus(403).json({ error: "Unauthorized", err });
    req.user = user;
    next();
  });
}

export default authenticateUser;
