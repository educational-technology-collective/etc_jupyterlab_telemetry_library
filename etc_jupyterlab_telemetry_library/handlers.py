from jupyter_server.utils import url_path_join
import tornado
import json
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import os, json, concurrent, tornado
from jupyter_core.paths import jupyter_config_path
from pathlib import Path

def get_extension_name():
    try: 
        HERE = Path(__file__).parent.resolve()

        with (HERE / "labextension" / "package.json").open() as fid:
            data = json.load(fid)
        extension_name = data['jupyterlab']['discovery']['server']['base']['name']
    except:
        raise Exception('The extension failed to obtain a base extension name in package.json. \
            The base extension name should be at jupyterlab.discovery.server.base.name in package.json.')
    
    return extension_name

EXTENSION_NAME = get_extension_name()

def get_config(server_app):

    config_file_name = EXTENSION_NAME + '.json'

    config = None

    config_dirs = jupyter_config_path()
    config_dirs.reverse()
    for config_dir in config_dirs:

        path = os.path.join(config_dir, config_file_name)

        if os.path.isfile(path):
            with open(path) as f:
                config = json.load(f)
            break

    if not config:
        server_app.log.info('The ' + config_file_name + ' configuration file is missing in one of: ' + ', '.join(config_dirs))

    return config

class RouteHandler(APIHandler):

    executor = concurrent.futures.ThreadPoolExecutor(5)

    def __init__(self, *args, **kwargs):
        self.extension_config = kwargs.pop(EXTENSION_NAME)
        super().__init__(*args, **kwargs)

    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self, resource):

        try:
            if resource == 'config':
                    if self.extension_config:
                        self.finish(json.dumps(self.extension_config))
                    else:
                       self.set_status(404)
            else:
                self.set_status(404)

        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps(str(e)))

def setup_handlers(server_app):
    host_pattern = ".*$"

    base_url = server_app.web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "etc-jupyterlab-telemetry-library", "(.*)")
    extension_config = get_config(server_app)
    handlers = [(route_pattern, RouteHandler, { EXTENSION_NAME : extension_config })]
    server_app.web_app.add_handlers(host_pattern, handlers)