const board = document.getElementById("board");
const currentPlayerText = document.getElementById("current-player");
const pieceList = document.getElementById("piece-list");
const rotateButton = document.getElementById("rotate-button");
const flipButton = document.getElementById("flip-button");
const passButton = document.getElementById("pass-button");
const result = document.getElementById("result");
const allPlayerPieces = document.getElementById("all-player-pieces");
const resetButton = document.getElementById("reset-button");
const selectedPiecePreview = document.getElementById("selected-piece-preview");
const log = document.getElementById("log");

const BOARD_SIZE = 20;

const players = ["青", "赤", "黄", "緑"];
const humanPlayerSelect = document.getElementById("human-player-select");

let humanPlayer = 0;
let cpuPlayers = [false, true, true, true];
let currentPlayer = 0;
let selectedPieceIndex = 0;
let consecutivePassCount = 0;
let isGameOver = false;

const playerStartCorners = [
  { row: 0, col: 0 },
  { row: 0, col: 19 },
  { row: 19, col: 19 },
  { row: 19, col: 0 },
];

const hasPlacedFirstPiece = [false, false, false, false];

const pieces = [
  { name: "1マス", shape: [[1]] },
  { name: "2マス", shape: [[1, 1]] },
  { name: "3マス直線", shape: [[1, 1, 1]] },
  {
    name: "3マスL字",
    shape: [
      [1, 0],
      [1, 1],
    ],
  },
  { name: "4マス直線", shape: [[1, 1, 1, 1]] },
  {
    name: "4マス四角",
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    name: "4マスT字",
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    name: "4マスL字",
    shape: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: "4マスZ字",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  { name: "5マス直線", shape: [[1, 1, 1, 1, 1]] },
  {
    name: "5マスL字",
    shape: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: "5マスT字",
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    name: "5マス十字",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    name: "5マスZ字",
    shape: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    name: "5マスV字",
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    name: "5マスW字",
    shape: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    name: "5マスU字",
    shape: [
      [1, 0, 1],
      [1, 1, 1],
    ],
  },
  {
    name: "5マスP字",
    shape: [
      [1, 1],
      [1, 1],
      [1, 0],
    ],
  },
  {
    name: "5マスY字",
    shape: [
      [0, 1],
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  },
  {
    name: "5マスN字",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
  {
    name: "5マスF字",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
];

function createPlayerPieces() {
  return pieces.map((piece) => ({
    name: piece.name,
    shape: piece.shape.map((row) => [...row]),
    used: false,
  }));
}

let playerPieces = [
  createPlayerPieces(),
  createPlayerPieces(),
  createPlayerPieces(),
  createPlayerPieces(),
];

function getCurrentPieces() {
  return playerPieces[currentPlayer];
}

function createBoard() {
  board.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("button");

      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener("click", () => {
        placePiece(row, col);
      });

      cell.addEventListener("mouseenter", () => {
        showPreview(row, col);
      });

      cell.addEventListener("mouseleave", () => {
        clearPreview();
      });

      board.appendChild(cell);
    }
  }
}

function renderPieces() {
  pieceList.innerHTML = "";

  const currentPieces = getCurrentPieces();

  currentPieces.forEach((piece, index) => {
    const button = document.createElement("button");
    button.classList.add("piece-button");

    if (piece.used) {
      button.classList.add("used");
      button.disabled = true;
    }

    if (index === selectedPieceIndex) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (piece.used) {
        return;
      }

      selectedPieceIndex = index;
      renderPieces();
    });

    const miniGrid = document.createElement("div");
    miniGrid.classList.add("mini-grid");
    miniGrid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 14px)`;

    piece.shape.forEach((row) => {
      row.forEach((value) => {
        const miniCell = document.createElement("div");
        miniCell.classList.add("mini-cell");

        if (value === 0) {
          miniCell.classList.add("empty");
        }

        miniGrid.appendChild(miniCell);
      });
    });

    button.appendChild(miniGrid);
    pieceList.appendChild(button);
  });

  renderSelectedPiecePreview();
}

function renderSelectedPiecePreview() {
  selectedPiecePreview.innerHTML = "";

  const piece = getCurrentPieces()[selectedPieceIndex];

  if (!piece) {
    selectedPiecePreview.textContent = "選択できるピースがありません";
    return;
  }

  const title = document.createElement("p");
  title.textContent = piece.name;
  selectedPiecePreview.appendChild(title);

  const previewGrid = document.createElement("div");
  previewGrid.classList.add("selected-preview-grid");
  previewGrid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 28px)`;

  piece.shape.forEach((row) => {
    row.forEach((value) => {
      const cell = document.createElement("div");
      cell.classList.add("selected-preview-cell");

      if (value === 0) {
        cell.classList.add("empty");
      }

      previewGrid.appendChild(cell);
    });
  });

  selectedPiecePreview.appendChild(previewGrid);
}

function renderAllPlayerPieces() {
  allPlayerPieces.innerHTML = "";

  playerPieces.forEach((pieces, playerIndex) => {
    const playerBox = document.createElement("details");
    playerBox.classList.add("player-piece-box");

    if (playerIndex === currentPlayer) {
      playerBox.open = true;
    }

    const title = document.createElement("summary");
    title.textContent = `${players[playerIndex]}の残りピース`;
    playerBox.appendChild(title);

    const grid = document.createElement("div");
    grid.classList.add("other-piece-grid");

    pieces.forEach((piece) => {
      const pieceItem = document.createElement("div");
      pieceItem.classList.add("other-piece-item");

      if (piece.used) {
        pieceItem.classList.add("used");
      }

      const name = document.createElement("div");
      name.classList.add("other-piece-name");
      name.textContent = piece.name;

      const miniGrid = document.createElement("div");
      miniGrid.classList.add("mini-grid");
      miniGrid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 10px)`;

      piece.shape.forEach((row) => {
        row.forEach((value) => {
          const miniCell = document.createElement("div");
          miniCell.classList.add("mini-cell");

          if (value === 0) {
            miniCell.classList.add("empty");
          }

          miniGrid.appendChild(miniCell);
        });
      });

      pieceItem.appendChild(name);
      pieceItem.appendChild(miniGrid);
      grid.appendChild(pieceItem);
    });

    playerBox.appendChild(grid);
    allPlayerPieces.appendChild(playerBox);
  });
}

function placePiece(startRow, startCol) {
  if (isGameOver) {
    return;
  }

  clearPreview();

  const piece = getCurrentPieces()[selectedPieceIndex];

  if (!piece || piece.used) {
    alert("このピースは使用できません。");
    return;
  }

  const shape = piece.shape;

  if (!canPlacePiece(startRow, startCol, shape)) {
    alert("ここには置けません。");
    return;
  }

  shape.forEach((shapeRow, rowOffset) => {
    shapeRow.forEach((value, colOffset) => {
      if (value === 0) {
        return;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;
      const cell = getCell(row, col);

      cell.classList.add("occupied");
      cell.classList.add(`player-${currentPlayer}`);
    });
  });

  hasPlacedFirstPiece[currentPlayer] = true;
  piece.used = true;
  consecutivePassCount = 0;

  renderAllPlayerPieces();
  nextPlayer();
}

function showPreview(startRow, startCol) {
  clearPreview();

  if (isGameOver) {
    return;
  }

  const piece = getCurrentPieces()[selectedPieceIndex];

  if (!piece || piece.used) {
    return;
  }

  const shape = piece.shape;
  const canPlace = canPlacePiece(startRow, startCol, shape);

  shape.forEach((shapeRow, rowOffset) => {
    shapeRow.forEach((value, colOffset) => {
      if (value === 0) {
        return;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return;
      }

      const cell = getCell(row, col);

      if (!cell.classList.contains("occupied")) {
        cell.classList.add(
          canPlace ? `player-${currentPlayer}` : "invalid-preview",
        );
        cell.classList.add("preview");
      }
    });
  });
}

function clearPreview() {
  document.querySelectorAll(".cell.preview").forEach((cell) => {
    if (cell.classList.contains("occupied")) {
      cell.classList.remove("preview", "invalid-preview");
      return;
    }

    cell.classList.remove(
      "preview",
      "invalid-preview",
      "player-0",
      "player-1",
      "player-2",
      "player-3",
    );
  });
}

function canPlacePiece(startRow, startCol, shape) {
  for (let rowOffset = 0; rowOffset < shape.length; rowOffset++) {
    for (let colOffset = 0; colOffset < shape[rowOffset].length; colOffset++) {
      if (shape[rowOffset][colOffset] === 0) {
        continue;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return false;
      }

      const cell = getCell(row, col);

      if (cell.classList.contains("occupied")) {
        return false;
      }
    }
  }

  if (!hasPlacedFirstPiece[currentPlayer]) {
    return touchesStartCorner(startRow, startCol, shape);
  }

  if (touchesSamePlayerSide(startRow, startCol, shape)) {
    return false;
  }

  if (!touchesSamePlayerCorner(startRow, startCol, shape)) {
    return false;
  }

  return true;
}

function touchesStartCorner(startRow, startCol, shape) {
  const startCorner = playerStartCorners[currentPlayer];

  for (let rowOffset = 0; rowOffset < shape.length; rowOffset++) {
    for (let colOffset = 0; colOffset < shape[rowOffset].length; colOffset++) {
      if (shape[rowOffset][colOffset] === 0) {
        continue;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      if (row === startCorner.row && col === startCorner.col) {
        return true;
      }
    }
  }

  return false;
}

function touchesSamePlayerSide(startRow, startCol, shape) {
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (let rowOffset = 0; rowOffset < shape.length; rowOffset++) {
    for (let colOffset = 0; colOffset < shape[rowOffset].length; colOffset++) {
      if (shape[rowOffset][colOffset] === 0) {
        continue;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      for (const direction of directions) {
        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (
          nextRow < 0 ||
          nextRow >= BOARD_SIZE ||
          nextCol < 0 ||
          nextCol >= BOARD_SIZE
        ) {
          continue;
        }

        const neighborCell = getCell(nextRow, nextCol);

        if (neighborCell.classList.contains(`player-${currentPlayer}`)) {
          return true;
        }
      }
    }
  }

  return false;
}

function touchesSamePlayerCorner(startRow, startCol, shape) {
  const directions = [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 },
  ];

  for (let rowOffset = 0; rowOffset < shape.length; rowOffset++) {
    for (let colOffset = 0; colOffset < shape[rowOffset].length; colOffset++) {
      if (shape[rowOffset][colOffset] === 0) {
        continue;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      for (const direction of directions) {
        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (
          nextRow < 0 ||
          nextRow >= BOARD_SIZE ||
          nextCol < 0 ||
          nextCol >= BOARD_SIZE
        ) {
          continue;
        }

        const neighborCell = getCell(nextRow, nextCol);

        if (neighborCell.classList.contains(`player-${currentPlayer}`)) {
          return true;
        }
      }
    }
  }

  return false;
}

function getCell(row, col) {
  return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function selectFirstUnusedPiece() {
  const pieces = getCurrentPieces();
  const index = pieces.findIndex((piece) => !piece.used);

  selectedPieceIndex = index === -1 ? 0 : index;
}

function nextPlayer() {
  currentPlayer++;

  if (currentPlayer >= players.length) {
    currentPlayer = 0;
  }

  selectFirstUnusedPiece();

  currentPlayerText.textContent = players[currentPlayer];

  renderPieces();
  renderAllPlayerPieces();

  if (!hasValidMove(currentPlayer)) {
    consecutivePassCount++;

    result.classList.add("show");
    result.innerHTML = `
      <p>${players[currentPlayer]}は置ける場所がないため、自動でパスしました。</p>
    `;

    if (consecutivePassCount >= players.length) {
      endGame();
      return;
    }

    setTimeout(() => {
      nextPlayer();
    }, 800);

    return;
  }

  result.classList.remove("show");
  result.innerHTML = "";
  if (cpuPlayers[currentPlayer]) {
    setTimeout(() => {
      playCpuTurn();
    }, 700);
  }
}

function hasValidMove(playerIndex) {
  return getValidMoves(playerIndex).length > 0;
}
function getShapeCells(shape) {
  const cells = [];

  shape.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 1) {
        cells.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  return cells;
}

function getShapeKey(shape) {
  return shape.map((row) => row.join("")).join("/");
}

function getUniqueShapes(shape) {
  const shapes = [];
  const keys = new Set();

  for (let flip = 0; flip < 2; flip++) {
    let testShape =
      flip === 1 ? flipShape(cloneShape(shape)) : cloneShape(shape);

    for (let rotate = 0; rotate < 4; rotate++) {
      if (rotate > 0) {
        testShape = rotateShape(testShape);
      }

      const key = getShapeKey(testShape);

      if (!keys.has(key)) {
        keys.add(key);
        shapes.push(cloneShape(testShape));
      }
    }
  }

  return shapes;
}

function getCandidateCells(playerIndex) {
  const candidates = new Set();

  if (!hasPlacedFirstPiece[playerIndex]) {
    const corner = playerStartCorners[playerIndex];
    candidates.add(`${corner.row},${corner.col}`);
    return [...candidates].map((key) => {
      const [row, col] = key.split(",").map(Number);
      return { row, col };
    });
  }

  const cornerDirections = [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 },
  ];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = getCell(row, col);

      if (!cell.classList.contains(`player-${playerIndex}`)) {
        continue;
      }

      cornerDirections.forEach((direction) => {
        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (
          nextRow < 0 ||
          nextRow >= BOARD_SIZE ||
          nextCol < 0 ||
          nextCol >= BOARD_SIZE
        ) {
          return;
        }

        const nextCell = getCell(nextRow, nextCol);

        if (nextCell.classList.contains("occupied")) {
          return;
        }

        if (touchesVirtualSide(nextRow, nextCol, playerIndex)) {
          return;
        }

        candidates.add(`${nextRow},${nextCol}`);
      });
    }
  }

  return [...candidates].map((key) => {
    const [row, col] = key.split(",").map(Number);
    return { row, col };
  });
}
function getValidMoves(playerIndex) {
  const validMoves = [];
  const moveKeys = new Set();
  const pieces = playerPieces[playerIndex];
  const candidateCells = getCandidateCells(playerIndex);

  const savedPlayer = currentPlayer;
  currentPlayer = playerIndex;

  pieces.forEach((piece, pieceIndex) => {
    if (piece.used) {
      return;
    }

    const uniqueShapes = getUniqueShapes(piece.shape);

    uniqueShapes.forEach((shape) => {
      const shapeCells = getShapeCells(shape);

      candidateCells.forEach((candidate) => {
        shapeCells.forEach((shapeCell) => {
          const startRow = candidate.row - shapeCell.row;
          const startCol = candidate.col - shapeCell.col;

          const key = `${pieceIndex}-${getShapeKey(shape)}-${startRow}-${startCol}`;

          if (moveKeys.has(key)) {
            return;
          }

          moveKeys.add(key);

          if (canPlacePiece(startRow, startCol, shape)) {
            validMoves.push({
              pieceIndex,
              row: startRow,
              col: startCol,
              shape: cloneShape(shape),
            });
          }
        });
      });
    });
  });

  currentPlayer = savedPlayer;

  return validMoves;
}
function getPieceSize(shape) {
  return shape.flat().filter((cell) => cell === 1).length;
}
function countNewCorners(startRow, startCol, shape, playerIndex) {
  const cornerDirections = [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 },
  ];

  let count = 0;

  shape.forEach((shapeRow, rowOffset) => {
    shapeRow.forEach((value, colOffset) => {
      if (value === 0) {
        return;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      cornerDirections.forEach((direction) => {
        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (
          nextRow < 0 ||
          nextRow >= BOARD_SIZE ||
          nextCol < 0 ||
          nextCol >= BOARD_SIZE
        ) {
          return;
        }

        const cell = getCell(nextRow, nextCol);

        if (
          !cell.classList.contains("occupied") &&
          !touchesVirtualSide(nextRow, nextCol, playerIndex)
        ) {
          count++;
        }
      });
    });
  });

  return count;
}
function getExpansionScore(startRow, startCol, shape, playerIndex) {
  const corner = playerStartCorners[playerIndex];
  let score = 0;

  shape.forEach((shapeRow, rowOffset) => {
    shapeRow.forEach((value, colOffset) => {
      if (value === 0) {
        return;
      }

      const row = startRow + rowOffset;
      const col = startCol + colOffset;

      score += Math.abs(row - corner.row);
      score += Math.abs(col - corner.col);
    });
  });

  return score;
}

function touchesVirtualSide(row, col, playerIndex) {
  const sideDirections = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  return sideDirections.some((direction) => {
    const nextRow = row + direction.row;
    const nextCol = col + direction.col;

    if (
      nextRow < 0 ||
      nextRow >= BOARD_SIZE ||
      nextCol < 0 ||
      nextCol >= BOARD_SIZE
    ) {
      return false;
    }

    return getCell(nextRow, nextCol).classList.contains(
      `player-${playerIndex}`,
    );
  });
}

function countRemainingBlocks(playerIndex) {
  return playerPieces[playerIndex].reduce((total, piece) => {
    if (piece.used) {
      return total;
    }

    const blockCount = piece.shape.flat().filter((value) => value === 1).length;
    return total + blockCount;
  }, 0);
}

function endGame() {
  isGameOver = true;

  const scores = players.map((playerName, index) => ({
    name: playerName,
    remainingBlocks: countRemainingBlocks(index),
  }));

  scores.sort((a, b) => a.remainingBlocks - b.remainingBlocks);

  currentPlayerText.textContent = `ゲーム終了：勝者 ${scores[0].name}`;

  result.classList.add("show");
  result.innerHTML = `
    <h2>ゲーム結果</h2>
    <p><strong>勝者：${scores[0].name}</strong></p>
    <ul>
      ${scores
        .map(
          (score) => `<li>${score.name}：残り${score.remainingBlocks}マス</li>`,
        )
        .join("")}
    </ul>
  `;
}

function rotateShape(shape) {
  const rowCount = shape.length;
  const colCount = shape[0].length;
  const rotated = [];

  for (let col = 0; col < colCount; col++) {
    const newRow = [];

    for (let row = rowCount - 1; row >= 0; row--) {
      newRow.push(shape[row][col]);
    }

    rotated.push(newRow);
  }

  return rotated;
}
function flipShape(shape) {
  return shape.map((row) => [...row].reverse());
}
function cloneShape(shape) {
  return shape.map((row) => [...row]);
}

function playCpuTurn() {
  if (isGameOver) {
    return;
  }

  const validMoves = getValidMoves(currentPlayer);

  if (validMoves.length === 0) {
    consecutivePassCount++;

    result.classList.add("show");
    result.innerHTML = `
      <p>${players[currentPlayer]}（CPU）は置ける場所がないため、パスしました。</p>
    `;

    if (consecutivePassCount >= players.length) {
      endGame();
      return;
    }

    nextPlayer();
    return;
  }

  // 最初にスコア計算して保存
  const scoredMoves = validMoves.map((move) => {
    const size = getPieceSize(move.shape);

    const corners = countNewCorners(
      move.row,
      move.col,
      move.shape,
      currentPlayer,
    );

    const expansion = getExpansionScore(
      move.row,
      move.col,
      move.shape,
      currentPlayer,
    );

    return {
      ...move,
      score: size * 1000 + corners * 50 + expansion,
    };
  });

  // scoreだけでsort
  scoredMoves.sort((a, b) => b.score - a.score);

  const bestScore = scoredMoves[0].score;

  // 同点候補
  const bestMoves = scoredMoves.filter((move) => move.score === bestScore);

  // 同点ならランダム
  const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];

  const cpuName = players[currentPlayer];
  const pieceName = playerPieces[currentPlayer][move.pieceIndex].name;

  selectedPieceIndex = move.pieceIndex;

  playerPieces[currentPlayer][selectedPieceIndex].shape = cloneShape(
    move.shape,
  );

  if (log) {
    log.textContent = `${cpuName}（CPU）が「${pieceName}」を置きました。`;
  }

  placePiece(move.row, move.col);
}
function updateCpuPlayers() {
  cpuPlayers = players.map((_, index) => index !== humanPlayer);
}

function resetGame() {
  currentPlayer = 0;
  selectedPieceIndex = 0;
  consecutivePassCount = 0;
  isGameOver = false;

  hasPlacedFirstPiece.fill(false);

  for (let i = 0; i < playerPieces.length; i++) {
    playerPieces[i] = createPlayerPieces();
  }

  result.classList.remove("show");
  result.innerHTML = "";

  if (log) {
    log.textContent = "";
  }

  currentPlayerText.textContent = players[currentPlayer];

  createBoard();
  selectFirstUnusedPiece();
  renderPieces();
  renderAllPlayerPieces();

  if (cpuPlayers[currentPlayer]) {
    setTimeout(() => {
      playCpuTurn();
    }, 700);
  }
}
flipButton.addEventListener("click", () => {
  if (isGameOver) {
    return;
  }

  const piece = getCurrentPieces()[selectedPieceIndex];

  if (!piece || piece.used) {
    return;
  }

  piece.shape = flipShape(cloneShape(piece.shape));

  renderPieces();
  renderAllPlayerPieces();
});
rotateButton.addEventListener("click", () => {
  if (isGameOver) {
    return;
  }

  const piece = getCurrentPieces()[selectedPieceIndex];

  if (!piece || piece.used) {
    return;
  }

  piece.shape = rotateShape(cloneShape(piece.shape));

  renderPieces();
  renderAllPlayerPieces();
});

passButton.addEventListener("click", () => {
  if (isGameOver) {
    return;
  }

  clearPreview();
  consecutivePassCount++;

  if (consecutivePassCount >= players.length) {
    endGame();
    return;
  }

  nextPlayer();
});
resetButton.addEventListener("click", resetGame);

humanPlayerSelect.addEventListener("change", () => {
  humanPlayer = Number(humanPlayerSelect.value);
  updateCpuPlayers();
  resetGame();
});

updateCpuPlayers();
resetGame();
