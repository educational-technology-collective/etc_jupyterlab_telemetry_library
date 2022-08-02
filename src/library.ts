import {
    NotebookPanel,
    INotebookModel,
    Notebook,
    NotebookActions,
    KernelError
} from '@jupyterlab/notebook';

import {
    ISignal,
    Signal
} from '@lumino/signaling';

import {
    Cell,
    ICellModel
} from '@jupyterlab/cells';

import {
    IObservableList,
    IObservableUndoableList
} from '@jupyterlab/observables';

import {
    DocumentRegistry
} from '@jupyterlab/docregistry';

import { IMessage, MessageType } from '@jupyterlab/services/lib/kernel/messages';

import { ICellMeta, IConfig, INotebookEventMessage, INotebookEventOptions } from './types';

import { requestAPI } from './handler';

export class ETCJupyterLabTelemetryLibrary {

    public notebookClipboardEvent: NotebookClipboardEvent;
    public notebookVisibilityEvent: NotebookVisibilityEvent;
    public notebookCloseEvent: NotebookCloseEvent;
    public notebookOpenEvent: NotebookOpenEvent;
    public notebookSaveEvent: NotebookSaveEvent;
    public cellExecutionEvent: CellExecutionEvent;
    public cellErrorEvent: CellErrorEvent;
    public notebookScrollEvent: NotebookScrollEvent;
    public activeCellChangeEvent: ActiveCellChangeEvent;
    public cellAddEvent: CellAddEvent;
    public cellRemoveEvent: CellRemoveEvent;

    constructor({
        notebookPanel,
        config
    }: {
        notebookPanel: NotebookPanel,
        config: IConfig
    }) {

        this.notebookClipboardEvent = new NotebookClipboardEvent({
            notebookPanel: notebookPanel,
            config: config
        });

        this.notebookVisibilityEvent = new NotebookVisibilityEvent({
            notebookPanel: notebookPanel,
            config: config
        });

        this.notebookCloseEvent = new NotebookCloseEvent({
            notebookPanel: notebookPanel,
            config: config
        });

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

class NotebookEvent {

    protected _notebookPanel: NotebookPanel;

    constructor(notebookPanel: NotebookPanel) {
        this._notebookPanel = notebookPanel;
    }

    protected getVisibleCells(): Array<ICellMeta> {

        let cells: Array<ICellMeta> = [];
        let cell: Cell<ICellModel>;
        let index: number;
        let id: string;
        let notebook = this._notebookPanel.content;

        for (index = 0; index < notebook.widgets.length; index++) {

            cell = notebook.widgets[index];

            let cellTop = cell.node.offsetTop;
            let cellBottom = cell.node.offsetTop + cell.node.offsetHeight;
            let viewTop = notebook.node.scrollTop;
            let viewBottom = notebook.node.scrollTop + notebook.node.clientHeight;

            if (cellTop > viewBottom || cellBottom < viewTop) {
                continue;
            }

            id = cell.model.id;

            cells.push({ id, index });
        }

        return cells;
    }

}


export class NotebookClipboardEvent {

    private _notebookClipboardCopied: Signal<NotebookClipboardEvent, INotebookEventMessage> = new Signal(this);
    private _notebookClipboardCut: Signal<NotebookClipboardEvent, INotebookEventMessage> = new Signal(this);
    private _notebookClipboardPasted: Signal<NotebookClipboardEvent, INotebookEventMessage> = new Signal(this);

    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        this.handleCopy = this.handleCopy.bind(this);
        this.handleCut = this.handleCut.bind(this);
        this.handlePaste = this.handlePaste.bind(this);

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_clipboard_event) {

            this._notebookPanel.node.addEventListener('copy', this.handleCopy, false);
            this._notebookPanel.node.addEventListener('cut', this.handleCut, false);
            this._notebookPanel.node.addEventListener('paste', this.handlePaste, false);
        }

    }

    private onDisposed() {
        Signal.disconnectAll(this);
        this._notebookPanel.node.removeEventListener('copy', this.handleCopy, false);
        this._notebookPanel.node.removeEventListener('cut', this.handleCut, false);
        this._notebookPanel.node.removeEventListener('paste', this.handlePaste, false);
    }

