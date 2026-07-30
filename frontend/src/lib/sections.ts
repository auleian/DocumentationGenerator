import { useEffect, useState } from 'react';
import type { ApiQuestion, ApiSection, SectionNode } from '../types';
import { listQuestions, listSections } from './api';
import { buildSectionTree } from './catalog';

interface SrsCatalog {
  sections: ApiSection[];
  questions: ApiQuestion[];
  tree: SectionNode[];
}

let cache: Promise<SrsCatalog> | null = null;

/** Fetches the real "srs" section/question catalog once per page load and memoizes it. */
export function loadSrsCatalog(): Promise<SrsCatalog> {
  if (!cache) {
    cache = Promise.all([listSections(), listQuestions()]).then(([sections, questions]) => ({
      sections,
      questions,
      tree: buildSectionTree(sections, questions),
    }));
  }
  return cache;
}

interface UseSrsCatalogResult {
  catalog: SrsCatalog | null;
  loading: boolean;
  error: string | null;
}

/** React hook wrapping loadSrsCatalog() for screens that render synchronously off the tree. */
export function useSrsCatalog(): UseSrsCatalogResult {
  const [catalog, setCatalog] = useState<SrsCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSrsCatalog()
      .then((result) => {
        if (!cancelled) setCatalog(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load sections.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loading: !catalog && !error, error };
}
