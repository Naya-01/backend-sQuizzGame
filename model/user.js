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

    async getUserByEmailWithSubs(email){
        const {rows} = await db.query(`SELECT u.*, count(DISTINCT subscribe.id_follower) AS "subscribers", count(DISTINCT follower.id_user) AS "subscriptions"
        FROM users u
         LEFT OUTER JOIN subscribers subscribe ON subscribe.id_user=u.id_user
        LEFT OUTER JOIN subscribers follower ON follower.id_follower=u.id_user
        WHERE u.email='${email}'
        GROUP BY u.id_user;`);
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
            email: user.email,
            token: "noSoucis"
        };

        authenticatedUser.token=jwt.sign(
            {username: authenticatedUser.username, email: authenticatedUser.email}, jwtSecret, {expiresIn: LIFETIME_JWT}
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

        const {rows} = await db.query(`SELECT banned FROM users WHERE id_user='${id}'`);

        if(!rows)
            return;
        return rows[0];
    }

    async isBannedByEmail(email){
        let idUser = await this.findIdUserByEmail(email);
        return await this.isBanned(idUser);
    }

    async isAdmin(id){
        const {rows} =await db.query(`SELECT is_admin FROM users WHERE id_user='${id}'`);
        if(!rows)
            return;
        return rows[0];
    }

    async isAdminByEmail(email){
        let idUser = await this.findIdUserByEmail(email);
        return await this.isAdmin(idUser);
    }

    async banUser(id){
        let boolean = await this.isAdmin(id);
        if(boolean.is_admin){
            console.log( 'cet utilisateur ne peut etre ban car il est admin');
            return;
        }
        boolean = await this.isBanned(id);
        if(boolean.banned){
            console.log('cet utilisateur est deja ban');
            return;
        }

        await db.query(`UPDATE users SET banned = true WHERE id_user = '${id}'`);
        return this.isBanned(id);
    }

    async banUserByEmail(email){
        let idUser = await this.findIdUserByEmail(email);
        let ban = await this.banUser(idUser);
        if (!ban) return;
        return this.isBanned(idUser);
    }

    async unbanUser(id){
        if(!await this.isBanned(id)) return ;
        await db.query(`UPDATE users SET banned = false WHERE id_user = '${id}'`);
        return true;
    }

    async followUser(id_user,id_follower){
        let userFound = this.getUserById(id_user);
        if(!userFound) return;
        userFound = this.getUserById(id_follower);
        if(!userFound) return;
         let {rows}=await db.query(`INSERT INTO subscribers (id_user,id_follower) VALUES ('${id_user}','${id_follower}') RETURNING *`);
         return rows[0];
    }
    async getAllUsers(){
        const {rows} = await db.query(`SELECT *  FROM users`);

        if(!rows)
            return;

        return rows;
    }

    async upgradeUser(id){
        let boolean = await this.isAdmin(id);
        if(boolean.is_admin){
            console.log( 'cet utilisateur ne peut pas etre upgrade en admin car il l\'est deja');
            return;
        }
        await db.query(`UPDATE users SET is_admin = true WHERE id_user = '${id}'`);
        return this.isAdmin(id);
    }

    async upgradeUserByEmail(email){
        let idUser = await this.findIdUserByEmail(email);
        let admin = await this.upgradeUser(idUser);
        if(!admin) return;
        return this.isAdmin(idUser);
    }

    async findIdUserByEmail(email){
        const {rows} = await db.query(`SELECT *  FROM users WHERE email='${email}'`);
        if(!rows)
            return;

        return rows[0].id_user;
    }

    async getSubscribers(id_user){
        const {rows} = await db.query(`SELECT count(s.*) FROM subscribers s WHERE s.id_user=${id_user}`);

        if(!rows)
            return;

        return rows[0];
    }

    async getSubscriptions(id_user){
        const {rows} = await db.query(`SELECT count(s.*) FROM subscribers s WHERE s.id_follower=${id_user}`);

        if(!rows)
            return;

        return rows;
    }

    async getUsersByFilterOnNameOrEmail(filter){
        const {rows} = await db.query(`SELECT u.*  FROM users u WHERE lower(u.name) LIKE lower('%${filter}%') OR lower(u.email) LIKE lower('%${filter}%') ORDER BY u.email`);
        if(!rows) return;
        return rows;
    }




}

module.exports = {User};