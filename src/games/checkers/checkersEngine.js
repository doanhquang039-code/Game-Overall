// Checkers (Classic Draughts / Cờ Đam 8x8) Engine with Jump Captures, King Promotion & AI

export class CheckersGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place Black pieces (rows 0, 1, 2) on dark squares
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          this.board[r][c] = 'b';
        }
      }
    }

    // Place White pieces (rows 5, 6, 7) on dark squares
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          this.board[r][c] = 'w';
        }
      }
    }

    this.turn = 'w'; // White/Red moves first
    this.history = [];
    this.isGameOver = false;
    this.winner = null;
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
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.restoreState(prev);
    return true;
  }

  isInside(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  // Get jump captures for a single piece
  getJumpsForPiece(r, c) {
    const piece = this.board[r][c];
    if (!piece) return [];
    const color = piece[0];
    const isKing = piece.length === 2;
    const opp = color === 'w' ? 'b' : 'w';
    const jumps = [];

    // Directions
    const dirs = [];
    if (isKing) {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    } else {
      // Normal men can jump in their forward direction (or all 4 diagonals for captures)
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dr, dc] of dirs) {
      const midR = r + dr, midC = c + dc;
      const endR = r + dr * 2, endC = c + dc * 2;

      if (this.isInside(endR, endC)) {
        const midPiece = this.board[midR][midC];
        const endPiece = this.board[endR][endC];
        if (midPiece && midPiece[0] === opp && endPiece === null) {
          jumps.push({
            from: { r, c },
            to: { r: endR, c: endC },
            captured: { r: midR, c: midC },
            isJump: true
          });
        }
      }
    }

    return jumps;
  }

  // Get regular steps for a piece
  getStepsForPiece(r, c) {
    const piece = this.board[r][c];
    if (!piece) return [];
    const color = piece[0];
    const isKing = piece.length === 2;
    const steps = [];

    const dirs = [];
    if (isKing) {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    } else {
      const forward = color === 'w' ? -1 : 1;
      dirs.push([forward, -1], [forward, 1]);
    }

    for (const [dr, dc] of dirs) {
      const toR = r + dr, toC = c + dc;
      if (this.isInside(toR, toC) && this.board[toR][toC] === null) {
        steps.push({
          from: { r, c },
          to: { r: toR, c: toC },
          isJump: false
        });
      }
    }

    return steps;
  }

  getLegalMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece || piece[0] !== this.turn) return [];

    // Check if any jump is available across board
    const allJumps = this.getAllJumps(this.turn);
    if (allJumps.length > 0) {
      return this.getJumpsForPiece(r, c);
    }

    return this.getStepsForPiece(r, c);
  }

  getAllJumps(color = this.turn) {
    const jumps = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] && this.board[r][c][0] === color) {
          jumps.push(...this.getJumpsForPiece(r, c));
        }
      }
    }
    return jumps;
  }

  getAllLegalMoves(color = this.turn) {
    const jumps = this.getAllJumps(color);
    if (jumps.length > 0) return jumps;

    const steps = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] && this.board[r][c][0] === color) {
          steps.push(...this.getStepsForPiece(r, c));
        }
      }
    }
    return steps;
  }

  makeMove(move) {
    if (this.isGameOver) return false;

    this.history.push(this.cloneState());

    const { from, to, isJump, captured } = move;
    let piece = this.board[from.r][from.c];

    this.board[to.r][to.c] = piece;
    this.board[from.r][from.c] = null;

    if (isJump && captured) {
      this.board[captured.r][captured.c] = null;
    }

    // King promotion
    const color = piece[0];
    const promoRank = color === 'w' ? 0 : 7;
    if (to.r === promoRank && piece.length === 1) {
      this.board[to.r][to.c] = color + 'K';
      piece = color + 'K';
    }

    // Check multi-jump for same piece if it just jumped
    let canMultiJump = false;
    if (isJump) {
      const nextJumps = this.getJumpsForPiece(to.r, to.c);
      if (nextJumps.length > 0) {
        canMultiJump = true;
      }
    }

    if (!canMultiJump) {
      this.turn = color === 'w' ? 'b' : 'w';
    }

    // Check game over
    const nextMoves = this.getAllLegalMoves(this.turn);
    if (nextMoves.length === 0) {
      this.isGameOver = true;
      this.winner = color;
    }

    return {
      success: true,
      isJump,
      canMultiJump,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  getCounts() {
    let w = 0, b = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) {
          if (p[0] === 'w') w++;
          else if (p[0] === 'b') b++;
        }
      }
    }
    return { W: w, B: b };
  }

  evaluate(color) {
    const opp = color === 'w' ? 'b' : 'w';
    let myScore = 0;
    let oppScore = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) continue;
        const val = p.length === 2 ? 300 : 100; // Kings worth 3x
        if (p[0] === color) myScore += val;
        else oppScore += val;
      }
    }

    return myScore - oppScore;
  }

  getBestMove(difficulty = 'medium') {
    const moves = this.getAllLegalMoves(this.turn);
    if (moves.length === 0) return null;

    if (difficulty === 'easy') {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const m of moves) {
      const state = this.cloneState();
      this.makeMove(m);
      const score = this.evaluate(state.turn);
      this.restoreState(state);

      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }

    return bestMove;
  }
}
