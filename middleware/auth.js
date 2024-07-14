import { getUser } from "../service/auth.js";

function restrictToLoggedInUserOnly(req, res, next) {
  const userUid = req.cookies?.uid;

  if (!userUid) res.status(403).redirect("/login");
  const user = getUser(userUid);

  if (!user) res.status(403).redirect("/login");

  req.user = user;
  next();
}

export { restrictToLoggedInUserOnly };
