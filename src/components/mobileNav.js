// Mobile Bottom Navigation Dock for Google Play Store Mobile UX
import { i18n } from '../i18n/translations.js';

export function renderMobileNav(container, handlers) {
  const t = (k) => i18n.t(k);

  container.innerHTML = `
    <nav class="mobile-bottom-dock" id="mobile-bottom-dock">
      <button class="dock-item" id="dock-btn-games" title="${t('gameNav') || 'Bàn Cờ'}">
        <span class="dock-icon">🎮</span>
        <span class="dock-label">${t('gameNav') || 'Bàn Cờ'}</span>
      </button>

      <button class="dock-item" id="dock-btn-hint" title="${t('hint') || 'Mách Nước'}">
        <span class="dock-icon pulse-badge">💡</span>
        <span class="dock-label">${t('hint') || 'Mách Nước'}</span>
      </button>

      <button class="dock-item" id="dock-btn-undo" title="${t('undo') || 'Đi Lại'}">
        <span class="dock-icon">↩️</span>
        <span class="dock-label">${t('undo') || 'Đi Lại'}</span>
      </button>

      <button class="dock-item" id="dock-btn-reset" title="${t('newGame') || 'Ván Mới'}">
        <span class="dock-icon">🔄</span>
        <span class="dock-label">${t('newGame') || 'Ván Mới'}</span>
      </button>

      <button class="dock-item" id="dock-btn-achievements" title="${t('achievements') || 'Thành Tựu'}">
        <span class="dock-icon">🏆</span>
        <span class="dock-label">${t('achievements') || 'Thành Tựu'}</span>
      </button>

      <button class="dock-item" id="dock-btn-settings" title="${t('settings') || 'Cài Đặt'}">
        <span class="dock-icon">⚙️</span>
        <span class="dock-label">${t('settings') || 'Cài Đặt'}</span>
      </button>
    </nav>
  `;

  // Attach event handlers
  container.querySelector('#dock-btn-games')?.addEventListener('click', () => {
    handlers.onShowGames && handlers.onShowGames();
  });

  container.querySelector('#dock-btn-hint')?.addEventListener('click', () => {
    handlers.onHint && handlers.onHint();
  });

  container.querySelector('#dock-btn-undo')?.addEventListener('click', () => {
    handlers.onUndo && handlers.onUndo();
  });

  container.querySelector('#dock-btn-reset')?.addEventListener('click', () => {
    handlers.onReset && handlers.onReset();
  });

  container.querySelector('#dock-btn-achievements')?.addEventListener('click', () => {
    handlers.onShowAchievements && handlers.onShowAchievements();
  });

  container.querySelector('#dock-btn-settings')?.addEventListener('click', () => {
    handlers.onShowSettings && handlers.onShowSettings();
  });
}
