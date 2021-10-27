import {
    NotebookPanel,
  
} from "@jupyterlab/notebook";

export interface IConfig {
    "mentoracademy.org/schemas/events/1.0.0/NotebookSaveEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/NotebookCloseEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/NotebookOpenEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/CellRemoveEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/CellAddEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/CellExecutionEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/NotebookScrollEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/ActiveCellChangeEvent": {
        "enable": boolean
    },
    "mentoracademy.org/schemas/events/1.0.0/CellErrorEvent": {
        "enable": boolean
    }
  }

  export interface ICellMeta {
    index: number;
    id: any;
}

export interface INotebookEventOptions {
    notebookPanel: NotebookPanel;
    config: IConfig;
}