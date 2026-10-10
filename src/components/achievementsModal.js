// Achievements & Trophy Showcase Modal
import { ACHIEVEMENTS, achievements } from '../state/achievements.js';
import { i18n } from '../i18n/translations.js';

export function showAchievementsModal() {
  let modal = document.getElementById('achievements-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'achievements-modal-backdrop';
    modal.className = 'rules-modal-backdrop';
    document.body.appendChild(modal);
  }

  const lang = i18n.getLang();
  const unlockedCount = achievements.getUnlockedCount();
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  modal.innerHTML = `
    <div class="rules-modal-card achievements-modal-card">
      <div class="modal-header">
        <div>
          <span class="modal-badge">🏆 GOOGLE PLAY REWARDS</span>
          <h2 class="modal-title">${lang === 'vi' ? 'Huy Hiệu & Thành Tựu Kỳ Thủ' : 'Player Achievements & Trophies'}</h2>
        </div>
        <button class="modal-close-btn" id="ach-close">&times;</button>
      </div>

      <div class="modal-body ach-body">
        <!-- Progress Bar -->
        <div class="ach-progress-card">
          <div class="ach-progress-header">
            <span class="ach-progress-label">${lang === 'vi' ? 'Tiến Độ Mở Khóa:' : 'Trophy Progress:'}</span>
            <span class="ach-progress-num"><strong>${unlockedCount}</strong> / ${totalCount} (${progressPercent}%)</span>
          </div>
          <div class="ach-progress-track">
            <div class="ach-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- Badges Grid -->
        <div class="ach-grid">
          ${ACHIEVEMENTS.map(ach => {
            const isDone = achievements.isUnlocked(ach.id);
            const title = lang === 'vi' ? ach.titleVi : ach.titleEn;
            const desc = lang === 'vi' ? ach.descVi : ach.descEn;

            return `
              <div class="ach-card ${isDone ? 'unlocked' : 'locked'}">
                <div class="ach-icon-box">
                  ${isDone ? ach.icon : '🔒'}
                </div>
                <div class="ach-card-info">
                  <h4 class="ach-card-title">${title}</h4>
                  <p class="ach-card-desc">${desc}</p>
                </div>
                <div class="ach-card-status">
                  ${isDone ? `<span class="ach-badge-done">✓ ${lang === 'vi' ? 'Đã Nhận' : 'Unlocked'}</span>` : `<span class="ach-badge-lock">${lang === 'vi' ? 'Chưa mở' : 'Locked'}</span>`}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="modal-footer">
        <button class="primary-btn" id="ach-ok">${lang === 'vi' ? 'Đóng' : 'Close'}</button>
      </div>
    </div>
  `;

  modal.classList.add('visible');

  const close = () => modal.classList.remove('visible');
  modal.querySelector('#ach-close').addEventListener('click', close);
  modal.querySelector('#ach-ok').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
