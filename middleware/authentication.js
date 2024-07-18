const jwt = require("jsonwebtoken");
const models = require("../models");
const { customResponse } = require("../utils/util");

exports.authentication = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  try {
    if(!authHeader) throw new Error("Auth header missing")
    const token = authHeader.split(" ")[1];
    if(!token) throw new Error("Token missing")
    let decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded || !decoded.id) throw new Error("Invalid token");
    let user = await models.Users.findOne({_id: decoded.id  });
    if(!user || !user.id) throw new Error("User not found");
    req.currentUser = user;
    next() 
  } catch (error) {
    customResponse(401,null, res)
  }
}
