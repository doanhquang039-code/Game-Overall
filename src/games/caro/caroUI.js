// Gomoku (Cờ Caro) UI Controller
import { CaroGame, CARO_BOARD_SIZE } from './caroEngine.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import { achievements } from '../../state/achievements.js';
import confetti from 'canvas-confetti';

export class CaroUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new CaroGame(CARO_BOARD_SIZE);
    this.isAiThinking = false;
    this.lastMove = null;

    this.render();
  }

  reset() {
    this.game.reset();
    this.isAiThinking = false;
    this.lastMove = null;
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
    this.lastMove = this.game.history.length > 0 ? this.game.history[this.game.history.length - 1] : null;
    sounds.playUndo();
    this.renderBoard();
    this.updateStatus();
  }

  render() {
    this.container.innerHTML = `
      <div class="caro-wrapper">
        <!-- Top Player (O) -->
        <div class="player-bar top-player" id="caro-top-player">
          <div class="player-info">
            <span class="player-avatar">⚪</span>
            <div>
              <div class="player-name">Quân O (Trắng) ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-sub">Hậu thủ • 5 quân thẳng hàng</div>
            </div>
          </div>
          <div class="player-turn-indicator" id="caro-o-turn">Chờ lượt</div>
        </div>

        <!-- 15x15 Caro Board -->
        <div class="caro-board-container">
          <div class="caro-board" id="caro-board"></div>
        </div>

        <!-- Bottom Player (X) -->
        <div class="player-bar bottom-player" id="caro-bottom-player">
          <div class="player-info">
            <span class="player-avatar">⚫</span>
            <div>
              <div class="player-name">Quân X (Đen) (Bạn / Người chơi 1)</div>
              <div class="player-sub">Tiên thủ • 5 quân thẳng hàng</div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="caro-x-turn">Lượt đi</div>
        </div>
      </div>
    `;

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const boardEl = document.getElementById('caro-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const size = this.game.size;
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Center star point is at Math.floor(size / 2)
    const mid = Math.floor(size / 2);
    const starPoints = [
      { r: 3, c: 3 }, { r: 3, c: size - 4 },
      { r: mid, c: mid },
      { r: size - 4, c: 3 }, { r: size - 4, c: size - 4 }
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'caro-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Star point dot
        if (starPoints.some(p => p.r === r && p.c === c)) {
          const star = document.createElement('div');
          star.className = 'caro-star-point';
          cell.appendChild(star);
        }

        // Stone if present
        const stone = this.game.board[r][c];
        if (stone) {
          const stoneEl = document.createElement('div');
          stoneEl.className = `caro-stone stone-${stone.toLowerCase()}`;

          // Winning line glow
          if (this.game.winningLine && this.game.winningLine.some(p => p.r === r && p.c === c)) {
            stoneEl.classList.add('winning-stone');
          }

          // Last move indicator
          if (this.lastMove && this.lastMove.r === r && this.lastMove.c === c) {
            stoneEl.classList.add('last-placed');
          }

          cell.appendChild(stoneEl);
        }

        cell.addEventListener('click', () => this.handleCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  async handleCellClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn === 'O') return;
    if (this.game.board[r][c] !== null) return;

    await this.executeMove(r, c);
  }

  async executeMove(r, c) {
    const result = this.game.makeMove(r, c);
    if (!result) return;

    this.lastMove = { r, c };
    sounds.playMove();

    this.renderBoard();
    this.updateStatus();

    if (result.win) {
      this.handleGameOver(result.winner);
      return;
    } else if (result.draw) {
      this.handleGameOver('draw');
      return;
    }

    if (gameState.mode === 'ai' && this.game.turn === 'O') {
      this.triggerAiMove();
    }
  }

  async triggerAiMove() {
    this.isAiThinking = true;
    this.updateStatus();

    await new Promise(r => setTimeout(r, 400));

    const aiMove = this.game.getBestMove(gameState.difficulty);
    this.isAiThinking = false;

    if (aiMove) {
      await this.executeMove(aiMove.r, aiMove.c);
    }
  }

  showHint() {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn !== 'X') return;

    const best = this.game.getBestMove('hard');
    if (!best) return;

    sounds.playCheck();
    if (this.onStatusChange) {
      this.onStatusChange(`💡 Mách nước Caro: Nên đặt cờ vào ô hàng ${best.r + 1}, cột ${best.c + 1}!`, false);
    }
  }

  handleGameOver(winner) {
    if (winner === 'X') {
      sounds.playWin();
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
      gameState.recordGameResult('caro', 'win');
      achievements.unlock('first_win');
      achievements.unlock('caro_win');
      if (gameState.difficulty === 'hard') achievements.unlock('hard_ai_win');
      if (gameState.timeControl > 0) achievements.unlock('timed_win');
    } else if (winner === 'O') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('caro', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('caro', 'win');
        achievements.unlock('first_win');
      }
    } else {
      gameState.recordGameResult('caro', 'draw');
    }
    this.renderBoard(); // refresh to show winning stone pulse
    this.updateStatus();
  }

  updateStatus() {
    const xTurnEl = document.getElementById('caro-x-turn');
    const oTurnEl = document.getElementById('caro-o-turn');

    if (this.game.isGameOver) {
      const msg = this.game.winner === 'draw'
        ? 'Hòa cờ!'
        : `Thắng cuộc! Quân ${this.game.winner} nối thành công 5 quân! 🏆`;
      if (this.onStatusChange) this.onStatusChange(msg, true);
      if (xTurnEl) xTurnEl.textContent = 'Kết thúc';
      if (oTurnEl) oTurnEl.textContent = 'Kết thúc';
      return;
    }

    if (this.isAiThinking) {
      if (oTurnEl) {
        oTurnEl.textContent = 'AI đang nghĩ... 🤔';
        oTurnEl.classList.add('thinking');
      }
      if (this.onStatusChange) this.onStatusChange('Máy AI đang tìm nước cờ hiểm...', false);
      return;
    }

    const isX = this.game.turn === 'X';
    if (xTurnEl) {
      xTurnEl.textContent = isX ? 'Lượt đi' : 'Chờ';
      xTurnEl.className = `player-turn-indicator ${isX ? 'active' : ''}`;
    }
    if (oTurnEl) {
      oTurnEl.textContent = !isX ? 'Lượt đi' : 'Chờ';
      oTurnEl.className = `player-turn-indicator ${!isX ? 'active' : ''}`;
    }

    const turnText = isX
      ? 'Lượt Quân X (Đen - Bạn)'
      : `Lượt Quân O (Trắng) ${gameState.mode === 'ai' ? '(Máy)' : ''}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
