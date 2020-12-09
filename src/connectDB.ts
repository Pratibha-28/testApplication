import mysql from 'mysql';

export const conn = mysql.createConnection({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    port: Number(process.env.MYSQL_PORT),
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    insecureAuth: true
})

conn.connect((err)=>{
    if(!err){
        console.log('Mysql DB connection is successful')
    } else {
        console.log('Mysql DB connection is failed')
        console.log(err);
    }
})