const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller.js");
const protect = require("../middleware/auth.middleware.js");
const requireRole = require("../middleware/role.middleware.js");
const User = require("../models/user.model.js");


router.post("/signup", UserController.signup);
router.get("/faculty",protect, requireRole(User.ROLES.FACULTY), UserController.getallfaculty);
router.get("/students",protect, requireRole(User.ROLES.FACULTY), UserController.getallstudent);
router.get("/mems",protect, requireRole(User.ROLES.FACULTY), UserController.getalluser);
router.get("/mempop",protect, requireRole(User.ROLES.FACULTY), UserController.getalluserWithoutPop);
router.get("/search",protect, requireRole(User.ROLES.FACULTY), UserController.getUserByQuery);
router.put("/update/:id", protect,UserController.updateUserById);
router.delete("/softdelete/:id",protect, requireRole(User.ROLES.FACULTY), UserController.softDelete);
router.post("/login", UserController.login);
router.post("/profile",protect,UserController.addUserProfile);
module.exports = router;
