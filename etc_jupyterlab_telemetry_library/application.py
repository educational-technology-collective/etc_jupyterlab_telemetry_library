from .handlers import RouteHandler
from jupyter_server.extension.application import ExtensionApp
from traitlets import Bool
import pprint

class ETCJupyterLabTelemetryLibraryApp(ExtensionApp):

    name = "etc_jupyterlab_telemetry_library"

    notebook_clipboard_event = Bool(True).tag(config=True)
    notebook_visibility_event = Bool(True).tag(config=True)
    notebook_save_event = Bool(True).tag(config=True)
    notebook_close_event = Bool(True).tag(config=True)
    notebook_open_event = Bool(True).tag(config=True)
    notebook_cell_remove_event = Bool(True).tag(config=True)
    notebook_cell_add_event = Bool(True).tag(config=True)
    notebook_cell_execution_event = Bool(True).tag(config=True)
    notebook_scroll_event = Bool(True).tag(config=True)
    notebook_active_cell_change_event = Bool(True).tag(config=True)
    notebook_cell_error_event = Bool(True).tag(config=True)

    def initialize_settings(self):
        try:
            self.log.info(f"ETCJupyterLabTelemetryLibraryApp.config {pprint.pformat(self.config)}")
        except Exception as e:
            self.log.error(str(e))

    def initialize_handlers(self):
        try:
            self.handlers.extend([(r"/etc-jupyterlab-telemetry-library/(.*)", RouteHandler)])
        except Exception as e:
            self.lof.error(str(e))
            raise e

