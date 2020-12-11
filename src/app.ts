import express from 'express';
import mysql from 'mysql';
import * as fs from 'fs';

const app = express();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

app.get('/message', (req, res)=>{
    fs.readFile('/vault/secrets/database-config.txt', 'utf8' , (err, data) => {
    //fs.readFile('./test.txt', 'utf8' , (err, data) => {  //Use this for application run on local system with local mysql db
      if (err) {
          console.error(err)
          return
        }
        const fdata = data;

        const url = fdata.split('#').pop();
 
        const conn = mysql.createConnection(url);

        conn.query('select message from appmsg', (err, rows, fields)=>{
          if(!err){
              console.log('Mysql DB connection is successful..sending data on UI');
              res.send(rows);
          } else {
              console.log(err);
          }
        });  
    });
});

app.listen({port: port}, () => {
    return console.log(`Server running on http://${host}:${port}`);
});