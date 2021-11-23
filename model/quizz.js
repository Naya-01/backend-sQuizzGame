const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");

const jsonDbPath = __dirname + "/../data/quizz.json";

//TODO : Ajouter quizz de départ
const defaultQuizz = [];

class Quizz {
    constructor(dbPath = jsonDbPath, defaultItems = defaultQuizz ){
        this.jsonDbPath = dbPath;
        this.defaultQuizz = defaultItems
    }
    /**
   * Returns the quizz identified by id
   * @param {number} id - id of the quizz we want or -1 if it doesn't exist
     */
    getOneQuizz(id) {
        const allQuizz = parse(this.jsonDbPath, this.defaultQuizz);
        const i = quizz.findIndex((quizz) => quizz.id == id);
        if(i < 0) return -1;
        return allQuizz[i];
    }

    /**
     * Returns all quizz
     * @returns {Array} Array of Quizz
     */
    getAllQuizz(){
        const allQuizz = parse(this.jsonDbPath, this.defaultQuizz);
        return allQuizz;
    }

    addOne(body){
        const allQuizz = parse(this.jsonDbPath, this.defaultQuizz);
        const newQuizz = { // a modifier
            id = allQuizz.length,
            name = escape(body.name),
            questions = body.questions,
            scores = body.scores,
        };
        allQuizz.push(newQuizz);
        serialize(this.jsonDbPath, allQuizz);
        return newQuizz;
    }



}