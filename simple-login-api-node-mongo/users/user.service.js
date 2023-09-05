const config = require("config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
// const { ObjectId } = require('mongoose');
const mongoose = require("mongoose");
const User = db.User;

module.exports = {
  authenticate,
  logout,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getAudit,
};

async function authenticate({ username, password, ipAddress }) {
  const user = await User.findOne({ username });

  try {
    // console.log(ipAddress)
    // Change login API to also record the login time, client IP of the user for the current login
    let updateUserResult = await User.updateOne(
      { username },
      {
        $set: {
          lastLoginDate: new Date(),
          lastLoginIp: ipAddress,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }

  console.log(user, password);

  if (user && bcrypt.compareSync(password, user.hash)) {
    const { hash, ...userWithoutHash } = user.toObject();
    const token = jwt.sign({ sub: user.id }, config.secret);
    return {
      ...userWithoutHash,
      token,
    };
  }
}

async function logout({ username, ipAddress }) {
  const user = await User.findOne({ username });

  console.log("Logout API called", username);

  if (!user) {
    return {
      status: "error",
      message: "User not found",
    };
  }

  // Change logout API to also record the logout time, client IP of the user for the current logout
  let updateUserResult = await User.updateOne(
    { username },
    {
      $set: {
        lastLogoutDate: new Date(),
        lastLogoutIp: ipAddress,
      },
    }
  );

  return {
    status: "success",
    message: "User logged out successfully",
  };
}

async function getAll() {
  return await User.find().select("-hash");
}

async function getById(id) {
  return await User.findById(id).select("-hash");
}

async function create(userParam) {
  // validate
  if (await User.findOne({ username: userParam.username })) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  const user = new User(userParam);

  // hash password
  if (userParam.password) {
    user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // save user
  await user.save();
}

async function update(id, userParam) {
  const user = await User.findById(id);

  // validate
  if (!user) throw "User not found";
  if (
    user.username !== userParam.username &&
    (await User.findOne({ username: userParam.username }))
  ) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  // hash password if it was entered
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}

async function getAudit({ id, page = 1, limit = 10 }) {
  console.log(id, page, limit);
  page = parseInt(page);
  limit = parseInt(limit);
  const user = await User.findOne({
    _id: mongoose.Types.ObjectId(id),
  });

  if (!user) {
    return {
      status: "error",
      message: "User not found",
    };
  }

  console.log("getAudit", user);

  if (user.role != "Admin") {
    return {
      status: "error",
      message: "User is not an admin",
    };
  }

  // let users = await User.find().select('-hash');
  let users = await User.find()
    .sort({ lastLoginDate: -1 })
    .skip((page-1) * limit)
    .limit(limit)
    .select("-hash")
  
    for(let i in users){
        users.id = users[i]._id
    }

  let total = await User.countDocuments();

  return { users, total };
}
