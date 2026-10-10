// Internationalization (i18n) - Bilingual Vietnamese & English Dictionary

export const translations = {
  vi: {
    // Header
    appTitle: 'CHESSVERSE',
    appTagline: 'BÁCH KỲ TRẬN • ĐẠI SẢNH CỜ ĐA DẠNG',
    
    // Game Titles & Info
    chess: {
      title: 'Cờ Vua Quốc Tế',
      subtitle: 'International Chess',
      tag: 'Chiến Thuật Kinh Điển',
      badge: '8x8',
      desc: 'Bàn cờ 64 ô với Vua, Hậu, Xe, Tượng, Mã, Tốt. Chiếu bí vua đối phương để chiến thắng.'
    },
    xiangqi: {
      title: 'Cờ Tướng',
      subtitle: 'Xiangqi - Sở Hà Hán Giới',
      tag: 'Bách Trận Tranh Hùng',
      badge: '9x10',
      desc: 'Đấu trí Á Đông với sông Sở Hà - Hán Giới, cung Cửu Cung, Pháo nhảy ngòi, Tướng không lộ mặt.'
    },
    caro: {
      title: 'Cờ Caro (Gomoku)',
      subtitle: 'Năm Quân Thẳng Hàng',
      tag: 'Đấu Trí Tốc Độ',
      badge: '15x15',
      desc: 'Nối liền 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng.'
    },
    othello: {
      title: 'Cờ Lật (Reversi)',
      subtitle: 'Othello Strategy',
      tag: 'Lật Ngược Thế Cờ',
      badge: '8x8',
      desc: 'Kẹp quân đối phương để lật toàn bộ về màu của bạn. Chiếm góc để nắm chắc phần thắng.'
    },
    coganh: {
      title: 'Cờ Gánh Dân Gian',
      subtitle: 'Vietnamese Folk Game',
      tag: 'Di Sản Cổ Truyền',
      badge: '5x5',
      desc: 'Trò chơi trí tuệ dân gian Việt Nam với tuyệt chiêu "Gánh" và "Vây" triệt tiêu đường đi.'
    },
    go: {
      title: 'Cờ Vây (Go / Weiqi)',
      subtitle: 'Kỳ Đạo Nhập Môn 9x9',
      tag: 'Trí Tuệ Phương Đông',
      badge: '9x9',
      desc: 'Vây bắt quân không còn khí (liberties) và chiếm cứ lãnh thổ trên bàn cờ 9x9.'
    },
    checkers: {
      title: 'Cờ Đam (Checkers)',
      subtitle: 'Classic Draughts',
      tag: 'Nhảy Bắt Liên Hoàn',
      badge: '8x8',
      desc: 'Di chuyển chéo, nhảy bắt quân đối phương và phong Vua (King) khi đến hàng cuối cùng.'
    },

    // Selector
    chooseGame: 'Chọn Kỳ Nghệ So Tài',
    hubPill: '⚡ BÁCH KỲ TRẬN ⚡',

    // Controls
    vsAi: 'Đấu với AI',
    pvp: '2 Người Chơi',
    difficulty: 'Độ khó:',
    easy: '🌱 Dễ (Tập sự)',
    medium: '⚔️ Vừa (Thử thách)',
    hard: '🔥 Khó (Cao thủ)',
    undo: 'Đi Lại',
    newGame: 'Ván Mới',
    rules: 'Luật Chơi',
    stats: 'Thành Tích',
    settings: 'Cài Đặt',
    theme: 'Giao Diện',

    // Themes
    themeClassic: '🪵 Hoàng Gia Cổ Điển',
    themeCyberpunk: '🌌 Cyberpunk Neon',
    themeZen: '🎋 Thủy Mặc Zen',
    themeMidnight: '🌑 Midnight Obsidian',

    // Status
    turn: 'Lượt đi',
    waiting: 'Chờ',
    aiThinking: 'Máy AI đang tính toán nước đi...',
    checkAlert: '⚠️ [ĐANG BỊ CHIẾU!]',
    xqCheckAlert: '⚔️ [CHIẾU TƯỚNG!]',
    gameOver: 'Trận đấu kết thúc!',
    youWin: 'Bạn đã chiến thắng! 🏆',
    youLose: 'Bạn đã thất bại! 😢',
    draw: 'Hòa cờ!',

    // Settings Modal
    settingsTitle: 'Cài Đặt & Tùy Chỉnh Bàn Cờ',
    settingsBadge: 'TÙY BIẾN TRẢI NGHIỆM',
    languageLabel: 'Ngôn Ngữ (Language):',
    xqPieceStyleLabel: 'Kiểu hiển thị quân Cờ Tướng:',
    xqStyleHanzi: 'Chữ Hán Cổ Điển (帥, 將, 俥...)',
    xqStyleViet: 'Thuần Tiếng Việt (TƯỚNG, XE, PHÁO...)',
    xqStyleBoth: 'Song Ngữ (Chữ Hán + Tên Việt)',
    boardScaleLabel: 'Kích thước bàn cờ (Phù hợp mọi lứa tuổi):',
    scaleCompact: 'Vừa vặn (Compact)',
    scaleStandard: 'Chuẩn (Standard)',
    scaleLarge: 'Lớn & Rõ Ràng (Large - Khuyên dùng cho trẻ/người lớn tuổi)',
    moveHintsLabel: 'Hiển thị gợi ý nước đi hợp lệ:',
    soundLabel: 'Hiệu ứng âm thanh:',
    soundVolumeLabel: 'Âm lượng âm thanh:',
    timerLabel: 'Đồng hồ thời gian mỗi ván:',
    timeUnlimited: 'Vô hạn (Thư giãn, không giới hạn)',
    time3m: '3 Phút (Chớp / Blitz)',
    time5m: '5 Phút (Nhanh / Rapid)',
    time10m: '10 Phút (Tiêu chuẩn / Standard)',
    saveSettings: 'Lưu & Áp Dụng',

    // Stats Modal
    statsTitle: 'Bảng Thành Tích Kỳ Thủ',
    statsBadge: 'THỐNG KÊ CHIẾN TÍCH',
    totalGames: 'Tổng Trận',
    wins: 'Chiến Thắng',
    losses: 'Thất Bại',
    winRate: 'Tỉ Lệ Thắng',
    gamesPlayed: 'ván đã đấu',
    resetStats: 'Đặt Lại Thống Kê',
    close: 'Đóng',
    confirmReset: 'Bạn có chắc muốn xóa toàn bộ lịch sử thành tích không?',

    // Hint & Store Features
    hint: 'Mách Nước',
    achievements: 'Thành Tựu',
    rematch: 'Đấu Lại',
    switchGame: 'Đổi Môn Cờ',
    reviewBoard: 'Xem Lại Bàn Cờ',
    aboutApp: 'Thông Tin & Bản Quyền',
    privacyPolicy: 'Chính Sách Bảo Mật',
    playStoreReady: 'Chuẩn Google Play Store',
    offlinePlay: 'Chơi Mượt Offline 100%',
    gameNav: 'Bàn Cờ'
  },

  en: {
    // Header
    appTitle: 'CHESSVERSE',
    appTagline: 'MASTER CHESS ARCADE • MULTI-BOARD ARENA',

    // Game Titles & Info
    chess: {
      title: 'International Chess',
      subtitle: 'Classic Royal Strategy',
      tag: 'Grandmaster Classic',
      badge: '8x8',
      desc: '64-square grid with King, Queen, Rook, Bishop, Knight, Pawn. Checkmate the enemy King.'
    },
    xiangqi: {
      title: 'Xiangqi (Chinese Chess)',
      subtitle: 'River & Nine Palaces',
      tag: 'Eastern Strategy',
      badge: '9x10',
      desc: 'Legendary battle across the river Chu-Han with Cannons jumping screens and palace defense.'
    },
    caro: {
      title: 'Gomoku (Caro / 5-in-a-row)',
      subtitle: 'Five in a Row',
      tag: 'Speed & Tactics',
      badge: '15x15',
      desc: 'Connect five stones in an unbroken row horizontally, vertically, or diagonally to win.'
    },
    othello: {
      title: 'Othello / Reversi',
      subtitle: 'Reverse the Board',
      tag: 'Dynamic Flips',
      badge: '8x8',
      desc: 'Flank opponent disks to flip them to your color. Secure corners for lasting victory.'
    },
    coganh: {
      title: 'Co Ganh (Folk Chess)',
      subtitle: 'Vietnamese Traditional Game',
      tag: 'Folk Heritage',
      badge: '5x5',
      desc: 'Traditional Vietnamese 25-point board featuring "Ganh" double flank and "Vay" suffocation traps.'
    },
    go: {
      title: 'Go / Weiqi (9x9)',
      subtitle: 'Tactical Way of Go',
      tag: 'Ancient Strategy',
      badge: '9x9',
      desc: 'Surround opponent stones with zero liberties and secure maximum territory on 9x9 board.'
    },
    checkers: {
      title: 'Checkers (Draughts)',
      subtitle: 'Classic Jump & Crown',
      tag: 'Multi-Jump Action',
      badge: '8x8',
      desc: 'Move diagonally forward, jump over enemy pieces, and crown your Kings to dominate.'
    },

    // Selector
    chooseGame: 'Select Board Game Arena',
    hubPill: '⚡ CHESS ARENA ⚡',

    // Controls
    vsAi: 'Play vs AI',
    pvp: '2 Players',
    difficulty: 'Difficulty:',
    easy: '🌱 Easy (Novice)',
    medium: '⚔️ Medium (Challenger)',
    hard: '🔥 Hard (Master)',
    undo: 'Undo',
    newGame: 'New Game',
    rules: 'Rules',
    stats: 'Stats',
    settings: 'Settings',
    theme: 'Theme',

    // Themes
    themeClassic: '🪵 Royal Classic Wood',
    themeCyberpunk: '🌌 Cyberpunk Neon',
    themeZen: '🎋 Zen Ink Wash',
    themeMidnight: '🌑 Midnight Obsidian',

    // Status
    turn: 'Turn',
    waiting: 'Wait',
    aiThinking: 'AI is calculating move...',
    checkAlert: '⚠️ [CHECK!]',
    xqCheckAlert: '⚔️ [GENERAL IN CHECK!]',
    gameOver: 'Match Concluded!',
    youWin: 'You Won! 🏆',
    youLose: 'You Lost! 😢',
    draw: 'Draw Game!',

    // Settings Modal
    settingsTitle: 'Settings & Board Customization',
    settingsBadge: 'CUSTOMIZE EXPERIENCE',
    languageLabel: 'Language (Ngôn Ngữ):',
    xqPieceStyleLabel: 'Xiangqi Piece Style:',
    xqStyleHanzi: 'Traditional Chinese (帥, 將, 俥...)',
    xqStyleViet: 'Pure Vietnamese (TƯỚNG, XE, PHÁO...)',
    xqStyleBoth: 'Bilingual (Hanzi + Vietnamese label)',
    boardScaleLabel: 'Board & Piece Scale (All Ages Friendly):',
    scaleCompact: 'Compact',
    scaleStandard: 'Standard',
    scaleLarge: 'Large & Clear (Recommended for seniors & children)',
    moveHintsLabel: 'Show legal move indicators:',
    soundLabel: 'Sound effects:',
    soundVolumeLabel: 'Sound volume:',
    timerLabel: 'Game Clock Timer:',
    timeUnlimited: 'Unlimited (Casual & Relaxed)',
    time3m: '3 Minutes (Blitz)',
    time5m: '5 Minutes (Rapid)',
    time10m: '10 Minutes (Standard)',
    saveSettings: 'Save & Apply',

    // Stats Modal
    statsTitle: 'Player Leaderboard & Stats',
    statsBadge: 'CAREER OVERVIEW',
    totalGames: 'Total Games',
    wins: 'Victories',
    losses: 'Defeats',
    winRate: 'Win Rate',
    gamesPlayed: 'matches played',
    resetStats: 'Reset Statistics',
    close: 'Close',
    confirmReset: 'Are you sure you want to erase all match history?',

    // Hint & Store Features
    hint: 'AI Hint',
    achievements: 'Achievements',
    rematch: 'Rematch',
    switchGame: 'Switch Game',
    reviewBoard: 'Review Board',
    aboutApp: 'About & Licenses',
    privacyPolicy: 'Privacy Policy',
    playStoreReady: 'Google Play Store Ready',
    offlinePlay: '100% Offline Capable',
    gameNav: 'Games'
  }
};

class I18nManager {
  constructor() {
    this.lang = localStorage.getItem('chessverse_lang') || 'vi';
    this.translations = translations;
    this.subscribers = [];
  }

  getGame(gameId) {
    const langDict = translations[this.lang] || translations.vi;
    return langDict[gameId] || translations.vi[gameId] || {};
  }

  getLang() {
    return this.lang;
  }

  setLang(lang) {
    if (translations[lang]) {
      this.lang = lang;
      localStorage.setItem('chessverse_lang', lang);
      this.notify();
    }
  }

  t(path) {
    const keys = path.split('.');
    let curr = translations[this.lang];
    for (const k of keys) {
      if (curr && curr[k] !== undefined) {
        curr = curr[k];
      } else {
        // fallback to vi
        let fallback = translations.vi;
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) fallback = fallback[fk];
          else return path;
        }
        return fallback;
      }
    }
    return curr;
  }

  subscribe(cb) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(c => c !== cb);
    };
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.lang));
  }
}

export const i18n = new I18nManager();
