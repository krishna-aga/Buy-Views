import React from "react";

export function Table({ headers, rows, emptyText, isLoading = false }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3 font-semibold" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {isLoading && (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={headers.length}>
                Loading...
              </td>
            </tr>
          )}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={headers.length}>
                {emptyText}
              </td>
            </tr>
          )}
          {!isLoading &&
            rows.map((row, rowIndex) => (
              <tr className="align-top" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="px-4 py-3 text-gray-700" key={cellIndex}>
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
