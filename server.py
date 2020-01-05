from flask import Flask, render_template
from flask_socketio import SocketIO
import threading
import queue

messages = queue.Queue()

def send(message, data):
    messages.put({'message': message, 'data': data})

app = Flask(__name__, static_url_path='',   static_folder='public')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# liest Messages aus der queue und sendet sie als Websockets
def background_thread():
    count = 0
    while True:
        socketio.sleep()
        if not messages.empty():
            message = messages.get()
            socketio.emit(message['message'], message['data'])

def thread_function(name):
    socketio.start_background_task(background_thread)
    socketio.run(app)

def start():
    thread = threading.Thread(target=thread_function, args=(1,))
    thread.start()
    print("server started on port 5000")