"use strict";

//A JSON object. Can be read from an external .json file
const obj = require('./questions.json') //only works on server-end eg Node.js


// console.log(obj.questions) //list of cat+answers
function eligibleCats(letter) {
    let ques = obj.questions;
    let validCats = [];
    ques.forEach(que => {
        let cat = que.category;
        let answers = que.answers;
        let validAns = [];
        answers.forEach(ans => {
            if (ans[0] === letter) {
                validAns.push(ans);
            }
        });
        if (validAns.length > 0) {
            validCats.push(cat);
        }
    });
    return validCats;
}
function eligibleQues(letter) {
    let ques = obj.questions;
    let validCats = [];
    ques.forEach(que => {
        let answers = que.answers;
        let validAns = [];
        answers.forEach(ans => {
            if (ans[0] === letter) {
                validAns.push(ans);
            }
        });
        if (validAns.length > 0) {
            validCats.push(que);
        }
    });
    return validCats;
}
//let eligibleList= eligibleQues('h') //given a letter => a list of que objects
// console.log(eligibleList[0])
function shuffleArray(array) {
    let curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
        // Pick a remaining element
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        // Swap it with the current element.
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}
export function randomChoice(items) {
    let choice = items[items.length * Math.random() | 0];
    return choice;
}
function pickRandomLetter() {
    let alphabet = 'abcdefghijklmnopqrstvvwxyz';
    let letter;
    let candidates;
    let done = false;
    while (done === false) {
        letter = randomChoice(alphabet);
        candidates = eligibleQues(letter);
        //Need at least 5 ques
        if (candidates.length >= 5) {
            done = true;
        }
    }
    candidates.forEach(candidate => {
        let answers = candidate.answers;
        let okAnswers = [];
        answers.forEach(ans => {
            if (ans[0] === letter) {
                okAnswers.push(ans);
            }
        });
        candidate.answers = okAnswers;
    });
    candidates = shuffleArray(candidates);
    return [letter, candidates];
}
class questions {
    constructor(letter, ques) {
        this.letter = letter;
        this.ques = ques;
    }
}
//Instanticates an object with .letter (a random letter) & .ques (array of 5+ questions objects); 
//each question object has .category & .answers (array of things in that category and begins with the letter)
export function makeNewQuestions() {
    let arr = pickRandomLetter();
    let letter = arr[0];
    let ques = arr[1];
    let questionsObj = new questions(letter, ques);
    return questionsObj;
}
// let q = makeNewQuestions(); //q has two properties: .letter and .ques= five or more categories+answers
// console.log(q.letter);
// console.log(q.ques);

function game() {
    let playing = true;
    while (playing === true) {
        let quesObj = makeNewQuestions();
        let letter = quesObj.letter; //A random letter
        let ques = quesObj.ques; //5 more more question-sets (categories+answers)
        let tally = 0; // If incorporating with xstate, use this as context.tally...?
        if (tally === 0) {
            alert(`Your letter is ${letter.toUpperCase()}...`);
        }
        while (tally < 5) {
            let que = ques[ques.length - 1]; //start from the last 
            let cat = que.category;
            let answers = que.answers;
            let userInput = prompt(`Name ${cat}...`);
            let reply = userInput.toLowerCase();
            if (answers.includes(reply)) {
                alert("Correct!");
                tally += 1;
                ques.pop(); //remove the last
            }
            else if (reply === 'hint') {
                let anAns = randomChoice(answers);
                //hint 3 letters
                if (anAns.length >= 3) {
                    let hint = anAns.slice(0, 3); //first 3 letters
                    let rest = '-'.repeat(anAns.slice(3).length);
                    alert(hint + rest);
                }
                //in case word is too short>>hint only 1 letter
                else {
                    let hint = anAns.slice(0); //first letter
                    let rest = '-'.repeat(anAns.slice(1).length);
                    alert(hint + rest);
                }
            }
            else {
                alert('Try again!');
            }
        }
        if (tally >= 5) {
            let reply = prompt('Well done! Play again?');
            let yesReplies = ['yes', 'okay', 'sure', 'ok'];
            if (yesReplies.includes(reply.toLowerCase())) {
                tally = 0;
            }
            else {
                alert('Ok bye!');
                playing = false;
            }
        }
    }
}

// game()
