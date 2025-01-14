from firebase_admin import initialize_app
from firebase_functions import https_fn
import flask

initialize_app()
app = flask.Flask(__name__)

@app.get("/")
def say_hello():
    return "Hello, World!"

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()
