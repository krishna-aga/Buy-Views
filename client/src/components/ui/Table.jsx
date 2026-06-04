import React from "react";

export function Table({ headers, rows, emptyText, isLoading = false }) {
  return (
    <div className="overflow-x-auto rounded-[1.2rem] border border-stone-950/10 bg-white/60">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#211915] text-xs uppercase tracking-[0.18em] text-stone-200">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3 font-black" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-950/10 bg-stone-50/70">
          {isLoading && (
            <tr>
              <td className="px-4 py-8 text-center text-stone-500" colSpan={headers.length}>
                Loading...
              </td>
            </tr>
          )}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-stone-500" colSpan={headers.length}>
                {emptyText}
              </td>
            </tr>
          )}
          {!isLoading &&
            rows.map((row, rowIndex) => (
              <tr className="align-top transition hover:bg-[#f7ead7]" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="px-4 py-4 text-stone-700" key={cellIndex}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
