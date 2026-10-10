// Xiangqi (Chinese Chess / Cờ Tướng) UI Controller with All-Ages Accessibility & Style Switcher
import { XiangqiGame, XIANGQI_PIECE_NAMES } from './xiangqiEngine.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import { achievements } from '../../state/achievements.js';
import confetti from 'canvas-confetti';

export class XiangqiUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new XiangqiGame();
    this.selectedSquare = null; // {r, c}
    this.legalMoves = [];
    this.isAiThinking = false;

    // Subscribe to settings changes for dynamic re-render
    this.unsubscribe = gameState.subscribe((event) => {
      if (event === 'settingsChange' || event === 'langChange') {
        this.renderBoard();
        this.updateStatus();
      }
    });

    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
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
    this.container.innerHTML = `
      <div class="xiangqi-wrapper">
        <!-- Top Player (Black) -->
        <div class="player-bar top-player" id="xq-top-player">
          <div class="player-info">
            <span class="player-avatar">🀄</span>
            <div>
              <div class="player-name">Phe Đen ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-captured" id="xq-black-captured"></div>
            </div>
          </div>
          <div class="player-turn-indicator" id="xq-black-turn">Chờ lượt</div>
        </div>

        <!-- 9x10 Board Canvas / Grid -->
        <div class="xiangqi-board-container">
          <div class="xiangqi-board" id="xiangqi-board">
            <!-- Background River Text -->
            <div class="river-banner">
              <span class="river-text">楚 河</span>
              <span class="river-center-text">✦ SỞ HÀ • HÁN GIỚI ✦</span>
              <span class="river-text">漢 界</span>
            </div>
            <!-- Intersection Grid for 90 points -->
            <div class="xq-grid-points" id="xq-grid-points"></div>
          </div>
        </div>

        <!-- Bottom Player (Red) -->
        <div class="player-bar bottom-player" id="xq-bottom-player">
          <div class="player-info">
            <span class="player-avatar">🔴</span>
            <div>
              <div class="player-name">Phe Đỏ (Bạn / Người chơi 1)</div>
              <div class="player-captured" id="xq-red-captured"></div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="xq-red-turn">Lượt đi</div>
        </div>
      </div>
    `;

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const gridEl = document.getElementById('xq-grid-points');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const pieceStyle = gameState.xqPieceStyle; // 'hanzi', 'viet', 'both'
    const showHints = gameState.showMoveHints;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const point = document.createElement('div');
        point.className = 'xq-point';
        point.dataset.r = r;
        point.dataset.c = c;

        // Selection highlight
        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          point.classList.add('selected');
        }

        // Check highlight on King
        if (this.game.inCheck) {
          const piece = this.game.board[r][c];
          if (piece === this.game.turn + 'K') {
            point.classList.add('in-check');
          }
        }

        // Legal move destination
        if (showHints) {
          const moveTarget = this.legalMoves.find(m => m.to.r === r && m.to.c === c);
          if (moveTarget) {
            if (moveTarget.captured) {
              point.classList.add('has-capture');
            } else {
              point.classList.add('has-move');
            }
          }
        }

        // Piece token
        const pieceCode = this.game.board[r][c];
        if (pieceCode) {
          const pieceData = XIANGQI_PIECE_NAMES[pieceCode];
          const token = document.createElement('div');
          token.className = `xq-token ${pieceCode[0] === 'r' ? 'red-token' : 'black-token'}`;
          
          let innerHTML = '';
          if (pieceStyle === 'viet') {
            innerHTML = `<span class="xq-vn-text">${pieceData ? pieceData.vn : ''}</span>`;
          } else if (pieceStyle === 'both') {
            innerHTML = `
              <span class="xq-char">${pieceData ? pieceData.char : ''}</span>
              <span class="xq-sub-vn">${pieceData ? pieceData.vn : ''}</span>
            `;
          } else {
            // Default 'hanzi'
            innerHTML = `<span class="xq-char">${pieceData ? pieceData.char : ''}</span>`;
          }

          token.innerHTML = `<div class="xq-token-inner style-${pieceStyle}">${innerHTML}</div>`;
          point.appendChild(token);
        }

        point.addEventListener('click', () => this.handlePointClick(r, c));
        gridEl.appendChild(point);
      }
    }

    this.renderCaptured();
  }

  renderCaptured() {
    const redCapEl = document.getElementById('xq-red-captured');
    const blackCapEl = document.getElementById('xq-black-captured');
    const pieceStyle = gameState.xqPieceStyle;

    const formatBadge = (p) => {
      const info = XIANGQI_PIECE_NAMES[p];
      if (!info) return p;
      return pieceStyle === 'viet' ? info.vn : info.char;
    };

    if (redCapEl) {
      redCapEl.innerHTML = this.game.capturedPieces.r.map(p => {
        return `<span class="xq-cap-badge black-badge">${formatBadge(p)}</span>`;
      }).join('');
    }
    if (blackCapEl) {
      blackCapEl.innerHTML = this.game.capturedPieces.b.map(p => {
        return `<span class="xq-cap-badge red-badge">${formatBadge(p)}</span>`;
      }).join('');
    }
  }

  async handlePointClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;

    if (gameState.mode === 'ai' && this.game.turn === 'b') return;

    const matchedMove = this.legalMoves.find(m => m.to.r === r && m.to.c === c);
    if (matchedMove) {
      await this.executeMove(matchedMove);
      return;
    }

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

    if (result.captured) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    if (result.inCheck) {
      sounds.playCheck();
    }

    this.renderBoard();
    this.updateStatus();

    if (result.isGameOver) {
      this.handleGameOver(result.winner);
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

    const aiMove = this.game.getBestMove(gameState.difficulty);
    this.isAiThinking = false;

    if (aiMove) {
      await this.executeMove(aiMove);
    }
  }

  showHint() {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn !== 'r') return;

    const best = this.game.getBestMove('hard');
    if (!best) return;

    this.selectedSquare = best.from;
    this.legalMoves = [best];
    sounds.playCheck();
    this.renderBoard();
    if (this.onStatusChange) {
      this.onStatusChange('💡 Mách nước: AI gợi ý nước cờ đã được khoanh vùng!', false);
    }
  }

  handleGameOver(winner) {
    if (winner === 'r') {
      sounds.playWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      gameState.recordGameResult('xiangqi', 'win');
      achievements.unlock('first_win');
      achievements.unlock('xiangqi_win');
      if (gameState.difficulty === 'hard') achievements.unlock('hard_ai_win');
      if (gameState.timeControl > 0) achievements.unlock('timed_win');
    } else if (winner === 'b') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('xiangqi', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('xiangqi', 'win');
        achievements.unlock('first_win');
      }
    } else {
      gameState.recordGameResult('xiangqi', 'draw');
    }
    this.updateStatus();
  }

  updateStatus() {
    const redTurnEl = document.getElementById('xq-red-turn');
    const blackTurnEl = document.getElementById('xq-black-turn');

    if (this.game.isGameOver) {
      const msg = `Chiếu bí sát cuộc! ${this.game.winner === 'r' ? 'Phe Đỏ' : 'Phe Đen'} đại thắng! 🏆`;
      if (this.onStatusChange) this.onStatusChange(msg, true);
      if (redTurnEl) redTurnEl.textContent = 'Kết thúc';
      if (blackTurnEl) blackTurnEl.textContent = 'Kết thúc';
      return;
    }

    if (this.isAiThinking) {
      if (blackTurnEl) {
        blackTurnEl.textContent = 'AI đang nghĩ... 🤔';
        blackTurnEl.classList.add('thinking');
      }
      if (this.onStatusChange) this.onStatusChange('Máy AI đang suy tính xuất chiêu...', false);
      return;
    }

    const isRed = this.game.turn === 'r';
    if (redTurnEl) {
      redTurnEl.textContent = isRed ? 'Lượt đi' : 'Chờ';
      redTurnEl.className = `player-turn-indicator ${isRed ? 'active' : ''}`;
    }
    if (blackTurnEl) {
      blackTurnEl.textContent = !isRed ? 'Lượt đi' : 'Chờ';
      blackTurnEl.className = `player-turn-indicator ${!isRed ? 'active' : ''}`;
    }

    const checkText = this.game.inCheck ? ' ⚔️ [CHIẾU TƯỚNG!]' : '';
    const turnText = isRed
      ? `Lượt Phe Đỏ (Bạn)${checkText}`
      : `Lượt Phe Đen ${gameState.mode === 'ai' ? '(Máy)' : ''}${checkText}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