    private handleCopy(event: ClipboardEvent) {

        let text = document.getSelection()?.toString();

        let cell = this._notebookPanel.content.activeCell;

        let cells = [
            {
                id: cell?.model.id,
                index: this._notebook.widgets.findIndex((value: Cell<ICellModel>) => value == cell)
            }
        ];

        this._notebookClipboardCopied.emit({
            eventName: 'clipboard_copy',
            cells: cells,
            notebookPanel: this._notebookPanel,
            selection: text
        });
    }

    private handleCut(event: ClipboardEvent) {

        let text = document.getSelection()?.toString();

        let cell = this._notebookPanel.content.activeCell;

        let cells = [
            {
                id: cell?.model.id,
                index: this._notebook.widgets.findIndex((value: Cell<ICellModel>) => value == cell)
            }
        ];

        this._notebookClipboardCut.emit({
            eventName: 'clipboard_cut',
            cells: cells,
            notebookPanel: this._notebookPanel,
            selection: text
        });
    }

    private handlePaste(event: ClipboardEvent) {

        let text = (event.clipboardData || (window as any).clipboardData).getData('text');

        let cell = this._notebookPanel.content.activeCell;

        let cells = [
            {
                id: cell?.model.id,
                index: this._notebook.widgets.findIndex((value: Cell<ICellModel>) => value == cell)
            }
        ];

        this._notebookClipboardPasted.emit({
            eventName: 'clipboard_paste',
            cells: cells,
            notebookPanel: this._notebookPanel,
            selection: text
        });
    }

    get notebookClipboardCopied(): ISignal<NotebookClipboardEvent, INotebookEventMessage> {
        return this._notebookClipboardCopied
    }
    get notebookClipboardCut(): ISignal<NotebookClipboardEvent, INotebookEventMessage> {
        return this._notebookClipboardCut
    }
    get notebookClipboardPasted(): ISignal<NotebookClipboardEvent, INotebookEventMessage> {
        return this._notebookClipboardPasted
    }
}

export class NotebookVisibilityEvent extends NotebookEvent {

    private _notebookVisible: Signal<NotebookVisibilityEvent, INotebookEventMessage> = new Signal(this);
    private _notebookHidden: Signal<NotebookVisibilityEvent, INotebookEventMessage> = new Signal(this);
    private _notebook: Notebook;
    private _hiddenProperty: string = 'hidden';
    private _visibilityChange: string = 'visibilitychange';
    private _visibility: boolean = false;

