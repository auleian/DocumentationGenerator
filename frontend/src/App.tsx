import { useEffect, useState } from 'react';
import type { ApiDocumentType, ApiQuestion, ApiSection, Screen } from './types';
import { listDocumentTypes, listQuestions, listSections } from './lib/api';
import { useLocalStorageState } from './useLocalStorageState';
import {
  SESSION_EXTRAS_KEY,
  SESSION_NICKNAMES_KEY,
  type SessionExtras,
  type SessionNicknames,
} from './lib/sessionNicknames';
import Home from './Home';
import Drafts from './Dashboard';
import TemplatePicker from './TemplatePicker';
import Wizard from './Wizard';
import Generate from './Generate';
import Review from './Review';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [nicknames, setNicknames] = useLocalStorageState<SessionNicknames>(SESSION_NICKNAMES_KEY, {});
  const [extras, setExtras] = useLocalStorageState<SessionExtras>(SESSION_EXTRAS_KEY, {});

  const [documentTypes, setDocumentTypes] = useState<ApiDocumentType[]>([]);
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listDocumentTypes(), listSections(), listQuestions()])
      .then(([dt, s, q]) => {
        setDocumentTypes(dt);
        setSections(s);
        setQuestions(q);
      })
      .catch(() => setCatalogError('Could not reach the server. Is the backend running?'));
  }, []);

  function openDraft(sessionId: string) {
    setActiveSessionId(sessionId);
    setScreen('wizard');
  }

  function goToTemplatePicker() {
    setScreen('templates');
  }

  function onSessionCreated(sessionId: string, nickname: string) {
    setNicknames((prev) => ({ ...prev, [sessionId]: nickname }));
    setActiveSessionId(sessionId);
    setScreen('wizard');
  }

  function onWizardComplete() {
    setScreen('generate');
  }

  function onGenerated(generatedDocumentId: string) {
    if (activeSessionId) {
      setExtras((prev) => ({
        ...prev,
        [activeSessionId]: { ...prev[activeSessionId], generatedDocumentId },
      }));
    }
    setScreen('review');
  }

  if (catalogError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center max-w-sm px-6">
          <p className="text-sm font-medium text-gray-900">Can&apos;t reach the server</p>
          <p className="mt-1.5 text-sm text-gray-500">{catalogError}</p>
        </div>
      </div>
    );
  }

  if (screen === 'home') {
    return <Home onBrowseDrafts={() => setScreen('drafts')} onNewSrs={goToTemplatePicker} />;
  }

  if (screen === 'drafts') {
    return (
      <Drafts
        nicknames={nicknames}
        onOpenDraft={openDraft}
        onNewSrs={goToTemplatePicker}
        onBackHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'templates') {
    return (
      <TemplatePicker
        documentTypes={documentTypes}
        onCreated={onSessionCreated}
        onBackHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'wizard' && activeSessionId) {
    return (
      <Wizard
        sessionId={activeSessionId}
        sessionTitle={nicknames[activeSessionId] ?? 'Untitled document'}
        sections={sections}
        questions={questions}
        documentTypes={documentTypes}
        onComplete={onWizardComplete}
        onBackToDrafts={() => setScreen('drafts')}
      />
    );
  }

  if (screen === 'generate' && activeSessionId) {
    return (
      <Generate
        sessionId={activeSessionId}
        documentTypes={documentTypes}
        sections={sections}
        onDone={onGenerated}
        onBack={() => setScreen('drafts')}
      />
    );
  }

  if (screen === 'review' && activeSessionId) {
    return (
      <Review
        sessionId={activeSessionId}
        sessionTitle={nicknames[activeSessionId] ?? 'Untitled document'}
        generatedDocumentId={extras[activeSessionId]?.generatedDocumentId}
        onBackToDrafts={() => setScreen('drafts')}
      />
    );
  }

  return <Home onBrowseDrafts={() => setScreen('drafts')} onNewSrs={goToTemplatePicker} />;
}

export default App;
