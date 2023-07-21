import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

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
  activate: async (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
  ): Promise<IETCJupyterLabTelemetryLibraryFactory> => {

    const VERSION = await requestAPI<string>("version");

    console.log(`${PLUGIN_ID}, ${VERSION}`);

    const CONFIG = await requestAPI<IConfig>("config");

    let etcJupyterLabTelemetryLibraryFactory = new ETCJupyterLabTelemetryLibraryFactory({ config: CONFIG });

    return etcJupyterLabTelemetryLibraryFactory;
  }
};

export default plugin;
