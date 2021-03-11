
import * as React from "react";

//XState library & Game DM-machine
import { Machine, assign, send, State } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { dmMachine } from './dmGame';


//Animation effects
import Confetti from 'react-dom-confetti';
import TextLoop from "react-text-loop";
import { useWindupString, WindupChildren } from "windups";
        // import HeadShake from 'react-reveal/HeadShake';
const HeadShake = require('react-reveal/HeadShake'); //?import shows error in TS, so use require() here instead
const RubberBand = require('react-reveal/RubberBand');


//Browser detection 
import { isSafari,isChrome, isEdge, isMobile} from "react-device-detect";


// import { inspect } from "@xstate/inspect";
// inspect({ url:"https://statecharts.io/inspect", iframe: false });


// State machines: ASR-TTS (voice interface) & dmGame
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';

const machine = Machine<SDSContext, any, SDSEvent>({
    id: 'root',
    type: 'parallel',
    states: {
        dm: {
            ...dmMachine  //dmGame
        },
        asrtts: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        LISTEN: 'recognising',
                        SPEAK: {
                            target: 'speaking',
                            actions: assign((_context, event) => { return { ttsAgenda: event.value } })
                        }
                    }
                },
                recognising: {
                    initial: 'progress',
                    entry: 'recStart',
                    exit: 'recStop',
                    on: {
                        ASRRESULT: {
                            actions: ['recLogResult',
                                assign((_context, event) => { return { recResult: event.value } })],
                            target: '.match'
                        },
                        RECOGNISED: 'idle'
                    },
                    states: {
                        progress: {
                        },
                        match: {
                            entry: send('RECOGNISED'),
                        },
                    }
                },
                speaking: {
                    entry: 'ttsStart',
                    on: {
                        ENDSPEECH: 'idle',
                    }
                }
            }
        }
    },
},
    {
        actions: {
            recLogResult: (context: SDSContext) => {
                /* context.recResult = event.recResult; */
                console.log('<< ASR: ' + context.recResult);

            },
            test: () => {
                console.log('test')
            },
            logIntent: (context: SDSContext) => {
                /* context.nluData = event.data */
                console.log('<< NLU intent: ' + context.nluData.intent.name)
            }
        },
    });



interface Props extends React.HTMLAttributes<HTMLElement> {
    state: State<SDSContext, any, any, any>;  //==dm context >>access via props.state.context
}
//COMPONENT: Big button in the middle, with changing texts
const ReactiveButton = (props: Props,): JSX.Element => {
    const {playingNow} = props.state.context
    const {ttsAgenda} = props.state.context
    let speakingText= playingNow? '😼 '+ttsAgenda : '😻 '+ttsAgenda
    let promptMsg = playingNow? "...or say Clue, Skip, Restart, Stop " : "...say Yes or No"

    switch (true) {
        case props.state.matches({ asrtts: 'recognising' }):
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "glowing 20s linear"}} {...props}>
                    {/* Listening... */}

                    <TextLoop mask={true} interval={5000} springConfig={{ stiffness: 170, damping: 8 }} >
                        <div><code> {speakingText} </code></div>
                        <div><code> {promptMsg} </code></div>
                    </TextLoop>

                </button>
            );
        case props.state.matches({ asrtts: 'speaking' }):
            
            const [spokentext] = useWindupString(speakingText); // adds char-by-char animation
            return (
                <button type="button" className="glow-on-hover"
                    style={{ animation: "bordering 1s infinite" }} {...props}>
                    {/* Speaking... */}
                    <code>{spokentext}</code>
                </button>
            );
        default:
            return (
                <button type="button" className="glow-on-hover" {...props}>
                    <HeadShake>Play game!</HeadShake>
                </button >
            );
    }
}

