import { useState, useEffect } from 'react';

function App() {
  const [size, setSize] = useState('9x9');
  const values = {
    '6x6': ['1', '2', '3', '4', '5', '6', 'ESCAPE', 'BACKSPACE'],
    '9x9': ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'ESCAPE', 'BACKSPACE'],
    '16x16': ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'ESCAPE', 'BACKSPACE'],
  };

  const [dimensions, setDimensions] = useState({ rows: 9, cols: 9 });

  const generateEmptyGrid = (rows, cols) =>
    Array.from({ length: rows }, () => Array(cols).fill(''));

  const [grid, setGrid] = useState(generateEmptyGrid(dimensions.rows, dimensions.cols));
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    const [newRows, newCols] = size.split('x').map(Number);
    setDimensions({ rows: newRows, cols: newCols });
    setGrid(generateEmptyGrid(newRows, newCols));
    setSelectedCell(null);
  }, [size]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (selectedCell) {
        const [row, col] = selectedCell;
        const validValues = values[size];
        const input = event.key.toUpperCase();
  
        if (validValues.includes(input)) {
          const updatedGrid = [...grid];
          ['ESCAPE', 'BACKSPACE'].includes(input) ? updatedGrid[row][col] = '' : updatedGrid[row][col] = input;
          setGrid(updatedGrid);
        } else {
          let newRow = row;
          let newCol = col;
  
          switch (event.key) {
            case 'ArrowUp':
              newRow = row === 0 ? dimensions.rows - 1 : row - 1;
              break;
            case 'ArrowDown':
              newRow = row === dimensions.rows - 1 ? 0 : row + 1;
              break;
            case 'ArrowLeft':
              newCol = col === 0 ? dimensions.cols - 1 : col - 1;
              break;
            case 'ArrowRight':
              newCol = col === dimensions.cols - 1 ? 0 : col + 1;
              break;
            default:
              return;
          }
  
          setSelectedCell([newRow, newCol]);
        }
      }
    }
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, size, values, dimensions]);

  function handleSelectChange(e) {
    setSize(e.target.value);
  }

  function handleButtonClick(value) {
    if (selectedCell) {
      const [row, col] = selectedCell;
      const updatedGrid = [...grid];
      ['ESCAPE', 'BACKSPACE'].includes(value) ? updatedGrid[row][col] = '' : updatedGrid[row][col] = value;
      setGrid(updatedGrid);
    }
  }

  function Square({ row, col }) {

    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col
    const isSubSelected = selectedCell && (selectedCell[0] === row || selectedCell[1] === col)
    const borderStyle = {
      borderLeft:
        Number(col) % Math.floor(Math.sqrt(dimensions.cols)) === 0 && col !== 0
          ? '3px solid #FFB76B'
          : undefined,
      borderTop:
        Number(row) % Math.ceil(Math.sqrt(dimensions.rows)) === 0 && row !== 0
          ? '3px solid #FFB76B'
          : undefined,
    };

    return (
      <div
        className={`square ${isSelected ? 'selected' : ''} ${isSubSelected ? 'subselected' : ''}`}  
        onClick={() => setSelectedCell([row, col])}
        data-row={row}
        data-col={col}
        style={borderStyle}
      >
        {grid[row][col]}
      </div>
    );
  }

  function onSolveClick(sudoku) {
    const sudokuCopy = JSON.parse(JSON.stringify(sudoku))
    const solved = solveSudoku(sudokuCopy)
  
    if (solved) {
      setGrid(sudokuCopy)
    } else {
      window.alert("No solutions found!")
    }
  }

  function findFree(sudoku){
    for(let row = 0; row < sudoku.length; row++){
        for(let col = 0; col < sudoku[0].length; col++){
            if(sudoku[row][col] == ''){
                return [row, col]
            }
        }
    }
  }

  function validate(sudoku, row, col, num){
      for(let i = 0; i < sudoku[0].length; i++){
          if(sudoku[row][i] == num && col != i){
              return false
          }
      }
      for(let i = 0; i < sudoku.length; i++){
          if(sudoku[i][col] == num && row != i){
              return false
          }
      }
      for(let i = row - row % Math.ceil(Math.sqrt(dimensions.rows)); i < row - row % Math.ceil(Math.sqrt(dimensions.rows)) + Math.ceil(Math.sqrt(dimensions.rows)); i++){
          for(let j = col - col % Math.floor(Math.sqrt(dimensions.rows)); j < col - col % Math.floor(Math.sqrt(dimensions.rows)) + Math.floor(Math.sqrt(dimensions.rows)); j++){
              if(sudoku[i][j] == num){
                  return false
              }
          }
      }
      return true
  }

  let cnt = 0
  function solveSudoku(sudoku){
      const find = findFree(sudoku);
      if(!find){
          return true
      }
      const [row, col] = find;
      for(let i of values[size].slice(0, -2)){
        if(validate(sudoku, row, col, i)){
          sudoku[row][col] = i;
            cnt++
            if(cnt == 500000){
                cnt = 0
                window.alert("No solutions!");
                throw 'No solution';
            }
            if(solveSudoku(sudoku)){
                return true
            }
            sudoku[row][col] = '';
        }
    }
      return false
  }

  return (
    <div className="main-wrapper">
      <h5>Adjust the sudoku size</h5>
      <div className="select-container">
        <select onChange={handleSelectChange} value={size}>
          <option value="6x6">6x6</option>
          <option value="9x9">9x9</option>
          <option value="16x16">16x16</option>
        </select>
      </div>
      <div className={`sudoku-wrapper x${size}`}>
        {Array.from({ length: dimensions.rows }).map((_, rowIndex) => (
          <div className="row" key={rowIndex}>
            {Array.from({ length: dimensions.cols }).map((_, colIndex) => (
              <Square key={colIndex} row={rowIndex} col={colIndex} />
            ))}
          </div>
        ))}
      </div>
      <button className='solve-btn' onClick={() => onSolveClick(grid)}>Solve</button>
      <div className='phone-nums'>
        <ul>
          {values[size].slice(0, -2).map((num, index) => 
          <li key={index}>
            <button onClick={() => handleButtonClick(num)}>
              {num}
            </button>
          </li>)}
          <li><button onClick={() => handleButtonClick('BACKSPACE')}><i className="fa-solid fa-left-long"></i></button></li>
        </ul>
      </div>
    </div>
  );
}

export default App;
