// Go / Weiqi (Cờ Vây 9x9) Engine with Liberties, Captures, Ko Rule & AI

export const GO_BOARD_SIZE = 9;

export class GoGame {
  constructor(size = GO_BOARD_SIZE) {
    this.size = size;
    this.reset();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
    this.turn = 'B'; // Black moves first
    this.captures = { B: 0, W: 0 }; // Captured opponent stones
    this.history = [];
    this.consecutivePasses = 0;
    this.isGameOver = false;
    this.winner = null;
    this.koPosition = null; // Board hash or previous board state
  }

  cloneBoard(board = this.board) {
    return board.map(row => [...row]);
  }

  cloneState() {
    return {
      board: this.cloneBoard(),
      turn: this.turn,
      captures: { ...this.captures },
      consecutivePasses: this.consecutivePasses,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  restoreState(state) {
    this.board = this.cloneBoard(state.board);
    this.turn = state.turn;
    this.captures = { ...state.captures };
    this.consecutivePasses = state.consecutivePasses;
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
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  getAdjacent(r, c) {
    const adj = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (this.isInside(nr, nc)) adj.push({ r: nr, c: nc });
    }
    return adj;
  }

  // Get connected stone group and its liberties
  getGroup(r, c, board = this.board) {
    const color = board[r][c];
    if (!color) return null;

    const group = [];
    const liberties = new Set();
    const visited = Array(this.size).fill(false).map(() => Array(this.size).fill(false));
    const queue = [{ r, c }];
    visited[r][c] = true;

    while (queue.length > 0) {
      const curr = queue.shift();
      group.push(curr);

      const neighbors = this.getAdjacent(curr.r, curr.c);
      for (const n of neighbors) {
        const neighborVal = board[n.r][n.c];
        if (neighborVal === null) {
          liberties.add(`${n.r},${n.c}`);
        } else if (neighborVal === color && !visited[n.r][n.c]) {
          visited[n.r][n.c] = true;
          queue.push(n);
        }
      }
    }

    return {
      color,
      stones: group,
      libertiesCount: liberties.size,
      libertiesSet: liberties
    };
  }

  // Check if a move is legal (non-suicidal, obeys Ko)
  isMoveLegal(r, c, color = this.turn) {
    if (!this.isInside(r, c) || this.board[r][c] !== null || this.isGameOver) {
      return false;
    }

    const opp = color === 'B' ? 'W' : 'B';
    const tempBoard = this.cloneBoard();
    tempBoard[r][c] = color;

    // Check if move captures any adjacent opponent group
    let capturedAny = false;
    const neighbors = this.getAdjacent(r, c);
    for (const n of neighbors) {
      if (tempBoard[n.r][n.c] === opp) {
        const oppGroup = this.getGroup(n.r, n.c, tempBoard);
        if (oppGroup && oppGroup.libertiesCount === 0) {
          capturedAny = true;
          oppGroup.stones.forEach(s => { tempBoard[s.r][s.c] = null; });
        }
      }
    }

    // Check suicide rule
    const myGroup = this.getGroup(r, c, tempBoard);
    if (!capturedAny && myGroup && myGroup.libertiesCount === 0) {
      return false; // Suicide move is forbidden
    }

    // Check Ko rule (prevent repeating previous board position)
    if (this.history.length > 0) {
      const prevBoard = this.history[this.history.length - 1].board;
      let identical = true;
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (tempBoard[i][j] !== prevBoard[i][j]) {
            identical = false;
            break;
          }
        }
        if (!identical) break;
      }
      if (identical) return false; // Ko forbidden
    }

    return true;
  }

  getLegalMoves(color = this.turn) {
    const moves = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isMoveLegal(r, c, color)) {
          moves.push({ r, c });
        }
      }
    }
    return moves;
  }

  makeMove(r, c) {
    if (!this.isMoveLegal(r, c, this.turn)) return false;

    this.history.push(this.cloneState());
    this.consecutivePasses = 0;

    const color = this.turn;
    const opp = color === 'B' ? 'W' : 'B';

    this.board[r][c] = color;

    // Capture dead opponent stones
    let capturedStones = [];
    const neighbors = this.getAdjacent(r, c);
    for (const n of neighbors) {
      if (this.board[n.r][n.c] === opp) {
        const oppGroup = this.getGroup(n.r, n.c);
        if (oppGroup && oppGroup.libertiesCount === 0) {
          capturedStones.push(...oppGroup.stones);
          oppGroup.stones.forEach(s => { this.board[s.r][s.c] = null; });
        }
      }
    }

    this.captures[color] += capturedStones.length;
    this.turn = opp;

    return {
      success: true,
      captured: capturedStones,
      capturesTotal: { ...this.captures },
      isGameOver: this.isGameOver
    };
  }

  pass() {
    this.history.push(this.cloneState());
    this.consecutivePasses++;

    if (this.consecutivePasses >= 2) {
      this.isGameOver = true;
      this.calculateTerritoryAndWinner();
    } else {
      this.turn = this.turn === 'B' ? 'W' : 'B';
    }

    return {
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  calculateTerritoryAndWinner() {
    // Basic territory count
    let bTerritory = this.captures.B;
    let wTerritory = this.captures.W + 5.5; // Komi for White

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 'B') bTerritory++;
        else if (this.board[r][c] === 'W') wTerritory++;
      }
    }

    this.winner = bTerritory > wTerritory ? 'B' : 'W';
    return { bTerritory, wTerritory, winner: this.winner };
  }

  getBestMove(difficulty = 'medium') {
    const legal = this.getLegalMoves(this.turn);
    if (legal.length === 0) return null;

    if (difficulty === 'easy') {
      return legal[Math.floor(Math.random() * legal.length)];
    }

    const color = this.turn;
    const opp = color === 'B' ? 'W' : 'B';

    let bestScore = -Infinity;
    let bestMove = legal[0];

    for (const m of legal) {
      let score = 0;
      // Bonus: capturing opponent stones
      const neighbors = this.getAdjacent(m.r, m.c);
      for (const n of neighbors) {
        if (this.board[n.r][n.c] === opp) {
          const g = this.getGroup(n.r, n.c);
          if (g && g.libertiesCount === 1) score += 200; // Atari kill!
        }
      }

      // Bonus: central influence
      const distFromCenter = Math.abs(m.r - 4) + Math.abs(m.c - 4);
      score -= distFromCenter * 5;

      // Bonus: not playing on first line edge too early
      if (m.r === 0 || m.r === 8 || m.c === 0 || m.c === 8) {
        score -= 20;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }

    return bestMove;
  }
}
