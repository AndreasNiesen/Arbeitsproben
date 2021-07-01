const fields = document.querySelectorAll(".field");
const rows = document.querySelectorAll(".row");
const solve_button = document.querySelector("#solve");
const reset_button = document.querySelector("#reset");

reset_button.addEventListener("click", e => {
  fields.forEach(ele => {
    ele.value = "";
    ele.classList.remove("bruteforced");
  });
  const msgField = document.querySelector("h1#msg");
  if (!msgField) return;
  msgField.classList.remove("error", "success");
  msgField.textContent = "Gib deine vorhandenen Zahlen ein:";
});

solve_button.addEventListener("click", e => {
  const field = createArrayfromFields();
  const beatable = test(field);
  if (!beatable) {  // prevent fruitless endeavour
    msg("Doppelte Zahl in einer der Reihen, Spalten oder Boxen!", "error");
    return;
  }
  msg("Die Lösung ist: ", "success");
  
  const solved = sudokuSolver(0, 0, field);
  rows.forEach((row, row_index) => {
    row.querySelectorAll(".field").forEach((field, col_index) => {
      if(!field.value) {
        field.classList.add("bruteforced");
        field.value = solved[row_index][col_index];
      }
    });
  });
});

/**
 * Checks if the Sudoku-Field is beatable in the current state.
 * 
 * @param {Array} field - The whole field in array-of-arrays form
 * @return {Boolean} true if beatable
 */
function test(field) {
  for (let i = 0; i < field.length; i++) {
    const row = field[i];
    for (let c = 0; c < row.length; c++) {
      const num = row[c];
      
      if (num){
        row[c] = "";  // Prevent the number from finding itself
        const chrow = checkRow(num, i, field);
        const chcol = checkColumn(num, c, field);
        const chbox = checkBox(num, i, c, field);
        row[c] = num;

        if (!chrow || !chcol || !chbox) return false;
      }
    }
  }
  return true;
}

// add some comfy controls
fields.forEach((field, index) => {
  field.addEventListener("input", e => {
    if (Number(e.target.value) === 0) {
      e.target.value = "";
      fields[index+1]?.focus();
    }else if (Number(e.target.value)) {
      fields[index+1]?.focus();
    } else {
      e.target.value = "";
    }
  })
});

/**
 * Create an array of arrays containing the whole Sudoku-Field
 * 
 * @return {Array} Array of arrays mirroring the typed-in Sudoku-Field
 */
function createArrayfromFields() {
  let result = [];
  let row = [];

  fields.forEach((field, index) => {
    row.push(field.value);
    if ((index+1) % 9 === 0) {
      result.push(row);
      row = [];
    }
  });

  return result;
}

/**
 * Checks if Sudoku-Field contains passed number in passed row.
 * 
 * @param {Number} number - Number to be checked
 * @param {Number} row_index - Index of the row to be checked
 * @param {Array} sudoku_arr - Array-version of the Sudoku-Field
 * 
 * @return {Boolean} true if passed number is not in passed row
 */
function checkRow(number, row_index, sudoku_arr) {
  return !sudoku_arr[row_index].join("").includes(number);
}

/**
 * Checks if Sudoku-Field contains passed number in passed column.
 * 
 * @param {Number} number - Number to be checked
 * @param {Number} col_index - Index of the column to be checked
 * @param {Array} sudoku_arr - Array-version of the Sudoku-Field
 * 
 * @return {Boolean} true if passed number is not in passed column
 */
function checkColumn(number, col_index, sudoku_arr) {
  return !sudoku_arr.map(row => row[col_index]).join("").includes(number);
}

/**
 * Checks if Sudoku-Field contains passed number in 3x3 box containing the passed row- and col-index.
 * 
 * @param {Number} number - Number to be checked
 * @param {Number} row_index - Index of the row to be checked
 * @param {Number} col_index - Index of the column to be checked
 * @param {Array} sudoku_arr - Array-version of the Sudoku-Field
 * 
 * @return {Boolean} true if passed number is not in passed 3x3 box
 */
function checkBox(number, row_index, col_index, sudoku_arr) {
  let sub_arr;

  if (row_index < 3) {
    sub_arr = sudoku_arr.slice(0, 3);
  } else if (row_index > 5) {
    sub_arr = sudoku_arr.slice(6);
  } else {
    sub_arr = sudoku_arr.slice(3, 6);
  }

  if (col_index < 3) {
    return !sub_arr.map(row => row.slice(0, 3)).join().replaceAll(",", "").includes(number);  // replacing all "," with "" is unnecessary - but having it ","-less in every remaining case compels me
  } else if (col_index > 5) {
    return !sub_arr.map(row => row.slice(6)).join().replaceAll(",", "").includes(number);
  } else {
    return !sub_arr.map(row => row.slice(3, 6)).join().replaceAll(",", "").includes(number);
  }
}

/**
 * Recursive function to solve the passed Sudoku-Field.
 * 
 * @param {Number} row_index - Index of the row-position of the next Number to be checked
 * @param {Number} col_index - Index of the column-position of the next Number to be checked
 * @param {Array} sudoku_arr - Sudoku-Field to be solved
 * 
 * @return false if unsolvable, solved field if solvable
 */
function sudokuSolver(row_index, col_index, sudoku_arr) {
  // check if already filled in
  if (sudoku_arr[row_index][col_index]) {
    // check if final number
    if (row_index === 8 && col_index === 8) {
      return sudoku_arr;
    } else if (col_index === 8) {
      return sudokuSolver(row_index+1, 0, sudoku_arr)
    } else {
      return sudokuSolver(row_index, col_index+1, sudoku_arr)
    }
  }

  let res_buff;

  // bruteforce all possible numbers
  for (let i = 1; i <= 9; i++) {
    if (checkRow(i, row_index, sudoku_arr) && checkColumn(i, col_index, sudoku_arr) && checkBox(i, row_index, col_index, sudoku_arr)) {
      sudoku_arr[row_index][col_index] = String(i);

      if (row_index === 8 && col_index === 8) {
        return sudoku_arr;
      } else if (col_index === 8) {
        res_buff = sudokuSolver(row_index+1, 0, sudoku_arr)
        if (res_buff) {
          return res_buff;
        }
      } else {
        res_buff = sudokuSolver(row_index, col_index+1, sudoku_arr)
        if (res_buff) {
          return res_buff;
        }
      }
    }
  }

  sudoku_arr[row_index][col_index] = "";
  return false;
}

/**
 * Display message on website.
 * 
 * @param {String} message - The message to be displayed
 * @param {String} type - "error" or "success" to add the proper class
 */
function msg(message, type) {
  let msgElement = document.querySelector("h1#msg");
  if (!msgElement) {
    msgElement = document.createElement("h1");
    msgElement.id = "msg";
    document.querySelector("body").prepend(msgElement);
  }
  msgElement.classList.remove("error", "success");
  msgElement.classList.add(type);
  msgElement.textContent = message;
  return;
}
