USE testdb;
CREATE TABLE appmsg (id INT NOT NULL, message VARCHAR(200) NULL, PRIMARY KEY (id));
INSERT INTO appmsg (id, message) VALUES (1, 'Hello Team');
CREATE USER 'testUsr'@'%' IDENTIFIED WITH mysql_native_password BY 'wournEwyin';
GRANT ALL ON *.* TO 'testUsr'@'%';
FLUSH PRIVILEGES;
