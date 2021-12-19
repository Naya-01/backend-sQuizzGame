"use script";
const db = require("../db");
const jwt = require("jsonwebtoken");
const escape = require("escape-html");
require("dotenv").config();
const jwtSecret = process.env.jwtSecret;
const LIFETIME_JWT = 24 * 60 * 60 * 1000; //24h
const bcrypt = require("bcrypt");
const saltRounds = 10;

class User {
  constructor(id_user, name, email, banned, is_admin) {
    this.id_user = id_user;
    this.name = name;
    this.email = email;
    this.banned = banned;
    this.is_admin = is_admin;
  }

  /**
   * Add a resource in the DB and returns the added resource
   * @param {object} body - it contains all required data to create a ressource
   * @returns {object} the resource that was created
   */
  async addUser(body) {
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    console.log(body.name);
    db.query(
      `INSERT INTO users (name,email,password) VALUES('${body.name}','${body.email}','${hashedPassword}')`
    );
    let user = {
      name: body.name,
      email: body.email,
      password: hashedPassword,
    };
    return user;
  }

  /**
   * Get a user with his subscriptions and subscribers by email
   * @param {String} email - email of user 
   * @returns {object} the ressource user
   */
  async getUserByEmailWithSubs(email) {
    const { rows } =
      await db.query(`SELECT u.*, count(DISTINCT subscribe.id_follower) AS "subscribers", count(DISTINCT follower.id_user) AS "subscriptions"
        FROM users u
         LEFT OUTER JOIN subscribers subscribe ON subscribe.id_user=u.id_user
        LEFT OUTER JOIN subscribers follower ON follower.id_follower=u.id_user
        WHERE u.email='${email}'
        GROUP BY u.id_user;`);
    if (!rows) return;
    return rows[0];
  }

  /**
   * Get all the followers of a user
   * @param {number} id - if of user 
   * @returns {Array} Array of resources
   */
  async getAllFollowers(id){
    const { rows } = await db.query('SELECT u.* \
                                     FROM users u, subscribers s \
                                     WHERE $1 = s.id_user AND u.banned=false AND u.id_user = s.id_follower',[id]);
    return rows;
  }
  /**
   * Get all the subscriptions of a user
   * @param {number} id - if of user 
   * @returns {Array} Array of resources
   */
  async getAllSubscriptions(id){
    const { rows } = await db.query('SELECT u.* \
                                     FROM users u, subscribers s \
                                     WHERE $1 = s.id_follower AND u.banned=false AND u.id_user = s.id_user',[id]);
    return rows;
  }


  /**
   * Get a user with an id with his subscribers and subscriptions
   * @param {number} id - id of user 
   * @returns {object} user having this id, undefined otherwise
   */
  async getUserByIdWithSubs(id) {
    const { rows } =
      await db.query(`SELECT u.*, count(DISTINCT subscribe.id_follower) AS "subscribers", count(DISTINCT follower.id_user) AS "subscriptions"
        FROM users u
         LEFT OUTER JOIN subscribers subscribe ON subscribe.id_user=u.id_user
        LEFT OUTER JOIN subscribers follower ON follower.id_follower=u.id_user
        WHERE u.id_user='${id}'
        GROUP BY u.id_user;`);
    if (!rows) return;
    return rows[0];
  }

  /**
   * Returns the resource (user) identified by id
   * @param {number} id - id of the resource to find
   * @returns {object} the resource found or undefined if the id does not exist
   */
  async getUserById(id) {
    const { rows } = await db.query(
      `SELECT u.* FROM users u WHERE u.id_user=${id}`
    );
    if (!rows) return;
    return rows[0];
  }

  /**
   * Get 2 users but getting the number of subscribers and subscriptions for the id2 in addition
   * user1 = user session
   * user2 = user in the url, with 2 more columns (subscriptions and subscribers)
   * @param {number} id1 - id of first user 
   * @param {number} id2 - id of second user we want his subscriber and subscriptions too
   * @returns {object} object having 2 users, the 2nd one with the subscribers and subscriptions, the 2st one simple data, and if no tuple then undefined
   */
  async getTwoUsersById(id1, id2) {
    const { rows } = await db.query(
      `SELECT u2.id_user AS "id_user2", u2.name AS "name2", u2.email AS "email2", u2.password AS "password2", u2.banned AS "banned2", u2.is_admin AS "is_admin2", count(DISTINCT subscribe.id_follower) AS "subscribers", count(DISTINCT follower.id_user) AS "subscriptions",
      u1.id_user AS "id_user1", u1.name AS "name1", u1.email AS "email1", u1.password AS "password1", u1.banned AS "banned1", u1.is_admin AS "is_admin1"
      FROM users u2
       LEFT OUTER JOIN subscribers subscribe ON subscribe.id_user=u2.id_user
      LEFT OUTER JOIN subscribers follower ON follower.id_follower=u2.id_user
      LEFT OUTER JOIN users u1 ON u1.id_user!=u2.id_user
      WHERE u2.id_user=${id2} AND u1.id_user=${id1}
      GROUP BY u2.id_user,u1.id_user;`
    );
    if (!rows) return;
    return rows[0];
  }

