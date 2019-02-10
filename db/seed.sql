CREATE DATABASE campsDB;

CREATE TABLE camps (
  campid int NOT NULL,
  name varchar DEFAULT NULL,
  imageurl varchar DEFAULT NULL,
  description varchar DEFAULT NULL,
  userid int DEFAULT NULL
)

CREATE TABLE users (
  id int NOT NULL,
  username varchar DEFAULT NULL,
  password varchar DEFAULT NULL
)

ALTER TABLE camps
  ADD PRIMARY KEY (campid);


ALTER TABLE users
  ADD PRIMARY KEY (id);
