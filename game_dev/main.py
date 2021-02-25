from flask import Flask

app = Flask(__name__)

@app.route('/')
def homepage():
    return """<form action="" method="get">
            <input type="text" name="celsius">
            <input type="submit" value="Convert">
            </form>"""

@app.route("/<int:celsius>") # /arg => pass to func(arg)
def fahrenheit_from(celsius):
    try:
        fahrenheit = float(celsius) * 9 / 5 + 32
        fahrenheit = round(fahrenheit, 3)  # Round to three decimal places
        return str(fahrenheit)
    except ValueError:
        return "invalid input"
# import game_dev


# Run on local
if __name__ == '__main__':
    app.run(host='localhost',port=8080, debug=True)