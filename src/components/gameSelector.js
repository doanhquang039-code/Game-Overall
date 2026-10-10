// Game Selector Component with 7 Games & Bilingual Support
import { GAME_INFO, gameState } from '../state/gameState.js';
import { i18n } from '../i18n/translations.js';

export function renderGameSelector(container, onSelectGame) {
  const t = (k) => i18n.t(k);

  container.innerHTML = `
    <div class="game-selector-bar">
      <div class="selector-header">
        <span class="hub-pill">${t('hubPill')}</span>
        <h2 class="hub-title">${t('chooseGame')}</h2>
      </div>
      <div class="game-cards-row">
        ${Object.values(GAME_INFO).map(game => {
          const gameTrans = i18n.getGame(game.id);
          return `
            <button class="game-card ${gameState.currentGame === game.id ? 'active' : ''}" data-game-id="${game.id}">
              <div class="card-glow"></div>
              <div class="card-icon">${game.icon}</div>
              <div class="card-badge">${game.badge}</div>
              <div class="card-content">
                <h3 class="card-title">${gameTrans.title || game.title}</h3>
                <p class="card-sub">${gameTrans.tag || game.tag}</p>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach click listeners
  container.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      const gameId = card.dataset.gameId;
      container.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if (onSelectGame) onSelectGame(gameId);
    });
  });
}
