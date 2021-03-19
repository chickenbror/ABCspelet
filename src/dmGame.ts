import { MachineConfig, actions, Action, assign, send } from "xstate";

//Instantiate a new obj for each new round of game
import { makeNewQuestions, randomChoice } from './game_codes/game'
const quesJSON = require('./game_codes/questionsSV.json') //Source of game questions; require() only works on server
// let qs=makeNewQuestions(quesJSON)
// console.log(qs.letter)
// console.log(qs.ques)

//Using "Natural" NLP library --Swedish lemmatizer?
const natural = require('natural'),
nounInflector = new natural.NounInflector();
// let singular = nounInflector.singularize('those tomatoes');
// console.log(singular); //>>those tomato

// var snowball = require('node-snowball');

// // Using String
// let stemmed = snowball.stemword('consignment'); // 'consign'
// console.log(stemmed)

// https://json-tagger.com/ needs CORS...?
// const proxyurl = "https://cors-anywhere.herokuapp.com/";
// const taggerurl = 'https://json-tagger.com/tag'
// const taggerRequest = (text: string) =>
//     fetch(new Request(proxyurl + taggerurl, {
//         method: 'POST',
//         headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
//         body: `${text}`
//         })
//         )
//         .then(data => data.json());
// console.log( taggerRequest("Fördomen har alltid sin rot i vardagslivet - Olof Palme") )
// var request = require('request');
// request.post({url: 'https://json-tagger.com/tag', body: "Fördomen har alltid sin rot i vardagslivet - Olof Palme"}, function (error, response, body) {
//     console.log(body)
// })





const clearRecResult: Action<SDSContext, SDSEvent> = assign((context) => { return { recResult:''} })
const clearTTSAgenda: Action<SDSContext, SDSEvent> = assign((context) => { return { ttsAgenda:''} })
const resetTally: Action<SDSContext, SDSEvent> = assign((context) => { return { tally:0} })
const clearLetter: Action<SDSContext, SDSEvent> = assign((context) => { return { letter:undefined} })

const confettiOn: Action<SDSContext, SDSEvent> = assign((context) => { return { confettiSwitch:true} })
const confettiOff: Action<SDSContext, SDSEvent> = assign((context) => { return { confettiSwitch:false} })

const gameOn: Action<SDSContext, SDSEvent> = assign((context) => { return { playingNow:true} })
const gameOff: Action<SDSContext, SDSEvent> = assign((context) => { return { playingNow:false} })

//Initiate a questions object & assign values to context.letter/questions/tally
const newGameRound: Action<SDSContext, SDSEvent> = assign((context) => { 
    let qs=makeNewQuestions( quesJSON );
    console.log(`Last round:${context.lastLetter}`)
    console.log(qs.ques)
    return { letter: qs.letter, questions: qs.ques, tally:0, skipped:0, hinted:0, confettiSwitch:false} 
})
//After chosen a letter and before going saying it, remember it for referece of next game round
const rememberLetter: Action<SDSContext, SDSEvent> = assign((context) => { 
    return { lastLetter: context.letter} 
})
// const remember3Letters: Action<SDSContext, SDSEvent> = assign((context) => { 
//     let last3Letters= context.lastLetters? context.lastLetters : []
//     last3Letters.push(context.letter)
//     if(last3Letters.length>3){
//         last3Letters.shift()
//     }
//     return { lastLetters: last3Letters} 
// })


//Say the current random letter and a 'spelling/phonetic' alphabet
function letterNow(context:SDSContext){
    let alphabet:any = {
        'a':'Adam', 'b':'Benedikt', 'c':'Cecilia', 'd':'Daniel', 'e':'Eva', 'f':'Francesca', 'g':'Gustav', 'h':'Håkan',
        'i':'Ida', 'j':'Julia', 'k':'Klara', 'l':'Lotta', 'm':'Markus', 'n':'Natalie', 'o':'Oscar', 'p':'Paula',
        'q':'Queen', 'r':'Rebecka', 's':'Sven', 't':'Tina', 'u':'Ulla', 'v':'Viktoria', 'w':'Wanda', 'x':'Xavier',
        'y':'Ylva', 'z':'Zara', 'å':'Åsa','ä':'Ängel', 'ö':'Örebro', 
        }
    let letter:string = context.letter
    return `Bokstaven är "${letter.toUpperCase()}" för "${alphabet[letter]}". `
}

