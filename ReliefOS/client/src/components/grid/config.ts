import { themeQuartz, type ColTypeDefs, type ValueFormatterParams } from 'ag-grid-community'

export const gridTheme = themeQuartz.withParams({
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  backgroundColor: 'transparent',
  foregroundColor: 'var(--text)',
  headerBackgroundColor: 'rgba(34, 211, 238, 0.05)',
  headerTextColor: 'var(--text-muted)',
  headerFontWeight: 600,
  headerFontSize: 12,
  borderColor: 'var(--border)',
  rowBorder: { color: 'var(--border)', width: 1 },
  accentColor: 'var(--cyan)',
  rowHoverColor: 'rgba(34, 211, 238, 0.06)',
  selectedRowBackgroundColor: 'rgba(34, 211, 238, 0.12)',
  oddRowBackgroundColor: 'rgba(148, 197, 255, 0.015)',
  chromeBackgroundColor: 'var(--surface-solid)',
  inputBackgroundColor: 'var(--surface-solid)',
  menuBackgroundColor: 'var(--surface-solid)',
  wrapperBorderRadius: 12,
  borderRadius: 8,
  spacing: 6,
})

const decimal = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value !== '' ? Number(value) : NaN
  return Number.isFinite(n) ? n : null
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Backend amounts are Prisma Decimal strings; these types parse, sort and filter them as numbers.
export const columnTypes: ColTypeDefs = {
  inr: {
    valueFormatter: ({ value }: ValueFormatterParams) => {
      const n = decimal(value)
      return n === null ? '—' : inr.format(n)
    },
    comparator: (a: unknown, b: unknown) => (decimal(a) ?? 0) - (decimal(b) ?? 0),
    filter: 'agNumberColumnFilter',
    cellClass: 'grid-num',
  },
  usd: {
    valueFormatter: ({ value }: ValueFormatterParams) => {
      const n = decimal(value)
      return n === null ? '—' : usd.format(n)
    },
    filter: 'agNumberColumnFilter',
    cellClass: 'grid-num',
  },
  quantity: {
    valueFormatter: ({ value }: ValueFormatterParams) =>
      typeof value === 'number' ? value.toLocaleString('en-IN') : '—',
    filter: 'agNumberColumnFilter',
    cellClass: 'grid-num',
  },
}

/** valueGetter that turns a Decimal-string field into a number so sorting and number filters work. */
export const decimalField =
  <T,>(pick: (row: T) => string | number | null | undefined) =>
  ({ data }: { data: T | undefined }) =>
    data ? decimal(pick(data)) : null