  /**
   * login a quidam
   * @param {object} body - it contains all required data to create a ressource
   * @returns {object} some information from a user with his token
   */
  async login(body) {
    const user = await this.getUserByEmailWithSubs(body.email);
    if (!user) return;
    const hashPass = await bcrypt.hash(body.password, saltRounds);
    const match = await bcrypt.compare(body.password, user.password);
    if (!match) return;

    const authenticatedUser = {
      id_user: user.id_user,
      username: user.name,
      email: user.email,
      is_admin: user.is_admin,
      token: "noSoucis",
    };

    authenticatedUser.token = jwt.sign(
      {
        id_user: authenticatedUser.id_user,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        is_admin: authenticatedUser.is_admin,
      },
      jwtSecret,
      { expiresIn: LIFETIME_JWT }
    );

    return authenticatedUser;
  }

  /**
   * register a quidam
   * @param {object} body - it contains all required data to create a ressource
   * @returns {object} some information from a user with his token
   */
  async register(body) {
    let user = await this.getUserByEmailWithSubs(body.email);
    if (user) {
      console.log("L'utilisateur existe déjà");
      return;
    }

    const newUser = await this.addUser(body);
    user = await this.getUserByEmailWithSubs(body.email);
    if (newUser === undefined) return;
    const authenticatedUser = {
      id_user: user.id_user,
      username: user.name,
      email: user.email,
      is_admin: user.is_admin,
      token: "noSoucis",
    };

    authenticatedUser.token = jwt.sign(
      {
        id_user: authenticatedUser.id_user,
        username: authenticatedUser.username,
        email: authenticatedUser.email,
        is_admin: authenticatedUser.is_admin,
      },
      jwtSecret,
      { expiresIn: LIFETIME_JWT }
    );

    return authenticatedUser;
  }

  /**
   * Check if a user is banned by id
   * @param {number} id - id of the user we want to know if banned
   * @returns {boolean} true if user is banned
   */ 
  async isBanned(id) {
    const { rows } = await db.query(
      `SELECT banned FROM users WHERE id_user='${id}'`
    );

    if (!rows) return;
    return rows[0];
  }

  /**
   * Check if a user is banned by email
   * @param {String} email - email of the user we want to know if banned
   * @returns {boolean} true if user is banned
   */ 
  async isBannedByEmail(email) {
    const { rows } = await db.query(
        `SELECT banned FROM users WHERE email='${email}'`
    );

    if (!rows) return;
    return rows[0];
  }

  /**
   * Check if a user is admin by id
   * @param {number} id - id of the user we want to know if is admin
   * @returns {boolean} true if user is admin
   */ 
  async isAdmin(id) {
    const { rows } = await db.query(
      `SELECT is_admin FROM users WHERE id_user='${id}'`
    );
    if (!rows) return;
    return rows[0];
  }

  /**
   * Check if a user is admin by email
   * @param {String} email - email of the user we want to know if is admin
   * @returns {boolean} true if user is admin
   */ 
  async isAdminByEmail(email) {
    let idUser = await this.findIdUserByEmail(email);
    return await this.isAdmin(idUser);
  }

  /**
   * Ban a user
   * @param {number} id - id of the user we want to ban
   * @returns {boolean} true if the user is not ban or not admin yet, false otherwise
   */ 
  async banUser(id) {
    let boolean = await this.isAdmin(id);
    if (boolean.is_admin) {
      console.log("cet utilisateur ne peut etre ban car il est admin");
      return;
    }
    boolean = await this.isBanned(id);
    if (boolean.banned) {
      console.log("cet utilisateur est deja ban");
      return;
    }

    await db.query(`UPDATE users SET banned = true WHERE id_user = '${id}'`);
    return this.isBanned(id);
  }

  /**
   * Ban a user
   * @param {String} email - email of the user we want to ban
   * @returns {boolean} true if the user is not banned or not admin yet, false otherwise
   */ 
  async banUserByEmail(email) {
    let idUser = await this.findIdUserByEmail(email);
    let ban = await this.banUser(idUser);
    if (!ban) return;
    return this.isBanned(idUser);
  }

  /**
   * Unban a user
   * @param {number} id - id of the user we want to ban
   * @returns {boolean} true if the user is not banned, false otherwise
   */ 
  async unbanUser(id) {
    if (!(await this.isBanned(id))) return;
    await db.query(`UPDATE users SET banned = false WHERE id_user = '${id}'`);
    return true;
  }

  /**
   * Subscribe a user
   * @param {number} id_user - id user who will have a follower
   * @param {number} id_follower - id user of the follower
   * @returns {object} tuple subscribers created, with the id user and the id follower
   */
  async followUser(id_user, id_follower) {
    let userFound = this.getUserById(id_user);
    if (!userFound) return;
    userFound = this.getUserById(id_follower);
    if (!userFound) return;
    let { rows } = await db.query(
      `INSERT INTO subscribers (id_user,id_follower) VALUES ('${id_user}','${id_follower}') RETURNING *`
    );
    return rows[0];
  }

