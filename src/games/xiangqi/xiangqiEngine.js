// Xiangqi (Chinese Chess / Cờ Tướng) Complete Game Engine & AI

export const INITIAL_XIANGQI_BOARD = [
  ['bR', 'bH', 'bE', 'bA', 'bK', 'bA', 'bE', 'bH', 'bR'],
  [null, null, null, null, null, null, null, null, null],
  [null, 'bC', null, null, null, null, null, 'bC', null],
  ['bP', null, 'bP', null, 'bP', null, 'bP', null, 'bP'],
  [null, null, null, null, null, null, null, null, null], // River boundary
  [null, null, null, null, null, null, null, null, null],
  ['rP', null, 'rP', null, 'rP', null, 'rP', null, 'rP'],
  [null, 'rC', null, null, null, null, null, 'rC', null],
  [null, null, null, null, null, null, null, null, null],
  ['rR', 'rH', 'rE', 'rA', 'rK', 'rA', 'rE', 'rH', 'rR']
];

export const XIANGQI_PIECE_NAMES = {
  rK: { char: '帥', vn: 'TƯỚNG', name: 'Tướng Đỏ', en: 'Red General' },
  rA: { char: '仕', vn: 'SĨ', name: 'Sĩ Đỏ', en: 'Red Advisor' },
  rE: { char: '相', vn: 'TƯỢNG', name: 'Tượng Đỏ', en: 'Red Elephant' },
  rH: { char: '傌', vn: 'MÃ', name: 'Mã Đỏ', en: 'Red Horse' },
  rR: { char: '俥', vn: 'XE', name: 'Xe Đỏ', en: 'Red Chariot' },
  rC: { char: '炮', vn: 'PHÁO', name: 'Pháo Đỏ', en: 'Red Cannon' },
  rP: { char: '兵', vn: 'BINH', name: 'Binh Đỏ', en: 'Red Soldier' },

  bK: { char: '將', vn: 'TƯỚNG', name: 'Tướng Đen', en: 'Black General' },
  bA: { char: '士', vn: 'SĨ', name: 'Sĩ Đen', en: 'Black Advisor' },
  bE: { char: '象', vn: 'TƯỢNG', name: 'Tượng Đen', en: 'Black Elephant' },
  bH: { char: '馬', vn: 'MÃ', name: 'Mã Đen', en: 'Black Horse' },
  bR: { char: '車', vn: 'XE', name: 'Xe Đen', en: 'Black Chariot' },
  bC: { char: '砲', vn: 'PHÁO', name: 'Pháo Đen', en: 'Black Cannon' },
  bP: { char: '卒', vn: 'TỐT', name: 'Tốt Đen', en: 'Black Soldier' }
};

const PIECE_VALUES = {
  K: 10000,
  R: 900,
  C: 450,
  H: 400,
  E: 200,
  A: 200,
  P: 100
};

