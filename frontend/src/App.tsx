import { useState } from 'react';
import type { Draft, Screen } from './types';
import { MOCK_DRAFTS, TEMPLATES } from './data';
import { useLocalStorageState } from './useLocalStorageState';
import Home from './Home';
import Drafts from './Dashboard';
import TemplatePicker from './TemplatePicker';
import SectionPicker from './SectionPicker';
import Wizard from './Wizard';
import Generate from './Generate';
import Review from './Review';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [drafts, setDrafts] = useLocalStorageState<Draft[]>('docgen.drafts.v1', MOCK_DRAFTS);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const activeDraft = drafts.find((d) => d.id === activeDraftId) || null;

  function openDraft(id: string) {
    setActiveDraftId(id);
    setScreen('wizard');
  }

  function goToTemplatePicker() {
    setScreen('templates');
  }

  function selectTemplate(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template || template.comingSoon) return;

    const id = `draft-${Date.now()}`;
    const draft: Draft = {
      id,
      title: `Untitled ${template.name}`,
      subtitle: 'New specification',
      progress: 0,
      lastEdited: 'just now',
      templateId: template.id,
      selectedSectionIds: template.sections.filter((s) => !s.optional).map((s) => s.id),
      answers: {},
      diagrams: {},
      generated: {},
      generationStatus: 'idle',
    };
    setDrafts((prev) => [draft, ...prev]);
    setActiveDraftId(id);
    setScreen('sections');
  }

  function updateDraft(updated: Draft) {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
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
      />
    );
  }

  if (screen === 'templates') {
    return <TemplatePicker onSelect={selectTemplate} onBackHome={() => setScreen('home')} />;
  }

  if (screen === 'sections' && activeDraft) {
    return (
      <SectionPicker
        draft={activeDraft}
        onUpdateDraft={updateDraft}
        onContinue={() => setScreen('wizard')}
        onBack={() => setScreen('templates')}
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
