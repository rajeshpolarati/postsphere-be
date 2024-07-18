const jwt = require("jsonwebtoken");

module.exports = (id, email) => {
    return jwt.sign({ id: id, email:email }, process.env.SECRET_KEY, { expiresIn: '1d' });
}