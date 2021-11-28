import * as React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Settings } from './Settings';
import { GlobalStyle } from './styles/GlobalStyle';
import { TwitchLayout } from './Twitch/TwitchLayout';

export const App = React.memo(() => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <GlobalStyle />
              <Settings />
            </>
          }
        />
        <Route
          path="/chat"
          element={
            <>
              <GlobalStyle />
              <TwitchLayout />
            </>
          }
        />
      </Routes>
    </HashRouter>
  );
});

App.displayName = 'App';
