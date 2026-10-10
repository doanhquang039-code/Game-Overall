// Chess UI Component & Board Controller
import { ChessGame } from './chessEngine.js';
import { CHESS_SVGS } from './chessPieces.js';
import { sounds } from '../../audio/soundEngine.js';
import { gameState } from '../../state/gameState.js';
import { achievements } from '../../state/achievements.js';
import confetti from 'canvas-confetti';

export class ChessUI {
  constructor(container, onStatusChange) {
    this.container = container;
    this.onStatusChange = onStatusChange;
    this.game = new ChessGame();
    this.selectedSquare = null; // {r, c}
    this.legalMoves = [];
    this.pendingPromotion = null; // {move, resolve}
    this.isAiThinking = false;

    this.render();
  }

  reset() {
    this.game.reset();
    this.selectedSquare = null;
    this.legalMoves = [];
    this.pendingPromotion = null;
    this.isAiThinking = false;
    this.renderBoard();
    this.updateStatus();
  }

  undo() {
    if (this.isAiThinking) return;
    if (gameState.mode === 'ai') {
      // Undo both AI move and Player move
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
      <div class="chess-wrapper">
        <!-- Top Player / AI info bar -->
        <div class="player-bar top-player" id="chess-top-player">
          <div class="player-info">
            <span class="player-avatar">🤖</span>
            <div>
              <div class="player-name">Quân Đen ${gameState.mode === 'ai' ? '(Máy AI)' : '(Người chơi 2)'}</div>
              <div class="player-captured" id="chess-black-captured"></div>
            </div>
          </div>
          <div class="player-turn-indicator" id="chess-black-turn">Chờ lượt</div>
        </div>

        <!-- 8x8 Chess Board Container -->
        <div class="chess-board-wrapper">
          <div class="chess-board" id="chess-board"></div>
        </div>

        <!-- Bottom Player info bar -->
        <div class="player-bar bottom-player" id="chess-bottom-player">
          <div class="player-info">
            <span class="player-avatar">👤</span>
            <div>
              <div class="player-name">Quân Trắng (Bạn / Người chơi 1)</div>
              <div class="player-captured" id="chess-white-captured"></div>
            </div>
          </div>
          <div class="player-turn-indicator active" id="chess-white-turn">Lượt đi</div>
        </div>

        <!-- Promotion Modal -->
        <div class="promotion-modal hidden" id="chess-promotion-modal">
          <div class="modal-dialog">
            <h3>Chọn quân phong cấp</h3>
            <div class="promotion-pieces" id="chess-promotion-options"></div>
          </div>
        </div>
      </div>
    `;

    this.renderBoard();
    this.updateStatus();
  }

  renderBoard() {
    const boardEl = document.getElementById('chess-board');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        square.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        square.dataset.r = r;
        square.dataset.c = c;

        // Coordinates notation
        if (c === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-label rank-label';
          rankLabel.textContent = 8 - r;
          square.appendChild(rankLabel);
        }
        if (r === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-label file-label';
          fileLabel.textContent = files[c];
          square.appendChild(fileLabel);
        }

        // Selection highlight
        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          square.classList.add('selected');
        }

        // King in check red glow
        if (this.game.inCheck) {
          const piece = this.game.board[r][c];
          if (piece === this.game.turn + 'K') {
            square.classList.add('in-check');
          }
        }

        // Legal move indicator
        const moveTarget = this.legalMoves.find(m => m.to.r === r && m.to.c === c);
        if (moveTarget) {
          if (moveTarget.captured || moveTarget.isEnPassant) {
            square.classList.add('has-capture');
          } else {
            square.classList.add('has-move');
          }
        }

        // Piece SVG
        const pieceCode = this.game.board[r][c];
        if (pieceCode) {
          const pieceEl = document.createElement('div');
          pieceEl.className = 'chess-piece';
          pieceEl.innerHTML = CHESS_SVGS[pieceCode] || '';
          square.appendChild(pieceEl);
        }

        square.addEventListener('click', () => this.handleSquareClick(r, c));
        boardEl.appendChild(square);
      }
    }

    this.renderCaptured();
  }

  renderCaptured() {
    const whiteCapEl = document.getElementById('chess-white-captured');
    const blackCapEl = document.getElementById('chess-black-captured');

    if (whiteCapEl) {
      whiteCapEl.innerHTML = this.game.capturedPieces.w.map(p =>
        `<span class="cap-piece-icon">${CHESS_SVGS[p]}</span>`
      ).join('');
    }
    if (blackCapEl) {
      blackCapEl.innerHTML = this.game.capturedPieces.b.map(p =>
        `<span class="cap-piece-icon">${CHESS_SVGS[p]}</span>`
      ).join('');
    }
  }

  async handleSquareClick(r, c) {
    if (this.game.isGameOver || this.isAiThinking) return;

    // If it's AI turn, human cannot click
    if (gameState.mode === 'ai' && this.game.turn === 'b') return;

    // Check if clicked square is one of legal destinations
    const matchedMove = this.legalMoves.find(m => m.to.r === r && m.to.c === c);
    if (matchedMove) {
      await this.executeMove(matchedMove);
      return;
    }

    // Otherwise, select piece if it belongs to current player
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

    // Check promotion
    let promotionPiece = 'Q';
    const isPawn = move.piece[1] === 'P';
    const promoRank = move.piece[0] === 'w' ? 0 : 7;
    if (isPawn && move.to.r === promoRank) {
      if (gameState.mode === 'ai' && move.piece[0] === 'b') {
        promotionPiece = 'Q';
      } else {
        promotionPiece = await this.promptPromotion(move.piece[0]);
      }
    }

    const result = this.game.makeMove(move, promotionPiece);

    // Play appropriate sound
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

    // Check game over
    if (result.isGameOver) {
      this.handleGameOver(result.winner);
      return;
    }

    // AI turn if in AI mode
    if (gameState.mode === 'ai' && this.game.turn === 'b') {
      this.triggerAiMove();
    }
  }

  promptPromotion(color) {
    return new Promise(resolve => {
      const modal = document.getElementById('chess-promotion-modal');
      const optionsContainer = document.getElementById('chess-promotion-options');
      if (!modal || !optionsContainer) {
        resolve('Q');
        return;
      }

      const pieces = ['Q', 'R', 'B', 'N'];
      optionsContainer.innerHTML = '';

      pieces.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'promo-btn';
        btn.innerHTML = CHESS_SVGS[color + p];
        btn.addEventListener('click', () => {
          modal.classList.add('hidden');
          resolve(p);
        });
        optionsContainer.appendChild(btn);
      });

      modal.classList.remove('hidden');
    });
  }

  async triggerAiMove() {
    this.isAiThinking = true;
    this.updateStatus();

    // Delay for realism and feeling
    await new Promise(r => setTimeout(r, 450));

    const aiMove = this.game.getBestMove(gameState.difficulty);
    this.isAiThinking = false;

    if (aiMove) {
      await this.executeMove(aiMove);
    }
  }

  showHint() {
    if (this.game.isGameOver || this.isAiThinking) return;
    if (gameState.mode === 'ai' && this.game.turn !== 'w') return;

    const best = this.game.getBestMove('hard');
    if (!best) return;

    this.selectedSquare = best.from;
    this.legalMoves = [best];
    sounds.playCheck();
    this.renderBoard();
    if (this.onStatusChange) {
      const fromCoord = `${String.fromCharCode(97 + best.from.c)}${8 - best.from.r}`;
      const toCoord = `${String.fromCharCode(97 + best.to.c)}${8 - best.to.r}`;
      this.onStatusChange(`💡 Mách nước: Di chuyển từ ${fromCoord} đến ${toCoord}!`, false);
    }
  }

  handleGameOver(winner) {
    if (winner === 'w') {
      sounds.playWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      gameState.recordGameResult('chess', 'win');
      achievements.unlock('first_win');
      if (gameState.difficulty === 'hard') achievements.unlock('hard_ai_win');
      if (gameState.timeControl > 0) achievements.unlock('timed_win');
    } else if (winner === 'b') {
      if (gameState.mode === 'ai') {
        sounds.playLose();
        gameState.recordGameResult('chess', 'loss');
      } else {
        sounds.playWin();
        confetti({ particleCount: 80, spread: 60 });
        gameState.recordGameResult('chess', 'win');
        achievements.unlock('first_win');
      }
    } else {
      gameState.recordGameResult('chess', 'draw');
    }
    this.updateStatus();
  }

  updateStatus() {
    const whiteTurnEl = document.getElementById('chess-white-turn');
    const blackTurnEl = document.getElementById('chess-black-turn');

    if (this.game.isGameOver) {
      const msg = this.game.winner === 'draw'
        ? 'Hòa cờ (Stalemate)!'
        : `Chiếu bí! ${this.game.winner === 'w' ? 'Quân Trắng' : 'Quân Đen'} thắng! 🏆`;
      if (this.onStatusChange) this.onStatusChange(msg, true);
      if (whiteTurnEl) whiteTurnEl.textContent = 'Kết thúc';
      if (blackTurnEl) blackTurnEl.textContent = 'Kết thúc';
      return;
    }

    if (this.isAiThinking) {
      if (blackTurnEl) {
        blackTurnEl.textContent = 'AI đang nghĩ... 🤔';
        blackTurnEl.classList.add('thinking');
      }
      if (this.onStatusChange) this.onStatusChange('Máy AI đang tính toán nước đi...', false);
      return;
    }

    const isWhite = this.game.turn === 'w';
    if (whiteTurnEl) {
      whiteTurnEl.textContent = isWhite ? 'Lượt đi' : 'Chờ';
      whiteTurnEl.className = `player-turn-indicator ${isWhite ? 'active' : ''}`;
    }
    if (blackTurnEl) {
      blackTurnEl.textContent = !isWhite ? 'Lượt đi' : 'Chờ';
      blackTurnEl.className = `player-turn-indicator ${!isWhite ? 'active' : ''}`;
    }

    const checkText = this.game.inCheck ? ' ⚠️ [ĐANG BỊ CHIẾU!]' : '';
    const turnText = isWhite
      ? `Lượt Quân Trắng (Bạn)${checkText}`
      : `Lượt Quân Đen ${gameState.mode === 'ai' ? '(Máy)' : ''}${checkText}`;

    if (this.onStatusChange) this.onStatusChange(turnText, false);
  }
}
