// Go (Cờ Vây 9x9) UI Controller
import { GoGame, GO_BOARD_SIZE } from './goEngine.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import { achievements } from '../../state/achievements.js';
import { i18n } from '../../i18n/translations.js';
import confetti from 'canvas-confetti';

export class GoUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new GoGame(GO_BOARD_SIZE);
    this.isAiThinking = false;
    this.hintPosition = null;

    this.render();
  }

  reset() {
    this.game.reset();
    this.isAiThinking = false;
    this.hintPosition = null;
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
    this.container.innerHTML = `
      <div class="go-wrapper">
        <!-- Top Player (White) -->
        <div class="player-bar top-player" id="go-top-player">
          <div class="player-info">
            <span class="player-avatar">⚪</span>
            <div>
              <div class="player-name">Quân Trắng ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-sub" id="go-white-sub">Tù binh bắt được: <strong>${this.game.captures.W}</strong></div>
            </div>
          </div>
          <div class="player-turn-indicator" id="go-white-turn">Chờ lượt</div>
        </div>

        <!-- 9x9 Go Board -->
        <div class="go-board-container">
          <div class="go-board" id="go-board"></div>
        </div>

        <!-- Pass Action Bar -->
        <div class="go-action-bar">
          <button class="action-btn secondary-btn" id="go-btn-pass">
            <span>✋</span>
            <span>Bỏ Lượt (Pass Turn)</span>
          </button>
        </div>

        <!-- Bottom Player (Black) -->
        <div class="player-bar bottom-player" id="go-bottom-player">
          <div class="player-info">
            <span class="player-avatar">⚫</span>
            <div>
              <div class="player-name">Quân Đen (Bạn / Người chơi 1)</div>
              <div class="player-sub" id="go-black-sub">Tù binh bắt được: <strong>${this.game.captures.B}</strong></div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="go-black-turn">Lượt đi</div>
        </div>
      </div>
    `;

    const passBtn = this.container.querySelector('#go-btn-pass');
    if (passBtn) {
      passBtn.addEventListener('click', () => this.handlePass());
    }

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const boardEl = document.getElementById('go-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const size = this.game.size;
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // 9x9 star points (hoshi)
    const starPoints = [
      { r: 2, c: 2 }, { r: 2, c: 6 },
      { r: 4, c: 4 },
      { r: 6, c: 2 }, { r: 6, c: 6 }
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'go-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Star point
        if (starPoints.some(p => p.r === r && p.c === c)) {
          const star = document.createElement('div');
          star.className = 'go-star-point';
          cell.appendChild(star);
        }

        // Stone
        const stone = this.game.board[r][c];
        if (stone) {
          const stoneEl = document.createElement('div');
          stoneEl.className = `go-stone stone-${stone.toLowerCase()}`;
          cell.appendChild(stoneEl);
        } else if (this.hintPosition && this.hintPosition.r === r && this.hintPosition.c === c) {
          cell.classList.add('has-hint');
          const hintMarker = document.createElement('div');
          hintMarker.className = 'go-hint-pulse';
          cell.appendChild(hintMarker);
        }

        cell.addEventListener('click', () => {
          this.hintPosition = null;
          this.handleCellClick(r, c);
        });
        boardEl.appendChild(cell);
      }
    }

    this.updateScores();
  }

  updateScores() {
    const bSub = document.getElementById('go-black-sub');
    const wSub = document.getElementById('go-white-sub');
    if (bSub) bSub.innerHTML = `Tù binh bắt được: <strong>${this.game.captures.B}</strong>`;
    if (wSub) wSub.innerHTML = `Tù binh bắt được: <strong>${this.game.captures.W}</strong> (+5.5 Komi)`;
  }

  async handleCellClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn === 'W') return;

    if (!this.game.isMoveLegal(r, c, this.game.turn)) return;

    await this.executeMove(r, c);
  }

  async executeMove(r, c) {
    const result = this.game.makeMove(r, c);
    if (!result || !result.success) return;

    if (result.captured.length > 0) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    this.renderBoard();
    this.updateStatus();

    if (gameState.mode === 'ai' && this.game.turn === 'W') {
      this.triggerAiMove();
    }
  }

  async handlePass() {
    if (this.game.isGameOver || this.isAiThinking) return;

    const result = this.game.pass();
    sounds.playMove();
    this.renderBoard();
    this.updateStatus();

    if (result.isGameOver) {
      this.handleGameOver(result.winner);
      return;
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
    } else {
      // AI chooses to pass
      this.handlePass();
    }
  }

  showHint() {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn !== 'B') return;

    const best = this.game.getBestMove('hard');
    if (!best) return;

    this.hintPosition = { r: best.r, c: best.c };
    sounds.playHint();
    this.renderBoard();
    if (this.onStatusChange) {
      this.onStatusChange(`💡 Mách nước Cờ Vây: Gợi ý đặt quân tại hàng ${best.r + 1}, cột ${best.c + 1}!`, false);
    }
  }

  handleGameOver(winner) {
    if (winner === 'B') {
      sounds.playWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      gameState.recordGameResult('go', 'win');
      achievements.unlock('first_win');
      achievements.unlock('go_win');
      if (gameState.difficulty === 'hard') achievements.unlock('hard_ai_win');
      if (gameState.timeControl > 0) achievements.unlock('timed_win');
    } else if (winner === 'W') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('go', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('go', 'win');
        achievements.unlock('first_win');
      }
    } else {
      gameState.recordGameResult('go', 'draw');
    }
    this.updateStatus();
  }

  updateStatus() {
    const bTurnEl = document.getElementById('go-black-turn');
    const wTurnEl = document.getElementById('go-white-turn');

    if (this.game.isGameOver) {
      const msg = `Ván cờ kết thúc! Người thắng: ${this.game.winner === 'B' ? 'Quân Đen' : 'Quân Trắng'}! 🏆`;
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
      if (this.onStatusChange) this.onStatusChange('Máy AI đang tính toán khí và biên...', false);
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
      ? 'Lượt Quân Đen (Bạn)'
      : `Lượt Quân Trắng ${gameState.mode === 'ai' ? '(Máy)' : ''}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
