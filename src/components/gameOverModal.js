// Game Over Celebration & Review Modal (Google Play Games standard)
import { gameState, GAME_INFO } from '../state/gameState.js';
import { i18n } from '../i18n/translations.js';
import { showAchievementsModal } from './achievementsModal.js';

export function showGameOverModal({ winner, gameId, onRematch, onSwitchGame }) {
  const existing = document.getElementById('game-over-modal');
  if (existing) existing.remove();

  const isWin = winner === 'p1' || winner === 'w' || winner === 'B' || winner === 'b_folk' || winner === 'X';
  const isDraw = winner === 'draw';
  const gameInfo = i18n.getGame(gameId) || GAME_INFO[gameId] || {};
  const stats = gameState.stats[gameId] || { wins: 0, losses: 0, draws: 0 };
  const total = stats.wins + stats.losses + stats.draws;
  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
  const lang = i18n.getLang();

  let title, emblem, subtitle;
  if (isDraw) {
    emblem = '🤝';
    title = lang === 'vi' ? 'HÒA CỜ NGOẠN MỤC!' : 'DRAW MATCH!';
    subtitle = lang === 'vi' ? 'Kỳ phùng địch thủ, bất phân thắng bại.' : 'Equally matched grandmasters!';
  } else if (isWin || gameState.mode === 'pvp') {
    emblem = '👑';
    title = lang === 'vi' ? 'CHIẾN THẮNG HUY HOÀNG!' : 'VICTORIOUS TRIUMPH!';
    subtitle = lang === 'vi' 
      ? `Chúc mừng bạn đã giành chiến thắng trong môn ${gameInfo.title || 'Cờ'}!`
      : `Outstanding victory in ${gameInfo.title || 'the match'}!`;
  } else {
    emblem = '🛡️';
    title = lang === 'vi' ? 'VÁN CỜ KẾT THÚC' : 'MATCH CONCLUDED';
    subtitle = lang === 'vi' ? 'Một thế cờ học hỏi sâu sắc. Hãy phục thù ở ván tiếp theo!' : 'A great tactical lesson. Try again and claim victory!';
  }

  const modal = document.createElement('div');
  modal.id = 'game-over-modal';
  modal.className = 'modal-backdrop visible';

  modal.innerHTML = `
    <div class="modal-dialog game-over-dialog">
      <div class="game-over-header">
        <div class="victory-emblem">${emblem}</div>
        <div class="store-badge-pill">${i18n.t('playStoreReady') || 'CHESSVERSE ARENA'}</div>
        <h2 class="victory-title">${title}</h2>
        <p class="victory-subtitle">${subtitle}</p>
      </div>

      <div class="game-over-card">
        <div class="game-over-stat-item">
          <span class="stat-label">${lang === 'vi' ? 'Môn cờ' : 'Game'}</span>
          <strong class="stat-val highlight">${gameInfo.title || gameId}</strong>
        </div>
        <div class="game-over-stat-item">
          <span class="stat-label">${lang === 'vi' ? 'Chế độ' : 'Mode'}</span>
          <strong class="stat-val">${gameState.mode === 'ai' ? (lang === 'vi' ? 'Đấu Máy AI (' + gameState.difficulty.toUpperCase() + ')' : 'vs AI (' + gameState.difficulty + ')') : (lang === 'vi' ? '2 Người chơi' : '2 Players')}</strong>
        </div>
        <div class="game-over-stat-item">
          <span class="stat-label">${lang === 'vi' ? 'Kỷ lục môn này' : 'Record'}</span>
          <strong class="stat-val text-win">${stats.wins}W - ${stats.losses}L - ${stats.draws}D (${winRate}%)</strong>
        </div>
      </div>

      <div class="game-over-actions">
        <button class="action-btn primary-btn btn-large" id="modal-btn-rematch">
          <span class="btn-icon">🔄</span>
          <span>${i18n.t('rematch') || 'Đấu Lại'}</span>
        </button>
        <button class="action-btn secondary-btn" id="modal-btn-achievements">
          <span class="btn-icon">🏆</span>
          <span>${i18n.t('achievements') || 'Thành Tựu'}</span>
        </button>
        <button class="action-btn secondary-btn" id="modal-btn-review">
          <span class="btn-icon">🔍</span>
          <span>${i18n.t('reviewBoard') || 'Xem Lại'}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();

  modal.querySelector('#modal-btn-rematch')?.addEventListener('click', () => {
    close();
    if (onRematch) onRematch();
  });

  modal.querySelector('#modal-btn-achievements')?.addEventListener('click', () => {
    close();
    showAchievementsModal();
  });

  modal.querySelector('#modal-btn-review')?.addEventListener('click', () => {
    close();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
