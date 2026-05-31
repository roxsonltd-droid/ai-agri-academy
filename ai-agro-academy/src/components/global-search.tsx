"use client";

import { useState, useMemo } from "react";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import { InstantSearch, SearchBox, Hits, Highlight, useInstantSearch } from "react-instantsearch";
import { Search, X, BookOpen, Video, FileText } from "lucide-react";

// Initialize Typesense Client
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY || "dummy", // Search-only API key
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || "localhost",
        port: 443,
        protocol: "https",
      },
    ],
  },
  additionalSearchParameters: {
    query_by: "title,content",
    num_typos: 2, // typo-tolerance!
  },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;

// Custom Empty State
function EmptyQueryBoundary({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const { indexUiState } = useInstantSearch();
  if (!indexUiState.query) return <>{fallback}</>;
  return <>{children}</>;
}

function Hit({ hit }: any) {
  return (
    <div className="flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mt-1">
        {hit.type === 'video' ? <Video className="w-4 h-4" /> : 
         hit.type === 'pdf' ? <FileText className="w-4 h-4" /> : 
         <BookOpen className="w-4 h-4" />}
      </div>
      <div>
        <h4 className="font-medium text-slate-200">
          <Highlight attribute="title" hit={hit} className="bg-emerald-500/30 text-emerald-300 px-1 rounded" />
        </h4>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
          <Highlight attribute="content" hit={hit} className="bg-emerald-500/30 text-emerald-300 px-1 rounded" />
        </p>
      </div>
    </div>
  );
}

export function GlobalSearchBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white hover:border-emerald-500/50 transition-all shadow-sm"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium">Търси уроци, видеа, PDF...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 ml-4 px-2 py-0.5 text-xs font-mono bg-slate-800 rounded text-slate-500 border border-slate-700">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Modal / Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <InstantSearch indexName="lessons" searchClient={searchClient}>
              
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-slate-900/50">
                <Search className="w-5 h-5 text-emerald-500" />
                <div className="flex-1 typesense-searchbox">
                  <SearchBox 
                    autoFocus 
                    placeholder="Напр. сеитба на пшеница..." 
                    classNames={{
                      root: "w-full",
                      form: "relative flex items-center",
                      input: "w-full bg-transparent border-none text-white text-lg placeholder:text-slate-600 focus:outline-none focus:ring-0",
                      submit: "hidden",
                      reset: "absolute right-0 p-1 text-slate-500 hover:text-white bg-slate-800 rounded-md"
                    }}
                  />
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results Area */}
              <div className="flex-1 overflow-y-auto bg-slate-950/50 custom-scrollbar">
                <EmptyQueryBoundary fallback={
                  <div className="p-12 text-center text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-400">Какво искаш да научиш днес?</p>
                    <p className="text-sm mt-2">Търси в заглавия и съдържание на всички уроци.</p>
                  </div>
                }>
                  <Hits 
                    hitComponent={Hit} 
                    classNames={{
                      root: "w-full",
                      list: "flex flex-col",
                      item: "w-full list-none"
                    }}
                  />
                </EmptyQueryBoundary>
              </div>

            </InstantSearch>
            
            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-slate-900 text-xs text-slate-500 flex items-center justify-between">
              <span>⚡ Супербързо търсене с Typesense</span>
              <div className="flex gap-4">
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↓</kbd> за навигация</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">esc</kbd> за затваряне</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
