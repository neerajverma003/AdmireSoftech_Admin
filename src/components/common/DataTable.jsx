import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchKey = '',
  searchPlaceholder = 'Search records...',
  filterOptions = [], // [{ key: 'status', label: 'All Statuses', options: ['New', 'In Discussion', 'Closed'] }]
  defaultSortKey = '',
  defaultSortDir = 'desc',
  pageSize = 10,
  actionButton,
  onExportCsv,
  title,
  subtitle,
}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and Search logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Search Query
      if (search.trim() !== '') {
        const query = search.toLowerCase();
        const matchesSearch = columns.some((col) => {
          if (!col.accessor) return false;
          const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
          return val ? String(val).toLowerCase().includes(query) : false;
        });
        if (!matchesSearch) return false;
      }

      // 2. Custom Filters
      for (const [key, value] of Object.entries(filters)) {
        if (value && value !== 'ALL') {
          if (String(item[key]).toLowerCase() !== String(value).toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, search, filters, columns]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // CSV Export utility if onExportCsv not provided
  const triggerCsvExport = () => {
    if (onExportCsv) {
      onExportCsv(sortedData);
      return;
    }
    if (!sortedData.length) return;

    const headers = columns.filter((c) => c.header && c.accessor).map((c) => c.header);
    const rows = sortedData.map((item) => {
      return columns
        .filter((c) => c.header && c.accessor)
        .map((c) => {
          const val = typeof c.accessor === 'function' ? c.accessor(item) : item[c.accessor];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {(title || subtitle) && (
          <div>
            {title && <h2 className="text-xl font-bold text-slate-100">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto sm:ml-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#0a1128] border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Dropdowns */}
            {filterOptions.map((filter) => (
              <div key={filter.key} className="relative flex-1 sm:flex-none">
                <select
                  value={filters[filter.key] || 'ALL'}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 text-xs rounded-xl bg-[#0a1128] border border-slate-700/80 text-slate-200 focus:outline-none focus:border-cyan-500/60 transition-all cursor-pointer"
                >
                  <option value="ALL">{filter.label || `All ${filter.key}`}</option>
                  {filter.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}

            {/* Export CSV Button */}
            <button
              onClick={triggerCsvExport}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Optional Action Button */}
            {actionButton}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl bg-[#0b1329]/90 border border-slate-800/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0e1738] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.sortable && col.accessor && handleSort(col.accessor)}
                    className={`px-4 py-3.5 ${col.sortable ? 'cursor-pointer hover:text-white select-none' : ''} ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey === col.accessor && (
                        sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    className="hover:bg-cyan-500/[0.03] transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-4 py-3.5 ${col.className || ''}`}>
                        {col.cell ? col.cell(row) : (
                          typeof col.accessor === 'function'
                            ? col.accessor(row)
                            : row[col.accessor]
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No records found</p>
                    <p className="text-xs mt-1 text-slate-600">Try adjusting your search query or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a1128]/80 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, sortedData.length)}</span> of{' '}
            <span className="font-semibold text-slate-200">{sortedData.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