// //MAIN CONTAINER: React webpage elements & VOI
export default function App() {
    
    //Voice interface events (& console logs)
    const { speak, cancel, speaking } = useSpeechSynthesis({
        onEnd: () => {send('ENDSPEECH') },
    });
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result: any) => {send({ type: "ASRRESULT", value: result })  },
    });
    const [current, send, service] = useMachine(machine, {
        devTools: true,
        actions: {
            recStart: asEffect(() => {
                console.log('Ready to receive a voice input.');
                listen({
                    interimResults: false,
                    continuous: true
                });
            }),
            recStop: asEffect(() => {
                console.log('Recognition stopped.');
                stop()
            }),
            ttsStart: asEffect((context, effect) => {
                console.log('Speaking...');
                speak({ text: context.ttsAgenda })
            }),
            ttsCancel: asEffect((context, effect) => {
                console.log('TTS STOP...');
                cancel()
            }),
            speak: asEffect((context) => {
	            console.log('Speaking...');
                speak({text: context.ttsAgenda })
            }) 
        }
    });

    // dmMachine-context / React-states, to display on webpage or turn components on/off
    const { confettiSwitch } = current.context; //triggers confetti when true
    const { playingNow } = current.context;
    const { tally } = current.context;
    const { recResult } = current.context;
    const { ttsAgenda } = current.context;
    const { letter } = current.context;
    
    // Config for confetti 
    const confettiConfig = {
        angle: 90,
        spread: 360,
        startVelocity: 80,
        elementCount: 400,
        dragFriction: 0.12,
        duration: 7500,
        stagger: 1,
        width: "7px",
        height: "7px",
        perspective: "210px",
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
      };
    
    let clicked=0;
    const handleClick = () =>{ 
        if(clicked===0){ console.log("clicked"); send('CLICK'); clicked=1 }
        else{ console.log("unclicked"); send('UNCLICK'); clicked=0 }
    }

    //>>>JSX codes & various components
    
    // Alt page: Show if not using Chrome or Edge
    if(!isChrome && !isEdge)
    return (
        <div className='OtherBrowsers'>  
            <HeadShake>
            <div className='Box'>   
                <h1>Speech Recognition Not Supported :( </h1>
                <p>I won't be able to hear you on this browser.</p>
                <p>Please try Chrome or Edge. :-)</p>
            </div>
            </HeadShake>
        </div>
      )

    //Show if using Chrome or Edge
    return (
        <div className="App">
                
                <div className="LetterAndHeart">
                    <div className="GlowLetter"> <YourLetter letter={letter}/> </div>
                    <div className="Heart"> 
                        {playingNow? <HeartBar currentScore={tally} maxScore={5} size={50} /> : null }
                    </div> 
                </div>
                
                <Confetti active={ confettiSwitch } config={ confettiConfig }/> 

                <RubberBand>
                    <div className="Button"> 
                        <ReactiveButton state={current} onClick={() => {handleClick()}} /> 
                    </div>
                </RubberBand>

                <div className="Subtitles"> 
                    <YourSubtitles voiceIn={recResult} tally={tally}/>
                </div>
                
            
            
        </div>
    )
};

//COMPONENT: Displaying input of voice interface (ie, recResult)
const YourSubtitles=(props:any) =>{
    // Player's speech-- only displays when recResult!=undefined 

    //Prefix face changes based on score of the game
    const  emojis=['😗','🙂','😀','😄','😁','🥳']
    let emoji=props.tally? emojis[props.tally]:'🙃'

    const subtitlesText = props.voiceIn? emoji+' '+props.voiceIn : ''
    const [textAnimated] = useWindupString(subtitlesText, {pace: (char) => 3,});
    return(
        <div>
            <span> {textAnimated} </span>
        </div>
    )
}

//COMPONENT: Current score (number & hearts)
// const Scoreboard=(props:any) =>{
//     // Shows score and hearts when tally>=1 
//     const tally = props.tally
//     // const scoreNum = tally? tally : '' 
//     const hearts = tally? '💛'.repeat(tally) : '' 
//     return(
//         <div>
//             {/* <h1>{scoreNum}</h1> */}
//             <RubberBand>
//             <h2> {hearts}</h2>
//             </RubberBand>

//         </div>
//     )
// }

//COMPONENT: Capital letter of the game
const YourLetter=(props:any) =>{
    // Shows the letter of the current game round 
    const letter = props.letter
    return(
        <div> 
            {letter? letter.toUpperCase():''}
        </div> 
    )
}

//COMPONENT: Grey heart to be filled with pink, based on percentage
const HeartBar = (props:any) => {
    
    const maxScore = props.maxScore
    const currentScore = props.currentScore>0? props.currentScore : ''
    const size = props.size
    const percentage = currentScore? 100*currentScore/maxScore : 0
    //add other props? eg, showScore={true/false}; showPercentage={true/false}


    const y = 24 - (24 * percentage) / 100; //Height of the pink filling shape

    //Below: Heart-shaped vector graphs & text inside
    return (
      <div className="ProgressBarH">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
        >
          <defs>
            <clipPath id="cut-off-bottom">
              <rect x="0" y={y} width="24" height="24" />
            </clipPath>
          
            <linearGradient id="grey-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cfccce" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#bab8ba" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#949293" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="pink-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff33a7" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#ff2667" stopOpacity="0.95" />
                <stop offset="100%" stopColor="rgb(255,0,0)" stopOpacity="0.95" />
            </linearGradient>

          </defs>
          
          <path
            style={{ fill: "url(#grey-grad)" }}
            d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"
            />

          <path
            style={{ fill: "url(#pink-grad)", }}
            d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"
            clipPath="url(#cut-off-bottom)"
            />

          <text textAnchor="middle" x="12" y="15" color="white" fontSize="11" fill="white" opacity="0.3"
                style={{animation: "wiggle 2.4s ease-out infinite", animationDelay:'0.72s'}}>
            {currentScore} 
          </text>

        </svg>
      </div>
    );
  };
