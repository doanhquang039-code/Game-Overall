// Gomoku / Cờ Caro Engine with Advanced Pattern-Matching Heuristic AI

export const CARO_BOARD_SIZE = 15;

export class CaroGame {
  constructor(size = CARO_BOARD_SIZE) {
    this.size = size;
    this.reset();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
    this.turn = 'X'; // 'X' moves first, 'O' moves second
    this.history = [];
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null; // [{r, c}, ...]
  }

  isInside(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  makeMove(r, c) {
    if (this.isGameOver || !this.isInside(r, c) || this.board[r][c] !== null) {
      return false;
    }

    this.history.push({
      r, c,
      player: this.turn,
      boardSnap: this.board.map(row => [...row])
    });

    this.board[r][c] = this.turn;

    const winLine = this.checkWin(r, c, this.turn);
    if (winLine) {
      this.isGameOver = true;
      this.winner = this.turn;
      this.winningLine = winLine;
      return { win: true, winner: this.winner, winningLine: winLine };
    }

    // Check draw (board full)
    let full = true;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (!this.board[i][j]) { full = false; break; }
      }
      if (!full) break;
    }

    if (full) {
      this.isGameOver = true;
      this.winner = 'draw';
      return { win: false, draw: true };
    }

    this.turn = this.turn === 'X' ? 'O' : 'X';
    return { success: true };
  }

  undo() {
    if (this.history.length === 0) return false;
    const last = this.history.pop();
    this.board[last.r][last.c] = null;
    this.turn = last.player;
    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    return true;
  }

  checkWin(r, c, player) {
    const directions = [
      [[0, 1], [0, -1]],   // Horizontal
      [[1, 0], [-1, 0]],   // Vertical
      [[1, 1], [-1, -1]],   // Diagonal \
      [[1, -1], [-1, 1]]   // Diagonal /
    ];

    for (const [dir1, dir2] of directions) {
      const line = [{ r, c }];

      // Step along dir1
      let step = 1;
      while (true) {
        const nr = r + dir1[0] * step, nc = c + dir1[1] * step;
        if (this.isInside(nr, nc) && this.board[nr][nc] === player) {
          line.push({ r: nr, c: nc });
          step++;
        } else {
          break;
        }
      }

      // Step along dir2
      step = 1;
      while (true) {
        const nr = r + dir2[0] * step, nc = c + dir2[1] * step;
        if (this.isInside(nr, nc) && this.board[nr][nc] === player) {
          line.push({ r: nr, c: nc });
          step++;
        } else {
          break;
        }
      }

      if (line.length >= 5) {
        return line;
      }
    }

    return null;
  }

  // Get candidates (empty squares adjacent to existing stones)
  getCandidates() {
    const candidateSet = new Set();
    let hasPieces = false;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] !== null) {
          hasPieces = true;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = r + dr, nc = c + dc;
              if (this.isInside(nr, nc) && this.board[nr][nc] === null) {
                candidateSet.add(`${nr},${nc}`);
              }
            }
          }
        }
      }
    }

    if (!hasPieces) {
      // First move in center
      const mid = Math.floor(this.size / 2);
      return [{ r: mid, c: mid }];
    }

    return Array.from(candidateSet).map(s => {
      const [r, c] = s.split(',').map(Number);
      return { r, c };
    });
  }

  // Evaluate single position score for a player
  evaluateDirection(r, c, dr, dc, player) {
    const opp = player === 'X' ? 'O' : 'X';
    let count = 1;
    let openEnds = 0;

    // Check forward
    let forwardBlocked = false;
    let step = 1;
    while (step <= 4) {
      const nr = r + dr * step, nc = c + dc * step;
      if (!this.isInside(nr, nc) || this.board[nr][nc] === opp) {
        forwardBlocked = true;
        break;
      }
      if (this.board[nr][nc] === null) break;
      count++;
      step++;
    }
    if (!forwardBlocked && this.isInside(r + dr * step, c + dc * step) && this.board[r + dr * step][c + dc * step] === null) {
      openEnds++;
    }

    // Check backward
    let backwardBlocked = false;
    step = 1;
    while (step <= 4) {
      const nr = r - dr * step, nc = c - dc * step;
      if (!this.isInside(nr, nc) || this.board[nr][nc] === opp) {
        backwardBlocked = true;
        break;
      }
      if (this.board[nr][nc] === null) break;
      count++;
      step++;
    }
    if (!backwardBlocked && this.isInside(r - dr * step, c - dc * step) && this.board[r - dr * step][c - dc * step] === null) {
      openEnds++;
    }

    if (count >= 5) return 100000;
    if (count === 4) {
      if (openEnds === 2) return 15000;
      if (openEnds === 1) return 2500;
    }
    if (count === 3) {
      if (openEnds === 2) return 1500;
      if (openEnds === 1) return 200;
    }
    if (count === 2) {
      if (openEnds === 2) return 100;
      if (openEnds === 1) return 15;
    }
    return 1;
  }

  evaluateSpot(r, c, player) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let total = 0;
    for (const [dr, dc] of dirs) {
      total += this.evaluateDirection(r, c, dr, dc, player);
    }
    return total;
  }

  getBestMove(difficulty = 'hard') {
    const candidates = this.getCandidates();
    if (candidates.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.6) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    const aiPlayer = this.turn;
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const { r, c } of candidates) {
      // Temporarily place stone
      this.board[r][c] = aiPlayer;
      const attackScore = this.evaluateSpot(r, c, aiPlayer);
      this.board[r][c] = humanPlayer;
      const defendScore = this.evaluateSpot(r, c, humanPlayer);
      this.board[r][c] = null;

      // Defense weight vs attack weight
      // Prioritize blocking opponent instant 5 or open 4
      let score = attackScore + defendScore * (difficulty === 'hard' ? 1.15 : 0.85);

      if (attackScore >= 100000) score = 999999; // Instant win for AI!
      else if (defendScore >= 100000) score = 900000; // Block human instant win!

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [{ r, c }];
      } else if (score === bestScore) {
        bestMoves.push({ r, c });
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
}
