import {
    NotebookPanel,
  
} from "@jupyterlab/notebook";

export interface IConfig {
    notebook_save_event: boolean;
    notebook_close_event: boolean;
    notebook_open_event: boolean;
    notebook_cell_remove_event: boolean;
    notebook_cell_add_event: boolean;
    notebook_cell_execution_event: boolean;
    notebook_scroll_event: boolean;
    notebook_active_cell_change_event: boolean;
    notebook_cell_error_event: boolean;
  }

  export interface ICellMeta {
    index: number;
    id: any;
}

export interface INotebookEventOptions {
    notebookPanel: NotebookPanel;
    config: IConfig;
}