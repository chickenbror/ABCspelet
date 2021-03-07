"use strict";
//A JSON object. Can be read from an external .json file
const obj = { "questions": [
        { "category": "a day of the week",
            "answers": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        },
        { "category": "a fruit",
            "answers": ["apple", "avocado", "apricot", "banana", "cantaloupe", "cherries", "cherry", "clementine", "date",
                "grapefruit", "grapes", "grape", "honeydew", "melon", "lemon", "lime", "mandarin", "orange", "mango", "orange",
                "papaya", "peach", "pear", "pineapple", "plantain", "plum", "pomelo", "tangerine", "watermelon", "strawberry",
                "blueberry", "litchi", "lingonberry", "dragonfruit", "tomato", "pawpaw", "lychee", "kiwifruit", "jackfruit",
                "durian", "guava", "passionfruit"]
        },
        { "category": "an EU country",
            "answers": ["austria", "belgium", "bulgaria", "croatia", "cyprus", "czech republic", "czechia", "denmark",
                "estonia", "finland", "france", "germany", "greece", "hungary", "ireland", "italy",
                "latvia", "lithuania", "luxembourg", "malta", "netherlands", "holland", "poland", "portugal",
                "romania", "slovakia", "slovenia", "spain", "sweden"]
        },
        { "category": "a name of a month",
            "answers": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
        },
        { "category": "a swear word",
            "answers": ["fuck", "bitch", "damn", "cunt", "motherfucker", "bugger", "bloody", "shit", "arsehole", "asshole", "prick", "bastard", "wanker"]
        },
        { "category": "a country that has won Eurovision",
            "answers": ["luxembourg", "portugal", "switzerland", "russia", "sweden", "estonia", "serbia", "monaco", "denmark", "israel", "norway",
                "greece", "france", "spain", "azerbaijan", "belgium", "italy", "yugoslavia", "finland", "latvia", "germany", "ireland", "austria",
                "turkey", "united kingdom", "ukraine", "netherlands"]
        },
        { "category": "a country in Asia",
            "answers": ["china", "india", "kazakhstan", "saudi arabia", "iran", "mongolia", "indonesia", "pakistan", "turkey", "myanmar", "afghanistan",
                "yemen", "thailand", "turkmenistan", "uzbekistan", "iraq", "japan", "vietnam", "malaysia", "oman", "philippines", "philippine",
                "laos", "lao", "kyrgyzstan", "syria", "cambodia", "bangladesh", "nepal", "tajikistan", "north korea", "south korea", "korea", "jordan", "azerbaijan",
                "united arab emirates", "uae", "georgia", "sri lanka", "bhutan", "taiwan", "armenia", "israel", "kuwait", "east timor", "qatar", "lebanon",
                "cyprus", "northern cyprus", "palestine", "brunei", "bahrain", "singapore", "maldives"]
        },
        { "category": "a capital city in Europe",
            "answers": ["amsterdam", "andorra la vella", "ankara", "athens", "baku", "belgrade", "berlin", "bern", "bratislava", "brussels", "bucharest",
                "budapest", "chisinau", "kishinev", "copenhagen", "dublin", "helsinki", "kyiv", "lisbon", "ljubljana", "london", "luxembourg", "madrid",
                "minsk", "monaco", "moscow", "nicosia", "nur-sultan", "oslo", "paris", "podgorica", "prague", "reykjavik", "riga", "rome", "san marino",
                "sarajevo", "skopje", "sofia", "stockholm", "tallinn", "tbilisi", "tirana", "vaduz", "valletta", "vatican", "vatican city", "vienna", "vilnius", "warsaw",
                "yerevan", "zagreb", "north nicosia", "pristina", "stepanakert", "sukhumi", "tiraspol", "tskhinvali", "south ossetia"]
        },
        { "category": "a common pet animal",
            "answers": ["bird", "fish", "mouse", "rat", "dog", "cat", "gerbil", "hamster", "spider", "snake", "ferret", "goldfish", "turtle", "rabbit",
                "pig", "goat", "guinea", "pig", "frog", "hedgehog", "horse", "chicken", "duck", "goose", "budgie", "parrot", "canary"]
        },
        { "category": "a vegetable",
            "answers": ["watercress", "brussels sprout", "pumpkin", "squash", "mushroom", "bakchoy", "kale", "rocket", "broccoli", "spinash", "carrot",
                "beetroot", "celery", "zucchini", "potato", "onion", "cucumber", "eggplant", "aubergine", "corn", "cauliflower", "asparagus",
                "cabbage"]
        },
        { "category": "a family member",
            "answers": ["dad", "mom", "mother", "father", "sister", "brother", "auntie", "aunt", "uncle", "cousin", "niece", "nephew",
                "grandfather", "grandmother", "grandma", "grandpa", "granny", "nanna", "pappa", "mamma", "mommy"]
        },
        { "category": "a continent",
            "answers": ["america", "australia", "north america", "south america", "africa", "asia", "europe", "antarctica"]
        },
        { "category": "a social media website or app",
            "answers": ["facebook", "tik tok", "twitter", "instagram", "snapchat", "youtube"]
        }
    ]
};
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
function randomChoice(items) {
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
    candidates = shuffleArray(candidates);
    return [letter, candidates];
}
class questions {
    constructor(letter, ques) {
        this.letter = letter;
        this.ques = ques;
    }
}
function makeNewQuestions() {
    let arr = pickRandomLetter();
    let letter = arr[0];
    let ques = arr[1];
    let questionsObj = new questions(letter, ques);
    return questionsObj;
}
// let q=makeNewQuestions() //q has two properties: .letter and .ques= five or more categories+answers
// console.log(q.letter)
// var userInput = prompt('Please enter your name.');
// console.log(userInput)
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
            let okAnswers = [];
            answers.forEach(ans => {
                if (ans[0] === letter) {
                    okAnswers.push(ans);
                }
            });
            let userInput = prompt(`Name ${cat}...`);
            let reply = userInput.toLowerCase();
            if (okAnswers.includes(reply)) {
                alert("Correct!");
                tally += 1;
                ques.pop(); //remove the last
            }
            else if (reply === 'hint') {
                let anAns = randomChoice(okAnswers);
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
            if (yesReplies.includes(reply)) {
                tally = 0;
            }
            else {
                alert('Ok bye!');
                playing = false;
            }
        }
    }
}
game();