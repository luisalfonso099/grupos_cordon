
import Grid from 'tui-grid';
import type { CellValue, RowKey } from 'tui-grid';
import type { OptRow } from 'tui-grid/types/options';
import deleteIcon from '../assets/icons/delete-icon.svg';
import excelIcon from '../assets/icons/excel-icon.svg';

Grid.applyTheme('striped')

interface paramscontextMenu {
    rowKey: RowKey;
    columnName: string;
}
export class MyGridL {
    grid: Grid;
    isEdited: boolean = false;
    onEditChange: (isEdited: boolean) => void;

    constructor(ref: HTMLDivElement , data: OptRow[], onEditChange: (isEdited: boolean) => void) {
        this.grid = new Grid({
            el: ref,
            data: data,
            scrollX: false,
            scrollY: false,
            // treeColumnOptions: {
            //     name: 'mes',
            //     useCascadingCheckbox: true,
            // },

            columns: [
                {
                    header: 'Grupo',
                    name: 'grupo',
                    className: '',
                    resizable: true,
                    width : 150
                },
                {
                    header: 'Privilegios',
                    name: 'privilegios',
                    className: '',
                    editor: { type: 'text' },
                    filter: { type: 'text', operator: 'OR' },
                    resizable: true
                },
                {
                    header: 'Condicion',
                    name: 'condicion',
                    className: '',
                    filter: { type: 'text', operator: 'OR' },
                    editor: { type: 'text' },
                    resizable: true

                },
                {
                    header: 'Nombre',
                    name: 'nombre',
                    className: '',
                    filter: { type: 'text', operator: 'OR' },
                    editor: { type: 'text' },
                    resizable: true

                },
                {
                    header: 'Direccion',
                    name: 'direccion',
                    className: '',
                    filter: { type: 'text', operator: 'OR' },
                    editor: { type: 'text' },
                    align: 'center',
                    resizable: true,
                    width : 200,
                },
            ],
            // contextMenu: (params) => {
            //     return [
            //         [
            //             {
            //                 name: 'addRow',
            //                 label: `<div class="flex gap-20">Agregar fila <span class="text-2xl">+</span></div>`,
            //                 action: () => this.addRow(params)
            //             },
            //             {
            //                 name: 'Export',
            //                 label: `<div class="flex gap-20">Export xlsx<img width="20" src="${excelIcon}"/></div>`,
            //                 action: () => this.export()
            //             },
            //             {
            //                 name: 'deleteRow',
            //                 label: `<div class="flex gap-20">Eliminar fila <img width="20" src="${deleteIcon}"/></div>`,
            //                 action: () => this.deleteRow(params)
            //             }
            //         ]
            //     ];
            // },
            // draggable: true,
        });


        this.onEditChange = onEditChange;
        this.grid.on('afterChange', () => (this.onEditChange(this.grid.isModified())));
        // this.grid.on('dragStart', (ev) => {
        //     const childRows = this.grid.getChildRows(ev.rowKey);
            
        //     // Si la fila tiene hijos, evitar que se arrastre
        //     if (childRows.length > 0) {
        //         ev.stop();
        //     }
        // });
        // this.grid.on('drop', (ev) => {
        //     const { rowKey, targetRowKey } = ev;

        //     if (rowKey !== undefined && targetRowKey !== undefined) {
        //         const row = this.grid.getRow(rowKey);
        //         const targetRow = this.grid.getRow(targetRowKey);
        
        //         // Solo permitir el movimiento dentro del mismo nivel
        //         if (row?.mes === targetRow?.mes) {
        //             this.grid.moveRow(rowKey, targetRowKey);
        //         }
        
        //         // Evitar que se convierta en hijo
        //         ev.stop();
        //     }
        // });
        
    }

    export() {
        this.grid.export('xlsx')
    }

    destroy() {
        this.grid.destroy();
    }

    addRow(params: paramscontextMenu) {
        const month: CellValue = this.grid.getValue(params.rowKey, 'keyMonth')
        const rowsMes = this.grid.findRows({ keyMonth: month });
        const lastSemana: string | number | boolean | object = rowsMes[rowsMes.length - 1]?.semana ?? 0;
        const semana: number =  Number(lastSemana) + 1;

        this.grid.appendTreeRow(
            { keyMonth: month, semana: semana, mes : rowsMes[0].mes },
            { parentRowKey:  rowsMes[0].rowKey }

        );
        this.onEditChange(this.grid.isModified())
    }

    deleteRow(params: paramscontextMenu) {
        if (params.rowKey !== null) {
            this.grid.removeRow(params.rowKey);
            this.onEditChange(this.grid.isModified())
        }
    }

    getChanges() {
        return this.grid.getModifiedRows();
    }
}