function questionNow(context:SDSContext){
    let category = context.questions[0].category //the question at front of array
    return `Nämn ${category}. `
}

function giveHint(context:SDSContext){
    let answers = context.questions[0].answers //answers to the question at front of array
    let anAns = randomChoice(answers)
    if (anAns.length >= 3) {
        let hint = anAns.slice(0, 3).toUpperCase() //first 3 letters
        return `Stavas med ${hint[0]}, ${hint[1]}, ${hint[2]}.`
    }
    //in case word is too short>>hint only 2 letters
    else {
        let hint = anAns.slice(0, 2).toUpperCase() //first 2 letters
        return `Stavas med ${hint[0]}, ${hint[1]}, ${hint[2]}.`
    }
}

//Partial match of user input, as long as input mentions an answer
function answerMatches(input:string,context:SDSContext){
    let reply = input.toLowerCase() //convert to lowercase
    let replySing = nounInflector.singularize( reply ) //convert to singular form

    let answers = context.questions[0].answers //answers to the question at front of array

    //True if reply--either original or singularised--mentions an answer 
    //(eg, 'the Netherlands' matches 'netherlands'; 'these strawberries' matches 'strawberry')
    return  (exists(reply, answers) || exists(replySing, answers)) 
}


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function sharedRecognitions() {
    return [
        { target: 'stop', cond: (context:SDSContext) => sayKeyword(context.recResult) === 'stop' },
        { target: 'restart', cond: (context:SDSContext) => sayKeyword(context.recResult) === 'restart' },
        //for testing 
        { target: 'winning', cond: (context:SDSContext) => sayKeyword(context.recResult) === 'shortcut' },
        { target: ".nomatch" }
        ]
}

function promptAndAsk(promptEvent: Action<SDSContext, SDSEvent>): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
        initial: 'prompt',
        states: {
            prompt: {
                entry: promptEvent,
                on: { ENDSPEECH: 'ask' }
            },
            ask: {
                entry: send('LISTEN'),
            },
            nomatch: { entry: [say("Försök igen")],  
                       on: { ENDSPEECH: "prompt" } 
            },
        }
    })
}


// Similar to python: any(keyword in input for keyword in keywords)
function exists(input:string, keywords:string[]){
    let existence = keywords.some(keyword => input.includes(keyword))
    return existence
}
//Replace this with grammar parser?
function sayKeyword(reply: string){
    let yes=["ja", "naturligtvis", "säker", "absolut", "javisst", "visst", "okej", "ok"]
    let no=["nej", "nä", "nej tack"]
    let pass=["hoppa", "pass", "nästa",]
    let hint=["hint", "tips", "ledtråd", "hjälp"]
    let whatletter=['bokstav', 'upprepa']
    let stop=['stop', 'avsluta', 'sluta', 'stopp']
    let restart=['starta om', 'börja om', 'starta igen']
    let shortcut=['short cut', 'shortcut'] //for testing

    reply=reply.toLowerCase()
    if(exists(reply, yes)){ return 'yes' }
    if(exists(reply, no)){ return 'no' }
    if(exists(reply, pass)){ return 'pass' }
    if(exists(reply, hint)){ return 'hint' }
    if(exists(reply, whatletter)){ return 'whatletter' }
    if(exists(reply, stop)){ return 'stop' }
    if(exists(reply, restart)){ return 'restart' }
    if(exists(reply, shortcut)){ return 'shortcut' } //for testing
}


