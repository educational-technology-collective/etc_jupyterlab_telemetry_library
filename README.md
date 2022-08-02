# ETC JupyterLab Telemetry Library

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/educational-technology-collective/etc_jupyterlab_telemetry_library/main?urlpath=lab)

This extension provides a JupyterLab service, identified by the `IETCJupyterLabTelemetryLibraryFactory` token, that can be used to construct a `ETCJupyterLabTelemetryLibrary` instance that exposes Signals associated with user actions in the Notebook.

The `IETCJupyterLabTelemetryLibraryFactory` Token represents a **service** that can be consumed by a JupyterLab plugin similar to how core services are consumed by plugins: [Core Tokens](https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#core-tokens). See the [Usage](#usage) section for instructions on how to consume the service.

The ETCJupyterLabTelemetryLibrary service contains Signals grouped according to their functionality. For example in order to `console.log` the `notebook_open` event, you would connect to the Signal like this:

```js
etcJupyterLabTelemetryLibrary.notebookOpenEvent.notebookOpened.connect(
  console.log
);
```

The following table provides the Signal Groups and their respective Signal(s).

| Signal Group            | Signal(s)                                                              |
| ----------------------- | ---------------------------------------------------------------------- |
| notebookClipboardEvent  | notebookClipboardCopied, notebookClipboardCut, notebookClipboardPasted |
| notebookVisibilityEvent | notebookVisible, notebookHidden                                        |
| notebookCloseEvent      | notebookClosed                                                         |
| notebookOpenEvent       | notebookOpened                                                         |
| notebookSaveEvent       | notebookSaved                                                          |
| notebookScrollEvent     | notebookScrolled                                                       |
| activeCellChangeEvent   | activeCellChanged                                                      |
| cellAddEvent            | cellAdded                                                              |
| cellRemoveEvent         | cellRemoved                                                            |
| cellExecutionEvent      | cellExecuted                                                           |
| cellErrorEvent          | cellErrored                                                            |

A plugin that consumes this plugin can attach a handler to the Signal(s) of each Signal Group in order to log the event message.

## Events

Each event message (i.e., the message emitted by the Signal) contains a list of cells relevant to that event. See the [Relevant Cells](#relevant-cells) section for details.

## Event Message Schema

Each event message will contain the name of the event, a list of cells that are relevant to the event, and a reference to the NotebookPanel that emitted the event.

Each event message conforms to the following JSON schema.

### TO DO

## Relevant Cells

For each event message, in addition to reference to the complete NotebookPanel, which contains the full contents of each cell, the top level `cells` property in the message will contain the cells relevant to the event.


| Signal(s)                                                              | Relevant Cells |
| ---------------------------------------------------------------------- | ---------------|
| notebookClipboardCopied, notebookClipboardCut, notebookClipboardPasted | The cell list contains the ID of the active cell. |
| notebookVisible, notebookHidden                                        | The cell list contains the IDs of the cells that are visible to the user. |
| notebookClosed                                                         | The cell list contains the IDs of all the cells in the notebook. |
| notebookOpened                                                         | The cell list contains the IDs of all the cells in the notebook. |
| notebookSaved                                                          | The cell list contains active or selected cell. |
| notebookScrolled                                                       | The cell list contains the IDs of the cells that are visible to the user. |
| activeCellChanged                                                      | The cell list contains the ID of the active cell. |
| cellAdded                                                              | The cell list contains the IDs of the added cells. |
| cellRemoved                                                            | The cell list contains the IDs of the removed cells. |
| cellExecuted                                                           | The cell list contains the ID of the executed cell. |
| cellErrored                                                            | The cell list contains the ID of the cell that produced the error. |

## Usage

Install the extension according to the installation instructions.

Once the extension is installed a plugin can consume the service by including it in its `requires` list. See the below code for an example.

The extension provides a service identified by the `IETCJupyterLabTelemetryLibraryFactory` token. In the following example, the `consumer` plugin consumes the Token provided by the `etc_jupyterlab_telemetry_library` extension. The `ETCJupyterLabTelemetryLibraryFactory` is used in order to instantiate a `ETCJupyterLabTelemetryLibrary` for each NotebookPanel. Each `ETCJupyterLabTelemetryLibrary` instance contains grouped Signals that are connected to the `console.log` method, which will log the events to the console.

The Signals can be connected to any handler that you choose. The content of the messages can be filtered according to your needs.

```js
const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [INotebookTracker, IETCJupyterLabTelemetryLibraryFactory],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    etcJupyterLabTelemetryLibraryFactory: IETCJupyterLabTelemetryLibraryFactory
  ) => {
    (async () => {
      const VERSION = (await requestAPI) < string > 'version';

      console.log(`${PLUGIN_ID}, ${VERSION}`);

      await app.started;

      try {
        notebookTracker.widgetAdded.connect(
          (sender: INotebookTracker, notebookPanel: NotebookPanel) => {
            //  Handlers must be attached immediately in order to detect early events, hence we do not want to await the appearance of the Notebook.

            let etcJupyterLabTelemetryLibrary =
              etcJupyterLabTelemetryLibraryFactory.create({ notebookPanel });

            etcJupyterLabTelemetryLibrary.notebookClipboardEvent.notebookClipboardCopied.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.notebookClipboardEvent.notebookClipboardCut.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.notebookClipboardEvent.notebookClipboardPasted.connect(
              console.log
            );

            etcJupyterLabTelemetryLibrary.notebookVisibilityEvent.notebookVisible.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.notebookVisibilityEvent.notebookHidden.connect(
              console.log
            );

            etcJupyterLabTelemetryLibrary.notebookOpenEvent.notebookOpened.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.notebookCloseEvent.notebookClosed.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.notebookSaveEvent.notebookSaved.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.notebookScrollEvent.notebookScrolled.connect(
              console.log
            );

            etcJupyterLabTelemetryLibrary.activeCellChangeEvent.activeCellChanged.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.cellAddEvent.cellAdded.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.cellRemoveEvent.cellRemoved.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.cellExecutionEvent.cellExecuted.connect(
              console.log
            );
            etcJupyterLabTelemetryLibrary.cellErrorEvent.cellErrored.connect(
              console.log
            );
          }
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }
};
```

## Configuration

The extension requires a configuration file that specifies which Signal _groups_ will emit events.

The configuration file may be placed in any of the Jupyter Server configuration directories e.g., `/etc/jupyter`. Execute `jupyter --paths` in order to get a list of valid configuration directories. The configuration file must be named `jupyter_etc_jupyterlab_telemetry_coursera_config.py`.

This is an example of a valid configuration file:

```py
c.ETCJupyterLabTelemetryLibraryApp.notebook_clipboard_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_visibility_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_save_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_close_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_open_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_cell_remove_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_cell_add_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_cell_execution_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_scroll_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_active_cell_change_event = True
c.ETCJupyterLabTelemetryLibraryApp.notebook_cell_error_event = True
```

An Signal group can be enable or disabled by setting the respective property to `True` or `False`. This setting will enable or disable all of the Signals in the respective group.  The change will take effect each time JupyterLab is started.

## Requirements

- JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install etc_jupyterlab_telemetry_library
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall etc_jupyterlab_telemetry_library
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the etc_jupyterlab_telemetry_library directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
jupyter server extension enable etc_jupyterlab_telemetry_library
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
# Server extension must be manually disabled in develop mode
jupyter server extension disable etc_jupyterlab_telemetry_library
pip uninstall etc_jupyterlab_telemetry_library
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `@educational-technology-collective/etc_jupyterlab_telemetry_library` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
