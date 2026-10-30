const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller.js");
const protect = require("../middleware/auth.middleware.js");


router.post("/signup", UserController.signup);
router.get("/mems",protect, UserController.getalluser);
router.get("/mempop",protect, UserController.getalluserWithoutPop);
router.get("/search",protect, UserController.getUserByQuery);
router.put("/update/:id", protect,UserController.updateUserById);
router.delete("/softdelete/:id",protect, UserController.softDelete);
router.post("/login", UserController.login);
router.post("/profile",protect,UserController.addUserProfile);
module.exports = router;