export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'start'
            }
        },
        stop: {
            entry: say("Hej och farväl!"),
            on: { ENDSPEECH: {
                actions: [resetTally,clearLetter,clearTTSAgenda,clearRecResult,confettiOff, gameOff],
                target:"init",
                } 
            }
        },
        //Start/restart new game: initiate new questions-object & reset tally counter
        start: {
            entry: say("Var redo att spela!"),
            on: { ENDSPEECH: { target:"chooseNewLetter" } } 
        },
        restart: {
            entry: say("Okej, vi startar om!"),
            on: { ENDSPEECH: {target:"chooseNewLetter" } } 
        },
        chooseNewLetter :{
            always:[
                {actions: [newGameRound, clearTTSAgenda, clearRecResult],
                 target: "checkLastLetter" }
            ]
        },

        //After choosing letter, comparing to last letter game so that the new letter is not repeated
        checkLastLetter: {
            always: [
                //if chosen letter is the same as last ones >> choose again
                { cond: (context) => !!context.lastLetter && context.letter===context.lastLetter, 
                    target: 'chooseNewLetter', },

                //chosen letter is different from last 3 letters >> remember it & resume game
                { 
                  actions: [rememberLetter, gameOn, ],
                  target: 'sayletter',  },
            ]
        },

        //Starting the game for real from this state
        //Say the letter
        sayletter:{
            entry: send((context)=>({ type: "SPEAK", value: letterNow(context) })),
            on: {ENDSPEECH:'askQues' }
        },

        //Ask 5 (or more if skipping) questions 
        askQues: {
            on: {
                RECOGNISED: [
                    
                    // ? Clear recResult after recognition or not...?
                    // If answer matches answers, tally+=1, shift question[0]
                    {cond: (context:SDSContext) => answerMatches(context.recResult, context),
                     actions: assign((context:SDSContext) => { 
                        context.questions.shift()
                        return { tally: context.tally+1 } }),
                     target:"checkscore"  },
                    
                    //If pass, move the question to the last (unshift & push)
                    {cond: (context:SDSContext) => sayKeyword(context.recResult)==='pass', target:"skip"  },

                    //Hint 3 or 2 letters
                    {cond: (context:SDSContext) => sayKeyword(context.recResult)==='hint', target:"hint"},

                    //Repeat letter
                    {cond: (context:SDSContext) => sayKeyword(context.recResult)==='whatletter', target:"sayletter"},

                    //Else    
                    ...sharedRecognitions(),
                    
                ]},
                ...promptAndAsk( send((context)=>({ type: "SPEAK", 
                                                    value: questionNow(context) })) )
        },

        skip: {
            initial: 'checkSkipped',
            states:{
                checkSkipped:{
                    always:[
                        { target: 'letSkip', cond: (context) => context.skipped<5 },
                        { target: 'maxSkipped', cond: (context) => context.skipped>=5 },
                    ]
                },
                //move the question to the last (unshift & push); context.skipped++
                letSkip:{
                    entry:  assign((context:SDSContext) => { 
                        let skipped=context.questions.shift();
                        context.questions.push(skipped);
                        console.log(`Skipped so far: ${context.skipped+1} `)
                        console.log(context.questions)
                        return { skipped:context.skipped+1} }),
                    always: '#checkscore'
                },
                maxSkipped:{
                    entry: say(`Åjojoj, du har hoppat över för många gånger!`),
                    on:{ ENDSPEECH: {target:'#checkscore'}}
                }
            }
        },

        hint: {
            initial: 'checkHinted',
            states:{
                checkHinted:{
                    always:[
                        { target: 'giveHint', cond: (context) => context.hinted<5 },
                        { target: 'maxHinted', cond: (context) => context.hinted>=5 },
                    ]
                },
                //Hint 3 or 2 letters or a random answer; context.hinted++
                giveHint:{
                    entry: [
                        send((context)=>({ type: "SPEAK", value: giveHint(context) })),
                        assign((context:SDSContext) => {
                            console.log(`Hinted so far: ${context.hinted+1} `);
                            return { hinted:context.hinted+1} })
                    ],
                    always: '#checkscore' // use 'on endspeech...' if we want the question being said again
                },
                maxHinted:{
                    entry: say(`Åjojoj, du har bett om för många hints!`),
                    on:{ ENDSPEECH: {target:'#checkscore'}}
                }
            }
        },
        
        checkscore:{
            id:"checkscore",
            always: [
                //Less than 5 correct
                { target: 'askQues', cond: (context) => context.tally<5 },

                //5 correct
                { target: 'winning', cond: (context) => context.tally>=5 },
            ]
        },

                    //? reset/clear tally here or not...? 
        winning: {
            entry: [ say("Du vann, winner winner chicken dinner!"), confettiOn, clearTTSAgenda ], 
            on: {ENDSPEECH:{target:'playagain'}}
        },
        playagain: {
            entry: [ clearRecResult, confettiOff, resetTally, clearLetter, gameOff,],
            on: {
                RECOGNISED: [
                     //Play again? restart:stop
                     {cond: (context:SDSContext) => sayKeyword(context.recResult)==='yes', target:"restart"},
                     {cond: (context:SDSContext) => sayKeyword(context.recResult)==='no', target:"stop"},

                    //Else    
                    ...sharedRecognitions() 
                ]},
                ...promptAndAsk( say('Vill du spela igen?') )
        }, 
        
    },

})