    constructor({ notebookPanel, config }: INotebookEventOptions) {
        super(notebookPanel);

        this._notebookPanel = notebookPanel;
        let notebook = this._notebook = notebookPanel.content;
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_visibility_event) {

            (async () => {

                try {

                    await notebookPanel.revealed;

                    if (typeof document.hidden !== 'undefined') {
                        this._hiddenProperty = 'hidden';
                        this._visibilityChange = 'visibilitychange';
                    } else if (typeof (document as any).msHidden !== 'undefined') {
                        this._hiddenProperty = 'msHidden';
                        this._visibilityChange = 'msvisibilitychange';
                    } else if (typeof (document as any).webkitHidden !== 'undefined') {
                        this._hiddenProperty = 'webkitHidden';
                        this._visibilityChange = 'webkitvisibilitychange';
                    }

                    document.addEventListener(this._visibilityChange, this.handleVisibilityChange, false);
                    notebook.node.addEventListener('blur', this.handleBlur, true);
                    notebook.node.addEventListener('focus', this.handleFocus, true);

                    window.addEventListener('blur', this.handleBlur, true);
                    window.addEventListener('focus', this.handleFocus, true);

                    this.visibility = notebookPanel.content.isVisible;
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    private onDisposed() {
        Signal.disconnectAll(this);
        document.removeEventListener(this._visibilityChange, this.handleVisibilityChange, false)
        this._notebook.node.removeEventListener('blur', this.handleBlur, true);
        this._notebook.node.removeEventListener('focus', this.handleFocus, true);
        window.removeEventListener('blur', this.handleBlur, true);
        window.removeEventListener('focus', this.handleFocus, true);
    }

    private handleVisibilityChange(event: Event): void {

        this.visibility = !(document as any)[this._hiddenProperty] && this._notebook.isVisible;
    }

    private handleBlur(event: Event) {

        if (event.currentTarget === window && event.target === window) {

            this.visibility = false;
        }
        else if (event.currentTarget === this._notebook.node) {

            this.visibility = this._notebook.isVisible;
        }
    }

    private handleFocus(event: Event) {

        this.visibility = this._notebook.isVisible;
    }

    set visibility(visibility: boolean) {

        if (this._visibility != visibility) {

            this._visibility = visibility;

            let cells = this.getVisibleCells();

            if (this._visibility === true) {

                this._notebookVisible.emit({
                    eventName: 'notebook_visible',
                    cells: cells,
                    notebookPanel: this._notebookPanel
                });
            }
            else if (this._visibility === false) {

                this._notebookHidden.emit({
                    eventName: 'notebook_hidden',
                    cells: cells,
                    notebookPanel: this._notebookPanel
                });
            }
        }
    }

    get notebookVisible(): ISignal<NotebookVisibilityEvent, INotebookEventMessage> {
        return this._notebookVisible
    }

    get notebookHidden(): ISignal<NotebookVisibilityEvent, INotebookEventMessage> {
        return this._notebookHidden
    }
}

export class NotebookCloseEvent {

    private _notebookClosed: Signal<NotebookCloseEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        if (config.notebook_close_event) {

            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.disposed.connect(this.onNotebookDisposed, this);

                    notebookPanel.disposed.connect(this.onDisposed, this);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    private onDisposed() {

        Signal.disconnectAll(this);
    }

    private onNotebookDisposed(): void {

        let cells = this._notebook.widgets.map((cell: Cell<ICellModel>, index: number) =>
            ({ id: cell.model.id, index: index })
        );

        this._notebookClosed.emit({
            eventName: 'close_notebook',
            cells: cells,
            notebookPanel: this._notebookPanel
        });
    }

    get notebookClosed(): ISignal<NotebookCloseEvent, any> {
        return this._notebookClosed
    }
}

export class NotebookSaveEvent {

    private _notebookSaved: Signal<NotebookSaveEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_save_event) {

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

    private onDisposed() {
        Signal.disconnectAll(this);
    }

    private onSaveState(
        context: DocumentRegistry.IContext<INotebookModel>,
        saveState: DocumentRegistry.SaveState
    ): void {

        let cell: Cell<ICellModel>;
        let cells: Array<ICellMeta>;
        let index: number;

        if (saveState.match('completed')) {

            cells = [];

            for (index = 0; index < this._notebookPanel.content.widgets.length; index++) {

                cell = this._notebookPanel.content.widgets[index];

                if (this._notebookPanel.content.isSelectedOrActive(cell)) {

                    cells.push({ id: cell.model.id, index });
                }
            }

            this._notebookSaved.emit({
                eventName: 'save_notebook',
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get notebookSaved(): ISignal<NotebookSaveEvent, INotebookEventMessage> {
        return this._notebookSaved
    }
}

export class CellExecutionEvent {

    private _cellExecuted: Signal<CellExecutionEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_cell_execution_event) {
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

    private onDisposed() {

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
                eventName: 'cell_executed',
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get cellExecuted(): ISignal<CellExecutionEvent, any> {
        return this._cellExecuted
    }
}


export class NotebookScrollEvent extends NotebookEvent {

    private _notebookScrolled: Signal<NotebookScrollEvent, INotebookEventMessage> = new Signal(this);
    private _timeout: number;

    constructor({ notebookPanel, config }: INotebookEventOptions) {
        super(notebookPanel);

        this._notebookPanel = notebookPanel;
        this._timeout = 0;

        this.onScrolled = this.onScrolled.bind(this);

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_scroll_event) {

            (async () => {
                try {

                    await notebookPanel.revealed;

                    notebookPanel.content.node.addEventListener('scroll', this.onScrolled, false);
                }
                catch (e) {
                    console.error(e);
                }
            })();
        }
    }

    private onDisposed() {

        Signal.disconnectAll(this);
    }

    private onScrolled(e: Event): void {

        e.stopPropagation();

        clearTimeout(this._timeout);

        this._timeout = setTimeout(() => {

            let cells = this.getVisibleCells();

            this._notebookScrolled.emit({
                eventName: 'scroll',
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

    private _activeCellChanged: Signal<ActiveCellChangeEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_active_cell_change_event) {

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

    private onDisposed() {
        Signal.disconnectAll(this);
    }

    private onActiveCellChanged(send: Notebook, args: Cell<ICellModel>): void {

        if (this._notebook.widgets.length > 1) {
            //  More than 1 cell is needed in order for this event to happen; hence, check the number of cells.

            let cells = [
                {
                    id: args.model.id,
                    index: this._notebook.widgets.findIndex((value: Cell<ICellModel>) => value == args)
                }
            ];

            this._activeCellChanged.emit({
                eventName: 'active_cell_changed',
                cells: cells,
                notebookPanel: this._notebookPanel
            });
        }
    }

    get activeCellChanged(): ISignal<ActiveCellChangeEvent, any> {
        return this._activeCellChanged;
    }
}

export class NotebookOpenEvent {

    private _notebookOpened: Signal<NotebookOpenEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;
    private _notebook: Notebook;

    private _once: boolean = false;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;
        this._notebook = notebookPanel.content;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_open_event) {
            if (!this._once) {
                (async () => {
                    try {

                        await notebookPanel.revealed;

                        await this.emitNotebookOpened();
                    }
                    catch (e) {
                        console.error(e);
                    }
                })();
            }
        }
    }

    private onDisposed() {

        Signal.disconnectAll(this);
    }

    private async emitNotebookOpened() {


        let cells = this._notebook.widgets.map((cell: Cell<ICellModel>, index: number) =>
            ({ id: cell.model.id, index: index })
        );

        this._notebookOpened.emit({
            eventName: 'open_notebook',
            cells: cells,
            notebookPanel: this._notebookPanel,
            environ: await requestAPI<any>('environ')
        });

        this._once = true;
    }

    get notebookOpened(): ISignal<NotebookOpenEvent, any> {
        return this._notebookOpened
    }
}

export class CellAddEvent {

    private _cellAdded: Signal<CellAddEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_cell_add_event) {
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

    private onDisposed() {

        Signal.disconnectAll(this);
    }

    private onCellsChanged(
        sender: IObservableUndoableList<ICellModel>,
        args: IObservableList.IChangedArgs<ICellModel>) {

        if (args.type == 'add') {

            let cells = [{ id: args.newValues[0].id, index: args.newIndex }];

            this._cellAdded.emit({
                eventName: 'add_cell',
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

    private _cellRemoved: Signal<CellRemoveEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_cell_remove_event) {
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

    private onDisposed() {

        Signal.disconnectAll(this);
    }

    private onCellsChanged(
        sender: IObservableUndoableList<ICellModel>,
        args: IObservableList.IChangedArgs<ICellModel>) {

        if (args.type == 'remove') {

            let cells = [{ id: args.oldValues[0].id, index: args.oldIndex }];

            this._cellRemoved.emit({
                eventName: 'remove_cell',
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

    private _cellErrored: Signal<CellErrorEvent, INotebookEventMessage> = new Signal(this);
    private _notebookPanel: NotebookPanel;

    constructor({ notebookPanel, config }: INotebookEventOptions) {

        this._notebookPanel = notebookPanel;

        notebookPanel.disposed.connect(this.onDisposed, this);

        if (config.notebook_cell_error_event) {
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

    private onDisposed() {

        Signal.disconnectAll(this);
    }

    private onExecuted(_: any, args: {
        notebook: Notebook;
        cell: Cell<ICellModel>;
        success: boolean;
        error?: KernelError | null | undefined;
    }): void {
        
        if (!args.success || args.error) {

            let cells = [
                {
                    id: args.cell.model.id,
                    index: this._notebookPanel.content.widgets.findIndex((value: Cell<ICellModel>) => value == args.cell)
                }
            ]

            this._cellErrored.emit({
                eventName: 'cell_errored',
                cells: cells,
                notebookPanel: this._notebookPanel,
                kernelError: args.error
            });
        }
    }

    get cellErrored(): ISignal<CellErrorEvent, any> {
        return this._cellErrored
    }
}
