declare module 'tui-grid' {
    export type RowKey = string | number;
    export type CellValue = string | number | boolean | null | undefined;
  
    export interface GridEvent {
      rowKey: RowKey;
      targetRowKey?: RowKey;
      stop(): void;
    }
  
    export interface OptRow {
      [key: string]: CellValue | object | null | undefined;
    }
  
    export interface GridOptions {
      el: HTMLElement;
      data?: OptRow[];
      columns: Array<{
        header: string;
        name: string;
        editor?: { type: string };
        filter?: { type: string; operator?: string };
        align?: string;
        className?: string;
        resizable?: boolean;
        width?: number;
      }>;
      scrollX?: boolean;
      scrollY?: boolean;
      treeColumnOptions?: {
        name: string;
        useCascadingCheckbox?: boolean;
      };
      contextMenu?: (params: { rowKey: RowKey; columnName: string }) => Array[];
      draggable?: boolean;
    }
  
    export default class Grid {
      constructor(options: GridOptions);
  
      static applyTheme(theme: string): void;
  
      destroy(): void;
  
      export(type: 'xlsx' | 'csv' | string): void;
  
      on(event: string, handler: (ev: GridEvent) => void): void;
  
      getRow(rowKey: RowKey): OptRow | null;
      getChildRows(rowKey: RowKey): OptRow[];
      getValue(rowKey: RowKey, columnName: string): CellValue;
      findRows(condition: Record<string, CellValue>): OptRow[];
  
      appendTreeRow(row: OptRow, options?: { parentRowKey?: CellValue | object }): void;
      moveRow(rowKey: RowKey, targetRowKey: RowKey): void;
      removeRow(rowKey: RowKey): void;
  
      isModified(): boolean;
      getModifiedRows(): Record<string, OptRow[]>;
    }
  }
  