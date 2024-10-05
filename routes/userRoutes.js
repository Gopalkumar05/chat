const express = require("express");
const user_route = express();
const session = require("express-session");
const { SESSION_SECRET } = process.env;
user_route.use(session({ secret: SESSION_SECRET }));
const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));
user_route.set("view engine", "ejs");
user_route.set("views", "./views");
user_route.use(express.static("public"));
const multer = require("multer");
const path = require("path");
const { register } = require("../controllers/userController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

user_route.get("/register", auth.isLogout, userController.registerLoad);

user_route.post('/save-chat',userController.saveChat);
user_route.post("/register", upload.single("image"), (req, res, next) => {
  // req.file should be defined here
  register(req, res, next);
  
});

user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.login);
user_route.get("/logout", auth.isLogin, userController.logout);
user_route.get("/profile", auth.isLogin, userController.profile);
user_route.get("*", function (req, res) {
  res.redirect("/login");
});

module.exports = user_route;