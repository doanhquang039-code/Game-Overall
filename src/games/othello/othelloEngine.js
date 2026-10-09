// Othello / Reversi Engine with Board Weightings & Heuristic AI

export class OthelloGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    // Standard starting positions
    this.board[3][3] = 'W';
    this.board[3][4] = 'B';
    this.board[4][3] = 'B';
    this.board[4][4] = 'W';

    this.turn = 'B'; // Black moves first
    this.history = [];
    this.isGameOver = false;
    this.winner = null;
    this.passedLastTurn = false;
  }

  cloneState() {
    return {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      isGameOver: this.isGameOver,
      winner: this.winner,
      passedLastTurn: this.passedLastTurn
    };
  }

  restoreState(state) {
    this.board = state.board.map(r => [...r]);
    this.turn = state.turn;
    this.isGameOver = state.isGameOver;
    this.winner = state.winner;
    this.passedLastTurn = state.passedLastTurn;
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

  getFlips(r, c, color) {
    if (!this.isInside(r, c) || this.board[r][c] !== null) return [];
    const opp = color === 'B' ? 'W' : 'B';
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    const totalFlips = [];

    for (const [dr, dc] of directions) {
      let step = 1;
      const potential = [];
      while (true) {
        const nr = r + dr * step, nc = c + dc * step;
        if (!this.isInside(nr, nc)) break;
        const cell = this.board[nr][nc];
        if (cell === opp) {
          potential.push({ r: nr, c: nc });
        } else if (cell === color) {
          if (potential.length > 0) {
            totalFlips.push(...potential);
          }
          break;
        } else {
          break;
        }
        step++;
      }
    }

    return totalFlips;
  }

  getValidMoves(color = this.turn) {
    const valid = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === null) {
          const flips = this.getFlips(r, c, color);
          if (flips.length > 0) {
            valid.push({ r, c, flips });
          }
        }
      }
    }
    return valid;
  }

  getCounts() {
    let b = 0, w = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === 'B') b++;
        else if (this.board[r][c] === 'W') w++;
      }
    }
    return { B: b, W: w };
  }

  makeMove(r, c) {
    if (this.isGameOver) return false;
    const flips = this.getFlips(r, c, this.turn);
    if (flips.length === 0) return false;

    this.history.push(this.cloneState());

    // Place and flip
    this.board[r][c] = this.turn;
    flips.forEach(p => {
      this.board[p.r][p.c] = this.turn;
    });

    const opp = this.turn === 'B' ? 'W' : 'B';
    const oppMoves = this.getValidMoves(opp);

    if (oppMoves.length > 0) {
      this.turn = opp;
      this.passedLastTurn = false;
    } else {
      // Opponent must pass
      const myNextMoves = this.getValidMoves(this.turn);
      if (myNextMoves.length === 0) {
        // Both have no moves: GAME OVER
        this.isGameOver = true;
        const { B, W } = this.getCounts();
        if (B > W) this.winner = 'B';
        else if (W > B) this.winner = 'W';
        else this.winner = 'draw';
      } else {
        this.passedLastTurn = true;
        // Turn stays same player
      }
    }

    return {
      success: true,
      flips,
      counts: this.getCounts(),
      isGameOver: this.isGameOver,
      winner: this.winner,
      passedLastTurn: this.passedLastTurn
    };
  }

  // Positional weighting matrix for Othello AI
  static POSITION_WEIGHTS = [
    [ 120, -20,  20,   5,   5,  20, -20,  120 ],
    [ -20, -40,  -5,  -5,  -5,  -5, -40,  -20 ],
    [  20,  -5,  15,   3,   3,  15,  -5,   20 ],
    [   5,  -5,   3,   3,   3,   3,  -5,    5 ],
    [   5,  -5,   3,   3,   3,   3,  -5,    5 ],
    [  20,  -5,  15,   3,   3,  15,  -5,   20 ],
    [ -20, -40,  -5,  -5,  -5,  -5, -40,  -20 ],
    [ 120, -20,  20,   5,   5,  20, -20,  120 ]
  ];

  evaluate(color) {
    const opp = color === 'B' ? 'W' : 'B';
    let myScore = 0;
    let oppScore = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece === color) {
          myScore += OthelloGame.POSITION_WEIGHTS[r][c];
        } else if (piece === opp) {
          oppScore += OthelloGame.POSITION_WEIGHTS[r][c];
        }
      }
    }

    const myMobility = this.getValidMoves(color).length;
    const oppMobility = this.getValidMoves(opp).length;

    return (myScore - oppScore) + (myMobility - oppMobility) * 10;
  }

  getBestMove(difficulty = 'hard') {
    const valid = this.getValidMoves(this.turn);
    if (valid.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.6) {
        return valid[Math.floor(Math.random() * valid.length)];
      }
    }

    let bestScore = -Infinity;
    let bestMove = valid[0];

    for (const move of valid) {
      const state = this.cloneState();
      this.makeMove(move.r, move.c);
      // Minimax 1-2 step lookahead
      let score = this.evaluate(state.turn);
      if (difficulty === 'hard') {
        const oppMoves = this.getValidMoves(this.turn);
        let worstOpp = 0;
        if (oppMoves.length > 0) {
          worstOpp = Math.max(...oppMoves.map(m => m.flips.length));
        }
        score -= worstOpp * 5;
      }
      this.restoreState(state);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }
}
