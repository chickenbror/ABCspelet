# ABC Game

![](https://media.giphy.com/media/FLj65JIF1olGbW3Meu/giphy.gif)

(React component adapted from [github.com/vladmaraev/react-xstate-colourchanger](http://github.com/vladmaraev/react-xstate-colourchanger "github.com/vladmaraev/react-xstate-colourchanger")) 

(React + xstate + Webspeech API & Natural.js)

###### To run locally:
` npm install`
  `npm start`

###### To edit or add more question-sets:
go to src/game_codes/questions.json

## Design notes and diary
##### Made for LT2216 Dialog Systems game project at Göteborgs universitet

##### Collaborators:
- 	Hsien-hao Calvin Liao 
- 	Eirini Tsakiri

##### Project diary of who does what and when:

###### 1. Discussed and came up with game concept
- (2021-02-02, Eirini & Calvin)
![Notes for brainstorming & the flow chart](https://media.giphy.com/media/GayPUtZ3UFPcsGBtxg/giphy.gif "Notes for brainstorming & the flow chart")


###### 2. Made prototype game in Python
- (2021-02-11, Calvin)
- original py codes: https://tinyurl.com/lt2216-project-python
![Py code](https://media.giphy.com/media/BALZbz6P3BJmUui3jQ/giphy.gif "Py code")


###### 3. Rewrote protopype game in TypeScript
- (2021-03-03, Calvin)
- original ts codes: https://tinyurl.com/lt2216-project
![ts code](https://media.giphy.com/media/g4mvkk7aZujKuGl4Af/giphy.gif "ts code")

###### 4. Combined Step3 with React & Xstate from Lab2/4 to make a web app with voice interface
- (2021-03-07, Calvin)
- dependencies: Natural (to singularise speech-recognised words)

###### 5. Test/debug/improvement feedback
- (2021-03-08, Eirini)

###### 6. Added React components & updated CSS
- Display prompts, recognised texts, and context on screen
- Confetti effect when winning
- Text animation
- dependencies: react-dom-confetti, react-text-loop, windups, react-reveal

###### 7. Add more question-sets to game to make it playable
- (2021-03-10 ~ 2021-03-16, Eirini & Calvin)
- During testing, we noticed that some words are not be easily recognised, especially when said as a single word, so they were removed from the question-answers.

###### 8. Make the UI prettier
- (2021-03-12 ~ 2021-03-14, Calvin)
- Adjusted layout, colours, and animations

###### 9. Improve on the game
- (2021-03-19, Eirini)
- Added extra context and states in dmGame, eg maximum allowance on skipping the question and asking for clues.

###### 10. Presentation & Demo
- (2021-03-23, Calvin & Eirini)
- Presentation for LT2216 course & show the game demo.


