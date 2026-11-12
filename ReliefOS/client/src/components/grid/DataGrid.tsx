// Shared AG Grid for ReliefOS, following the PayPal x AG Grid boilerplate's data-grid pattern:
// a small explicit module list, named column types for money, a quick-filter search box, and a
// theme built from the app's own design tokens so the grid reads as part of the page.
import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  PaginationModule,
  DateFilterModule,
  NumberFilterModule,
  QuickFilterModule,
  RowStyleModule,
  TextFilterModule,
  CellStyleModule,
  type ColDef,
  type GetRowIdParams,
  type RowClickedEvent,
} from 'ag-grid-community'
import { AgGridProvider, AgGridReact } from 'ag-grid-react'
import { Download, Search } from 'lucide-react'
import { useRef, useState } from 'react'

import { columnTypes, gridTheme } from './config'

const modules = [
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  QuickFilterModule,
  ColumnAutoSizeModule,
  RowStyleModule,
  CellStyleModule,
  PaginationModule,
  CsvExportModule,
]

const defaultColDef: ColDef = { filter: true, sortable: true, resizable: true, minWidth: 90 }
const autoSizeStrategy = { type: 'fitCellContents' } as const

interface DataGridProps<T> {
  rows: T[] | undefined
  columns: ColDef<T>[]
  getRowId: (row: T) => string
  height?: number
  loading?: boolean
  searchable?: boolean
  emptyMessage?: string
  onRowClicked?: (row: T) => void
  selectedId?: string | null
  /** Page size; enables AG Grid pagination. */
  pageSize?: number
  /** File name (without extension) for the CSV export button. */
  exportName?: string
}

export function DataGrid<T>({
  rows,
  columns,
  getRowId,
  height = 360,
  loading,
  searchable = true,
  emptyMessage = 'No records',
  onRowClicked,
  selectedId,
  pageSize,
  exportName,
}: DataGridProps<T>) {
  const [search, setSearch] = useState('')
  const gridRef = useRef<AgGridReact<T>>(null)
  // Few rows: let the grid size to its content instead of leaving an empty viewport.
  const compact = !pageSize && !loading && (rows?.length ?? 0) > 0 && (rows?.length ?? 0) <= 8

  return (
    <div className="data-grid">
      {(searchable || exportName) && (
        <div className="data-grid__toolbar">
          {searchable && (
            <label className="data-grid__search">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search all columns…"
                aria-label="Search all columns"
              />
            </label>
          )}
          {exportName && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={!rows?.length}
              onClick={() => gridRef.current?.api?.exportDataAsCsv({ fileName: `${exportName}.csv` })}
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      )}
      <div style={compact ? undefined : { height }}>
        <AgGridProvider modules={modules}>
          <AgGridReact<T>
            ref={gridRef}
            theme={gridTheme}
            pagination={Boolean(pageSize)}
            paginationPageSize={pageSize}
            paginationPageSizeSelector={pageSize ? [pageSize, pageSize * 2, pageSize * 5] : undefined}
            domLayout={compact ? 'autoHeight' : 'normal'}
            rowData={rows ?? []}
            columnDefs={columns}
            columnTypes={columnTypes}
            defaultColDef={defaultColDef as ColDef<T>}
            quickFilterText={search}
            autoSizeStrategy={autoSizeStrategy}
            loading={loading}
            overlayNoRowsTemplate={`<span class="grid-empty">${emptyMessage}</span>`}
            getRowId={(params: GetRowIdParams<T>) => getRowId(params.data)}
            onRowClicked={onRowClicked ? (event: RowClickedEvent<T>) => event.data && onRowClicked(event.data) : undefined}
            rowClassRules={
              selectedId !== undefined
                ? { 'grid-row--selected': (params) => !!params.data && getRowId(params.data) === selectedId }
                : undefined
            }
            rowStyle={onRowClicked ? { cursor: 'pointer' } : undefined}
            enableCellTextSelection
          />
        </AgGridProvider>
      </div>
    </div>
  )
}
