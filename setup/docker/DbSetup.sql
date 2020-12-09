USE testdb;
CREATE TABLE appmsg (id INT NOT NULL, message VARCHAR(200) NULL, PRIMARY KEY (id));
INSERT INTO appmsg (id, message) VALUES (1, 'Hello Team');
CREATE USER 'testUsr'@'localhost' IDENTIFIED WITH mysql_native_password BY 'wournEwyin';
GRANT ALL ON testdb.* TO 'testUsr'@'localhost';
FLUSH PRIVILEGES;