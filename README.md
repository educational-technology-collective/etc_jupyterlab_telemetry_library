# ETC JupyterLab Telemetry Library

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/educational-technology-collective/etc_jupyterlab_telemetry_library/main?urlpath=lab)

This extension provides a JupyterLab service, identified by the `IETCJupyterLabTelemetryLibraryFactory` token, that can be used to construct a `ETCJupyterLabTelemetryLibrary` instance that exposes Signals associated with user actions in the Notebook.  

The `IETCJupyterLabTelemetryLibraryFactory` Token represents a service that can be consumed by a JupyterLab plugin similar to core services: [Core Tokens](https://jupyterlab.readthedocs.io/en/stable/extension/extension_points.html#core-tokens).  See the [Usage](#usage) section for instructions on how to consume the service.

The following user actions are emitted from the `ETCJupyterLabTelemetryLibrary` as a Signal:

* Active Cell Changed
* Cell Added
* Cell Executed
* Cell Errored
* Cell Removed
* Notebook Opened
* Notebook Saved
* Notebook Scrolled

The consumer plugin can attach a handler to the Signal in order to log the event message.

## Events

Each event message contains a list of cells relevant to that event.  See the [Relevant Cells](#relevant-cells) section for details.  

Each event contains an *incremental* representation of the Notebook.  A Notebook cell will contain just the cell ID if the cell input and output haven't changed since the last event. By providing incremental representations of the Notebook each message will requires less storage.  

This approach allows for messages to be reconstructed by using the cell contents contained in previously logged messages i.e., the cell IDs are used in order to obtain the contents of the cell from a previously logged cell.

Please note that in order to reconstruct messages all *enabled* events must be logged.  Please see the [Configuration](#configuration) for details on how toggle events.

## Event Message Schema

Each event message conforms to the following JSON schema.

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "event_name": {
      "type": "string"
    },
    "cells": {
      "type": "array",
      "items": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "index": {
              "type": "integer"
            }
          },
          "required": [
            "id",
            "index"
          ]
        }
      ]
    },
    "notebook": {
      "type": "object",
      "properties": {
        "metadata": {
          "type": "object",
          "properties": {
            "kernelspec": {
              "type": "object",
              "properties": {
                "display_name": {
                  "type": "string"
                },
                "language": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                }
              },
              "required": [
                "display_name",
                "language",
                "name"
              ]
            },
            "language_info": {
              "type": "object",
              "properties": {
                "codemirror_mode": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "version": {
                      "type": "integer"
                    }
                  },
                  "required": [
                    "name",
                    "version"
                  ]
                },
                "file_extension": {
                  "type": "string"
                },
                "mimetype": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "nbconvert_exporter": {
                  "type": "string"
                },
                "pygments_lexer": {
                  "type": "string"
                },
                "version": {
                  "type": "string"
                }
              },
              "required": [
                "codemirror_mode",
                "file_extension",
                "mimetype",
                "name",
                "nbconvert_exporter",
                "pygments_lexer",
                "version"
              ]
            }
          },
          "required": [
            "kernelspec",
            "language_info"
          ]
        },
        "nbformat_minor": {
          "type": "integer"
        },
        "nbformat": {
          "type": "integer"
        },
        "cells": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "cell_type": {
                "type": "string"
              },
              "source": {
                "type": "string"
              },
              "metadata": {
                "type": "object",
                "properties": {
                  "trusted": {
                    "type": "boolean"
                  }
                },
                "required": [
                  "trusted"
                ]
              },
              "execution_count": {
                "type": "null"
              },
              "outputs": {
                "type": "array",
                "items": {}
              },
              "id": {
                "type": "string"
              }
            },
            "required": [

              "id"
            ]
          }
        }
      },
      "required": [
        "metadata",
        "nbformat_minor",
        "nbformat",
        "cells"
      ]
    },
    "seq": {
      "type": "integer"
    },
    "notebook_path": {
      "type": "string"
    },
    "user_id": {
      "type": "string"
    }
  },
  "required": [
    "event_name",
    "cells",
    "notebook",
    "seq",
    "notebook_path",
    "user_id"
  ]
}
```

## Relevant Cells

For each event the top level `cells` property in the logged message will contain the cells relevant to the event.

* Active Cell Changed
  * The cell list contains the ID of the active cell. 
* Cell Added
  * The cell list contains the IDs of the added cells.
* Cell Executed
  * The cell list contains the ID of the executed cell.
* Cell Errored
  * The cell list contains the ID of the cell that produced the error.
* Cell Removed
  * The cell list contains the IDs of the removed cells.
* Notebook Opened
  * The cell list contains the IDs of all the cells in the notebook.
* Notebook Saved
  * The cell list contains the IDs of all the cells in the notebook.
* Notebook Scrolled
  * The cell list contains the IDs of the cells that are visible to the user.

## Usage

Install the extension according to the installation instructions.  

Once the extension is installed a plugin can consume the service by including it in its `requires` list.  

The extension provides a service identified by the IETCJupyterLabTelemetryLibraryFactory token.  In the following example, the `consumer` plugin consumes the Token provided by the etc_jupyterlab_telemetry_library extension.  The ETCJupyterLabTelemetryLibraryFactory is used in order to instantiate a ETCJupyterLabTelemetryLibrary.  ETCJupyterLabTelemetryLibrary contains Signals that are connected to the `console.log` method, which will log the events to the console.

The Signals can be connected to any handler that you choose.  The content of the messages can be filtered according to your needs.

```js
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import {
  IETCJupyterLabTelemetryLibraryFactory
} from "@educational-technology-collective/etc_jupyterlab_telemetry_extension";

