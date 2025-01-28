import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

function authenticateAdmin(req, res, next) {
  
  const token = req.cookies.token;
  if(!token) return res.status(403).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, owner) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.owner = owner;

    if (req.owner.role !== "admin") {
      return res.send("not authenticated");
    }
    next();
  });
}

export default authenticateAdmin;
