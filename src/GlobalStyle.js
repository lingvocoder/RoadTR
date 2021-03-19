import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`* {
    box-sizing: border-box;
    padding: 0;
    list-style-type: none;
}

html,
body {
    height: 100%;
    width: 100%;
    color: #828282;
    font-weight: 400;
    font-style: normal;
    -webkit-text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-family: Verdana, Geneva, sans-serif;
}`;

export default GlobalStyle;
