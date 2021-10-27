import {
    NotebookPanel,
    INotebookModel,
    Notebook,
    NotebookActions
} from "@jupyterlab/notebook";

import {
    ISignal,
    Signal
} from '@lumino/signaling';

import {
    Cell,
    ICellModel
} from "@jupyterlab/cells";

import {
    IObservableList,
    IObservableUndoableList
} from "@jupyterlab/observables";

import {
    DocumentRegistry
} from "@jupyterlab/docregistry";

import { IMessage, MessageType } from "@jupyterlab/services/lib/kernel/messages";

import { ICellMeta, INotebookEventOptions } from './types';

// export class NotebookCloseEvent {

//     private _notebookClosed: Signal<NotebookCloseEvent, any> = new Signal(this);
//     // private _notebookPanel: NotebookPanel;
//     // private _notebook: Notebook;

//     constructor({ notebookPanel, config }: INotebookEventOptions) {

//         // this._notebookPanel = notebookPanel;
//         // this._notebook = notebookPanel.content;

//         if (config['mentoracademy.org/schemas/events/1.0.0/NotebookCloseEvent']['enable']) {
//             (async () => {
//                 try {

//                     await notebookPanel.revealed;

//                     console.log(notebookPanel.id);

//                     let node = document.querySelector(`[data-id="${notebookPanel.id}"] .lm-TabBar-tabCloseIcon`);

//                     node?.addEventListener('click', () => {
//                         console.log(notebookPanel.content.widgets);
//                     })
//                 }
//                 catch (e) {
//                     console.error(e);
//                 }
//             })();
//         }
//     }

//     onDisposed() {

//         Signal.disconnectAll(this);
//     }

//     // private onNotebookDisposed(): void {

//     //     console.log('private onNotebookDisposed(): void {');

//     //     let cells = this._notebook.widgets.map((cell: Cell<ICellModel>, index: number) =>
//     //         ({ id: cell.model.id, index: index })
//     //     );

//     //     this._notebookClosed.emit({
//     //         event_name: "close_notebook",
//     //         cells: cells,
//     //         notebookPanel: this._notebookPanel
//     //     });
//     // }

//     get notebookClosed(): ISignal<NotebookCloseEvent, any> {
//         return this._notebookClosed
//     }
// }

export class NotebookSaveEvent {

    private _notebookSaved: Signal<NotebookSaveEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/NotebookSaveEvent']['enable']) {

            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.context.saveState.connect(this.onSaveState, this);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    onDisposed() {
        Signal.disconnectAll(this);
    }

