const jwt = require("jsonwebtoken");
require('dotenv').config();
const jwtSecret = process.env.jwtSecret;

const { User } = require("../model/user");
const userModel = new User();

const authorize =  async (req, res, next) => {
  let token = req.get("authorization");
  if (!token) return res.status(401).end();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userFound = await userModel.getUserById(decoded.id_user);

    if (!userFound) return res.status(403).end();
    req.user = userFound;
    next(); 
  } catch (err) {
    console.error("authorize: ", err);
    return res.status(403).end();
  }
};


module.exports = { authorize }; 
