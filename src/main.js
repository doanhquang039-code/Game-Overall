// CHESSVERSE (BÁCH KỲ TRẬN) - Entry Point & Application Coordinator
import './styles/main.css';
import { gameState, GAME_INFO } from './state/gameState.js';
import { i18n } from './i18n/translations.js';
import { renderGameSelector } from './components/gameSelector.js';
import { renderGameControls } from './components/gameControls.js';
import { showRulesModal } from './components/rulesModal.js';
import { showStatsModal } from './components/statsModal.js';
import { showSettingsModal } from './components/settingsModal.js';

import { ChessUI } from './games/chess/chessUI.js';
import { XiangqiUI } from './games/xiangqi/xiangqiUI.js';
import { CaroUI } from './games/caro/caroUI.js';
import { OthelloUI } from './games/othello/othelloUI.js';
import { CoGanhUI } from './games/coganh/coganhUI.js';
import { GoUI } from './games/go/goUI.js';
import { CheckersUI } from './games/checkers/checkersUI.js';

class ChessverseApp {
  constructor() {
    this.appEl = document.getElementById('app');
    this.currentUI = null;
    this.init();
  }

  init() {
    // Apply initial theme and scale
    gameState.setTheme(gameState.theme);
    gameState.applyBoardScale(gameState.boardScale);

    // Subscribe to state events
    gameState.subscribe((event, data) => {
      if (event === 'langChange') {
        this.updateTexts();
      } else if (event === 'clockTick') {
        this.updateClockDisplay(data);
      } else if (event === 'timeOut') {
        this.handleTimeOut(data);
      }
    });

    this.renderSkeleton();
    this.setupControls();
    this.setupSelector();
    this.switchGame(gameState.currentGame);
  }

  renderSkeleton() {
    const t = (k) => i18n.t(k);
    const gameTrans = i18n.translations[i18n.getLang()][gameState.currentGame] || GAME_INFO[gameState.currentGame];

    this.appEl.innerHTML = `
      <!-- Header -->
      <header class="app-header">
        <div class="logo-group">
          <div class="logo-emblem">👑</div>
          <div>
            <h1 class="logo-title" id="app-logo-title">${t('appTitle')}</h1>
            <p class="logo-tagline" id="app-logo-tagline">${t('appTagline')}</p>
          </div>
        </div>
        <div class="header-right-group">
          <div class="header-clock-badge ${gameState.timeControl > 0 ? '' : 'hidden'}" id="header-clock-badge">
            <span>⏱️</span>
            <span id="clock-display">00:00</span>
          </div>
          <div class="header-status-badge">
            <span class="live-dot"></span>
            <span id="header-active-game">${gameTrans.title}</span>
          </div>
        </div>
      </header>

      <!-- Main Layout -->
      <main class="main-layout">
        <!-- Game Selector Section -->
        <section class="game-selector-section" id="game-selector-container"></section>

        <!-- Controls & Toolbars -->
        <section class="game-controls-section" id="game-controls-container"></section>

        <!-- Status Banner -->
        <div class="status-banner" id="game-status-banner">
          <span id="status-text">${t('waiting')}...</span>
          <span class="status-icon" id="status-icon">⚡</span>
        </div>

        <!-- Active Game Stage Board -->
        <section class="game-stage-container" id="game-stage"></section>
      </main>
    `;
  }

  setupSelector() {
    const selectorContainer = document.getElementById('game-selector-container');
    renderGameSelector(selectorContainer, (gameId) => {
      this.switchGame(gameId);
    });
  }

  setupControls() {
    const controlsContainer = document.getElementById('game-controls-container');
    renderGameControls(controlsContainer, {
      onUndo: () => {
        if (this.currentUI && this.currentUI.undo) {
          this.currentUI.undo();
        }
      },
      onReset: () => {
        if (this.currentUI && this.currentUI.reset) {
          this.currentUI.reset();
        }
      },
      onModeChange: () => {
        if (this.currentUI && this.currentUI.reset) {
          this.currentUI.reset();
        }
      },
      onShowRules: () => {
        showRulesModal(gameState.currentGame);
      },
      onShowStats: () => {
        showStatsModal();
      },
      onShowSettings: () => {
        showSettingsModal(() => {
          this.updateTexts();
          this.setupControls();
          this.setupSelector();
        });
      }
    });
  }

