// Achievements & Google Play Games style Badges System
import { sounds } from '../audio/soundEngine.js';
import confetti from 'canvas-confetti';

export const ACHIEVEMENTS = [
  {
    id: 'first_win',
    icon: '🥇',
    titleVi: 'Kỳ Thủ Khởi Nghiệp',
    titleEn: 'First Victory',
    descVi: 'Giành chiến thắng ván cờ đầu tiên',
    descEn: 'Win your very first match'
  },
  {
    id: 'hard_ai_win',
    icon: '🧠',
    titleVi: 'Bách Chiến Bách Thắng',
    titleEn: 'Master Mind',
    descVi: 'Đánh bại máy AI ở mức độ Khó (Hard)',
    descEn: 'Defeat the AI on Hard difficulty'
  },
  {
    id: 'timed_win',
    icon: '⚡',
    titleVi: 'Kỳ Vương Tốc Độ',
    titleEn: 'Speed Demon',
    descVi: 'Thắng ván cờ có tính thời gian đồng hồ',
    descEn: 'Win a match with a countdown clock active'
  },
  {
    id: 'xiangqi_win',
    icon: '🀄',
    titleVi: 'Soái Trận Thần Kỳ',
    titleEn: 'Xiangqi Champion',
    descVi: 'Giành chiến thắng sát cuộc trong Cờ Tướng',
    descEn: 'Achieve checkmate victory in Xiangqi'
  },
  {
    id: 'caro_win',
    icon: '❌',
    titleVi: 'Ngũ Tử Liên Châu',
    titleEn: 'Gomoku Grandmaster',
    descVi: 'Nối thành công 5 quân liên tiếp trong Cờ Caro',
    descEn: 'Connect 5 stones in a row in Gomoku'
  },
  {
    id: 'othello_win',
    icon: '⚪',
    titleVi: 'Đảo Đảo Càn Khôn',
    titleEn: 'Othello Conqueror',
    descVi: 'Giành chiến thắng áp đảo trong Cờ Lật',
    descEn: 'Win a strategic match in Othello'
  },
  {
    id: 'coganh_win',
    icon: '🪵',
    titleVi: 'Kỳ Thủ Đất Việt',
    titleEn: 'Folk Legend',
    descVi: 'Chiến thắng trong Cờ Gánh Dân Gian',
    descEn: 'Win a traditional Vietnamese Co Ganh match'
  },
  {
    id: 'go_win',
    icon: '☯️',
    titleVi: 'Kỳ Đạo Nhập Môn',
    titleEn: 'Way of Go',
    descVi: 'Chiến thắng tính điểm lãnh thổ trong Cờ Vây',
    descEn: 'Win a tactical 9x9 match in Go'
  },
  {
    id: 'checkers_win',
    icon: '👑',
    titleVi: 'Vua Cờ Đam',
    titleEn: 'Crowned King',
    descVi: 'Chiến thắng trong môn Cờ Đam cổ điển',
    descEn: 'Dominate the board in Checkers'
  },
  {
    id: 'multi_games',
    icon: '🌍',
    titleVi: 'Bách Nghệ Tinh Thông',
    titleEn: 'All-Rounder Grandmaster',
    descVi: 'Thử sức và chơi ít nhất 4 môn cờ khác nhau',
    descEn: 'Play matches across at least 4 different board games'
  }
];

class AchievementManager {
  constructor() {
    const saved = localStorage.getItem('chessverse_achievements');
    this.unlocked = saved ? JSON.parse(saved) : {};
    this.playedGames = new Set(JSON.parse(localStorage.getItem('chessverse_played_games') || '[]'));
  }

  isUnlocked(id) {
    return !!this.unlocked[id];
  }

  recordGamePlay(gameId) {
    this.playedGames.add(gameId);
    localStorage.setItem('chessverse_played_games', JSON.stringify([...this.playedGames]));
    if (this.playedGames.size >= 4) {
      this.unlock('multi_games');
    }
  }

  unlock(id) {
    if (this.unlocked[id]) return; // Already unlocked

    this.unlocked[id] = Date.now();
    localStorage.setItem('chessverse_achievements', JSON.stringify(this.unlocked));

    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
      this.showUnlockToast(ach);
    }
  }

  showUnlockToast(ach) {
    sounds.playWin();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.2 } });

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    let toast = document.getElementById('achievement-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'achievement-toast';
      toast.className = 'achievement-toast';
      document.body.appendChild(toast);
    }

    const lang = localStorage.getItem('chessverse_lang') || 'vi';
    const title = lang === 'vi' ? ach.titleVi : ach.titleEn;
    const desc = lang === 'vi' ? ach.descVi : ach.descEn;

    toast.innerHTML = `
      <div class="ach-toast-icon">${ach.icon}</div>
      <div class="ach-toast-content">
        <div class="ach-toast-badge">🏆 ${lang === 'vi' ? 'THÀNH TỰU MỞ KHÓA!' : 'ACHIEVEMENT UNLOCKED!'}</div>
        <div class="ach-toast-title">${title}</div>
        <div class="ach-toast-desc">${desc}</div>
      </div>
    `;

    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 4500);
  }

  getUnlockedCount() {
    return Object.keys(this.unlocked).length;
  }
}

export const achievements = new AchievementManager();
