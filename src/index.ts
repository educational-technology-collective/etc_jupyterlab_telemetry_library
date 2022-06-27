import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

import { IETCJupyterLabNotebookStateProvider } from "@educational-technology-collective/etc_jupyterlab_notebook_state_provider";

import { requestAPI } from "./handler";

import { IConfig } from './types';

import { ETCJupyterLabTelemetryLibrary } from './library';

const PLUGIN_ID = '@educational-technology-collective/etc_jupyterlab_telemetry_library:plugin'

export const IETCJupyterLabTelemetryLibraryFactory = new Token<IETCJupyterLabTelemetryLibraryFactory>(PLUGIN_ID);

export interface IETCJupyterLabTelemetryLibraryFactory {

  create({ notebookPanel }: { notebookPanel: NotebookPanel }
  ): ETCJupyterLabTelemetryLibrary;
}

class ETCJupyterLabTelemetryLibraryFactory implements IETCJupyterLabTelemetryLibraryFactory {

  private _config: IConfig;

  constructor({ config }: { config: IConfig }) {

    this._config = config;
  }

  create({ notebookPanel }: { notebookPanel: NotebookPanel }): ETCJupyterLabTelemetryLibrary {

    return new ETCJupyterLabTelemetryLibrary({ notebookPanel, config: this._config });
  }
}

/**
 * Initialization data for the @educational-technology-collective/etc_jupyterlab_telemetry_extension extension.
 */
const plugin: JupyterFrontEndPlugin<IETCJupyterLabTelemetryLibraryFactory> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IETCJupyterLabTelemetryLibraryFactory,
  requires: [INotebookTracker],
  optional: [IETCJupyterLabNotebookStateProvider],
  activate: async (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    etcJupyterLabNotebookStateProvider: IETCJupyterLabNotebookStateProvider
  ): Promise<IETCJupyterLabTelemetryLibraryFactory> => {

    const VERSION = await requestAPI<string>("version")

    console.log(`${PLUGIN_ID}, ${VERSION}`);

    const CONFIG = await requestAPI<IConfig>("config");

    let etcJupyterLabTelemetryLibraryFactory = new ETCJupyterLabTelemetryLibraryFactory({ config: CONFIG });

    // // TEST
    // class MessageAdapter {
    //   constructor() { }

    //   log(sender: any, args: any) {

    //     let notebookPanel = args.notebookPanel;

    //     delete args.notebookPanel;

    //     let notebookState = etcJupyterLabNotebookStateProvider.getNotebookState({ notebookPanel: notebookPanel })

    //     let data = {
    //       ...args, ...notebookState
    //     }

    //     console.log("etc_jupyterlab_telemetry_extension", data);
    //   }
    // }

    // let messageAdapter = new MessageAdapter();

    // notebookTracker.widgetAdded.connect(async (sender: INotebookTracker, notebookPanel: NotebookPanel) => {

    //   etcJupyterLabNotebookStateProvider.addNotebookPanel({ notebookPanel });

    //   let etcJupyterLabTelemetryLibrary = etcJupyterLabTelemetryLibraryFactory.create({ notebookPanel });

    //   etcJupyterLabTelemetryLibrary.notebookClipboardEvent.notebookClipboardCopied.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookClipboardEvent.notebookClipboardCut.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookClipboardEvent.notebookClipboardPasted.connect(messageAdapter.log);

    //   etcJupyterLabTelemetryLibrary.notebookVisibilityEvent.notebookVisible.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookVisibilityEvent.notebookHidden.connect(messageAdapter.log);

    //   etcJupyterLabTelemetryLibrary.notebookOpenEvent.notebookOpened.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookCloseEvent.notebookClosed.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookSaveEvent.notebookSaved.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookScrollEvent.notebookScrolled.connect(messageAdapter.log);

    //   etcJupyterLabTelemetryLibrary.activeCellChangeEvent.activeCellChanged.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellAddEvent.cellAdded.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellRemoveEvent.cellRemoved.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellExecutionEvent.cellExecuted.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellErrorEvent.cellErrored.connect(messageAdapter.log);
    // });
    // // TEST

    return etcJupyterLabTelemetryLibraryFactory;

  }
};

export default plugin;
