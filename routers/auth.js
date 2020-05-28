const express = require("express");
const {register,getUser,login,logout,imageUpload,forgotpassword,resetpassword,editDetails} =require("../controllers/auth")
const {getAccessToRoute} = require("../middlewares/authorization/auth");
const router =express.Router();
const profileImageUpload = require('../middlewares/libraries/profileImageUpload');


router.post("/register",register);
router.post("/login",login);
router.get("/logout",getAccessToRoute,logout);
router.get("/profile",getAccessToRoute,getUser);
router.post("/upload",[getAccessToRoute,profileImageUpload.single("profile_image")],imageUpload);
router.post("/forgotpassword",forgotpassword);
router.put("/resetpassword",resetpassword);
router.put("/edit",getAccessToRoute,editDetails);
// router.get("/error",errorTest);


module.exports = router;

