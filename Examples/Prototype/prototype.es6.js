import * as random from 'random';
var _pj;
var an_answer, answers, cat, categories, five_cats, letter, new_thing, playing, ques, reply, skip, tally;
function _pj_snippets(container) {
    function in_es6(left, right) {
        if (((right instanceof Array) || ((typeof right) === "string"))) {
            return (right.indexOf(left) > (- 1));
        } else {
            if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
                return right.has(left);
            } else {
                return (left in right);
            }
        }
    }
    container["in_es6"] = in_es6;
    return container;
}
_pj = {};
_pj_snippets(_pj);
categories = {"a day of the week": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], "a fruit": ["apple", "avocado", "apricot", "banana", "cantaloupe", "cherries", "cherry", "clementine", "date", "grapefruit", "grapes", "grape", "honeydew", "melon", "lemon", "lime", "mandarin", "orange", "mango", "orange", "papaya", "peach", "pear", "pineapple", "plantain", "plum", "pomelo", "tangerine", "watermelon", "strawberry", "strawberries", "blueberry", "blueberries", "lingonberries", "lingonberry", "dragonfruit", "tomato", "pawpaw", "lychee", "kiwifruit", "jackfruit", "durian", "guava", "passionfruit"], "an EU country": ["austria", "belgium", "bulgaria", "croatia", "cyprus", "czech republic", "czechia", "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "ireland", "italy", "latvia", "lithuania", "luxembourg", "malta", "netherlands", "hollandm", "poland", "portugal", "romania", "slovakia", "slovenia", "spain", "sweden"], "a name of a month": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], "a swear word": ["fuck", "bitch", "damn", "cunt", "motherfucker", "bugger", "bloody", "shit", "arsehole", "asshole", "prick", "bastard", "wanker"], "a country in Asia": ["russia", "china", "india", "kazakhstan", "saudi arabia", "iran", "mongolia", "indonesia", "pakistan", "turkey", "myanmar", "afghanistan", "yemen", "thailand", "turkmenistan", "uzbekistan", "iraq", "japan", "vietnam", "malaysia", "oman", "philippines", "laos", "kyrgyzstan", "syria", "cambodia", "bangladesh", "nepal", "tajikistan", "north korea", "south korea", "jordan", "azerbaijan", "united arab emirates", "uae", "georgia", "sri lanka", "bhutan", "taiwan", "armenia", "israel", "kuwait", "east timor", "qatar", "lebanon", "cyprus", "northern cyprus", "palestine", "brunei", "bahrain", "singapore", "maldives"], "a country that has won Eurovision": ["luxembourg", "portugal", "switzerland", "russia", "sweden", "estonia", "serbia", "monaco", "denmark", "israel", "norway", "greece", "france", "spain", "azerbaijan", "belgium", "italy", "yugoslavia", "finland", "latvia", "germany", "ireland", "austria", "turkey", "united kingdom", "ukraine", "netherlands"], "a capital city in Europe": ["amsterdam", "andorra la vella", "ankara", "athens", "baku", "belgrade", "berlin", "bern", "bratislava", "brussels", "bucharest", "budapest", "chisinau", "kishinev", "copenhagen", "dublin", "helsinki", "kyiv", "lisbon", "ljubljana", "london", "luxembourg", "madrid", "minsk", "monaco", "moscow", "nicosia", "nur-sultan", "oslo", "paris", "podgorica", "prague", "reykjavik", "riga", "rome", "san marino", "sarajevo", "skopje", "sofia", "stockholm", "tallinn", "tbilisi", "tirana", "vaduz", "valletta", "vatican", "vienna", "vilnius", "warsaw", "yerevan", "zagreb", "north nicosia", "pristina", "stepanakert", "sukhumi", "tiraspol", "tskhinvali", "south ossetia"], "a common pet": ["bird", "fish", "mouse", "rat", "dog", "cat", "gerbil", "hamster", "spider", "snake", "ferret", "goldfish", "turtle", "rabbit", "pig", "goat", "guinea", "pig", "frog", "hedgehog", "horse", "chicken", "duck", "goose", "budgie", "parrot", "canary"], "a vegetable": ["pumpkin", "squash", "mushroom", "bakchoy", "kale", "arugula", "rocket", "broccoli", "spinash", "carrot", "cabbage", "beetroot", "celery", "zucchini", "potato", "onion", "cucumber", "eggplant", "aubergine", "corn", "cauliflower", "asparagus"]};
function eligible_cats(letter) {
    /* Returns a list of categories that contain things starting with *letter.  */
    var cats_with_letter;
    cats_with_letter = function () {
    var _pj_a = [], _pj_b = categories;
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var cat = _pj_b[_pj_c];
        if ((function () {
    var _pj_e = [], _pj_f = categories[cat];
    for (var _pj_g = 0, _pj_h = _pj_f.length; (_pj_g < _pj_h); _pj_g += 1) {
        var t = _pj_f[_pj_g];
        if ((t[0] === letter)) {
            _pj_e.push(t);
        }
    }
    return _pj_e;
}
.call(this).length > 0)) {
            _pj_a.push(cat);
        }
    }
    return _pj_a;
}
.call(this);
    return cats_with_letter;
}
class questions {
    /* A questions object, with a letter and a list of five relevant categories.  */
    constructor() {
        var done;
        this.letter = "";
        this.five_cats = [];
        done = false;
        while ((done === false)) {
            this.letter = random.choice("abcdefghijklmnopqrstvvwxyz");
            this.candidates = eligible_cats(this.letter);
            if ((this.candidates.length >= 5)) {
                done = true;
            }
        }
        this.five_cats = random.sample(this.candidates, this.candidates.length);
    }
}
playing = true;
while ((playing === true)) {
    ques = questions();
    letter = ques.letter;
    five_cats = ques.five_cats;
    tally = 0;
    if ((tally === 0)) {
        console.log(`Your letter is ${letter.upper()}. Answer or say "pass", "hint", "start again". `);
    }
    while ((tally < 5)) {
        cat = five_cats[0];
        answers = function () {
    var _pj_a = [], _pj_b = categories[cat];
    for (var _pj_c = 0, _pj_d = _pj_b.length; (_pj_c < _pj_d); _pj_c += 1) {
        var thing = _pj_b[_pj_c];
        if ((thing[0] === letter)) {
            _pj_a.push(thing);
        }
    }
    return _pj_a;
}
.call(this);
        reply = input(`Name ${cat}...`);
        if (_pj.in_es6(reply.lower(), answers)) {
            console.log("Yaaaaay! ");
            tally += 1;
            five_cats.pop(0);
        } else {
            if (_pj.in_es6(reply.lower(), ["skip", "pass"])) {
                skip = five_cats.pop(0);
                five_cats.append(skip);
            } else {
                if ((reply.lower() === "start again")) {
                    tally = 100;
                } else {
                    if ((reply.lower().slice(0, 7) === "update ")) {
                        new_thing = reply.lower().slice(7);
                        categories[cat].append(new_thing);
                        console.log(`I've learnt that ${new_thing} is ${cat}!`);
                    } else {
                        if ((reply.lower() === "hint")) {
                            an_answer = random.choice(answers);
                            console.log((an_answer.slice(0, 3) + ("-" * (an_answer.length - 3))));
                        } else {
                            console.log("Wrong! Try again...");
                        }
                    }
                }
            }
        }
    }
    if ((tally < 100)) {
        reply = input("Well done! Play again?");
        if ((reply.lower() === "yes")) {
            tally = 0;
        } else {
            console.log("Ok bye!");
            playing = false;
        }
    } else {
        tally = 0;
    }
}

//# sourceMappingURL=prototype.js.es6.map
