import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

const grid = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
   [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
    [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
     [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
      [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
       [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
        [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
         [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
          [1, 2, 3, 4, 5, 6, 7, 8, 9 ], 
]
  
const background = 'https://logic-masters.de/Dateien/bild.php?data=b02f41dc-8359-3030303449312d31'

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App width={9} height={9} background={background} />
  </React.StrictMode>,
  rootElement
);
