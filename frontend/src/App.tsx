import { useState } from 'react';
import type { Draft, Screen } from './types';
import { MOCK_DRAFTS } from './data';
import Home from './Home';
import Drafts from './Dashboard';
import Wizard from './Wizard';
import Review from './Review';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [drafts, setDrafts] = useState<Draft[]>(MOCK_DRAFTS);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const activeDraft = drafts.find((d) => d.id === activeDraftId) || null;

  function openDraft(id: string) {
    setActiveDraftId(id);
    setScreen('wizard');
  }

  function newSrs() {
    const id = `draft-${Date.now()}`;
    const draft: Draft = {
      id,
      title: 'Untitled SRS',
      subtitle: 'New specification',
      progress: 0,
      lastEdited: 'just now',
      answers: {},
      diagrams: {},
    };
    setDrafts((prev) => [draft, ...prev]);
    setActiveDraftId(id);
    setScreen('wizard');
  }

  function updateDraft(updated: Draft) {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  if (screen === 'home') {
    return <Home onBrowseDrafts={() => setScreen('drafts')} onNewSrs={newSrs} />;
  }

  if (screen === 'drafts') {
    return (
      <Drafts
        drafts={drafts}
        onOpenDraft={openDraft}
        onNewSrs={newSrs}
        onBackHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'wizard' && activeDraft) {
    return (
      <Wizard
        draft={activeDraft}
        onBackToDrafts={() => setScreen('drafts')}
        onReview={() => setScreen('review')}
        onUpdateDraft={updateDraft}
      />
    );
  }

  if (screen === 'review' && activeDraft) {
    return (
      <Review
        draft={activeDraft}
        onBackToDrafts={() => setScreen('drafts')}
        onBackToWizard={() => setScreen('wizard')}
      />
    );
  }

  return <Home onBrowseDrafts={() => setScreen('drafts')} onNewSrs={newSrs} />;
}

export default App;
