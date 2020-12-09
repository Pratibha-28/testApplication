import express from 'express';
import {conn} from './connectDB';

const app = express();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

app.get('/message', (req, res)=>{
    conn.query('select message from appmsg', (err, rows, fields)=>{
        if(!err){
            res.send(rows);
        } else {
            console.log(err);
        }
    })
})

app.listen({port: port}, () => {
    return console.log(`Server running on http://${host}:${port}`);
});