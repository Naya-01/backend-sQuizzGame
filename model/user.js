"use script";
const db = require('../db')
const jwt = require("jsonwebtoken");
const escape = require("escape-html");
require('dotenv').config();
const jwtSecret = process.env.jwtSecret;
const LIFETIME_JWT = 24 * 60 * 60 * 1000; //24h
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
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);
        console.log(body.name);
        db.query(`INSERT INTO users (name,email,password) VALUES('${body.name}','${body.email}','${hashedPassword}')`);
        let user= {
            name: body.name,
            email:body.email,
            password:hashedPassword
        };
        return user;
    }

    async getUserByEmail(email){
        const {rows} = await db.query(`SELECT *  FROM users WHERE email='${email}'`);
        if(!rows) return;
        return rows[0];
    }

    async getUserById(id){
        const {rows} = await db.query(`SELECT *  FROM users WHERE id_user='${id}'`);
        if(!rows) return;
        return rows[0];

    }

    async login(body){
        const user = await this.getUserByEmail(body.email);
        if(!user) return;
        const hashPass = await bcrypt.hash(body.password,saltRounds);
        const match = await bcrypt.compare(body.password, user.password);
        if(!match) return;

        const authenticatedUser = {
            username: user.name,
            token: "noSoucis"
        };

        authenticatedUser.token=jwt.sign(
            {username: authenticatedUser.username}, jwtSecret, {expiresIn: LIFETIME_JWT}
        );

        return authenticatedUser;

    }

    async register(body){
        const user = await this.getUserByEmail(body.email);
        if(user){
            console.log("L'utilisateur existe déjà");
            return;
        }

        const newUser = await this.addUser(body);
        if(newUser===undefined)return;
        const authenticatedUser = {
            username: newUser.name,
            email:newUser.email,
            token: "noSoucis"
        };

        authenticatedUser.token=jwt.sign(
            {username: authenticatedUser.username, email: authenticatedUser.email}, jwtSecret, {expiresIn: LIFETIME_JWT}
        );

        return authenticatedUser;

    }

    async isBanned(id){
        return await db.query(`SELECT banned FROM users WHERE id='${id}'`);
    }

    async isAdmin(id){
        return await db.query(`SELECT is_admin FROM users WHERE id='${id}'`);
    }

    async banUser(id){
        await db.query(`UPDATE users SET banned = true WHERE id_user = '${id}'`);
    }

    async unbanUser(id){
        await db.query(`UPDATE users SET banned = false WHERE id_user = '${id}'`);
    }





}

module.exports = {User};