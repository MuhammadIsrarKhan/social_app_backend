import { db } from "../connect.js";
import jwt from "jsonwebtoken";
export const getRelationships = (req, res) => {
  const q = "SELECT followerUserId from relationships WHERE followedUserId = ?";

  db.query(q, [req.query.followedUserId], (err, data) => {
    if (err) return res.status(500).send(err);

    return res
      .status(200)
      .send(data.map((relationship) => relationship.followerUserId));
  });
};

export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Not Logged In");

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) return res.status(403).send("Token Is not Valid");

    const q =
      "INSERT INTO relationships(`followerUserid`, `followedUserid`) VALUES (?)";
    const values = [userInfo.id, req.body.userId];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).send(err);

      return res.status(200).send("Following");
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).send("Not Logged In");

  jwt.verify(token, "secret", (err, userInfo) => {
    if (err) return res.status(403).send("Token Is not Valid");
    const q =
      "DELETE FROM relationships WHERE `followerUserid` = ? AND `followedUserid` = ?";

    db.query(q, [userInfo.id, req.query.userId], (err, data) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send("Unfollow");
    });
  });
};
