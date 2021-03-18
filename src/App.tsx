import * as React from "react";

//XState library & Game DM-machine
import { Machine, assign, send, State } from "xstate";
import { useMachine, asEffect } from "@xstate/react";
import { dmMachine } from './dmGame';


//Animation effects
import Confetti from 'react-dom-confetti';
import TextLoop from "react-text-loop";
import { useWindupString } from "windups";
        // import HeadShake from 'react-reveal/HeadShake';
const HeadShake = require('react-reveal/HeadShake'); //?import shows error in TS, so use require() here instead
const RubberBand = require('react-reveal/RubberBand');

import Tippy from '@tippyjs/react';
// import 'tippy.js/dist/tippy.css'; 



//Browser detection 
import { isChrome, isEdge } from "react-device-detect";


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

    const maxHinted = props.state.context.hinted >= 5
	const maxSkipped = props.state.context.skipped >= 5

    let promptInGame:string;
    if(maxSkipped && maxHinted){promptInGame = '...or say Restart, Stop'}
    else if(maxSkipped && !maxHinted){promptInGame = '...or say Clue, Restart, Stop'}
    else if(!maxSkipped && maxHinted){promptInGame = '...or say Skip, Restart, Stop'}
    else {promptInGame = '...or say Clue, Skip, Restart, Stop'}  //default

    let speakingText= playingNow? '😼 '+ttsAgenda : '😻 '+ttsAgenda
    let promptMsg = playingNow? promptInGame : "...say Yes or No"

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
    const { speak, cancel, speaking, voices } = useSpeechSynthesis({
        onEnd: () => {send('ENDSPEECH') },
    });

    //? Lists the available languages/voices ... varies depending on the computer/browser
    // const [voiceIndex, setVoiceIndex] = React.useState(null);
    // // console.log(voices)
    // const myvoice =  voices[7] || null; // voices[idx]? voices[idx] : null *(browser default voice)

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
                speak({ text: context.ttsAgenda, /*myvoice*/  }) //Config which language/voice to speak in
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
        <div className='main'>
            <div className="PopoverButtons"> <PopoverButtons/> </div>
            <div className="App">
                
                <div className="LetterAndHeart">
                    <div className="GlowLetter"> <YourLetter letter={letter}/> </div>
                    <div className="Heart"> 
                        {playingNow && <HeartBar currentScore={tally} maxScore={5} size={50} />  }
                    </div> 
                </div>
                
                <Confetti active={ confettiSwitch } config={ confettiConfig }/> 

                <RubberBand>
                    <div className="Button"> 
                        <ReactiveButton state={current} onClick={() => {handleClick()}} /> 
                    </div>
                </RubberBand>

                <div className="Subtitles"> 
                    {/* VersionA: FOR Github deployment & Canvas submission */}
                    {/* <YourSubtitles state={current}/>  */}

                    {/* Version B: FOR demo (on local cuz it cannot show on Github page) */}
                    <UserSubtitles state={current}/> 
                </div>
            
            </div>

        </div>
    )
};

//COMPONENT: Displaying input of voice interface (ie, recResult)
const YourSubtitles=(props:Props) =>{
    // Player's speech-- only displays when recResult!=undefined 

    const {tally} = props.state.context
    const {recResult} = props.state.context
    //Prefix face changes based on score of the game
    const  emojis=['😗','🙂','😀','😄','😁','🥳']
    let emoji=tally? emojis[tally]:'🙃'

    let subtitlesText:string;
    if(props.state.matches({ asrtts: 'recognising' })){
        subtitlesText=emoji+' Listening...'
    }else if(recResult && recResult!=''){
        subtitlesText = emoji+' '+recResult
    }else{
        subtitlesText = ''
    }

    const [textAnimated] = useWindupString(subtitlesText);
    return(
        <div>
            <span> {textAnimated} </span>
        </div>
    )
}

//This one doesn't show on Github pages...? but can run locally and use for presentation demo
const UserSubtitles=(props:Props) =>{

    const {tally} = props.state.context
    const {recResult} = props.state.context
    // const recResult='testing text'

    const  emojis=['😗','🙂','😀','😄','😁','🥳']
    let emoji= tally? emojis[tally]:'🙃'

    // const defaultText = props.state.matches({ asrtts: 'recognising' })? 'Listening...' : ''
    // const subtitlesText = recResult? recResult : defaultText

    let subtitlesText:string;
    if(props.state.matches({ asrtts: 'recognising' })){
        subtitlesText='Listening...'
    }else if(recResult && recResult!=''){
        subtitlesText = recResult
    }else{
        subtitlesText = ''
    }

    const [textAnimated] = useWindupString(subtitlesText);
    const showing = subtitlesText!=''
    return(
        <div id='emoji-and-bubble'>
            {showing &&  <span className='speech-bubble'> {textAnimated} </span> }
            {showing && <div id='emoji'> {emoji} </div>}
        </div>
    )
}

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

          <text textAnchor="middle" x="12" y="15" color="white" fontSize="11" fill="white" opacity="0.45"
                style={{animation: "wiggle 2.5s ease-out infinite", animationDelay:'0.9s'}}>
            {currentScore} 
          </text>

        </svg>
      </div>
    );
  };

const PopoverButtons = () => {


    return (
        <div>

            <Tippy content={
                <div>
                <h4>Having troubles playing? :</h4>
            
                    <p>
                    Due to limitations of the voice recogniser, these might help... <br></br><br></br>
                    -Speak in a North American accent.<br></br><br></br>
                    -After the cat finishes talking, wait for a sec for it to start listening to you
                    (indicated by the <strong>flashing button</strong>).
                    </p>
                </div>
            } className="popover-box">
                <button className="round-button">?</button>
            </Tippy>

            <Tippy content={
                    <div>
                    <h4>ABC Game</h4>
                        <p>
                        Designed & made by: <br></br>
                        Liao Hsien-hao Calvin<br></br>
                        Eirini Tsakiri <br></br><br></br>
                        for the project of <strong>LT2216 Dialogue Systems</strong> at Göteborgs universitet.
                        <br></br><br></br>
                        github.com/chickenbror/ABCgame
                        </p>
                    </div>
            }  className="popover-box">
                <button className="round-button">i</button>
            </Tippy>


        </div>
    )
}