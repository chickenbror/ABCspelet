from voice_interface import *
from game_ques import *

import random

from nltk.stem import WordNetLemmatizer 
lemmatise = WordNetLemmatizer().lemmatize

# For easy identification when saying the letters
alphabet = {
    'a':'Adam', 'b':'Bella', 'c':'Candy', 'd':'Daniel', 'e':'Eva', 'f':'Francesca', 'g':'Gabriel', 'h':'Harry',
    'i':'Ida', 'j':'Janet', 'k':'Kevin', 'l':'Laura', 'm':'Michael', 'n':'Nick', 'o':'opera', 'p':'pong',
    'q':'Quebec', 'r':'Rachel', 's':'Sara', 't':'Tina', 'u':'unique', 'v':'violet', 'w':'window', 'x':'x-ray',
    'y':'yes', 'z':'zero'
}


# Similar to a response() function...
def game():
    
    playing=True
    audioOn= False
    while playing==True:
        
        # Initialise letter&questions object for the new round
        ques=questions()
        letter=ques.letter  #A random letter
        five_cats=ques.five_cats # Relavant 5 categories
        print(five_cats)

        tally=0 # Correctly answered count
        if tally==0:
            
            get_output(f'Answer, or say "pass", "hint", or "start again". ', audio=audioOn)
            if audioOn==False:
                print('You can type "audio on" to play by speaking instead. ')
            else:
                say('You can say "audio off" to play by typing instead. ')
            get_output(f'Your letter is {letter.upper()}, for {alphabet[letter]}... ', audio=audioOn)

        while tally<5:
            
            #Start from the top of five_cats
            cat = five_cats[0] 
            answers = [thing for thing in categories[cat] if thing[0]==letter] # list of things starting with letter

            user_input = get_input(f'Name {cat}...', audio=audioOn)
            reply1 = lemmatise( user_input.lower() ) # To lowercase then citation form
            reply2 = lemmatise( user_input ).lower() # To citation form then lowercase
            reply3 = user_input.lower() # Just lowercase
            replies = [reply1,reply2,reply3]
            
            # Anwser matches
            if any(reply in answers for reply in replies):
                get_output('Correct! ', audio=audioOn)
                play('correct', audio=audioOn)
                tally+=1
                five_cats.pop(0)
            
            # If skipping, move cat to the last
            elif any(reply in ['skip','pass'] for reply in replies): 
                skip = five_cats.pop(0)
                five_cats.append(skip)
            
            elif any(reply in ['start again','start a game'] for reply in replies):
                tally=100
            elif any(reply[:7]=='update ' for reply in replies):
                new_thing=reply.lower()[7:]
                categories[cat].append(new_thing)
                get_output(f'I\'ve learnt that {new_thing} is {cat}!', audio=audioOn)
            
            elif any(reply in ['hint', 'give me a hint'] for reply in replies):
                an_answer=random.choice(answers)
                
                if audioOn:
                    spoken_hint = an_answer[:3].upper().split() # [first 3 letters]
                    say( f'Hint: {"-".join(spoken_hint)}...' ) # 'A...B...C'
                else:
                    print( an_answer[:3]+'-'*(len(an_answer)-3) )
            
            elif any(reply in ['audio on'] for reply in replies):
                audioOn=True
                get_output( 'Now we can play using voice instead.' , audio=audioOn)
                tally=100

            elif any(reply in ['audio off'] for reply in replies):
                audioOn=False
                get_output( 'Now we play using texts instead.' , audio=audioOn)
                tally=100

            else:
                print('Wrong! Try again...')
                # play('wrong', audio=audioOn)
        
        if 5<=tally<100:
            # After getting 5 tallies 
            play('win', audio=audioOn)
            reply=get_input('Well done! Play again?', audio=audioOn)

            #Reset tally
            if reply in ['yes','okay','sure','of course','ok']:
                tally=0

            #Exit the loop   
            else:
                get_output('Ok bye!', audio=audioOn)
                playing=False
        else:
            tally=0

class gameObj():

    def __init__(self): 
        self.output = ''
        self.propmpt = ''
        self.audioOn = False
        self.tally=0
        self.playing=True

    def game(self):
        while self.playing==True:
            
            # A random letter & relavant 5 categories for the new round
            ques=questions()
            letter=ques.letter
            five_cats=ques.five_cats

            tally=self.tally # Correctly answered count
            if tally==0:
                self.output = f'Your letter is {letter.upper()}, for {alphabet[letter]}... '
                self.output = f'Answer, or say "pass", "hint", or "start again". '
                if self.audioOn==False:
                    self.output = 'You can type "audio on" to play by speaking instead. '
                else:
                    self.output = 'You can say "audio off" to play by typing instead. '

            while tally<5:
                
                #Start from the top of five_cats
                cat = five_cats[0] 
                answers = [thing for thing in categories[cat] if thing[0]==letter] # list of things starting with letter

                user_input = get_input(f'Name {cat}...', audio=self.audioOn)
                reply = user_input.lower()
                
                # Anwser matches
                if reply in answers:
                    self.output = 'Yaaaay correct! '
                    play('correct', audio=self.audioOn)
                    tally+=1
                    five_cats.pop(0)
                
                # If skipping, move cat to the last
                elif reply in ['skip','pass']:
                    skip = five_cats.pop(0)
                    five_cats.append(skip)
                
                elif reply.lower()=='start again':
                    tally=100
                elif reply.lower()[:7]=='update ':
                    new_thing=reply.lower()[7:]
                    categories[cat].append(new_thing)
                    self.output = f'I\'ve learnt that {new_thing} is {cat}!'
                
                elif reply.lower()=='hint':
                    an_answer=random.choice(answers)
                    
                    if self.audioOn:
                        spoken_hint = an_answer[:3].upper().split() # [first 3 letters]
                        spoken_hint = spoken_hint.join('...')
                        self.output = spoken_hint 
                    else:
                        self.output = an_answer[:3]+'-'*(len(an_answer)-3) 
                
                elif reply.lower()=='audio on':
                    self.audioOn=True
                    self.output =  'Now we can play using voice instead.'

                elif reply.lower()=='audio off':
                    self.audioOn=False
                    self.output = 'Now we play using texts instead.'

                else:
                    self.output = 'Wrong! Try again...'
                    play('wrong', audio=self.audioOn)
            
            if tally<100:
                # After getting 5 tallies 
                play('win', audio=self.audioOn)
                reply=get_input('Well done! Play again?', audio=self.audioOn)

                #Reset tally
                if reply.lower()=='yes':
                    tally=0

                #Exit the loop   
                else:
                    get_output('Ok bye!')
                    self.playing=False
            else:
                tally=0

if __name__ == '__main__':

    game()


