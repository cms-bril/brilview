import time
import threading
import flask
import math
import json
import logging
from brilview import bvconfig, queryrouter, bvlogging


# static_url_path is hardcoded because it cannot be changed after creating app,
# but there should not be need to make it different than empty string
app = flask.Flask(__name__, static_url_path='')


def init_app():
    app.instance_path = bvconfig.instance_path
    app.logger.handlers = []
    for h in bvlogging.get_current_handlers():
        app.logger.addHandler(h)

    if hasattr(bvconfig, 'flask'):
        app.config.update(bvconfig.flask)
        # workaround: static_folder is not picked from app.config
        if 'static_folder' in bvconfig.flask:
            app.static_folder = bvconfig.flask['static_folder']
    return app


@app.route('/')
def root():
    # return app.send_static_file('Default.htm')
    return app.send_static_file('index.html')


@app.route('/api/query', methods=['GET', 'POST'])
@app.route('/query', methods=['GET', 'POST'])
def query():
    data = flask.request.json
    if data is None:
        return ('Bad request. Query body must be not empty.', 400)
    result = queryrouter.query(data)
    #return flask.Response(json.dumps(result), mimetype='application/json')
    return flask.jsonify(result)

@app.route('/test/<prm>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/test', methods=['GET', 'POST', 'PUT', 'DELETE'])
def test_app_server(prm=None):
    data = flask.request.json
    result = {
        'method': flask.request.method,
        'data': data,
        'parameter': prm
    }
    if prm is not None and prm.startswith('wait'):
        time.sleep(int(prm[4:]))
    #return flask.Response(json.dumps(result), mimetype='application/json')
    return flask.jsonify(result)

def run_flask():
    app.run(host=bvconfig.host, port=bvconfig.port, threaded=True)


def run(after_start=None):
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()

    try:
        # FIXME: this is fake after start implementation. It just waits and
        # executes anyway. It should execute only when and immediately after
        # flask is started succesfully
        time.sleep(1)
        # First swap `werkzeug` logger handlers with bvlogging current handlers
        wzlog = logging.getLogger('werkzeug')
        wzlog.handlers = []
        for h in bvlogging.get_current_handlers():
            wzlog.addHandler(h)
        # then continue with `after_start`
        after_start()

        while True:
            time.sleep(20)

    except KeyboardInterrupt:
        return


if __name__ == '__main__':
    run()
