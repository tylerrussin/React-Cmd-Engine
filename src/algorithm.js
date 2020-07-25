const nMapHeight = 16;
const nMapWidth = 16;

const fFOV = 3.14159 / 4.0;        // Field of View
const fDepth = 16.0;               // Maximum rendering distance
const frameSpeed = 30             // Iterations


// Create Map of world space # = wall block, . = space
export const map = [];
map.push('#########.......'.split(''));
map.push('#...............'.split(''));
map.push('#.......########'.split(''));
map.push('#..............#'.split(''));
map.push('#......##......#'.split(''));
map.push('#......##......#'.split(''));
map.push('#..............#'.split(''));
map.push('###............#'.split(''));
map.push('##.............#'.split(''));
map.push('#.......####.###'.split(''));
map.push('#.......#......#'.split(''));
map.push('#.......#......#'.split(''));
map.push('#..............#'.split(''));
map.push('#......#########'.split(''));
map.push('#..............#'.split(''));
map.push('################'.split(''));


// Pure Javascript
export function matrixWarp({fPlayerX, fPlayerY, fPlayerA, nScreenWidth, nScreenHeight, screen}) {
  
    for (let x = 0; x < nScreenWidth; x++) {
      
      // For each column, calculate the projected ray angle into world space
      var fRayAngle = (fPlayerA - fFOV/2.0) + (x.toFixed(2) / nScreenWidth.toFixed(2)) * fFOV;
  
      // Find distance to wall
      var fStepSize = 0.1;         // Increment size for ray casting, decrease to increase
      var fDistanceToWall = 0;     //                                      resolution
  
      var bHitWall = false;       // Set when ray hits wall block
      var bBoundary = false;      // Set when ray hits boundary between two wall blocks
  
      var fEyeX = Math.sin(fRayAngle); // Unit vector for ray in player space
      var fEyeY = Math.cos(fRayAngle);
  
      // Incrementally cast ray from player, along ray angle, testing for 
      // intersection with a block
      
      while (bHitWall === false && fDistanceToWall < fDepth) {
        fDistanceToWall += fStepSize;
        var nTestX = Math.trunc(fPlayerX + fEyeX * fDistanceToWall);
        var nTestY = Math.trunc(fPlayerY + fEyeY * fDistanceToWall);
  
        // Test if ray is out of bounds
        if (nTestX < 0 || nTestX >= nMapWidth || nTestY < 0 || nTestY >= nMapHeight) {
          bHitWall = true;         // Just set distance to maximum depth
          fDistanceToWall = fDepth;
        }
        else {
          // Ray is inbounds so test to see if the ray cell is a wall block
          if (map[nTestY][nTestX] === '#') {
            // Ray has hit wall
            bHitWall = true;
  
            // To highlight tile boundaries, cast a ray from each corner
            // of the tile, to the player. The more coincident this ray
            // is to the rendering ray, the closer we are to a tile 
            // boundary, which we'll shade to add detail to the walls
            var p = [];
  
            // Test each corner of hit tile, storing the distance from
            // the player, and the calculated dot product of the two rays
            for (let tx = 0; tx < 2; tx++) {
              for (let ty = 0; ty < 2; ty++) {
                // Angle of corner to eye
                var vy = nTestY.toFixed(2) + ty - fPlayerY;
                var vx = nTestX.toFixed(2) + tx - fPlayerX;
                var d = Math.sqrt(vx*vx + vy*vy);
                var dot = (fEyeX * vx / d) + (fEyeY * vy / d);
                p.push([d, dot]);
              }              
            }
            // Sort Pairs from closest to farthest
            p.sort((a, b) => a[0] - b[0]);
  
            // First two/three are closest (we will never see all four)
            var fBound = 0.01
            if (Math.acos(p[0][1]) < fBound) {bBoundary = true;}
            if (Math.acos(p[1][1]) < fBound) {bBoundary = true;}
            if (Math.acos(p[2][1]) < fBound) {bBoundary = true;}
  
          }
        }   
      }
  
      // Calculate distance to ceiling and floor
      var nCeiling = nScreenHeight/2.0.toFixed(2) - nScreenHeight / fDistanceToWall.toFixed(2);
      var nFloor = nScreenHeight - nCeiling;
  
      // Shader walls based on distance
      var nShade = ' '
      if (fDistanceToWall <= fDepth / 4.0)        {nShade = '\u2588';}     // Very Close
      else if (fDistanceToWall < fDepth / 3.0)    {nShade = '\u2593';}
      else if (fDistanceToWall < fDepth / 2.0)    {nShade = '\u2592';}
      else if (fDistanceToWall < fDepth)          {nShade = '\u2591';}
      else                                        {nShade = ' ';}        // Too far away
  
      if (bBoundary)       {nShade = ' ';} // Black it out
      
      for (let y = 0; y < nScreenHeight; y++) {
        // Each Row
        if (y < nCeiling) {
          screen[y][x] = ' ';
        }
        else if (y > nCeiling && y <= nFloor) {
          screen[y][x] = nShade;
        }
        else {      // Floor
          
          let nShade2
          // Shade floor based on distance
          var b = 1.0 - ((y.toFixed(2) - nScreenHeight/2.0) / (nScreenHeight.toFixed(2) / 2.0));
          if (b < 0.25)       {nShade2 = '#';}
          else if (b < 0.5)   {nShade2 = 'x';}
          else if (b < 0.75)  {nShade2 = '.';}
          else if (b < 0.9)   {nShade2 = '-';}
          else                {nShade2 = " ";}
  
          screen[y][x] = nShade2;
        }
      }  
    }
  
    // Creating states string
    let xString = fPlayerX.toFixed(2);
    let yString = fPlayerY.toFixed(2);
    let aString = fPlayerA.toFixed(2);
    let fString = (1.0 / frameSpeed).toFixed(2);
    let stats = `X=${xString}, Y=${yString}, A=${aString}, FPS=${fString}`.split('');
  
    // Adding states string to screen matrix
    for (let x = 0; x < stats.length; x++) {
      screen[0][x] = stats[x];
    }
  
    // Display Map
    for (let nx = 0; nx < nMapHeight; nx++) {
      for (let ny = 0; ny < nMapWidth; ny++) {
        screen[ny + 1][nx] = map[ny][nx];
      }
    }
    // Display Player
    screen[Math.trunc(fPlayerY)+1][Math.trunc(fPlayerX)] = 'P';
  
    // Return screen 2D Matrix
    return screen;
  }