export class XiangqiGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = INITIAL_XIANGQI_BOARD.map(row => [...row]);
    this.turn = 'r'; // 'r' (Red) moves first, 'b' (Black) moves second
    this.history = [];
    this.capturedPieces = { r: [], b: [] };
    this.isGameOver = false;
    this.winner = null;
    this.inCheck = false;
  }

  cloneState() {
    return {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      capturedPieces: {
        r: [...this.capturedPieces.r],
        b: [...this.capturedPieces.b]
      },
      isGameOver: this.isGameOver,
      winner: this.winner,
      inCheck: this.inCheck
    };
  }

  restoreState(state) {
    this.board = state.board.map(r => [...r]);
    this.turn = state.turn;
    this.capturedPieces = {
      r: [...state.capturedPieces.r],
      b: [...state.capturedPieces.b]
    };
    this.isGameOver = state.isGameOver;
    this.winner = state.winner;
    this.inCheck = state.inCheck;
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.restoreState(prev);
    return true;
  }

  isInside(r, c) {
    return r >= 0 && r < 10 && c >= 0 && c < 9;
  }

  isInPalace(r, c, color) {
    if (c < 3 || c > 5) return false;
    if (color === 'b') return r >= 0 && r <= 2;
    if (color === 'r') return r >= 7 && r <= 9;
    return false;
  }

  findKing(board, color) {
    const kCode = color + 'K';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === kCode) return { r, c };
      }
    }
    return null;
  }

  // Flying General rule: Kings cannot face each other directly on same file with no pieces between
  isFlyingGeneral(board) {
    const rK = this.findKing(board, 'r');
    const bK = this.findKing(board, 'b');
    if (!rK || !bK) return false;
    if (rK.c !== bK.c) return false;

    // Same column: check squares between bK.r and rK.r
    for (let r = bK.r + 1; r < rK.r; r++) {
      if (board[r][rK.c] !== null) return false;
    }
    return true;
  }

  getPseudoLegalMoves(fromR, fromC, board = this.board) {
    const piece = board[fromR][fromC];
    if (!piece) return [];
    const color = piece[0];
    const type = piece[1];
    const moves = [];

    const addMove = (toR, toC) => {
      if (!this.isInside(toR, toC)) return;
      const target = board[toR][toC];
      if (!target || target[0] !== color) {
        moves.push({
          from: { r: fromR, c: fromC },
          to: { r: toR, c: toC },
          piece,
          captured: target
        });
      }
    };

    if (type === 'K') {
      // General: 1 step orthogonally within palace
      const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of deltas) {
        const nr = fromR + dr, nc = fromC + dc;
        if (this.isInPalace(nr, nc, color)) {
          addMove(nr, nc);
        }
      }
    } else if (type === 'A') {
      // Advisor: 1 step diagonally within palace
      const deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of deltas) {
        const nr = fromR + dr, nc = fromC + dc;
        if (this.isInPalace(nr, nc, color)) {
          addMove(nr, nc);
        }
      }
    } else if (type === 'E') {
      // Elephant: 2 steps diagonally, cannot cross river, eye check
      const deltas = [
        { dr: -2, dc: -2, eyeR: -1, eyeC: -1 },
        { dr: -2, dc: 2, eyeR: -1, eyeC: 1 },
        { dr: 2, dc: -2, eyeR: 1, eyeC: -1 },
        { dr: 2, dc: 2, eyeR: 1, eyeC: 1 }
      ];
      for (const { dr, dc, eyeR, eyeC } of deltas) {
        const nr = fromR + dr, nc = fromC + dc;
        if (!this.isInside(nr, nc)) continue;
        // Cannot cross river: Red must stay in rows 5..9, Black in rows 0..4
        if (color === 'r' && nr < 5) continue;
        if (color === 'b' && nr > 4) continue;
        // Eye of elephant must be empty
        if (board[fromR + eyeR][fromC + eyeC] === null) {
          addMove(nr, nc);
        }
      }
    } else if (type === 'H') {
      // Horse: 8 potential steps, leg check
      const horseSteps = [
        { dr: -2, dc: -1, legR: -1, legC: 0 },
        { dr: -2, dc: 1, legR: -1, legC: 0 },
        { dr: 2, dc: -1, legR: 1, legC: 0 },
        { dr: 2, dc: 1, legR: 1, legC: 0 },
        { dr: -1, dc: -2, legR: 0, legC: -1 },
        { dr: 1, dc: -2, legR: 0, legC: -1 },
        { dr: -1, dc: 2, legR: 0, legC: 1 },
        { dr: 1, dc: 2, legR: 0, legC: 1 }
      ];
      for (const { dr, dc, legR, legC } of horseSteps) {
        const nr = fromR + dr, nc = fromC + dc;
        if (!this.isInside(nr, nc)) continue;
        // Horse leg must be clear
        if (board[fromR + legR][fromC + legC] === null) {
          addMove(nr, nc);
        }
      }
    } else if (type === 'R') {
      // Chariot: Orthogonal line
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const nr = fromR + dr * step, nc = fromC + dc * step;
          if (!this.isInside(nr, nc)) break;
          const target = board[nr][nc];
          if (!target) {
            addMove(nr, nc);
          } else {
            if (target[0] !== color) addMove(nr, nc);
            break;
          }
          step++;
        }
      }
    } else if (type === 'C') {
      // Cannon: Orthogonal move without jump, jump over 1 screen to capture
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        let screenEncountered = false;
        while (true) {
          const nr = fromR + dr * step, nc = fromC + dc * step;
          if (!this.isInside(nr, nc)) break;
          const target = board[nr][nc];
          if (!screenEncountered) {
            if (!target) {
              addMove(nr, nc);
            } else {
              screenEncountered = true; // Found screen piece
            }
          } else {
            // Already found screen piece, waiting for capture
            if (target) {
              if (target[0] !== color) {
                addMove(nr, nc);
              }
              break;
            }
          }
          step++;
        }
      }
    } else if (type === 'P') {
      // Soldier
      const forwardDir = color === 'r' ? -1 : 1;
      const crossedRiver = color === 'r' ? fromR <= 4 : fromR >= 5;

      // Always can move forward
      addMove(fromR + forwardDir, fromC);

      // Once crossed river, can move left and right
      if (crossedRiver) {
        addMove(fromR, fromC - 1);
        addMove(fromR, fromC + 1);
      }
    }

    return moves;
  }

  isCheck(board, color) {
    // Check if color's King is attacked by opponent
    const kPos = this.findKing(board, color);
    if (!kPos) return true; // Captured / invalid
    if (this.isFlyingGeneral(board)) return true;

    const oppColor = color === 'r' ? 'b' : 'r';

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = board[r][c];
        if (piece && piece[0] === oppColor) {
          const moves = this.getPseudoLegalMoves(r, c, board);
          if (moves.some(m => m.to.r === kPos.r && m.to.c === kPos.c)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isMoveSafe(move) {
    const copyBoard = this.board.map(r => [...r]);
    const { from, to, piece } = move;

    copyBoard[to.r][to.c] = piece;
    copyBoard[from.r][from.c] = null;

    // Cannot leave own King in check or face-to-face
    return !this.isCheck(copyBoard, piece[0]);
  }

  getLegalMoves(fromR, fromC) {
    const piece = this.board[fromR][fromC];
    if (!piece || piece[0] !== this.turn) return [];
    const pseudo = this.getPseudoLegalMoves(fromR, fromC);
    return pseudo.filter(m => this.isMoveSafe(m));
  }

  getAllLegalMoves(color = this.turn) {
    const all = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] && this.board[r][c][0] === color) {
          const pseudo = this.getPseudoLegalMoves(r, c);
          pseudo.forEach(m => {
            if (this.isMoveSafe(m)) all.push(m);
          });
        }
      }
    }
    return all;
  }

  makeMove(move) {
    const stateBefore = this.cloneState();
    this.history.push(stateBefore);

    const { from, to, piece } = move;
    const color = piece[0];
    const oppColor = color === 'r' ? 'b' : 'r';

    const captured = this.board[to.r][to.c];
    this.board[to.r][to.c] = piece;
    this.board[from.r][from.c] = null;

    if (captured) {
      this.capturedPieces[color].push(captured);
    }

    this.turn = oppColor;
    this.inCheck = this.isCheck(this.board, this.turn);

    const nextMoves = this.getAllLegalMoves(this.turn);
    if (nextMoves.length === 0) {
      this.isGameOver = true;
      this.winner = color; // Checkmate / Stalemate (in Xiangqi stalemate is loss for stalemated side!)
    }

    return {
      captured,
      inCheck: this.inCheck,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  // Evaluation for Xiangqi
  evaluateBoard(board) {
    let score = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        const color = piece[0];
        const type = piece[1];
        let val = PIECE_VALUES[type] || 0;

        // Position bonus for soldier crossing river
        if (type === 'P') {
          if (color === 'r' && r <= 4) val += 120; // Red soldier crossed
          if (color === 'b' && r >= 5) val += 120; // Black soldier crossed
        }
        // Central chariot bonus
        if (type === 'R' && (c >= 3 && c <= 5)) {
          val += 30;
        }

        if (color === 'r') score += val;
        else score -= val;
      }
    }
    return score;
  }

  minimax(depth, isMax, alpha, beta) {
    if (depth === 0 || this.isGameOver) {
      return this.evaluateBoard(this.board);
    }

    const legal = this.getAllLegalMoves(this.turn);
    if (legal.length === 0) {
      return isMax ? -100000 : 100000;
    }

    if (isMax) {
      let maxEval = -Infinity;
      for (const m of legal) {
        const state = this.cloneState();
        this.makeMove(m);
        const evalScore = this.minimax(depth - 1, false, alpha, beta);
        this.restoreState(state);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of legal) {
        const state = this.cloneState();
        this.makeMove(m);
        const evalScore = this.minimax(depth - 1, true, alpha, beta);
        this.restoreState(state);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  getBestMove(difficulty = 'medium') {
    const legal = this.getAllLegalMoves(this.turn);
    if (legal.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.65) {
        return legal[Math.floor(Math.random() * legal.length)];
      }
    }

    const depth = difficulty === 'hard' ? 3 : 2;
    const isRed = this.turn === 'r';
    let bestMove = legal[0];
    let bestVal = isRed ? -Infinity : Infinity;

    const shuffled = [...legal].sort(() => Math.random() - 0.5);

    for (const m of shuffled) {
      const state = this.cloneState();
      this.makeMove(m);
      const val = this.minimax(depth - 1, !isRed, -Infinity, Infinity);
      this.restoreState(state);

      if (isRed) {
        if (val > bestVal) {
          bestVal = val;
          bestMove = m;
        }
      } else {
        if (val < bestVal) {
          bestVal = val;
          bestMove = m;
        }
      }
    }

    return bestMove;
  }
}
