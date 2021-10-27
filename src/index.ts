import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

import { IETCJupyterLabNotebookStateProvider } from "@educational-technology-collective/etc_jupyterlab_notebook_state_provider";

import {
  NotebookOpenEvent,
  NotebookSaveEvent,
  CellExecutionEvent,
  NotebookScrollEvent,
  ActiveCellChangeEvent,
  CellAddEvent,
  CellRemoveEvent,
  CellErrorEvent
} from "./events";

import { requestAPI } from "./handler";

import { IConfig } from './types';

const PLUGIN_ID = '@educational-technology-collective/etc_jupyterlab_telemetry_library:plugin'

export const IETCJupyterLabTelemetryLibraryFactory = new Token<IETCJupyterLabTelemetryLibraryFactory>(PLUGIN_ID);

export interface IETCJupyterLabTelemetryLibraryFactory {

  create(
    { notebookPanel }:
      { notebookPanel: NotebookPanel }
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

export class ETCJupyterLabTelemetryLibrary {

  public notebookOpenEvent: NotebookOpenEvent;
  public notebookSaveEvent: NotebookSaveEvent;
  public cellExecutionEvent: CellExecutionEvent;
  public cellErrorEvent: CellErrorEvent;
  public notebookScrollEvent: NotebookScrollEvent;
  public activeCellChangeEvent: ActiveCellChangeEvent;
  public cellAddEvent: CellAddEvent;
  public cellRemoveEvent: CellRemoveEvent;

  constructor({
    notebookPanel, config
  }: {
    notebookPanel: NotebookPanel, config: IConfig
  }) {

    this.notebookOpenEvent = new NotebookOpenEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.notebookSaveEvent = new NotebookSaveEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.cellExecutionEvent = new CellExecutionEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.cellErrorEvent = new CellErrorEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.notebookScrollEvent = new NotebookScrollEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.activeCellChangeEvent = new ActiveCellChangeEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.cellAddEvent = new CellAddEvent({
      notebookPanel: notebookPanel,
      config: config
    });

    this.cellRemoveEvent = new CellRemoveEvent({
      notebookPanel: notebookPanel,
      config: config
    });
  }
}

/**
 * Initialization data for the @educational-technology-collective/etc_jupyterlab_telemetry_extension extension.
 */
const plugin: JupyterFrontEndPlugin<IETCJupyterLabTelemetryLibraryFactory> = {
  id: PLUGIN_ID,
  autoStart: true,
  provides: IETCJupyterLabTelemetryLibraryFactory,
  requires: [INotebookTracker, IETCJupyterLabNotebookStateProvider],
  activate: async (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    etcJupyterLabNotebookStateProvider: IETCJupyterLabNotebookStateProvider
  ): Promise<IETCJupyterLabTelemetryLibraryFactory> => {
    console.log(`The JupyterLab plugin ${PLUGIN_ID} is activated!`);

    let config = await requestAPI<IConfig>("config");

    let etcJupyterLabTelemetryLibraryFactory = new ETCJupyterLabTelemetryLibraryFactory({ config });

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

    //   etcJupyterLabTelemetryLibrary.notebookOpenEvent.notebookOpened.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookSaveEvent.notebookSaved.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.activeCellChangeEvent.activeCellChanged.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellAddEvent.cellAdded.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellRemoveEvent.cellRemoved.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.notebookScrollEvent.notebookScrolled.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellExecutionEvent.cellExecuted.connect(messageAdapter.log);
    //   etcJupyterLabTelemetryLibrary.cellErrorEvent.cellErrored.connect(messageAdapter.log);
    // });
    // // TEST

    return etcJupyterLabTelemetryLibraryFactory;

  }
};

export default plugin;