import {
  IETCJupyterLabNotebookStateFactory
} from "@educational-technology-collective/etc_jupyterlab_notebook_state";

PLUGIN_ID = "the_name_of_the_plugin"

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [INotebookTracker, IETCJupyterLabNotebookStateFactory, IETCJupyterLabTelemetryLibraryFactory],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    etcJupyterLabNotebookStateFactory: IETCJupyterLabNotebookStateFactory,
    etcJupyterLabTelemetryLibraryFactory: IETCJupyterLabTelemetryLibraryFactory
    ) => {

    notebookTracker.widgetAdded.connect(async (sender: INotebookTracker, notebookPanel: NotebookPanel) => {

      await notebookPanel.revealed;
      await notebookPanel.sessionContext.ready;

      let notebookState = etcJupyterLabNotebookStateFactory.create({ notebookPanel });

      let etcJupyterLabTelemetryLibrary = etcJupyterLabTelemetryLibraryFactory.create({
        notebookPanel,
        notebookState
      });

      etcJupyterLabTelemetryLibrary.notebookOpenEvent.notebookOpened.connect((sender: NotebookOpenEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args));
      etcJupyterLabTelemetryLibrary.notebookSaveEvent.notebookSaved.connect((sender: NotebookSaveEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args));
      etcJupyterLabTelemetryLibrary.activeCellChangeEvent.activeCellChanged.connect((sender: ActiveCellChangeEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args))
      etcJupyterLabTelemetryLibrary.cellAddEvent.cellAdded.connect((sender: CellAddEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args))
      etcJupyterLabTelemetryLibrary.cellRemoveEvent.cellRemoved.connect((sender: CellRemoveEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args))
      etcJupyterLabTelemetryLibrary.notebookScrollEvent.notebookScrolled.connect((sender: NotebookScrollEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args))
      etcJupyterLabTelemetryLibrary.cellExecutionEvent.cellExecuted.connect((sender: CellExecutionEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args))
      etcJupyterLabTelemetryLibrary.cellErrorEvent.cellErrored.connect((sender: CellErrorEvent, args: any) => console.log("etc_jupyterlab_telemetry_extension", args))

    });

  }
};


```

## Configuration

The extension requires a configuration file that specifies which events will be emitted.

The configuration file may be placed in any of the Jupyter Server configuration directories.  Execute `jupyter --paths` in order to get a list of configuration directories.  The configuration file must be named `etc_jupyterlab_telemetry_library.json` in order for Jupyter Server to associate it with the extension.

This is an example of a valid JSON configuration file:
```json
{
    "mentoracademy.org/schemas/events/1.0.0/NotebookSaveEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/NotebookOpenEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/CellRemoveEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/CellAddEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/CellExecutionEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/NotebookScrollEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/ActiveCellChangeEvent": {
        "enable": true
    },
    "mentoracademy.org/schemas/events/1.0.0/CellErrorEvent": {
        "enable": true
    }
}
```

An event can be disabled by setting its `enable` property to `false`.  The change will take effect next time you start JupyterLab.

## Requirements

* JupyterLab >= 3.0

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
