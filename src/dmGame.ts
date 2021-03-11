import { MachineConfig, actions, Action, assign, send } from "xstate";

//Instantiate a new obj for each new round of game
import { makeNewQuestions, randomChoice } from './game_codes/game'
// let qs=makeNewQuestions()
// console.log(qs.letter)
// console.log(qs.ques)

//Using "Natural" NLP library
const natural = require('natural'),
nounInflector = new natural.NounInflector();
// let singular = nounInflector.singularize('those tomatoes');
// console.log(singular); //>>those tomato


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
    let qs=makeNewQuestions();
    return { letter: qs.letter, questions: qs.ques, tally:0, confettiSwitch:false} 
})


//Say the current random letter and a 'spelling/phonetic' alphabet
function letterNow(context:SDSContext){
    let alphabet:any = {
        'a':'Adam', 'b':'Bella', 'c':'Cindy', 'd':'Daniel', 'e':'Eva', 'f':'Francesca', 'g':'Gabriel', 'h':'Harry',
        'i':'Ida', 'j':'Julia', 'k':'Kevin', 'l':'Laura', 'm':'Michael', 'n':'Nicole', 'o':'Oscar', 'p':'Paula',
        'q':'Quebec', 'r':'Rachel', 's':'Sara', 't':'Tina', 'u':'unique', 'v':'Victoria', 'w':'window', 'x':'x-ray',
        'y':'yesman', 'z':'zero'
        }
    let letter:string = context.letter
    return `Your letter is ${letter.toUpperCase()} for ${alphabet[letter]}. `
}

function questionNow(context:SDSContext){
    let category = context.questions[0].category //the question at front of array
    return `Name ${category}. `
}

function giveHint(context:SDSContext){
    let answers = context.questions[0].answers //answers to the question at front of array
    let anAns = randomChoice(answers)
    if (anAns.length >= 3) {
        let hint = anAns.slice(0, 3).toUpperCase() //first 3 letters
        return `Spelled with ${hint[0]}, ${hint[1]}, ${hint[2]}.`
    }
    //in case word is too short>>hint only 2 letters
    else {
        let hint = anAns.slice(0, 2).toUpperCase() //first 2 letters
        return `Spelled with ${hint[0]}, ${hint[1]}, ${hint[2]}.`
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
            nomatch: { entry: [say("Try again")],  
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
    let yes=["yes", "of course", "sure", "absolutely", "yeah", "yep", "okay", "ok"]
    let no=["no", "nope", "no thanks", "nah",]
    let pass=["skip", "pass", "next",]
    let hint=["hint", "clue", "help"]
    let whatletter=['letter','repeat']
    let stop=['stop','end the game','shut down']
    let restart=['restart','start again', 'reboot']
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

/*
NOTES
Swear words are censored so won't match. Unless change them to f*** in the JSON
? Find out how to show prompts & recognised text on screen
? Confetti effect in winning state
! Need to lemmatize userinput. Use js-lemmatizer, Natural, and/or Wink libraries 
*/

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'start'
            }
        },
        stop: {
            entry: say("Ok bye!"),
            on: { ENDSPEECH: {
                actions: [resetTally,clearLetter,clearTTSAgenda,clearRecResult,confettiOff, gameOff],
                target:"init",
                } 
            }
        },
        //Start new game: initiate new game object & reset tally counter
        start: {
            entry: say("Starting the game "),
            on: { ENDSPEECH: {
                actions: [newGameRound, gameOn, clearTTSAgenda, clearRecResult],
                target:"sayletter",
                } 
            } 
        },
        restart: {
            entry: say("Ok, starting over"),
            // always: 'sayletter'
            on: { ENDSPEECH: {
                    actions: [newGameRound, gameOn, clearTTSAgenda, clearRecResult],
                    target:"sayletter",
                    } 
            } 
        },
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
                    {cond: (context:SDSContext) => sayKeyword(context.recResult)==='pass',
                     actions: assign((context:SDSContext) => { 
                        let skipped=context.questions.shift();
                        context.questions.push(skipped);
                        return { } }),
                     target:"checkscore"  },

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

        hint: {
            entry: send((context)=>({ type: "SPEAK", value: giveHint(context) })),
            always: 'checkscore'
        },
        
        checkscore:{
            always: [
                //Less than 5 correct
                { target: 'askQues', cond: (context) => context.tally<5 },

                //5 correct
                { target: 'winning', cond: (context) => context.tally>=5 },
            ]
        },

                    //? reset/clear tally here or not...? 
        winning: {
            entry: [ say("Winner winner chicken dinner"), confettiOn, clearTTSAgenda ], 
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
                ...promptAndAsk( say('Want to play again?') )
        }, 
        
    },

})