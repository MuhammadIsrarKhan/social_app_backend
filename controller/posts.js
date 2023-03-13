import moment from "moment/moment.js";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Not Logged In");

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) return res.status(403).send("Token Is not Valid");

    let q =
      userId !== "undefined"
        ? `SELECT p.*,u.id AS userId,name,profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ?`
        : `SELECT p.*,u.id AS userId,name,profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
        LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId = ? OR p.userId = ? ORDER BY p.createAt DESC`;
    const values =
      userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];
    db.query(q, values, (err, data) => {
      if (err) return res.status(500).send(err);

      return res.status(200).send(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Not Logged In");

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) return res.status(403).send("Token Is not Valid");

    const q =
      "INSERT INTO posts(`desc`, `img`, `createAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).send(err);

      return res.status(200).send("Post has been created");
    });
  });
};
export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Not Logged In");

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) return res.status(403).send("Token Is not Valid");

    const q = "DELETE FROM posts WHERE `id` = ? AND  `userid` = ?";
    console.log(req.params.id, userInfo.id);
    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).send(err);
      if (data.affectedRows > 0)
        return res.status(200).send("Post has been deleted");

      return res.status(403).json("you can delete only your post");
    });
  });
};
