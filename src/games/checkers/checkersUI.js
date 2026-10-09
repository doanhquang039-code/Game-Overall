// Checkers (Cờ Đam) UI Controller
import { CheckersGame } from './checkersEngine.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import confetti from 'canvas-confetti';

export class CheckersUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new CheckersGame();
    this.selectedSquare = null; // {r, c}
    this.legalMoves = [];
    this.isAiThinking = false;

    this.render();
  }

  reset() {
    this.game.reset();
    this.selectedSquare = null;
    this.legalMoves = [];
    this.isAiThinking = false;
    this.renderBoard();
    this.updateStatus();
  }

  undo() {
    if (this.isAiThinking) return;
    if (gameState.mode === 'ai') {
      this.game.undo();
      this.game.undo();
    } else {
      this.game.undo();
    }
    this.selectedSquare = null;
    this.legalMoves = [];
    sounds.playUndo();
    this.renderBoard();
    this.updateStatus();
  }

  render() {
    const counts = this.game.getCounts();
    this.container.innerHTML = `
      <div class="checkers-wrapper">
        <!-- Top Player (Black) -->
        <div class="player-bar top-player" id="chk-top-player">
          <div class="player-info">
            <span class="player-avatar">⚫</span>
            <div>
              <div class="player-name">Quân Đen ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-score" id="chk-black-count">Số quân: <strong>${counts.B}</strong></div>
            </div>
          </div>
          <div class="player-turn-indicator" id="chk-black-turn">Chờ lượt</div>
        </div>

        <!-- 8x8 Checkers Board -->
        <div class="checkers-board-container">
          <div class="checkers-board" id="checkers-board"></div>
        </div>

        <!-- Bottom Player (White) -->
        <div class="player-bar bottom-player" id="chk-bottom-player">
          <div class="player-info">
            <span class="player-avatar">🔴</span>
            <div>
              <div class="player-name">Quân Đỏ/Trắng (Bạn / Người chơi 1)</div>
              <div class="player-score" id="chk-white-count">Số quân: <strong>${counts.W}</strong></div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="chk-white-turn">Lượt đi</div>
        </div>
      </div>
    `;

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const boardEl = document.getElementById('checkers-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        const isDark = (r + c) % 2 === 1;
        cell.className = `checkers-cell ${isDark ? 'dark' : 'light'}`;
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Selection
        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          cell.classList.add('selected');
        }

        // Legal move destination
        const move = this.legalMoves.find(m => m.to.r === r && m.to.c === c);
        if (move) {
          if (move.isJump) {
            cell.classList.add('has-jump');
          } else {
            cell.classList.add('has-move');
          }
        }

        // Piece
        const piece = this.game.board[r][c];
        if (piece) {
          const pieceEl = document.createElement('div');
          const isWhite = piece[0] === 'w';
          const isKing = piece.length === 2;
          pieceEl.className = `checkers-piece piece-${isWhite ? 'white' : 'black'} ${isKing ? 'king' : ''}`;
          if (isKing) {
            pieceEl.innerHTML = '<span class="king-crown">👑</span>';
          }
          cell.appendChild(pieceEl);
        }

        cell.addEventListener('click', () => this.handleCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }

    this.updateCounts();
  }

  updateCounts() {
    const counts = this.game.getCounts();
    const bEl = document.getElementById('chk-black-count');
    const wEl = document.getElementById('chk-white-count');
    if (bEl) bEl.innerHTML = `Số quân: <strong>${counts.B}</strong>`;
    if (wEl) wEl.innerHTML = `Số quân: <strong>${counts.W}</strong>`;
  }

  async handleCellClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn === 'b') return;

    // Click destination
    const matchedMove = this.legalMoves.find(m => m.to.r === r && m.to.c === c);
    if (matchedMove) {
      await this.executeMove(matchedMove);
      return;
    }

    // Select piece
    const piece = this.game.board[r][c];
    if (piece && piece[0] === this.game.turn) {
      this.selectedSquare = { r, c };
      this.legalMoves = this.game.getLegalMoves(r, c);
    } else {
      this.selectedSquare = null;
      this.legalMoves = [];
    }

    this.renderBoard();
  }

  async executeMove(move) {
    this.selectedSquare = null;
    this.legalMoves = [];

    const result = this.game.makeMove(move);
    if (!result || !result.success) return;

    if (result.isJump) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    this.renderBoard();
    this.updateStatus();

    if (result.isGameOver) {
      this.handleGameOver(result.winner);
      return;
    }

    // If can multi-jump with same piece, auto select and show next jumps
    if (result.canMultiJump) {
      this.selectedSquare = { r: move.to.r, c: move.to.c };
      this.legalMoves = this.game.getJumpsForPiece(move.to.r, move.to.c);
      this.renderBoard();
      return;
    }

    if (gameState.mode === 'ai' && this.game.turn === 'b') {
      this.triggerAiMove();
    }
  }

  async triggerAiMove() {
    this.isAiThinking = true;
    this.updateStatus();

    await new Promise(r => setTimeout(r, 450));

    let aiMove = this.game.getBestMove(gameState.difficulty);
    this.isAiThinking = false;

    while (aiMove) {
      const res = this.game.makeMove(aiMove);
      if (res.isJump) sounds.playCapture();
      else sounds.playMove();

      this.renderBoard();
      this.updateStatus();

      if (res.isGameOver) {
        this.handleGameOver(res.winner);
        return;
      }

      if (res.canMultiJump) {
        await new Promise(r => setTimeout(r, 300));
        const multiJumps = this.game.getJumpsForPiece(aiMove.to.r, aiMove.to.c);
        aiMove = multiJumps[0] || null;
      } else {
        break;
      }
    }
  }

  handleGameOver(winner) {
    if (winner === 'w') {
      sounds.playWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      gameState.recordGameResult('checkers', 'win');
    } else if (winner === 'b') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('checkers', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('checkers', 'win');
      }
    } else {
      gameState.recordGameResult('checkers', 'draw');
    }
    this.updateStatus();
  }

  updateStatus() {
    const wTurnEl = document.getElementById('chk-white-turn');
    const bTurnEl = document.getElementById('chk-black-turn');
    const counts = this.game.getCounts();

    if (this.game.isGameOver) {
      const msg = `Hết ván cờ! ${this.game.winner === 'w' ? 'Quân Đỏ/Trắng' : 'Quân Đen'} chiến thắng vang dội! 🏆`;
      if (this.onStatusChange) this.onStatusChange(msg, true);
      if (wTurnEl) wTurnEl.textContent = 'Kết thúc';
      if (bTurnEl) bTurnEl.textContent = 'Kết thúc';
      return;
    }

    if (this.isAiThinking) {
      if (bTurnEl) {
        bTurnEl.textContent = 'AI đang nghĩ... 🤔';
        bTurnEl.classList.add('thinking');
      }
      if (this.onStatusChange) this.onStatusChange('Máy AI đang tính toán nước nhảy bắt...', false);
      return;
    }

    const isW = this.game.turn === 'w';
    if (wTurnEl) {
      wTurnEl.textContent = isW ? 'Lượt đi' : 'Chờ';
      wTurnEl.className = `player-turn-indicator ${isW ? 'active' : ''}`;
    }
    if (bTurnEl) {
      bTurnEl.textContent = !isW ? 'Lượt đi' : 'Chờ';
      bTurnEl.className = `player-turn-indicator ${!isW ? 'active' : ''}`;
    }

    const turnText = isW
      ? `Lượt Quân Đỏ/Trắng (Bạn) • ${counts.W} vs ${counts.B}`
      : `Lượt Quân Đen ${gameState.mode === 'ai' ? '(Máy)' : ''} • ${counts.W} vs ${counts.B}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
