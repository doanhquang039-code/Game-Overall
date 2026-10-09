// Cờ Gánh (Vietnamese Traditional Folk Chess) UI Controller
import { CoGanhGame } from './coganhEngine.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import confetti from 'canvas-confetti';

export class CoGanhUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new CoGanhGame();
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
      <div class="coganh-wrapper">
        <!-- Top Player (Red) -->
        <div class="player-bar top-player" id="cg-top-player">
          <div class="player-info">
            <span class="player-avatar">🏮</span>
            <div>
              <div class="player-name">Phe Đỏ ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-score" id="cg-red-count">Số quân: <strong>${counts.R}</strong> / 16</div>
            </div>
          </div>
          <div class="player-turn-indicator" id="cg-red-turn">Chờ lượt</div>
        </div>

        <!-- 5x5 Co Ganh Board SVG & Nodes -->
        <div class="coganh-board-container">
          <div class="coganh-board" id="coganh-board">
            <!-- SVG Lines -->
            <svg class="coganh-lines" viewBox="0 0 400 400">
              <!-- Grid lines -->
              <line x1="40" y1="40" x2="360" y2="40" stroke="currentColor" stroke-width="2"/>
              <line x1="40" y1="120" x2="360" y2="120" stroke="currentColor" stroke-width="2"/>
              <line x1="40" y1="200" x2="360" y2="200" stroke="currentColor" stroke-width="2"/>
              <line x1="40" y1="280" x2="360" y2="280" stroke="currentColor" stroke-width="2"/>
              <line x1="40" y1="360" x2="360" y2="360" stroke="currentColor" stroke-width="2"/>

              <line x1="40" y1="40" x2="40" y2="360" stroke="currentColor" stroke-width="2"/>
              <line x1="120" y1="40" x2="120" y2="360" stroke="currentColor" stroke-width="2"/>
              <line x1="200" y1="40" x2="200" y2="360" stroke="currentColor" stroke-width="2"/>
              <line x1="280" y1="40" x2="280" y2="360" stroke="currentColor" stroke-width="2"/>
              <line x1="360" y1="40" x2="360" y2="360" stroke="currentColor" stroke-width="2"/>

              <!-- Main Diagonals -->
              <line x1="40" y1="40" x2="360" y2="360" stroke="currentColor" stroke-width="2"/>
              <line x1="40" y1="360" x2="360" y2="40" stroke="currentColor" stroke-width="2"/>

              <!-- Diamond lines -->
              <line x1="200" y1="40" x2="40" y2="200" stroke="currentColor" stroke-width="2"/>
              <line x1="40" y1="200" x2="200" y2="360" stroke="currentColor" stroke-width="2"/>
              <line x1="200" y1="360" x2="360" y2="200" stroke="currentColor" stroke-width="2"/>
              <line x1="360" y1="200" x2="200" y2="40" stroke="currentColor" stroke-width="2"/>

              <!-- Corner sub-diagonals -->
              <line x1="120" y1="40" x2="40" y2="120" stroke="currentColor" stroke-width="1.5"/>
              <line x1="280" y1="40" x2="360" y2="120" stroke="currentColor" stroke-width="1.5"/>
              <line x1="40" y1="280" x2="120" y2="360" stroke="currentColor" stroke-width="1.5"/>
              <line x1="360" y1="280" x2="280" y2="360" stroke="currentColor" stroke-width="1.5"/>

              <!-- Central square diagonals -->
              <line x1="120" y1="120" x2="280" y2="280" stroke="currentColor" stroke-width="1.5"/>
              <line x1="120" y1="280" x2="280" y2="120" stroke="currentColor" stroke-width="1.5"/>
            </svg>

            <!-- 25 Intersections -->
            <div class="cg-points-grid" id="cg-points-grid"></div>
          </div>
        </div>

        <!-- Bottom Player (Blue) -->
        <div class="player-bar bottom-player" id="cg-bottom-player">
          <div class="player-info">
            <span class="player-avatar">🎋</span>
            <div>
              <div class="player-name">Phe Xanh (Bạn / Người chơi 1)</div>
              <div class="player-score" id="cg-blue-count">Số quân: <strong>${counts.B}</strong> / 16</div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="cg-blue-turn">Lượt đi</div>
        </div>
      </div>
    `;

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const gridEl = document.getElementById('cg-points-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const point = document.createElement('div');
        point.className = 'cg-point';
        point.dataset.r = r;
        point.dataset.c = c;

        // Position on 5x5 board
        point.style.left = `${(c / 4) * 100}%`;
        point.style.top = `${(r / 4) * 100}%`;

        // Selection
        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          point.classList.add('selected');
        }

        // Legal move destination
        const isLegal = this.legalMoves.some(m => m.r === r && m.c === c);
        if (isLegal) {
          point.classList.add('has-move');
        }

        // Piece
        const piece = this.game.board[r][c];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `cg-token ${piece === 'B' ? 'blue-token' : 'red-token'}`;

          // Check if piece was just gánh or vây
          if (this.game.lastGanh.some(p => p.r === r && p.c === c)) {
            pieceEl.classList.add('just-ganh');
          } else if (this.game.lastVay.some(p => p.r === r && p.c === c)) {
            pieceEl.classList.add('just-vay');
          }

          point.appendChild(pieceEl);
        }

        point.addEventListener('click', () => this.handlePointClick(r, c));
        gridEl.appendChild(point);
      }
    }

    this.updateCounts();
  }

  updateCounts() {
    const counts = this.game.getCounts();
    const bCount = document.getElementById('cg-blue-count');
    const rCount = document.getElementById('cg-red-count');
    if (bCount) bCount.innerHTML = `Số quân: <strong>${counts.B}</strong> / 16`;
    if (rCount) rCount.innerHTML = `Số quân: <strong>${counts.R}</strong> / 16`;
  }

  async handlePointClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn === 'R') return;

    // Check if clicked is a legal destination
    const isLegal = this.legalMoves.some(m => m.r === r && m.c === c);
    if (isLegal && this.selectedSquare) {
      await this.executeMove(this.selectedSquare, { r, c });
      return;
    }

    // Select piece
    const piece = this.game.board[r][c];
    if (piece === this.game.turn) {
      this.selectedSquare = { r, c };
      this.legalMoves = this.game.getLegalMoves(r, c);
    } else {
      this.selectedSquare = null;
      this.legalMoves = [];
    }

    this.renderBoard();
  }

  async executeMove(from, to) {
    this.selectedSquare = null;
    this.legalMoves = [];

    const result = this.game.makeMove(from, to);
    if (!result || !result.success) return;

    if (result.ganhPieces.length > 0 || result.vayPieces.length > 0) {
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

    if (gameState.mode === 'ai' && this.game.turn === 'R') {
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
      await this.executeMove(aiMove.from, aiMove.to);
    }
  }

  handleGameOver(winner) {
    if (winner === 'B') {
      sounds.playWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      gameState.recordGameResult('coganh', 'win');
    } else if (winner === 'R') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('coganh', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('coganh', 'win');
      }
    } else {
      gameState.recordGameResult('coganh', 'draw');
    }
    this.updateStatus();
  }

  updateStatus() {
    const bTurnEl = document.getElementById('cg-blue-turn');
    const rTurnEl = document.getElementById('cg-red-turn');
    const counts = this.game.getCounts();

    if (this.game.isGameOver) {
      const msg = `Chiến thắng tuyệt đối! ${this.game.winner === 'B' ? 'Phe Xanh' : 'Phe Đỏ'} toàn thắng! 🏆`;
      if (this.onStatusChange) this.onStatusChange(msg, true);
      if (bTurnEl) bTurnEl.textContent = 'Kết thúc';
      if (rTurnEl) rTurnEl.textContent = 'Kết thúc';
      return;
    }

    if (this.isAiThinking) {
      if (rTurnEl) {
        rTurnEl.textContent = 'AI đang nghĩ... 🤔';
        rTurnEl.classList.add('thinking');
      }
      if (this.onStatusChange) this.onStatusChange('Máy AI đang tính nước Gánh / Vây...', false);
      return;
    }

    const isB = this.game.turn === 'B';
    if (bTurnEl) {
      bTurnEl.textContent = isB ? 'Lượt đi' : 'Chờ';
      bTurnEl.className = `player-turn-indicator ${isB ? 'active' : ''}`;
    }
    if (rTurnEl) {
      rTurnEl.textContent = !isB ? 'Lượt đi' : 'Chờ';
      rTurnEl.className = `player-turn-indicator ${!isB ? 'active' : ''}`;
    }

    let extraNote = '';
    if (this.game.lastGanh.length > 0) extraNote = ` 💥 [GÁNH ${this.game.lastGanh.length} QUÂN!]`;
    else if (this.game.lastVay.length > 0) extraNote = ` 🕸️ [VÂY BẮT ${this.game.lastVay.length} QUÂN!]`;

    const turnText = isB
      ? `Lượt Phe Xanh (Bạn) • ${counts.B} vs ${counts.R}${extraNote}`
      : `Lượt Phe Đỏ ${gameState.mode === 'ai' ? '(Máy)' : ''} • ${counts.B} vs ${counts.R}${extraNote}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