  /**
   * Unsubscribe a user
   * @param {number} id_user - id user who will lose a follower
   * @param {number} id_follower - id user of the follower
   * @returns {object} tuple subscribers deleted, with the id user and the id follower
   */
  async unfollowUser(id_user, id_follower) {
    let { rows } = await db.query(
      `SELECT s.* FROM subscribers s WHERE s.id_user=${id_user} AND s.id_follower=${id_follower}`
    );
    if (!rows[0]) return false;
    let req = "DELETE FROM subscribers s WHERE s.id_user=$1 AND s.id_follower=$2;";
    let data = [id_user,id_follower];
    await db.query(req, data);
    return rows[0];
  }

  /**
   * Returns all resources (users)
   * @returns {Array} Array of resources
   */
  async getAllUsers() {
    const { rows } = await db.query(
      `SELECT u.*  FROM users u ORDER BY u.email`
    );

    if (!rows) return;

    return rows;
  }

  /**
   * Upgrade a user by id
   * @param {number} id - id of the user we want to upgrade
   * @returns {boolean} true if the user has been upgraded into admin
   */ 
  async upgradeUser(id) {
    let boolean = await this.isAdmin(id);
    if (boolean.is_admin) {
      console.log(
        "cet utilisateur ne peut pas etre upgrade en admin car il l'est deja"
      );
      return;
    }
    await db.query(`UPDATE users SET is_admin = true WHERE id_user = '${id}'`);
    return this.isAdmin(id);
  }

  /**
   * Upgrade a user by email
   * @param {String} email - email of the user we want to upgrade
   * @returns {boolean} true if the user has been upgraded into admin
   */ 
  async upgradeUserByEmail(email) {
    let idUser = await this.findIdUserByEmail(email);
    let admin = await this.upgradeUser(idUser);
    if (!admin) return;
    return this.isAdmin(idUser);
  }

  /**
   * Get a user by email
   * @param {String} email - email of user 
   * @returns {object} the ressource user
   */
  async findIdUserByEmail(email) {
    const { rows } = await db.query(
      `SELECT *  FROM users WHERE email='${email}'`
    );
    if (!rows) return;

    return rows[0].id_user;
  }

  /**
   * Check if is someone following another one
   * @param {number} id_user - id of the user
   * @param {number} id_follower -  id of the follower
   * @returns {boolean} true if id_follower is following id_user, false otherwise
   */
  async isFollowing(id_user, id_follower) {
    const { rows } = await db.query(
      `SELECT count(s.*) FROM subscribers s WHERE s.id_user=${id_user} AND s.id_follower=${id_follower}`
    );
    if (!rows) return;

    return rows[0].count;
  }

  /**
   * Get number of subscribers of a user
   * @param {*} id_user - id of the user
   * @returns {number} number of subscriber of the id_user
   */
  async getSubscribers(id_user) {
    const { rows } = await db.query(
      'SELECT count(DISTINCT s.*) FROM users u, subscribers s WHERE $1 = s.id_user AND u.banned=false AND u.id_user = s.id_follower',[id_user]);

    if (!rows) return;

    return rows[0];
  }

  /**
   * Get number of subscriptions of a user
   * @param {*} id_user - id of the user
   * @returns {number} number of subscription of the id_user
   */
  async getSubscriptions(id_user) {
    const { rows } = await db.query(
      'SELECT count(s.*) AS "nbAbonnements" FROM users u, subscribers s WHERE $1 = s.id_follower AND u.banned=false AND u.id_user = s.id_user',[id_user]
    );

    if (!rows) return;

    return rows;
  }

  /**
   * Get users matching with a filter one their email or name
   * @param {String} filter - filter 
   * @returns {Array} all names and emails users matching with the filter
   */
  async getUsersByFilterOnNameOrEmail(filter) {
    const { rows } = await db.query(
      `SELECT u.*  FROM users u WHERE lower(u.name) LIKE lower('%${filter}%') OR lower(u.email) LIKE lower('%${filter}%') ORDER BY u.email`
    );
    if (!rows) return;
    return rows;
  }

  /**
   * Check if a user exists by email
   * @param {String} email - email of the user
   * @returns {boolean} true if the user exists, else otherwise
   */
  async userExist(email){
    const user = await db.query(`SELECT email FROM users WHERE email='${email}'`);
    console.log(user);
    if(!user.rows[0]) return false;
    return true;
  }

  /**
   * Check if the password is correct for the user email
   * @param {String} email - email of the user
   * @param {String} password - password of the user
   * @returns {boolean} true if the password is correct, false otherwise
   */
  async passwordMatch(email,password){
    const user = await this.getUserByEmailWithSubs(email);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return false;
    else return true;
  }

}

module.exports = { User };
