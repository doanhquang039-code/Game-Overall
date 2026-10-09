// Cờ Gánh - Vietnamese Traditional Strategy Board Game Engine

export class CoGanhGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(5).fill(null).map(() => Array(5).fill(null));

    // Player 1 (Blue / 'B') initial positions (8 pieces)
    // Row 0: all 5 pieces
    for (let c = 0; c < 5; c++) this.board[0][c] = 'B';
    this.board[1][0] = 'B';
    this.board[1][4] = 'B';
    this.board[2][0] = 'B';

    // Player 2 (Red / 'R') initial positions (8 pieces)
    // Row 4: all 5 pieces
    for (let c = 0; c < 5; c++) this.board[4][c] = 'R';
    this.board[3][0] = 'R';
    this.board[3][4] = 'R';
    this.board[2][4] = 'R';

    this.turn = 'B'; // 'B' (Xanh) moves first
    this.history = [];
    this.isGameOver = false;
    this.winner = null;
    this.lastGanh = []; // pieces converted by Gánh in last move
    this.lastVay = [];  // pieces converted by Vây in last move
  }

  cloneState() {
    return {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  restoreState(state) {
    this.board = state.board.map(r => [...r]);
    this.turn = state.turn;
    this.isGameOver = state.isGameOver;
    this.winner = state.winner;
    this.lastGanh = [];
    this.lastVay = [];
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.restoreState(prev);
    return true;
  }

  isInside(r, c) {
    return r >= 0 && r < 5 && c >= 0 && c < 5;
  }

  // Check if two coordinates are directly connected by an active line
  isConnected(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);

    // Orthogonal adjacency (always valid)
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
      return true;
    }

    // Diagonal adjacency (only valid if both have (r+c)%2 === 0)
    if (dr === 1 && dc === 1) {
      return (r1 + c1) % 2 === 0;
    }

    return false;
  }

  getAdjacentSquares(r, c) {
    const list = [];
    const deltas = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // Orthogonal
    ];

    // Diagonals allowed if (r + c) is even
    if ((r + c) % 2 === 0) {
      deltas.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dr, dc] of deltas) {
      const nr = r + dr, nc = c + dc;
      if (this.isInside(nr, nc)) {
        list.push({ r: nr, c: nc });
      }
    }

    return list;
  }

  getLegalMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece || piece !== this.turn) return [];

    const adj = this.getAdjacentSquares(r, c);
    return adj.filter(p => this.board[p.r][p.c] === null);
  }

  getAllLegalMoves(color = this.turn) {
    const all = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (this.board[r][c] === color) {
          const adj = this.getLegalMoves(r, c);
          adj.forEach(to => {
            all.push({ from: { r, c }, to });
          });
        }
      }
    }
    return all;
  }

  // Check "Gánh" from newly placed piece at (r, c)
  checkGanh(r, c, color) {
    const opp = color === 'B' ? 'R' : 'B';
    const converted = [];

    // Directions: horizontal, vertical, and diagonals (if even)
    const linePairs = [
      { d1: [-1, 0], d2: [1, 0] }, // Vertical
      { d1: [0, -1], d2: [0, 1] }  // Horizontal
    ];

    if ((r + c) % 2 === 0) {
      linePairs.push({ d1: [-1, -1], d2: [1, 1] });
      linePairs.push({ d1: [-1, 1], d2: [1, -1] });
    }

    for (const { d1, d2 } of linePairs) {
      const r1 = r + d1[0], c1 = c + d1[1];
      const r2 = r + d2[0], c2 = c + d2[1];

      if (this.isInside(r1, c1) && this.isInside(r2, c2)) {
        if (this.board[r1][c1] === opp && this.board[r2][c2] === opp) {
          converted.push({ r: r1, c: c1 }, { r: r2, c: c2 });
        }
      }
    }

    return converted;
  }

  // Check "Vây / Chẹt": Find opponent pieces that have 0 liberties
  checkVay(color) {
    const opp = color === 'B' ? 'R' : 'B';
    const visited = Array(5).fill(false).map(() => Array(5).fill(false));
    const captured = [];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (this.board[r][c] === opp && !visited[r][c]) {
          // Find connected component of opp pieces
          const group = [];
          const queue = [{ r, c }];
          visited[r][c] = true;
          let hasLiberty = false;

          while (queue.length > 0) {
            const curr = queue.shift();
            group.push(curr);

            const neighbors = this.getAdjacentSquares(curr.r, curr.c);
            for (const n of neighbors) {
              if (this.board[n.r][n.c] === null) {
                hasLiberty = true;
              } else if (this.board[n.r][n.c] === opp && !visited[n.r][n.c]) {
                visited[n.r][n.c] = true;
                queue.push(n);
              }
            }
          }

          if (!hasLiberty) {
            captured.push(...group);
          }
        }
      }
    }

    return captured;
  }

  makeMove(from, to) {
    if (this.isGameOver) return false;
    if (this.board[from.r][from.c] !== this.turn || this.board[to.r][to.c] !== null) return false;
    if (!this.isConnected(from.r, from.c, to.r, to.c)) return false;

    this.history.push(this.cloneState());

    const color = this.turn;
    const opp = color === 'B' ? 'R' : 'B';

    // Move piece
    this.board[to.r][to.c] = color;
    this.board[from.r][from.c] = null;

    // 1. Process Gánh
    const ganhPieces = this.checkGanh(to.r, to.c, color);
    ganhPieces.forEach(p => {
      this.board[p.r][p.c] = color;
    });
    this.lastGanh = ganhPieces;

    // 2. Process Vây
    const vayPieces = this.checkVay(color);
    vayPieces.forEach(p => {
      this.board[p.r][p.c] = color;
    });
    this.lastVay = vayPieces;

    // Check game over
    const counts = this.getCounts();
    const oppMoves = this.getAllLegalMoves(opp);

    if (counts[opp] === 0 || oppMoves.length === 0) {
      this.isGameOver = true;
      this.winner = color;
    } else {
      this.turn = opp;
    }

    return {
      success: true,
      ganhPieces,
      vayPieces,
      counts,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  getCounts() {
    let b = 0, r = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.board[i][j] === 'B') b++;
        else if (this.board[i][j] === 'R') r++;
      }
    }
    return { B: b, R: r };
  }

  evaluate(color) {
    const opp = color === 'B' ? 'R' : 'B';
    const counts = this.getCounts();
    const pieceScore = (counts[color] - counts[opp]) * 100;
    const mobility = this.getAllLegalMoves(color).length - this.getAllLegalMoves(opp).length;
    return pieceScore + mobility * 10;
  }

  getBestMove(difficulty = 'hard') {
    const moves = this.getAllLegalMoves(this.turn);
    if (moves.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.6) {
        return moves[Math.floor(Math.random() * moves.length)];
      }
    }

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      const state = this.cloneState();
      this.makeMove(move.from, move.to);
      const score = this.evaluate(state.turn);
      this.restoreState(state);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }
}
