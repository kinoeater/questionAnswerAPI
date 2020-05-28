const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Question = require("./Question");

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },

  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email",
    ],
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  password: {
    type: String,
    minlength: [6, "Please provide a passowrd with the min length of 6 digits"],
    required: [true, "Please provide a password "],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  title: {
    type: String,
  },

  about: {
    type: String,
  },
  website: {
    type: String,
  },
  place: {
    type: String, 
  },
  profile_image: {
    type: String,
    default: "default.jpg",
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
});

// User schema methods

// User Password token Generate for pass forget
UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex"); // creates 15 byte random Hex string and convert to hex
  const { RESET_PASSWORD_EXPIRE } = process.env;
  const resetPasswordToken = crypto.createHash("SHA256").digest("hex");
  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);

  return resetPasswordToken;
};

// Generate JWT
UserSchema.methods.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;
  const payload = {
    id: this._id,
    name: this.name,
  };

  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};

// Pre hooks
UserSchema.pre("save", function (next) {
  // parola değişti mi?
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      // Store hash in your password DB.
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});
UserSchema.post("remove",async function () {  // kullanıcı silinsin ama sorular kalsn istersek burası cooment out
  await Question.deleteMany({
    user : this._id
  });
});

module.exports = mongoose.model("User", UserSchema);

// that creates users collection at mongo db, and user.create can be used
