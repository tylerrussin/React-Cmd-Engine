import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import { matrixWarp, map } from './algorithm.js';
import { useKeyPress, useInterval } from './hooks.js' 
import './index.css';


// Renders single ascii chars
function Box (props) {
  return (
    <div className="grid-item">
      {props.screen[props.row][props.col]}
    </div>
  );
}


// Renders the grid structer of matrix
function Grid (props) {
  const rowsArr = [];

  // Pull each box from matrix
  for (let row = 0; row < props.nScreenHeight; row++) {
    for (let col = 0; col < props.nScreenWidth; col++) {
      let boxId = row + "_" + col;

      rowsArr.push(
        <Box
          key={boxId}
          boxId={boxId}
          row={row}
          col={col}
          screen={props.screen}
        />
      );
    }
  }
  return (
    <div className="grid-container">
      {rowsArr}
    </div>
  );
}


// Master componet
function Main () {
  
  const nScreenWidth = 120         // Console Screen Size X (columns)
  const nScreenHeight = 40          // Console Screen Size Y (rows)
  const [screen] = useState(Array(nScreenHeight).fill().map(() => Array(nScreenWidth).fill('\u2588')));

  // Boolean Values
  const wPressed = useKeyPress('w');
  const aPressed = useKeyPress('a');
  const sPressed = useKeyPress('s');
  const dPressed = useKeyPress('d');

  // Creating player location states
  const [fPlayerX, setFPlayerX] = useState(8);
  const [fPlayerY, setFPlayerY] = useState(8);
  const [fPlayerA, setFPlayerA] = useState(0);

  let delayInMilliseconds = 10; //equal to 100 frames  
  let fSpeed = .5; // Player Speed


  // Logic for changing location states
  // Handles angle problem
  if (aPressed && dPressed) {
    // Change Nothing
  }
  // Either increase, decrease, or don't change A
  else {
    if (aPressed) {
      // Prevents react from crashing
      setTimeout(function() {
        setFPlayerA(fPlayerA - fSpeed * 0.75);
      }, delayInMilliseconds);
    }

    if (dPressed) {
      // Prevents react from crashing
      setTimeout(function() {
        setFPlayerA(fPlayerA + fSpeed * 0.75);
      }, delayInMilliseconds);
    }
  }


  // Handles forward backward problem
  if (wPressed && sPressed) {
    // Change Nothing
  } else {
    if (wPressed) {
      // Prevents react from crashing
      setTimeout(function() {
        let fPlayerXCopy = fPlayerX + Math.sin(fPlayerA) * fSpeed;
        let fPlayerYCopy = fPlayerY + Math.cos(fPlayerA) * fSpeed;

        if (map[Math.trunc(fPlayerYCopy)][Math.trunc(fPlayerXCopy)] !== "#") {
          setFPlayerX(fPlayerXCopy);
          setFPlayerY(fPlayerYCopy);
        }
      }, delayInMilliseconds);
    }

    if (sPressed) {
      // Prevents react from crashing
      setTimeout(function() {
        let fPlayerXCopy = fPlayerX - Math.sin(fPlayerA) * fSpeed;
        let fPlayerYCopy = fPlayerY - Math.cos(fPlayerA) * fSpeed;

        if (map[Math.trunc(fPlayerYCopy)][Math.trunc(fPlayerXCopy)] !== "#") {
          setFPlayerX(fPlayerXCopy);
          setFPlayerY(fPlayerYCopy);
        }
      }, delayInMilliseconds);
    }
  }

  // Calls algorthim then delays how many loops
  const update = () => matrixWarp({fPlayerX, fPlayerY, fPlayerA, nScreenWidth, nScreenHeight, screen})
  useInterval(update, delayInMilliseconds)

  return (
    <div>
      <Grid
        nScreenWidth={nScreenWidth}
        nScreenHeight={nScreenHeight}
        screen={screen}
      />
    </div>

  );
}





ReactDOM.render(<Main />, document.getElementById('root'));

