const bcrypt = require("bcrypt");
const models = require("../../models");
const { customResponse, sendErrorResponse } = require("../../utils/util");
const generateToken = require("../../middleware/generateToken");
const { COLORS } = require("../../constants");

exports.loginHandler = async (req, res) => {
  try {
    const user = await models.Users.findOne({
        email: req.body.email,
    });
    if (!user) throw new Error("USER_NOT_REGISTERED");
    let userPassword = user.password;
    const isPasswordValid = bcrypt.compareSync(req.body.password, userPassword);
    if (!isPasswordValid) throw new Error("INVALID_PASSWORD");
    let token = generateToken(user.id, user.email);
    res.setHeader('Authorization', `${token}`);
    customResponse( 200, { id: user.id, firstName: user.firstName, lastName: user.lastName ,name: `${user.firstName} ${user.lastName}`, email: user.email, color: user.color },res);
  } catch (err) {
    sendErrorResponse(err, res);
  }
};
exports.registerHandler = async (req, res) => {
  try {
    let reqBody = req.body;
    const exitingUser = await models.Users.findOne({email: req.body.email  });
    if(exitingUser?.id) throw new Error("USER_ALREADY_REGISTERED");
    const hashedPassword = bcrypt.hashSync(reqBody.password, 10);
    let randomInt =  Math.floor(Math.random() * 50) + 1;
    let code = COLORS[randomInt] || COLORS[0]
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      color: code,
    };
    const user = await models.Users.create(data);
    await user.save();
    let token = generateToken(user.id, user.email);
    res.setHeader('Authorization', `${token}`);
    customResponse( 200, { id: user.id, firstName: user.firstName, lastName: user.lastName , email: user.email,color: user.color },res);
  } catch (err) {
    sendErrorResponse(err, res);
  }
};