  updateTexts() {
    const t = (k) => i18n.t(k);
    const gameTrans = i18n.translations[i18n.getLang()][gameState.currentGame] || GAME_INFO[gameState.currentGame];

    const logoTitle = document.getElementById('app-logo-title');
    const logoTagline = document.getElementById('app-logo-tagline');
    const headerTitle = document.getElementById('header-active-game');

    if (logoTitle) logoTitle.textContent = t('appTitle');
    if (logoTagline) logoTagline.textContent = t('appTagline');
    if (headerTitle) headerTitle.textContent = gameTrans.title;

    // Refresh controls & selector with new language
    this.setupControls();
    this.setupSelector();
  }

  updateClockDisplay(times) {
    const clockBadge = document.getElementById('header-clock-badge');
    const clockDisplay = document.getElementById('clock-display');
    if (!clockBadge || !clockDisplay) return;

    if (gameState.timeControl > 0) {
      clockBadge.classList.remove('hidden');
      const activeTime = gameState.activeClock ? times[gameState.activeClock] : gameState.timeControl;
      clockDisplay.textContent = gameState.formatTime(activeTime);
    } else {
      clockBadge.classList.add('hidden');
    }
  }

  handleTimeOut(timedOutPlayer) {
    const isP1 = timedOutPlayer === 'p1';
    const loser = isP1 ? 'Người chơi 1' : 'Người chơi 2 / Máy';
    const msg = `Hết giờ! ${loser} bị xử thua thời gian! ⌛`;
    this.updateStatusBanner(msg, true);
  }

  switchGame(gameId) {
    if (this.currentUI && this.currentUI.destroy) {
      this.currentUI.destroy();
    }

    gameState.setGame(gameId);

    const gameTrans = i18n.translations[i18n.getLang()][gameId] || GAME_INFO[gameId];
    const headerTitle = document.getElementById('header-active-game');
    if (headerTitle) {
      headerTitle.textContent = gameTrans.title;
    }

    const stageEl = document.getElementById('game-stage');
    stageEl.innerHTML = '';

    const onStatusChange = (msg, isGameOver = false) => {
      this.updateStatusBanner(msg, isGameOver);
    };

    // Instantiate appropriate game UI
    switch (gameId) {
      case 'chess':
        this.currentUI = new ChessUI(stageEl, onStatusChange);
        break;
      case 'xiangqi':
        this.currentUI = new XiangqiUI(stageEl, onStatusChange);
        break;
      case 'caro':
        this.currentUI = new CaroUI(stageEl, onStatusChange);
        break;
      case 'othello':
        this.currentUI = new OthelloUI(stageEl, onStatusChange);
        break;
      case 'coganh':
        this.currentUI = new CoGanhUI(stageEl, onStatusChange);
        break;
      case 'go':
        this.currentUI = new GoUI(stageEl, onStatusChange);
        break;
      case 'checkers':
        this.currentUI = new CheckersUI(stageEl, onStatusChange);
        break;
      default:
        this.currentUI = new ChessUI(stageEl, onStatusChange);
    }
  }

  updateStatusBanner(msg, isGameOver = false) {
    const banner = document.getElementById('game-status-banner');
    const statusText = document.getElementById('status-text');
    const statusIcon = document.getElementById('status-icon');

    if (!banner || !statusText) return;

    statusText.textContent = msg;

    if (isGameOver) {
      banner.classList.add('game-over');
      if (statusIcon) statusIcon.textContent = '🏆';
    } else {
      banner.classList.remove('game-over');
      if (statusIcon) statusIcon.textContent = '⚡';
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ChessverseApp();
});
