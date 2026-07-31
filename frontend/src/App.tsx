import { useEffect, useState } from 'react';
import type { Draft, Screen } from './types';
import { TEMPLATES } from './data';
import { useLocalStorageState } from './useLocalStorageState';
import { createSession, deleteSession } from './lib/api';
import { leafNodes } from './lib/catalog';
import { loadSrsCatalog } from './lib/sections';
import { rehydrateDrafts } from './lib/rehydrate';
import Home from './Home';
import Drafts from './Dashboard';
import TemplatePicker from './TemplatePicker';
import ProjectDetails from './ProjectDetails';
import SectionPicker from './SectionPicker';
import Wizard from './Wizard';
import Generate from './Generate';
import Review from './Review';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [drafts, setDrafts] = useLocalStorageState<Draft[]>('docgen.drafts.v1', []);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const activeDraft = drafts.find((d) => d.id === activeDraftId) || null;

  useEffect(() => {
    rehydrateDrafts().then((fetched) => {
      if (fetched.length === 0) return;
      setDrafts((prev) => {
        const known = new Set(prev.map((d) => d.sessionId));
        const missing = fetched.filter((d) => !known.has(d.sessionId));
        return missing.length === 0 ? prev : [...prev, ...missing];
      });
    });
    // Runs once on mount to pull in any backend sessions missing from local state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openDraft(id: string) {
    setActiveDraftId(id);
    setScreen('wizard');
  }

  function goToTemplatePicker() {
    setScreen('templates');
  }

  const [creatingDraft, setCreatingDraft] = useState(false);

  async function selectTemplate(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template || template.comingSoon || creatingDraft) return;

    setCreatingDraft(true);
    try {
      const [session, catalog] = await Promise.all([createSession(template.id), loadSrsCatalog()]);
      const id = `draft-${Date.now()}`;
      const draft: Draft = {
        id,
        title: '',
        subtitle: '',
        lastEdited: 'just now',
        templateId: template.id,
        selectedSectionIds: leafNodes(catalog.tree).map((n) => n.section.id),
        answers: {},
        diagrams: {},
        generated: {},
        generationStatus: 'idle',
        sessionId: session.id,
        answerIds: {},
        generatedSectionIds: {},
        generatedDocumentId: null,
        sectionSummary: { total: leafNodes(catalog.tree).length, complete: 0, inProgress: 0 },
      };
      setDrafts((prev) => [draft, ...prev]);
      setActiveDraftId(id);
      setScreen('details');
    } catch {
      // Session/catalog fetch failed (backend unreachable) — stay on the template picker.
    } finally {
      setCreatingDraft(false);
    }
  }

  function updateDraft(updated: Draft) {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  async function deleteDraft(id: string) {
    const draft = drafts.find((d) => d.id === id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (activeDraftId === id) setActiveDraftId(null);
    if (draft?.sessionId) {
      try {
        await deleteSession(draft.sessionId);
      } catch {
        // best-effort — the local draft is already gone either way
      }
    }
  }

  if (screen === 'home') {
    return <Home onBrowseDrafts={() => setScreen('drafts')} onStartNew={goToTemplatePicker} />;
  }

  if (screen === 'drafts') {
    return (
      <Drafts
        drafts={drafts}
        onOpenDraft={openDraft}
        onStartNew={goToTemplatePicker}
        onBackHome={() => setScreen('home')}
        onDeleteDraft={deleteDraft}
      />
    );
  }

  if (screen === 'templates') {
    return <TemplatePicker onSelect={selectTemplate} onBackHome={() => setScreen('home')} />;
  }

  if (screen === 'details' && activeDraft) {
    return (
      <ProjectDetails
        draft={activeDraft}
        onUpdateDraft={updateDraft}
        onContinue={() => setScreen('sections')}
        onBack={() => setScreen('templates')}
      />
    );
  }

  if (screen === 'sections' && activeDraft) {
    return (
      <SectionPicker
        draft={activeDraft}
        onUpdateDraft={updateDraft}
        onContinue={() => setScreen('wizard')}
        onBack={() => setScreen('details')}
      />
    );
  }

  if (screen === 'wizard' && activeDraft) {
    return (
      <Wizard
        draft={activeDraft}
        onBackToDrafts={() => setScreen('drafts')}
        onGenerate={() => setScreen('generate')}
        onUpdateDraft={updateDraft}
      />
    );
  }

  if (screen === 'generate' && activeDraft) {
    return (
      <Generate
        draft={activeDraft}
        onUpdateDraft={updateDraft}
        onDone={() => setScreen('review')}
        onBack={() => setScreen('wizard')}
      />
    );
  }

  if (screen === 'review' && activeDraft) {
    return (
      <Review
        draft={activeDraft}
        onUpdateDraft={updateDraft}
        onBackToDrafts={() => setScreen('drafts')}
        onBackToWizard={() => setScreen('wizard')}
      />
    );
  }

  return <Home onBrowseDrafts={() => setScreen('drafts')} onStartNew={goToTemplatePicker} />;
}

export default App;
