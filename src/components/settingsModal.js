// Settings and Board Customization Modal
import { gameState } from '../state/gameState.js';
import { i18n } from '../i18n/translations.js';
import { sounds } from '../audio/soundEngine.js';
import { showAboutModal } from './aboutModal.js';

export function showSettingsModal(onApplied) {
  let modal = document.getElementById('settings-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal-backdrop';
    modal.className = 'rules-modal-backdrop';
    document.body.appendChild(modal);
  }

  const t = (k) => i18n.t(k);
  const lang = i18n.getLang();
  const currentStyle = gameState.xqPieceStyle;
  const currentScale = gameState.boardScale;
  const currentHints = gameState.showMoveHints;
  const currentVol = Math.round(gameState.volume * 100);
  const currentTime = gameState.timeControl;

  modal.innerHTML = `
    <div class="rules-modal-card settings-modal-card">
      <div class="modal-header">
        <div>
          <span class="modal-badge">${t('settingsBadge')}</span>
          <h2 class="modal-title">⚙️ ${t('settingsTitle')}</h2>
        </div>
        <button class="modal-close-btn" id="settings-close">&times;</button>
      </div>

      <div class="modal-body settings-body">
        <!-- 1. Language -->
        <div class="setting-item">
          <div class="setting-label-col">
            <label class="setting-title">🌐 ${t('languageLabel')}</label>
            <span class="setting-desc">Chọn ngôn ngữ hiển thị giao diện</span>
          </div>
          <div class="setting-control-col">
            <select class="control-select" id="setting-lang">
              <option value="vi" ${lang === 'vi' ? 'selected' : ''}>🇻🇳 Tiếng Việt</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
            </select>
          </div>
        </div>

        <!-- 2. Xiangqi Piece Display Style -->
        <div class="setting-item">
          <div class="setting-label-col">
            <label class="setting-title">🀄 ${t('xqPieceStyleLabel')}</label>
            <span class="setting-desc">Tùy biến chữ quân Cờ Tướng phù hợp cho mọi lứa tuổi</span>
          </div>
          <div class="setting-control-col">
            <select class="control-select" id="setting-xq-style">
              <option value="hanzi" ${currentStyle === 'hanzi' ? 'selected' : ''}>${t('xqStyleHanzi')}</option>
              <option value="viet" ${currentStyle === 'viet' ? 'selected' : ''}>${t('xqStyleViet')}</option>
              <option value="both" ${currentStyle === 'both' ? 'selected' : ''}>${t('xqStyleBoth')}</option>
            </select>
          </div>
        </div>

        <!-- 3. Board Scale / Accessibility -->
        <div class="setting-item">
          <div class="setting-label-col">
            <label class="setting-title">🔍 ${t('boardScaleLabel')}</label>
            <span class="setting-desc">Phóng to bàn cờ giúp người lớn tuổi & trẻ em nhìn rõ hơn</span>
          </div>
          <div class="setting-control-col">
            <select class="control-select" id="setting-scale">
              <option value="compact" ${currentScale === 'compact' ? 'selected' : ''}>${t('scaleCompact')}</option>
              <option value="standard" ${currentScale === 'standard' ? 'selected' : ''}>${t('scaleStandard')}</option>
              <option value="large" ${currentScale === 'large' ? 'selected' : ''}>${t('scaleLarge')}</option>
            </select>
          </div>
        </div>

        <!-- 4. Move Hints -->
        <div class="setting-item">
          <div class="setting-label-col">
            <label class="setting-title">💡 ${t('moveHintsLabel')}</label>
            <span class="setting-desc">Hiển thị chấm tròn và vòng tròn hướng dẫn nước đi</span>
          </div>
          <div class="setting-control-col">
            <label class="switch-toggle">
              <input type="checkbox" id="setting-hints" ${currentHints ? 'checked' : ''}>
              <span class="slider-round"></span>
            </label>
          </div>
        </div>

        <!-- 5. Sound & Volume -->
        <div class="setting-item">
          <div class="setting-label-col">
            <label class="setting-title">🔊 ${t('soundVolumeLabel')} (<span id="vol-display">${currentVol}%</span>)</label>
            <span class="setting-desc">Điều chỉnh âm thanh gõ cờ và hiệu ứng</span>
          </div>
          <div class="setting-control-col volume-slider-row">
            <input type="range" min="0" max="100" value="${currentVol}" class="slider-range" id="setting-volume">
          </div>
        </div>

        <!-- 6. Chess Clock Timer -->
        <div class="setting-item">
          <div class="setting-label-col">
            <label class="setting-title">⏱️ ${t('timerLabel')}</label>
            <span class="setting-desc">Thiết lập thời gian đếm ngược cho mỗi bên</span>
          </div>
          <div class="setting-control-col">
            <select class="control-select" id="setting-timer">
              <option value="0" ${currentTime === 0 ? 'selected' : ''}>${t('timeUnlimited')}</option>
              <option value="180" ${currentTime === 180 ? 'selected' : ''}>${t('time3m')}</option>
              <option value="300" ${currentTime === 300 ? 'selected' : ''}>${t('time5m')}</option>
              <option value="600" ${currentTime === 600 ? 'selected' : ''}>${t('time10m')}</option>
            </select>
          </div>
        </div>
        <!-- 7. Google Play Store Compliance & Privacy -->
        <div class="setting-item store-policy-item">
          <div class="setting-label-col">
            <label class="setting-title">📜 ${t('privacyPolicy') || 'Chính Sách Bảo Mật'} & Bản Quyền</label>
            <span class="setting-desc">100% Offline, bảo mật an toàn cho trẻ em & mọi lứa tuổi</span>
          </div>
          <div class="setting-control-col">
            <button class="action-btn secondary-btn" id="btn-open-privacy" type="button">
              <span>ℹ️</span>
              <span>${t('aboutApp') || 'Xem Chi Tiết'}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="primary-btn" id="settings-save">💾 ${t('saveSettings')}</button>
      </div>
    </div>
  `;

  modal.classList.add('visible');

  // Volume slider dynamic label
  const volInput = modal.querySelector('#setting-volume');
  const volDisplay = modal.querySelector('#vol-display');
  if (volInput && volDisplay) {
    volInput.addEventListener('input', (e) => {
      volDisplay.textContent = `${e.target.value}%`;
    });
  }

  const close = () => modal.classList.remove('visible');
  modal.querySelector('#settings-close').addEventListener('click', close);
  modal.querySelector('#btn-open-privacy')?.addEventListener('click', () => {
    showAboutModal();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector('#settings-save').addEventListener('click', () => {
    const newLang = modal.querySelector('#setting-lang').value;
    const newStyle = modal.querySelector('#setting-xq-style').value;
    const newScale = modal.querySelector('#setting-scale').value;
    const newHints = modal.querySelector('#setting-hints').checked;
    const newVol = parseInt(modal.querySelector('#setting-volume').value, 10) / 100;
    const newTimer = parseInt(modal.querySelector('#setting-timer').value, 10);

    gameState.setXqPieceStyle(newStyle);
    gameState.setBoardScale(newScale);
    gameState.setShowMoveHints(newHints);
    gameState.setVolume(newVol);
    gameState.setTimeControl(newTimer);

    if (newLang !== i18n.getLang()) {
      gameState.setLanguage(newLang);
    }

    close();
    if (onApplied) onApplied();
  });
}