    private onSaveState(
        context: DocumentRegistry.IContext<INotebookModel>,
        saveState: DocumentRegistry.SaveState
    ): void {

        let cell: Cell<ICellModel>;
        let cells: Array<ICellMeta>;
        let index: number;

        if (saveState.match("completed")) {

            cells = [];

            for (index = 0; index < this._notebookPanel.content.widgets.length; index++) {

                cell = this._notebookPanel.content.widgets[index];

                if (this._notebookPanel.content.isSelectedOrActive(cell)) {

                    cells.push({ id: cell.model.id, index });
                }
            }

            this._notebookSaved.emit({
                event_name: "save_notebook",
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get notebookSaved(): ISignal<NotebookSaveEvent, any> {
        return this._notebookSaved
    }
}

export class CellExecutionEvent {

    private _cellExecuted: Signal<CellExecutionEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/CellExecutionEvent']['enable']) {
            (async () => {
                try {

                    await notebookPanel.revealed;

                    NotebookActions.executed.connect(this.onExecuted, this);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    onDisposed() {

        Signal.disconnectAll(this);
    }

    private onExecuted(_: any, args: { notebook: Notebook; cell: Cell<ICellModel> }): void {

        if (args.notebook.model === this._notebook.model) {

            let cells = [
                {
                    id: args.cell.model.id,
                    index: this._notebook.widgets.findIndex((value: Cell<ICellModel>) => value == args.cell)
                }
            ]

            this._cellExecuted.emit({
                event_name: "cell_executed",
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get cellExecuted(): ISignal<CellExecutionEvent, any> {
        return this._cellExecuted
    }
}


export class NotebookScrollEvent {

    private _notebookScrolled: Signal<NotebookScrollEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;
    private _timeout: number;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;
        this._timeout = 0;

        this.onScrolled = this.onScrolled.bind(this);

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/NotebookScrollEvent']['enable']) {

            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.content.node.addEventListener("scroll", this.onScrolled, false);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    onDisposed() {

        Signal.disconnectAll(this);
    }

    private onScrolled(e: Event): void {

        e.stopPropagation();

        clearTimeout(this._timeout);

        this._timeout = setTimeout(() => {

            let cells: Array<ICellMeta> = [];
            let cell: Cell<ICellModel>;
            let index: number;
            let id: string;

            for (index = 0; index < this._notebook.widgets.length; index++) {

                cell = this._notebook.widgets[index];

                let cellTop = cell.node.offsetTop;
                let cellBottom = cell.node.offsetTop + cell.node.offsetHeight;
                let viewTop = this._notebook.node.scrollTop;
                let viewBottom = this._notebook.node.scrollTop + this._notebook.node.clientHeight;

                if (cellTop > viewBottom || cellBottom < viewTop) {
                    continue;
                }

                id = cell.model.id;

                cells.push({ id, index });
            }

            this._notebookScrolled.emit({
                event_name: "scroll",
                cells: cells,
                notebookPanel: this._notebookPanel
            });

        }, 1000);
    }

    get notebookScrolled(): ISignal<NotebookScrollEvent, any> {
        return this._notebookScrolled;
    }
}

export class ActiveCellChangeEvent {

    private _activeCellChanged: Signal<ActiveCellChangeEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/ActiveCellChangeEvent']['enable']) {
            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.content.activeCellChanged.connect(this.onActiveCellChanged, this);
                }
                catch (e) {
                    console.error(e);
                }

            })();
        }
    }

    onDisposed() {
        Signal.disconnectAll(this);
    }

    private onActiveCellChanged(send: Notebook, args: Cell<ICellModel>): void {

        let cells = [
            {
                id: args.model.id,
                index: this._notebook.widgets.findIndex((value: Cell<ICellModel>) => value == args)
            }
        ];

        this._activeCellChanged.emit({
            event_name: "active_cell_changed",
            cells: cells,
            notebookPanel: this._notebookPanel
        });
    }

    get activeCellChanged(): ISignal<ActiveCellChangeEvent, any> {
        return this._activeCellChanged;
    }
}

export class NotebookOpenEvent {

    private _notebookOpened: Signal<NotebookOpenEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    private _once: boolean = false;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/NotebookOpenEvent']['enable']) {
            if (!this._once) {
                (async () => {
                    try {

                        await notebookPanel.revealed;

                        this.onNotebookOpened();
                    }
                    catch (e) {
                        console.error(e);
                    }
                })();
            }
        }
    }

    onDisposed() {

        Signal.disconnectAll(this);
    }

    private onNotebookOpened(): void {

        let cells = this._notebook.widgets.map((cell: Cell<ICellModel>, index: number) =>
            ({ id: cell.model.id, index: index })
        );

        this._notebookOpened.emit({
            event_name: "open_notebook",
            cells: cells,
            notebookPanel: this._notebookPanel
        });

        this._once = true;
    }

    get notebookOpened(): ISignal<NotebookOpenEvent, any> {
        return this._notebookOpened
    }
}

export class CellAddEvent {

    private _cellAdded: Signal<CellAddEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/CellAddEvent']['enable']) {
            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.content.model?.cells.changed.connect(this.onCellsChanged, this);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    onDisposed() {

        Signal.disconnectAll(this);
    }

    private onCellsChanged(
        sender: IObservableUndoableList<ICellModel>,
        args: IObservableList.IChangedArgs<ICellModel>) {

        if (args.type == "add") {

            let cells = [{ id: args.newValues[0].id, index: args.newIndex }];

            this._cellAdded.emit({
                event_name: "add_cell",
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get cellAdded(): ISignal<CellAddEvent, any> {
        return this._cellAdded
    }
}

export class CellRemoveEvent {

    private _cellRemoved: Signal<CellRemoveEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/CellRemoveEvent']['enable']) {
            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.content.model?.cells.changed.connect(this.onCellsChanged, this);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    onDisposed() {

        Signal.disconnectAll(this);
    }

    private onCellsChanged(
        sender: IObservableUndoableList<ICellModel>,
        args: IObservableList.IChangedArgs<ICellModel>) {

        if (args.type == "remove") {

            let cells = [{ id: args.oldValues[0].id, index: args.oldIndex }];

            this._cellRemoved.emit({
                event_name: "remove_cell",
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get cellRemoved(): ISignal<CellRemoveEvent, any> {
        return this._cellRemoved
    }
}

export class CellErrorEvent {

    private _cellErrored: Signal<CellErrorEvent, any> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config['mentoracademy.org/schemas/events/1.0.0/CellErrorEvent']['enable']) {
            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.sessionContext.iopubMessage.connect(this.onCellErrored, this);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    onDisposed() {

        Signal.disconnectAll(this);
    }

    private onCellErrored(_: any, args: IMessage<MessageType>): void {

        if (args.header.msg_type == "error") {

            let cells = [
                {
                    id: this._notebookPanel.content.activeCell?.model.id,
                    index: this._notebookPanel.content.activeCellIndex
                }
            ]

            this._cellErrored.emit({
                event_name: "cell_errored",
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get cellErrored(): ISignal<CellErrorEvent, any> {
        return this._cellErrored
    }
}