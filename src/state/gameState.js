// Global Game Hub State Management, Customization Settings & LocalStorage Persistence
import { i18n } from '../i18n/translations.js';
import { sounds } from '../audio/soundEngine.js';

export const GAME_TYPES = {
  CHESS: 'chess',
  XIANGQI: 'xiangqi',
  CARO: 'caro',
  OTHELLO: 'othello',
  COGANH: 'coganh',
  GO: 'go',
  CHECKERS: 'checkers'
};

export const GAME_INFO = {
  chess: {
    id: 'chess',
    title: 'Cờ Vua Quốc Tế',
    subtitle: 'International Chess',
    tag: 'Chiến Thuật Kinh Điển',
    badge: '8x8',
    icon: '♟️',
    desc: 'Bàn cờ 64 ô với các binh chủng Vua, Hậu, Xe, Tượng, Mã, Tốt. Chiếu bí vua đối phương để giành thắng lợi.'
  },
  xiangqi: {
    id: 'xiangqi',
    title: 'Cờ Tướng',
    subtitle: 'Xiangqi - Sở Hà Hán Giới',
    tag: 'Bách Trận Tranh Hùng',
    badge: '9x10',
    icon: '🀄',
    desc: 'Đấu trí kinh điển Á Đông với sông Sở Hà - Hán Giới, cung Cửu Cung, Pháo nhảy ngòi, Tướng không lộ mặt.'
  },
  caro: {
    id: 'caro',
    title: 'Cờ Caro (Gomoku)',
    subtitle: 'Năm Quân Thẳng Hàng',
    tag: 'Đấu Trí Tốc Độ',
    badge: '15x15',
    icon: '❌',
    desc: 'Bàn cờ 15x15 ô giao điểm. Người đầu tiên nối liền 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc chéo sẽ chiến thắng.'
  },
  othello: {
    id: 'othello',
    title: 'Cờ Lật (Reversi)',
    subtitle: 'Othello Strategy',
    tag: 'Lật Ngược Thế Cờ',
    badge: '8x8',
    icon: '⚪',
    desc: 'Kẹp quân đối phương theo hàng thẳng hoặc chéo để lật toàn bộ quân về màu của bạn. Chiếm góc để thắng lớn.'
  },
  coganh: {
    id: 'coganh',
    title: 'Cờ Gánh Dân Gian',
    subtitle: 'Vietnamese Traditional Board Game',
    tag: 'Di Sản Cổ Truyền',
    badge: '5x5',
    icon: '🪵',
    desc: 'Trò chơi trí tuệ cổ truyền Việt Nam trên bàn cờ 25 giao điểm với tuyệt kỹ "Gánh" kẹp giữa và "Vây" chặn sạch đường đi.'
  },
  go: {
    id: 'go',
    title: 'Cờ Vây (Go / Weiqi)',
    subtitle: 'Kỳ Đạo Nhập Môn 9x9',
    tag: 'Trí Tuệ Phương Đông',
    badge: '9x9',
    icon: '☯️',
    desc: 'Bàn cờ 9x9 giao điểm. Tính khí (liberties), vây bắt tù binh và chiếm cứ lãnh thổ.'
  },
  checkers: {
    id: 'checkers',
    title: 'Cờ Đam (Checkers)',
    subtitle: 'Classic Draughts',
    tag: 'Nhảy Bắt Liên Hoàn',
    badge: '8x8',
    icon: '🔴',
    desc: 'Bàn cờ 64 ô, di chuyển chéo, nhảy bắt quân đối phương và phong Vua (King) khi đến hàng đối diện.'
  }
};

class GameStateManager {
  constructor() {
    this.currentGame = GAME_TYPES.CHESS;
    this.mode = 'ai'; // 'ai' or 'pvp'
    this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
    this.theme = localStorage.getItem('chessverse_theme') || 'classic';

    // Settings for customization & all-ages accessibility
    this.language = localStorage.getItem('chessverse_lang') || 'vi';
    this.xqPieceStyle = localStorage.getItem('chessverse_xq_style') || 'both'; // 'hanzi', 'viet', 'both'
    this.boardScale = localStorage.getItem('chessverse_scale') || 'standard'; // 'compact', 'standard', 'large'
    this.showMoveHints = localStorage.getItem('chessverse_hints') !== 'false'; // default true
    this.volume = parseFloat(localStorage.getItem('chessverse_volume') || '0.8');
    this.timeControl = parseInt(localStorage.getItem('chessverse_time_control') || '0', 10); // 0 = unlimited, 180 = 3m, 300 = 5m, 600 = 10m
    
    // Chess Clock Timers
    this.playerTimes = { p1: this.timeControl, p2: this.timeControl };
    this.activeClock = null; // 'p1' or 'p2'
    this.clockInterval = null;

    this.subscribers = [];

    // Load statistics
    const savedStats = localStorage.getItem('chessverse_stats');
    this.stats = savedStats ? JSON.parse(savedStats) : {
      chess: { wins: 0, losses: 0, draws: 0 },
      xiangqi: { wins: 0, losses: 0, draws: 0 },
      caro: { wins: 0, losses: 0, draws: 0 },
      othello: { wins: 0, losses: 0, draws: 0 },
      coganh: { wins: 0, losses: 0, draws: 0 },
      go: { wins: 0, losses: 0, draws: 0 },
      checkers: { wins: 0, losses: 0, draws: 0 }
    };

    // Apply scale to DOM
    this.applyBoardScale(this.boardScale);
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    this.subscribers.forEach(cb => cb(event, data));
  }

