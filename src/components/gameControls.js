// Game Controls Bar: Mode, Difficulty, Actions (Undo, Reset), Theme, Audio, Rules, Stats, Settings
import { gameState } from '../state/gameState.js';
import { sounds } from '../audio/soundEngine.js';
import { i18n } from '../i18n/translations.js';

export function renderGameControls(container, handlers) {
  const isMuted = sounds.isMuted();
  const t = (k) => i18n.t(k);
  const lang = i18n.getLang();

  container.innerHTML = `
    <div class="controls-toolbar">
      <!-- Left side: Mode & Difficulty -->
      <div class="control-group">
        <div class="pill-segmented" id="mode-selector">
          <button class="pill-btn ${gameState.mode === 'ai' ? 'active' : ''}" data-mode="ai" title="${t('vsAi')}">
            <span class="btn-icon">🤖</span>
            <span>${t('vsAi')}</span>
          </button>
          <button class="pill-btn ${gameState.mode === 'pvp' ? 'active' : ''}" data-mode="pvp" title="${t('pvp')}">
            <span class="btn-icon">👥</span>
            <span>${t('pvp')}</span>
          </button>
        </div>

        <div class="diff-selector-wrapper ${gameState.mode === 'pvp' ? 'hidden' : ''}" id="diff-wrapper">
          <label class="control-label">${t('difficulty')}</label>
          <select class="control-select" id="difficulty-select">
            <option value="easy" ${gameState.difficulty === 'easy' ? 'selected' : ''}>${t('easy')}</option>
            <option value="medium" ${gameState.difficulty === 'medium' ? 'selected' : ''}>${t('medium')}</option>
            <option value="hard" ${gameState.difficulty === 'hard' ? 'selected' : ''}>${t('hard')}</option>
          </select>
        </div>
      </div>

      <!-- Center: Action Buttons -->
      <div class="control-group actions-group">
        <button class="action-btn undo-btn" id="btn-undo" title="${t('undo')}">
          <span class="btn-icon">↩️</span>
          <span>${t('undo')}</span>
        </button>
        <button class="action-btn reset-btn" id="btn-reset" title="${t('newGame')}">
          <span class="btn-icon">🔄</span>
          <span>${t('newGame')}</span>
        </button>
      </div>

      <!-- Right side: Utilities & Modals -->
      <div class="control-group utils-group">
        <!-- Language Switcher Button -->
        <button class="action-btn secondary-btn lang-toggle-btn" id="btn-lang-toggle" title="Đổi ngôn ngữ / Change Language">
          <span>${lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
        </button>

        <!-- Sound toggle -->
        <button class="icon-btn" id="btn-sound" title="${isMuted ? 'Unmute' : 'Mute'}">
          <span id="sound-icon">${isMuted ? '🔇' : '🔊'}</span>
        </button>

        <!-- Theme selector -->
        <div class="theme-dropdown-wrapper">
          <button class="icon-btn" id="btn-theme-toggle" title="${t('theme')}">
            <span>🎨</span>
          </button>
          <div class="theme-menu hidden" id="theme-menu">
            <button class="theme-option ${gameState.theme === 'classic' ? 'active' : ''}" data-theme="classic">
              ${t('themeClassic')}
            </button>
            <button class="theme-option ${gameState.theme === 'cyberpunk' ? 'active' : ''}" data-theme="cyberpunk">
              ${t('themeCyberpunk')}
            </button>
            <button class="theme-option ${gameState.theme === 'zen' ? 'active' : ''}" data-theme="zen">
              ${t('themeZen')}
            </button>
            <button class="theme-option ${gameState.theme === 'midnight' ? 'active' : ''}" data-theme="midnight">
              ${t('themeMidnight')}
            </button>
          </div>
        </div>

        <!-- Settings Modal Button -->
        <button class="action-btn secondary-btn" id="btn-settings" title="${t('settings')}">
          <span class="btn-icon">⚙️</span>
          <span>${t('settings')}</span>
        </button>

        <!-- Rules modal button -->
        <button class="action-btn secondary-btn" id="btn-rules" title="${t('rules')}">
          <span class="btn-icon">📖</span>
          <span>${t('rules')}</span>
        </button>

        <!-- Stats modal button -->
        <button class="action-btn secondary-btn" id="btn-stats" title="${t('stats')}">
          <span class="btn-icon">🏆</span>
          <span>${t('stats')}</span>
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  const modeButtons = container.querySelectorAll('#mode-selector .pill-btn');
  const diffWrapper = container.querySelector('#diff-wrapper');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      gameState.setMode(mode);
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (mode === 'pvp') {
        diffWrapper.classList.add('hidden');
      } else {
        diffWrapper.classList.remove('hidden');
      }
      if (handlers.onModeChange) handlers.onModeChange(mode);
    });
  });

  const diffSelect = container.querySelector('#difficulty-select');
  if (diffSelect) {
    diffSelect.addEventListener('change', (e) => {
      gameState.setDifficulty(e.target.value);
    });
  }

  const undoBtn = container.querySelector('#btn-undo');
  if (undoBtn) undoBtn.addEventListener('click', () => handlers.onUndo && handlers.onUndo());

  const resetBtn = container.querySelector('#btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => handlers.onReset && handlers.onReset());

  // Quick Language Toggle
  const langBtn = container.querySelector('#btn-lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const nextLang = i18n.getLang() === 'vi' ? 'en' : 'vi';
      gameState.setLanguage(nextLang);
    });
  }

  const soundBtn = container.querySelector('#btn-sound');
  const soundIcon = container.querySelector('#sound-icon');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const muted = sounds.toggleMute();
      soundIcon.textContent = muted ? '🔇' : '🔊';
      soundBtn.title = muted ? 'Unmute' : 'Mute';
    });
  }

  // Theme dropdown logic
  const themeToggle = container.querySelector('#btn-theme-toggle');
  const themeMenu = container.querySelector('#theme-menu');
  if (themeToggle && themeMenu) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      themeMenu.classList.add('hidden');
    });

    themeMenu.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        gameState.setTheme(theme);
        themeMenu.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        themeMenu.classList.add('hidden');
      });
    });
  }

  const settingsBtn = container.querySelector('#btn-settings');
  if (settingsBtn) settingsBtn.addEventListener('click', () => handlers.onShowSettings && handlers.onShowSettings());

  const rulesBtn = container.querySelector('#btn-rules');
  if (rulesBtn) rulesBtn.addEventListener('click', () => handlers.onShowRules && handlers.onShowRules());

  const statsBtn = container.querySelector('#btn-stats');
  if (statsBtn) statsBtn.addEventListener('click', () => handlers.onShowStats && handlers.onShowStats());
}
