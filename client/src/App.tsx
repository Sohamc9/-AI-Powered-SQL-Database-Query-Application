import React, { useState } from 'react';
import { QueryPilotProvider } from './context/QueryPilotContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SqlEditor } from './components/editor/SqlEditor';
import { EditorToolbar } from './components/editor/EditorToolbar';
import { ResultTable } from './components/results/ResultTable';
import { AiPanel } from './components/ai/AiPanel';
import { QueryHistory } from './components/history/QueryHistory';
import { DestructiveModal } from './components/common/DestructiveModal';
import { SaveQueryModal } from './components/common/SaveQueryModal';
import { Toast } from './components/common/Toast';

const WorkspaceContent: React.FC = () => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'schema' | 'history' | 'saved'>('schema');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-workbench-900 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeSidebarTab} 
          setActiveTab={setActiveSidebarTab} 
        />

        {/* Center Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {activeSidebarTab === 'schema' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Upper Section: SQL Query Editor & Toolbar */}
              <div className="h-[48%] flex flex-col border-b border-slate-800 bg-slate-950 min-h-[180px]">
                <EditorToolbar onOpenSaveModal={() => setIsSaveModalOpen(true)} />
                <div className="flex-1 overflow-hidden relative">
                  <SqlEditor />
                </div>
              </div>

              {/* Lower Section: Results Table */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 min-h-[200px]">
                <ResultTable />
              </div>
            </div>
          ) : (
            /* History or Saved Queries View */
            <div className="flex-1 flex flex-col overflow-hidden">
              <QueryHistory activeTab={activeSidebarTab} />
            </div>
          )}
        </main>

        {/* Right AI Assistant Panel */}
        <AiPanel />
      </div>

      {/* Modals & Notifications */}
      <DestructiveModal />
      <SaveQueryModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
      />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryPilotProvider>
      <WorkspaceContent />
    </QueryPilotProvider>
  );
};

export default App;
