import userModel from "../model/user.js";
import { setUser } from "../service/auth.js";


async function handleRegisterUser(req, res) {
  const registerUser = req.body;
  console.log(registerUser);
  if (
    !registerUser.name ||
    !registerUser.email ||
    !registerUser.password ||
    !registerUser.username
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const imageURL = req.file && req.file.filename ? `/uploads/profile-images/${req.file.filename}` : "/uploads/profile-images/default.png";

    const createdUser = await userModel.create({
      name: registerUser.name,
      username: registerUser.username,
      email: registerUser.email,
      password: registerUser.password,
      profileImageURL: imageURL,
      blogs: [],
    });
    console.log(createdUser);

    res.redirect("/login?sucess=true");
  } catch (error) {
    if (error.code == 11000) {
      if (error.keyPattern.email)
        // checking duplicate email
        res.status(400).render("register.ejs", {
          duplicateErrMsg: "Email already in use",
        });
      else if (error.keyPattern.username)
        //checking duplicate username
        res.status(400).render("register.ejs", {
          duplicateErrMsg: "Username already in use",
        });
    }
  }
}

async function handleLoginUser(req, res) {
  try {
    const email = req.body["email"];
    const pass = req.body["password"];
    console.log(req.body);
    if (!email || !pass) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const loginUser = await userModel.matchPassword(email, pass);

    if (loginUser) {
      console.log("User authenticated");
      const token = setUser(loginUser);
      res.cookie("uid", token);
      return res.status(200).redirect(`/home`);
      // return res.redirect(`/dashboard/${loginUser.username}`);
    } else {
      // If loginUser is null or undefined, it means authentication failed
      console.log("Authentication failed");
      return res
        .status(400)
        .render("login.ejs", { err_msg: "Incorrect Login Credentials" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res
      .status(500)
      .render("login.ejs", { err_msg: "An error occurred, please try again" });
  }
}

function handleLogoutUser(req, res) {
  console.log("Logout");
  res.clearCookie("uid");
  res.redirect("/");
}


export { handleRegisterUser, handleLoginUser, handleLogoutUser };
