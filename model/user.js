"use script";
const db = require('../db')
//const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;


class User{
    constructor(id_user,name,email,banned,is_admin) {
        this.id_user=id_user;
        this.name=name;
        this.email=email;
        this.banned=banned
        this.is_admin=is_admin;
    }

    async addUser(body){
        // if(!this.userExist(body.email))
        //     return console.log("the user already exists");      DOESNT WORK

        const hashedPassword = await bcrypt.hash(body.password, saltRounds);
        console.log(body.name);
        db.query(`INSERT INTO users (name,email,password) VALUES('${body.name}','${body.email}','${hashedPassword}')`);
    }


      userExist(email){
         // return await db.query(`SELECT name  FROM users WHERE email='${email}'`);
         db.query(`SELECT *  FROM users WHERE email='${email}'`,(err, result)=>{
             if(result.rowCount === 0) return false;
         })
          return true;

    }


    async getUserById(id){
        const {rows} = await db.query(`SELECT *  FROM users WHERE id_user='${id}'`);
        if(!rows) return;
        return rows[0];

        // db.query(`SELECT *  FROM users WHERE id_user='${id}'`,(err, result)=>{
        //     if (!err) {
        //         res.send(result.rows[0]);
        //     }
        // })

    }



}

module.exports = {User};