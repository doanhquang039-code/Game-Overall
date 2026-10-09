// International Chess Engine with Full Rules & AI

export const INITIAL_CHESS_BOARD = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

// Piece values & Piece-Square Tables
const PIECE_VALUES = {
  P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000
};

const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

export class ChessGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = INITIAL_CHESS_BOARD.map(row => [...row]);
    this.turn = 'w'; // 'w' or 'b'
    this.castling = {
      wK: true, wQ: true,
      bK: true, bQ: true
    };
    this.enPassant = null; // {r, c}
    this.history = []; // stack of board states & moves
    this.capturedPieces = { w: [], b: [] }; // captured by w, captured by b
    this.isGameOver = false;
    this.winner = null;
    this.inCheck = false;
  }

  cloneState() {
    return {
      board: this.board.map(r => [...r]),
      turn: this.turn,
      castling: { ...this.castling },
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      capturedPieces: {
        w: [...this.capturedPieces.w],
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
    this.castling = { ...state.castling };
    this.enPassant = state.enPassant ? { ...state.enPassant } : null;
    this.capturedPieces = {
      w: [...state.capturedPieces.w],
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
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  getPiece(r, c) {
    if (!this.isInside(r, c)) return null;
    return this.board[r][c];
  }

  findKing(board, color) {
    const kingCode = color + 'K';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === kingCode) return { r, c };
      }
    }
    return null;
  }

  // Check if square (r, c) is attacked by opponent of 'defenderColor'
  isSquareAttacked(board, r, c, defenderColor) {
    const oppColor = defenderColor === 'w' ? 'b' : 'w';

    // 1. Knight attacks
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr, nc = c + dc;
      if (this.isInside(nr, nc) && board[nr][nc] === oppColor + 'N') return true;
    }

    // 2. Pawn attacks
    const pawnDir = defenderColor === 'w' ? -1 : 1;
    for (const dc of [-1, 1]) {
      const nr = r + pawnDir, nc = c + dc;
      if (this.isInside(nr, nc) && board[nr][nc] === oppColor + 'P') return true;
    }

    // 3. King adjacent attacks
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (this.isInside(nr, nc) && board[nr][nc] === oppColor + 'K') return true;
      }
    }

    // 4. Orthogonal lines (Rook / Queen)
    const ortho = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of ortho) {
      let step = 1;
      while (true) {
        const nr = r + dr * step, nc = c + dc * step;
        if (!this.isInside(nr, nc)) break;
        const p = board[nr][nc];
        if (p) {
          if (p === oppColor + 'R' || p === oppColor + 'Q') return true;
          break;
        }
        step++;
      }
    }

    // 5. Diagonal lines (Bishop / Queen)
    const diag = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diag) {
      let step = 1;
      while (true) {
        const nr = r + dr * step, nc = c + dc * step;
        if (!this.isInside(nr, nc)) break;
        const p = board[nr][nc];
        if (p) {
          if (p === oppColor + 'B' || p === oppColor + 'Q') return true;
          break;
        }
        step++;
      }
    }

    return false;
  }

  isCheck(board, color) {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return false;
    return this.isSquareAttacked(board, kingPos.r, kingPos.c, color);
  }

  // Generate pseudo-legal moves for square (fromR, fromC)
  getPseudoLegalMoves(fromR, fromC) {
    const piece = this.board[fromR][fromC];
    if (!piece) return [];
    const color = piece[0];
    const type = piece[1];
    const moves = [];

    const addMove = (toR, toC, isEnPassant = false, isCastling = null) => {
      moves.push({
        from: { r: fromR, c: fromC },
        to: { r: toR, c: toC },
        piece,
        captured: this.board[toR][toC],
        isEnPassant,
        isCastling
      });
    };

    if (type === 'P') {
      const dir = color === 'w' ? -1 : 1;
      const startRank = color === 'w' ? 6 : 1;

      // 1 square forward
      const f1R = fromR + dir;
      if (this.isInside(f1R, fromC) && !this.board[f1R][fromC]) {
        addMove(f1R, fromC);

        // 2 squares forward from start
        const f2R = fromR + dir * 2;
        if (fromR === startRank && !this.board[f2R][fromC]) {
          addMove(f2R, fromC);
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const toR = fromR + dir;
        const toC = fromC + dc;
        if (this.isInside(toR, toC)) {
          const target = this.board[toR][toC];
          if (target && target[0] !== color) {
            addMove(toR, toC);
          } else if (this.enPassant && this.enPassant.r === toR && this.enPassant.c === toC) {
            addMove(toR, toC, true);
          }
        }
      }
    } else if (type === 'N') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of offsets) {
        const toR = fromR + dr, toC = fromC + dc;
        if (this.isInside(toR, toC)) {
          const target = this.board[toR][toC];
          if (!target || target[0] !== color) {
            addMove(toR, toC);
          }
        }
      }
    } else if (type === 'B' || type === 'R' || type === 'Q') {
      const dirs = [];
      if (type === 'B' || type === 'Q') {
        dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (type === 'R' || type === 'Q') {
        dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }
      for (const [dr, dc] of dirs) {
        let step = 1;
        while (true) {
          const toR = fromR + dr * step, toC = fromC + dc * step;
          if (!this.isInside(toR, toC)) break;
          const target = this.board[toR][toC];
          if (!target) {
            addMove(toR, toC);
          } else {
            if (target[0] !== color) addMove(toR, toC);
            break;
          }
          step++;
        }
      }
    } else if (type === 'K') {
      // 1 square all around
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const toR = fromR + dr, toC = fromC + dc;
          if (this.isInside(toR, toC)) {
            const target = this.board[toR][toC];
            if (!target || target[0] !== color) {
              addMove(toR, toC);
            }
          }
        }
      }

      // Castling
      const rank = color === 'w' ? 7 : 0;
      if (fromR === rank && fromC === 4 && !this.isCheck(this.board, color)) {
        // King-side
        const kRight = color === 'w' ? this.castling.wK : this.castling.bK;
        if (kRight && !this.board[rank][5] && !this.board[rank][6]) {
          if (!this.isSquareAttacked(this.board, rank, 5, color) &&
              !this.isSquareAttacked(this.board, rank, 6, color)) {
            addMove(rank, 6, false, 'K');
          }
        }
        // Queen-side
        const qRight = color === 'w' ? this.castling.wQ : this.castling.bQ;
        if (qRight && !this.board[rank][3] && !this.board[rank][2] && !this.board[rank][1]) {
          if (!this.isSquareAttacked(this.board, rank, 3, color) &&
              !this.isSquareAttacked(this.board, rank, 2, color)) {
            addMove(rank, 2, false, 'Q');
          }
        }
      }
    }

    return moves;
  }

  // Filter moves to strictly legal ones (no self-check)
  getLegalMoves(fromR, fromC) {
    const piece = this.board[fromR][fromC];
    if (!piece || piece[0] !== this.turn) return [];

    const pseudo = this.getPseudoLegalMoves(fromR, fromC);
    return pseudo.filter(m => this.isMoveSafe(m));
  }

  isMoveSafe(move) {
    const copyBoard = this.board.map(r => [...r]);
    const { from, to, piece, isEnPassant, isCastling } = move;

    copyBoard[to.r][to.c] = piece;
    copyBoard[from.r][from.c] = null;

    if (isEnPassant) {
      const epCapR = piece[0] === 'w' ? to.r + 1 : to.r - 1;
      copyBoard[epCapR][to.c] = null;
    } else if (isCastling === 'K') {
      copyBoard[from.r][5] = copyBoard[from.r][7];
      copyBoard[from.r][7] = null;
    } else if (isCastling === 'Q') {
      copyBoard[from.r][3] = copyBoard[from.r][0];
      copyBoard[from.r][0] = null;
    }

    return !this.isCheck(copyBoard, piece[0]);
  }

  getAllLegalMoves(color = this.turn) {
    const all = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
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

  makeMove(move, promotionPiece = 'Q') {
    const stateBefore = this.cloneState();
    this.history.push(stateBefore);

    const { from, to, piece, isEnPassant, isCastling } = move;
    const color = piece[0];
    const oppColor = color === 'w' ? 'b' : 'w';

    let captured = this.board[to.r][to.c];

    // En Passant
    if (isEnPassant) {
      const epCapR = color === 'w' ? to.r + 1 : to.r - 1;
      captured = this.board[epCapR][to.c];
      this.board[epCapR][to.c] = null;
    }

    // Castling rook move
    if (isCastling === 'K') {
      this.board[from.r][5] = this.board[from.r][7];
      this.board[from.r][7] = null;
    } else if (isCastling === 'Q') {
      this.board[from.r][3] = this.board[from.r][0];
      this.board[from.r][0] = null;
    }

    // Move piece
    this.board[to.r][to.c] = piece;
    this.board[from.r][from.c] = null;

    // Promotion
    const promoRank = color === 'w' ? 0 : 7;
    if (piece[1] === 'P' && to.r === promoRank) {
      this.board[to.r][to.c] = color + promotionPiece;
    }

    // Update captured
    if (captured) {
      this.capturedPieces[color].push(captured);
    }

    // Update en passant availability
    if (piece[1] === 'P' && Math.abs(to.r - from.r) === 2) {
      this.enPassant = { r: (from.r + to.r) / 2, c: from.c };
    } else {
      this.enPassant = null;
    }

    // Update castling rights
    if (piece === 'wK') {
      this.castling.wK = false;
      this.castling.wQ = false;
    } else if (piece === 'bK') {
      this.castling.bK = false;
      this.castling.bQ = false;
    } else if (piece === 'wR') {
      if (from.r === 7 && from.c === 7) this.castling.wK = false;
      if (from.r === 7 && from.c === 0) this.castling.wQ = false;
    } else if (piece === 'bR') {
      if (from.r === 0 && from.c === 7) this.castling.bK = false;
      if (from.r === 0 && from.c === 0) this.castling.bQ = false;
    }

    // If opponent rook captured on original square
    if (captured === 'wR') {
      if (to.r === 7 && to.c === 7) this.castling.wK = false;
      if (to.r === 7 && to.c === 0) this.castling.wQ = false;
    } else if (captured === 'bR') {
      if (to.r === 0 && to.c === 7) this.castling.bK = false;
      if (to.r === 0 && to.c === 0) this.castling.bQ = false;
    }

    // Switch turn
    this.turn = oppColor;
    this.inCheck = this.isCheck(this.board, this.turn);

    // Check game over
    const nextMoves = this.getAllLegalMoves(this.turn);
    if (nextMoves.length === 0) {
      this.isGameOver = true;
      if (this.inCheck) {
        this.winner = color; // Checkmate
      } else {
        this.winner = 'draw'; // Stalemate
      }
    }

    return {
      captured,
      inCheck: this.inCheck,
      isGameOver: this.isGameOver,
      winner: this.winner
    };
  }

  // AI Evaluation function
  evaluateBoard(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        const color = piece[0];
        const type = piece[1];
        let val = PIECE_VALUES[type] || 0;

        // Position tables
        if (type === 'P') {
          val += color === 'w' ? PAWN_TABLE[r][c] : PAWN_TABLE[7 - r][c];
        } else if (type === 'N') {
          val += color === 'w' ? KNIGHT_TABLE[r][c] : KNIGHT_TABLE[7 - r][c];
        } else if (type === 'B') {
          val += color === 'w' ? BISHOP_TABLE[r][c] : BISHOP_TABLE[7 - r][c];
        }

        if (color === 'w') score += val;
        else score -= val;
      }
    }
    return score;
  }

  // Minimax with Alpha-Beta
  minimax(depth, isMax, alpha, beta) {
    if (depth === 0 || this.isGameOver) {
      return this.evaluateBoard(this.board);
    }

    const legal = this.getAllLegalMoves(this.turn);
    if (legal.length === 0) {
      if (this.inCheck) {
        return isMax ? -100000 + (3 - depth) : 100000 - (3 - depth);
      }
      return 0;
    }

    if (isMax) {
      let maxEval = -Infinity;
      for (const m of legal) {
        const state = this.cloneState();
        this.makeMove(m, 'Q');
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
        this.makeMove(m, 'Q');
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
      // 70% random, 30% best
      if (Math.random() < 0.7) {
        return legal[Math.floor(Math.random() * legal.length)];
      }
    }

    const depth = difficulty === 'hard' ? 3 : 2;
    const isWhite = this.turn === 'w';
    let bestMove = legal[0];
    let bestVal = isWhite ? -Infinity : Infinity;

    // Shuffle moves slightly so AI plays varied games
    const shuffled = [...legal].sort(() => Math.random() - 0.5);

    for (const m of shuffled) {
      const state = this.cloneState();
      this.makeMove(m, 'Q');
      const val = this.minimax(depth - 1, !isWhite, -Infinity, Infinity);
      this.restoreState(state);

      if (isWhite) {
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
