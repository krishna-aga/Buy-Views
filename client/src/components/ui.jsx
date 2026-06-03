import { statusTone } from "../lib/format";

export function Section({ title, description, actions, children }) {
  return (
    <section className="rounded-md border border-line bg-panel">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
      {hint ? <div className="mt-1 text-sm text-muted">{hint}</div> : null}
    </div>
  );
}

export function Badge({ children, status }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusTone(status)}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "border-slate-900 bg-slate-900 text-white hover:bg-slate-800",
    secondary: "border-line bg-white text-slate-900 hover:bg-slate-50",
    danger: "border-rose-700 bg-rose-700 text-white hover:bg-rose-600",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        className={`w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export function Select({ label, error, options, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        className={`w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
      <textarea
        className={`min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export function Table({ columns, rows, emptyMessage = "No records found." }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="border-b border-line px-3 py-2 font-medium text-slate-600">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.key || index} className="align-top">
                {columns.map((column) => (
                  <td key={column.key} className="border-b border-line px-3 py-3 text-slate-800">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
