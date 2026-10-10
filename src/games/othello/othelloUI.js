// Othello (Cờ Lật / Reversi) UI Controller
import { OthelloGame } from './othelloEngine.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import { achievements } from '../../state/achievements.js';
import confetti from 'canvas-confetti';

export class OthelloUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new OthelloGame();
    this.isAiThinking = false;

    this.render();
  }

  reset() {
    this.game.reset();
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
    sounds.playUndo();
    this.renderBoard();
    this.updateStatus();
  }

  render() {
    const counts = this.game.getCounts();
    this.container.innerHTML = `
      <div class="othello-wrapper">
        <!-- Top Player (White) -->
        <div class="player-bar top-player" id="oth-top-player">
          <div class="player-info">
            <span class="player-avatar">⚪</span>
            <div>
              <div class="player-name">Quân Trắng ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-score" id="oth-white-count">Số quân: <strong>${counts.W}</strong></div>
            </div>
          </div>
          <div class="player-turn-indicator" id="oth-white-turn">Chờ lượt</div>
        </div>

        <!-- 8x8 Othello Grid -->
        <div class="othello-board-container">
          <div class="othello-board" id="othello-board"></div>
        </div>

        <!-- Bottom Player (Black) -->
        <div class="player-bar bottom-player" id="oth-bottom-player">
          <div class="player-info">
            <span class="player-avatar">⚫</span>
            <div>
              <div class="player-name">Quân Đen (Bạn / Người chơi 1)</div>
              <div class="player-score" id="oth-black-count">Số quân: <strong>${counts.B}</strong></div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="oth-black-turn">Lượt đi</div>
        </div>
      </div>
    `;

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const boardEl = document.getElementById('othello-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const validMoves = this.game.getValidMoves(this.game.turn);
    const starPoints = [{ r: 2, c: 2 }, { r: 2, c: 5 }, { r: 5, c: 2 }, { r: 5, c: 5 }];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'othello-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Guide dot
        if (starPoints.some(p => p.r === r && p.c === c)) {
          const dot = document.createElement('div');
          dot.className = 'oth-guide-dot';
          cell.appendChild(dot);
        }

        // Disc if present
        const disc = this.game.board[r][c];
        if (disc) {
          const discEl = document.createElement('div');
          discEl.className = `othello-disc disc-${disc.toLowerCase()}`;
          cell.appendChild(discEl);
        }

        // Valid move ghost preview
        const valid = validMoves.find(m => m.r === r && m.c === c);
        if (valid && (!gameState.mode === 'ai' || this.game.turn === 'B')) {
          const hint = document.createElement('div');
          hint.className = 'othello-valid-hint';
          hint.title = `Lật ${valid.flips.length} quân`;
          hint.textContent = valid.flips.length;
          cell.appendChild(hint);
        }

        cell.addEventListener('click', () => this.handleCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }

    this.updateCounts();
  }

  updateCounts() {
    const counts = this.game.getCounts();
    const bCount = document.getElementById('oth-black-count');
    const wCount = document.getElementById('oth-white-count');
    if (bCount) bCount.innerHTML = `Số quân: <strong>${counts.B}</strong>`;
    if (wCount) wCount.innerHTML = `Số quân: <strong>${counts.W}</strong>`;
  }

  async handleCellClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn === 'W') return;

    const validMoves = this.game.getValidMoves(this.game.turn);
    if (!validMoves.some(m => m.r === r && m.c === c)) return;

    await this.executeMove(r, c);
  }

  async executeMove(r, c) {
    const result = this.game.makeMove(r, c);
    if (!result || !result.success) return;

    sounds.playFlip();

    this.renderBoard();
    this.updateStatus();

    if (result.isGameOver) {
      this.handleGameOver(result.winner);
      return;
    }

    if (result.passedLastTurn) {
      sounds.playCheck();
      // Show pass notification briefly
      if (this.onStatusChange) {
        this.onStatusChange(`Đối phương không có nước đi hợp lệ! Lượt chuyển lại cho ${this.game.turn === 'B' ? 'Quân Đen' : 'Quân Trắng'}.`, false);
      }
    }

    if (gameState.mode === 'ai' && this.game.turn === 'W') {
      this.triggerAiMove();
    }
  }

  async triggerAiMove() {
    this.isAiThinking = true;
    this.updateStatus();

    await new Promise(r => setTimeout(r, 450));

    const aiMove = this.game.getBestMove(gameState.difficulty);
    this.isAiThinking = false;

    if (aiMove) {
      await this.executeMove(aiMove.r, aiMove.c);
    }
  }

  showHint() {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn !== 'B') return;

    const best = this.game.getBestMove('hard');
    if (!best) return;

    sounds.playCheck();
    if (this.onStatusChange) {
      this.onStatusChange(`💡 Mách nước Cờ Lật: Đặt quân vào hàng ${best.r + 1}, cột ${best.c + 1} để lật được nhiều quân nhất!`, false);
    }
  }

  handleGameOver(winner) {
    const counts = this.game.getCounts();
    if (winner === 'B') {
      sounds.playWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      gameState.recordGameResult('othello', 'win');
      achievements.unlock('first_win');
      achievements.unlock('othello_win');
      if (gameState.difficulty === 'hard') achievements.unlock('hard_ai_win');
      if (gameState.timeControl > 0) achievements.unlock('timed_win');
    } else if (winner === 'W') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('othello', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('othello', 'win');
        achievements.unlock('first_win');
      }
    } else {
      gameState.recordGameResult('othello', 'draw');
    }
    this.updateStatus();
  }

  updateStatus() {
    const bTurnEl = document.getElementById('oth-black-turn');
    const wTurnEl = document.getElementById('oth-white-turn');
    const counts = this.game.getCounts();

    if (this.game.isGameOver) {
      const msg = this.game.winner === 'draw'
        ? `Hòa cờ! Tỉ số: Đen ${counts.B} - Trắng ${counts.W}`
        : `Kết thúc! ${this.game.winner === 'B' ? 'Quân Đen' : 'Quân Trắng'} chiến thắng! (Đen: ${counts.B} - Trắng: ${counts.W}) 🏆`;
      if (this.onStatusChange) this.onStatusChange(msg, true);
      if (bTurnEl) bTurnEl.textContent = 'Kết thúc';
      if (wTurnEl) wTurnEl.textContent = 'Kết thúc';
      return;
    }

    if (this.isAiThinking) {
      if (wTurnEl) {
        wTurnEl.textContent = 'AI đang nghĩ... 🤔';
        wTurnEl.classList.add('thinking');
      }
      if (this.onStatusChange) this.onStatusChange('Máy AI đang cân nhắc nước lật cờ...', false);
      return;
    }

    const isB = this.game.turn === 'B';
    if (bTurnEl) {
      bTurnEl.textContent = isB ? 'Lượt đi' : 'Chờ';
      bTurnEl.className = `player-turn-indicator ${isB ? 'active' : ''}`;
    }
    if (wTurnEl) {
      wTurnEl.textContent = !isB ? 'Lượt đi' : 'Chờ';
      wTurnEl.className = `player-turn-indicator ${!isB ? 'active' : ''}`;
    }

    const turnText = isB
      ? `Lượt Quân Đen (Bạn) • ${counts.B} vs ${counts.W}`
      : `Lượt Quân Trắng ${gameState.mode === 'ai' ? '(Máy)' : ''} • ${counts.B} vs ${counts.W}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
