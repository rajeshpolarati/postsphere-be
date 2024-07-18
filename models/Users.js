const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique: true,
    },
    lastName: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    bio: String,
    url: String,
    color: String,
    createdAt: { type: Date, default: () => Date.now() },
    updateAt: { type: Date, default: Date.now() },
  },
  {
    toJSON: {
      transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", function (next) {
  this.updateAt = Date.now();
  next();
});

module.exports = mongoose.model("Users", userSchema);