  setGame(gameId) {
    if (GAME_INFO[gameId]) {
      this.currentGame = gameId;
      this.resetClock();
      this.notify('gameChange', gameId);
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.resetClock();
    this.notify('modeChange', mode);
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.notify('difficultyChange', diff);
  }

  setTheme(themeName) {
    this.theme = themeName;
    localStorage.setItem('chessverse_theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    this.notify('themeChange', themeName);
  }

  setLanguage(lang) {
    this.language = lang;
    i18n.setLang(lang);
    this.notify('langChange', lang);
  }

  setXqPieceStyle(style) {
    this.xqPieceStyle = style;
    localStorage.setItem('chessverse_xq_style', style);
    this.notify('settingsChange', { xqPieceStyle: style });
  }

  setBoardScale(scale) {
    this.boardScale = scale;
    localStorage.setItem('chessverse_scale', scale);
    this.applyBoardScale(scale);
    this.notify('settingsChange', { boardScale: scale });
  }

  applyBoardScale(scale) {
    document.documentElement.setAttribute('data-scale', scale);
  }

  setShowMoveHints(show) {
    this.showMoveHints = show;
    localStorage.setItem('chessverse_hints', show ? 'true' : 'false');
    this.notify('settingsChange', { showMoveHints: show });
  }

  setVolume(vol) {
    this.volume = vol;
    localStorage.setItem('chessverse_volume', vol.toString());
    sounds.volume = vol;
    this.notify('settingsChange', { volume: vol });
  }

  setTimeControl(seconds) {
    this.timeControl = seconds;
    localStorage.setItem('chessverse_time_control', seconds.toString());
    this.resetClock();
    this.notify('settingsChange', { timeControl: seconds });
  }

  // Clock Control Methods
  resetClock() {
    this.stopClock();
    this.playerTimes = { p1: this.timeControl, p2: this.timeControl };
    this.notify('clockTick', this.playerTimes);
  }

  startClock(activePlayer = 'p1', onTimeOut = null) {
    if (this.timeControl <= 0) return; // Unlimited
    this.activeClock = activePlayer;

    if (this.clockInterval) clearInterval(this.clockInterval);

    this.clockInterval = setInterval(() => {
      if (!this.activeClock) return;
      if (this.playerTimes[this.activeClock] > 0) {
        this.playerTimes[this.activeClock]--;
        this.notify('clockTick', this.playerTimes);
      } else {
        // Time ran out!
        this.stopClock();
        if (onTimeOut) onTimeOut(this.activeClock);
        this.notify('timeOut', this.activeClock);
      }
    }, 1000);
  }

  switchClockTurn(newPlayer, onTimeOut) {
    if (this.timeControl <= 0) return;
    this.activeClock = newPlayer;
    this.startClock(newPlayer, onTimeOut);
  }

  stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    this.activeClock = null;
  }

  formatTime(seconds) {
    if (seconds <= 0 && this.timeControl <= 0) return '∞';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  recordGameResult(gameId, result) {
    if (!this.stats[gameId]) {
      this.stats[gameId] = { wins: 0, losses: 0, draws: 0 };
    }
    if (result === 'win') this.stats[gameId].wins++;
    else if (result === 'loss') this.stats[gameId].losses++;
    else if (result === 'draw') this.stats[gameId].draws++;

    localStorage.setItem('chessverse_stats', JSON.stringify(this.stats));
    this.notify('statsChange', this.stats);
  }

  getStats(gameId) {
    return this.stats[gameId] || { wins: 0, losses: 0, draws: 0 };
  }

  resetAllStats() {
    this.stats = {
      chess: { wins: 0, losses: 0, draws: 0 },
      xiangqi: { wins: 0, losses: 0, draws: 0 },
      caro: { wins: 0, losses: 0, draws: 0 },
      othello: { wins: 0, losses: 0, draws: 0 },
      coganh: { wins: 0, losses: 0, draws: 0 },
      go: { wins: 0, losses: 0, draws: 0 },
      checkers: { wins: 0, losses: 0, draws: 0 }
    };
    localStorage.setItem('chessverse_stats', JSON.stringify(this.stats));
    this.notify('statsChange', this.stats);
  }
}

export const gameState = new GameStateManager();
