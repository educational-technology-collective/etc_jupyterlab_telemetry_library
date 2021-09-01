import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

/**
 * Initialization data for the @educational-technology-collective/etc_jupyterlab_telemetry_library extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@educational-technology-collective/etc_jupyterlab_telemetry_library:plugin',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension @educational-technology-collective/etc_jupyterlab_telemetry_library is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('@educational-technology-collective/etc_jupyterlab_telemetry_library settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for @educational-technology-collective/etc_jupyterlab_telemetry_library.', reason);
        });
    }

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The etc_jupyterlab_telemetry_library server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
