'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown, Building2, PlusCircle, X, CheckCircle2 } from 'lucide-react';
import {
  INDIAN_COLLEGES,
  searchColleges,
  findExistingCollegeMatch,
  addCustomCollege,
} from '@/data/colleges';

interface CollegeComboboxProps {
  value: string;
  onChange: (college: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function CollegeCombobox({
  value,
  onChange,
  disabled = false,
  error,
}: CollegeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic search results
  const filteredColleges = searchColleges(query);

  // Exact duplicate check
  const exactMatch = findExistingCollegeMatch(query);
  const showCustomOption = query.trim().length > 0 && !exactMatch;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCollege = (collegeName: string) => {
    onChange(collegeName);
    setIsOpen(false);
    setQuery('');
  };

  const handleAddCustomCollege = () => {
    if (!query.trim()) return;
    const finalCollege = addCustomCollege(query);
    handleSelectCollege(finalCollege);
  };

  if (disabled) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2.5 w-full px-4 py-3.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-slate-700 font-medium text-sm cursor-not-allowed">
          <Building2 className="w-4 h-4 text-[#E43D12] shrink-0" />
          <span className="truncate">{value || 'Inherited College (Read-Only)'}</span>
          <span className="ml-auto text-[10px] font-black uppercase tracking-wider bg-slate-200 text-[#b45309] px-2.5 py-1 rounded-full border border-slate-300">
            Inherited
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Light Theme iOS Glass Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3.5 bg-white/95 backdrop-blur-xl border ${
          error
            ? 'border-red-500 ring-2 ring-red-500/20'
            : isOpen
            ? 'border-[#E43D12] ring-4 ring-[#E43D12]/15'
            : 'border-slate-300/90 hover:border-[#E43D12]'
        } rounded-2xl text-slate-900 font-semibold text-sm cursor-pointer transition-all shadow-md shadow-slate-900/5`}
      >
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-xl bg-[#E43D12]/10 text-[#E43D12] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-[#E43D12]" />
          </div>
          <span className={value ? 'text-slate-900 font-bold truncate' : 'text-slate-500 font-medium truncate'}>
            {value || 'Select College / Institution...'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#E43D12]' : ''
          }`}
        />
      </div>

      {error && <p className="text-xs text-red-600 font-bold mt-1.5 ml-1">{error}</p>}

      {/* Light Theme iOS Glass Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5">
          
          {/* iOS Glass Search Header */}
          <div className="p-3 border-b border-slate-200/90 bg-slate-50/90 backdrop-blur-md flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#E43D12] shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Search or enter custom college name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-bold focus:outline-none text-slate-900 placeholder-slate-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            
            {/* Case 1: Exact Match Prompt if User Types Duplicate */}
            {exactMatch && (
              <div
                onClick={() => handleSelectCollege(exactMatch)}
                className="px-4 py-3 text-xs sm:text-sm font-extrabold bg-emerald-50 text-emerald-800 border-b border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Matches Existing College: <strong>{exactMatch}</strong></span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-200 font-black text-emerald-900 shrink-0">
                  Select Existing
                </span>
              </div>
            )}

            {/* Case 2: Add New College Option if No Exact Match */}
            {showCustomOption && (
              <div
                onClick={handleAddCustomCollege}
                className="px-4 py-3 text-xs sm:text-sm font-extrabold bg-[#E43D12]/10 text-[#E43D12] border-b border-[#E43D12]/20 hover:bg-[#E43D12]/20 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <PlusCircle className="w-4 h-4 text-[#E43D12] shrink-0" />
                  <span className="truncate">Add New College: <strong>"{query.trim()}"</strong></span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E43D12] text-white font-black shrink-0 shadow-sm">
                  Add New
                </span>
              </div>
            )}

            {/* Case 3: Display Matching Existing Colleges */}
            {filteredColleges.length === 0 && !showCustomOption ? (
              <div className="p-5 text-center text-xs text-slate-500 font-medium">
                No matching college found. Type a custom name above to add.
              </div>
            ) : (
              filteredColleges.map((college) => {
                const isSelected = value === college;
                return (
                  <div
                    key={college}
                    onClick={() => handleSelectCollege(college)}
                    className={`px-4 py-3 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#E43D12]/10 text-[#E43D12] font-black border-l-4 border-[#E43D12]'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#E43D12]'
                    }`}
                  >
                    <span className="truncate pr-3">{college}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#E43D12] shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
