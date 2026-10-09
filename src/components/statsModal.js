// Statistics & Leaderboard Modal with Bilingual Support
import { gameState, GAME_INFO } from '../state/gameState.js';
import { i18n } from '../i18n/translations.js';

export function showStatsModal() {
  let modal = document.getElementById('stats-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'stats-modal-backdrop';
    modal.className = 'rules-modal-backdrop';
    document.body.appendChild(modal);
  }

  const t = (k) => i18n.t(k);
  const lang = i18n.getLang();

  const renderStatsBody = () => {
    let totalWins = 0, totalLosses = 0, totalDraws = 0;
    const rows = Object.values(GAME_INFO).map(info => {
      const s = gameState.getStats(info.id);
      totalWins += s.wins;
      totalLosses += s.losses;
      totalDraws += s.draws;
      const totalGames = s.wins + s.losses + s.draws;
      const winRate = totalGames > 0 ? Math.round((s.wins / totalGames) * 100) : 0;
      const gameTrans = i18n.translations[lang][info.id] || info;

      return `
        <div class="stat-row">
          <div class="stat-game-info">
            <span class="stat-icon">${info.icon}</span>
            <div>
              <div class="stat-game-title">${gameTrans.title}</div>
              <div class="stat-game-sub">${totalGames} ${t('gamesPlayed')}</div>
            </div>
          </div>
          <div class="stat-numbers">
            <span class="stat-badge win-badge">${t('wins')}: ${s.wins}</span>
            <span class="stat-badge loss-badge">${t('losses')}: ${s.losses}</span>
            <span class="stat-badge draw-badge">${lang === 'vi' ? 'Hòa' : 'Draw'}: ${s.draws}</span>
            <span class="stat-badge rate-badge">${winRate}%</span>
          </div>
        </div>
      `;
    }).join('');

    const allGames = totalWins + totalLosses + totalDraws;
    const overallWinRate = allGames > 0 ? Math.round((totalWins / allGames) * 100) : 0;

    modal.innerHTML = `
      <div class="rules-modal-card stats-modal-card">
        <div class="modal-header">
          <div>
            <span class="modal-badge">${t('statsBadge')}</span>
            <h2 class="modal-title">🏆 ${t('statsTitle')}</h2>
          </div>
          <button class="modal-close-btn" id="stats-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="stats-overview-grid">
            <div class="overview-box">
              <span class="ov-label">${t('totalGames')}</span>
              <span class="ov-val">${allGames}</span>
            </div>
            <div class="overview-box win-box">
              <span class="ov-label">${t('wins')}</span>
              <span class="ov-val">${totalWins}</span>
            </div>
            <div class="overview-box loss-box">
              <span class="ov-label">${t('losses')}</span>
              <span class="ov-val">${totalLosses}</span>
            </div>
            <div class="overview-box rate-box">
              <span class="ov-label">${t('winRate')}</span>
              <span class="ov-val">${overallWinRate}%</span>
            </div>
          </div>

          <div class="stats-list">
            ${rows}
          </div>
        </div>
        <div class="modal-footer stats-footer">
          <button class="danger-btn" id="btn-reset-stats">${t('resetStats')}</button>
          <button class="primary-btn" id="stats-ok">${t('close')}</button>
        </div>
      </div>
    `;

    const close = () => modal.classList.remove('visible');
    modal.querySelector('#stats-close').addEventListener('click', close);
    modal.querySelector('#stats-ok').addEventListener('click', close);

    const resetBtn = modal.querySelector('#btn-reset-stats');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(t('confirmReset'))) {
          gameState.resetAllStats();
          renderStatsBody();
        }
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  };

  renderStatsBody();
  modal.classList.add('visible');
}
