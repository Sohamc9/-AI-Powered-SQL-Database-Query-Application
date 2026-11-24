import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { useQueryPilot } from '../../context/QueryPilotContext';

export const SqlEditor: React.FC = () => {
  const { query, setQuery, runQuery, isRunning, theme } = useQueryPilot();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isRunning) {
        runQuery();
      }
    }
  };

  return (
    <div 
      className="h-full w-full flex flex-col bg-slate-950 overflow-hidden relative"
      onKeyDown={handleKeyDown}
    >
      <CodeMirror
        value={query}
        height="100%"
        theme={theme === 'dark' ? oneDark : 'light'}
        extensions={[sql()]}
        onChange={val => setQuery(val)}
        placeholder="-- Type your SQL query here (e.g. SELECT * FROM customers;)"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true
        }}
        className="h-full text-sm"
      />
    </div>
  );
};
