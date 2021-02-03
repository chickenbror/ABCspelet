categories={
    'a day of the week':['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
    'a fruit':['apple', 'avocado', 'apricot', 'banana', 'cantaloupe', 'cherries','cherry', 'clementine', 'date', 'grapefruit', 'grapes','grape', 'honeydew', 'melon', 'lemon', 'lime', 'mandarin', 'orange', 'mango', 'orange', 'papaya', 'peach', 'pear', 'pineapple', 'plantain', 'plum', 'pomelo', 'tangerine', 'watermelon', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'lingonberries', 'lingonberry', 'dragonfruit', 'tomato', 'pawpaw', 'lychee', 'kiwifruit', 'jackfruit', 'durian', 'guava', 'passionfruit'],
    'an EU country':['austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic', 'czechia', 'denmark', 
                     'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland', 'italy', 
                     'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands', 'hollandm', 'poland', 'portugal', 
                     'romania', 'slovakia', 'slovenia', 'spain', 'sweden'],
    'a name of a month':['january','february','march','april','may','june','july','august','september','october','november','december'],
    'a swear word':['fuck','bitch','damn','cunt','motherfucker','bugger','bloody','shit','arsehole', 'asshole','prick','bastard','wanker'],
    
    'a country in Asia':['russia', 'china', 'india', 'kazakhstan', 'saudi arabia', 'iran', 'mongolia', 'indonesia', 'pakistan', 'turkey', 'myanmar', 'afghanistan', 'yemen', 'thailand', 'turkmenistan', 'uzbekistan', 'iraq', 'japan', 'vietnam', 'malaysia', 'oman', 'philippines', 'laos', 'kyrgyzstan', 'syria', 'cambodia', 'bangladesh', 'nepal', 'tajikistan', 'north korea', 'south korea', 'jordan', 'azerbaijan', 'united arab emirates','uae', 'georgia', 'sri lanka', 'bhutan', 'taiwan', 'armenia', 'israel', 'kuwait', 'east timor', 'qatar', 'lebanon', 'cyprus', 'northern cyprus', 'palestine', 'brunei', 'bahrain', 'singapore', 'maldives'],
    'a country that has won Eurovision':['luxembourg', 'portugal', 'switzerland', 'russia', 'sweden', 'estonia', 'serbia', 'monaco', 'denmark', 'israel', 'norway', 'greece', 'france', 'spain', 'azerbaijan', 'belgium', 'italy', 'yugoslavia', 'finland', 'latvia', 'germany', 'ireland', 'austria', 'turkey', 'united kingdom', 'ukraine', 'netherlands',],
    'a capital city in Europe':['amsterdam', 'andorra la vella', 'ankara', 'athens', 'baku', 'belgrade', 'berlin', 'bern', 'bratislava', 'brussels', 'bucharest', 'budapest', 'chisinau', 'kishinev', 'copenhagen', 'dublin', 'helsinki', 'kyiv', 'lisbon', 'ljubljana', 'london', 'luxembourg', 'madrid', 'minsk', 'monaco', 'moscow', 'nicosia', 'nur-sultan', 'oslo', 'paris', 'podgorica', 'prague', 'reykjavik', 'riga', 'rome', 'san marino', 'sarajevo', 'skopje', 'sofia', 'stockholm', 'tallinn', 'tbilisi', 'tirana', 'vaduz', 'valletta', 'vatican', 'vienna', 'vilnius', 'warsaw', 'yerevan', 'zagreb', 'north nicosia', 'pristina', 'stepanakert', 'sukhumi', 'tiraspol', 'tskhinvali', 'south ossetia'],
    'a common pet':['bird','fish', 'mouse', 'rat', 'dog', 'cat', 'gerbil', 'hamster', 'spider', 'snake', 'ferret', 'goldfish', 'turtle', 'rabbit', 'pig', 'goat', 'guinea', 'pig', 'frog', 'hedgehog', 'horse', 'chicken', 'duck', 'goose', 'budgie', 'parrot', 'canary'],
    'a vegetable':['pumpkin', 'squash', 'mushroom', 'bakchoy', 'kale', 'arugula', 'rocket', 'broccoli', 'spinash', 'carrot', 'cabbage', 'beetroot', 'celery', 'zucchini', 'potato', 'onion', 'cucumber', 'eggplant', 'aubergine', 'corn', 'cauliflower', 'asparagus'], 
    
    
    
}

def eligible_cats(letter):
    '''Returns a list of categories that contain things starting with *letter. '''
    cats_with_letter = [cat for cat in categories if len([t for t in categories[cat] if t[0]==letter])>0]
    return cats_with_letter

import random

class questions():
    '''A questions object, with a letter and a list of five relevant categories. '''
    def __init__(self): 
        self.letter = ''
        self.five_cats = []
        
        done=False
        while done==False:
            self.letter = random.choice('abcdefghijklmnopqrstvvwxyz') # choose a random letter
            self.candidates = eligible_cats(self.letter) 
            if len(self.candidates)>=5: # Check if there are 5 or more eligible categories, if not, choose a new letter.
                done=True

        self.five_cats = random.sample(self.candidates,len(self.candidates)) # choose random 5+ elgible categories

playing=True
while playing==True:
    
    # A random letter & relavant 5 categories for the new round
    ques=questions()
    letter=ques.letter
    five_cats=ques.five_cats

    tally=0 # Correctly answered count
    if tally==0:
        print(f'Your letter is {letter.upper()}. Answer or say "pass", "hint", "start again". ')

    while tally<5:
        
        #Start from the top of five_cats
        cat = five_cats[0] 
        answers = [thing for thing in categories[cat] if thing[0]==letter] # list of things starting with letter

        reply = input(f'Name {cat}...')
        
        # Anwser matches
        if reply.lower() in answers:
            print('Yaaaaay! ')
            tally+=1
            five_cats.pop(0)
        
        # If skipping, move cat to the last
        elif reply.lower() in ['skip','pass']:
            skip = five_cats.pop(0)
            five_cats.append(skip)
        
        elif reply.lower()=='start again':
            tally=100
        elif reply.lower()[:7]=='update ':
            new_thing=reply.lower()[7:]
            categories[cat].append(new_thing)
            print(f'I\'ve learnt that {new_thing} is {cat}!')
        
        elif reply.lower()=='hint':
            an_answer=random.choice(answers)
            print( an_answer[:3]+'-'*(len(an_answer)-3) )
        
        else:
            print('Wrong! Try again...')
    
    if tally<100:
        # After getting 5 tallies 
        reply=input('Well done! Play again?')

        #Reset tally
        if reply.lower()=='yes':
            tally=0

        #Exit the loop   
        else:
            print('Ok bye!')
            playing=False
    else:
        tally=0