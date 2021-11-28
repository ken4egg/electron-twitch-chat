import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;

    -webkit-user-select: none;
    -webkit-app-region: drag;
  }

  #root, html, body {
    height: 100%;
  }

  body {
    font-family: Inter;
    font-size: 16px;
    overflow: hidden;
  }
`;
