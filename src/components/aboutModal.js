// About & Store Compliance Privacy Policy Modal
import { i18n } from '../i18n/translations.js';

export function showAboutModal() {
  const existing = document.getElementById('about-modal');
  if (existing) existing.remove();

  const lang = i18n.getLang();
  const modal = document.createElement('div');
  modal.id = 'about-modal';
  modal.className = 'modal-backdrop visible';

  modal.innerHTML = `
    <div class="modal-dialog about-dialog">
      <div class="modal-header">
        <div>
          <div class="store-badge-pill">GOOGLE PLAY STORE COMPLIANT</div>
          <h2 class="modal-title">👑 CHESSVERSE - Bách Kỳ Trận</h2>
          <p class="modal-subtitle">Phiên bản: v1.2.0 (Build 102) • Production Release</p>
        </div>
        <button class="modal-close-btn" id="about-close-btn">&times;</button>
      </div>

      <div class="about-body">
        <!-- Highlights Card -->
        <div class="about-highlight-card">
          <div class="highlight-item">
            <span class="hl-icon">📱</span>
            <div>
              <strong>${lang === 'vi' ? 'Đa Nền Tảng (Cross-Platform)' : 'Cross-Platform Ready'}</strong>
              <p>${lang === 'vi' ? 'Tương thích Android (Capacitor/APK), PWA và Windows Desktop.' : 'Optimized for Android (Capacitor/APK), Web PWA and Windows Desktop.'}</p>
            </div>
          </div>
          <div class="highlight-item">
            <span class="hl-icon">⚡</span>
            <div>
              <strong>${lang === 'vi' ? '100% Offline & Nhẹ Nhàng' : '100% Offline & Lightweight'}</strong>
              <p>${lang === 'vi' ? 'Không cần kết nối mạng để chơi. Không quảng cáo phiền toái, mở tức thì.' : 'No active internet required. Zero intrusive ads, instantaneous startup.'}</p>
            </div>
          </div>
          <div class="highlight-item">
            <span class="hl-icon">🛡️</span>
            <div>
              <strong>${lang === 'vi' ? 'An Toàn Tuyệt Đối (Family-Friendly)' : 'Family Safe & Compliant'}</strong>
              <p>${lang === 'vi' ? 'Phù hợp mọi lứa tuổi từ trẻ em đến người cao tuổi. Giao diện phóng to rõ nét.' : 'Designed for all age groups. High contrast and accessible scale options.'}</p>
            </div>
          </div>
        </div>

        <!-- Privacy Policy Section -->
        <div class="privacy-section">
          <h3 class="privacy-title">📜 ${lang === 'vi' ? 'Chính Sách Bảo Mật (Privacy Policy)' : 'Privacy Policy'}</h3>
          <div class="privacy-content">
            <p><strong>1. ${lang === 'vi' ? 'Thu thập dữ liệu:' : 'Data Collection:'}</strong> ${lang === 'vi' ? 'Ứng dụng CHESSVERSE KHÔNG thu thập, lưu trữ hay chia sẻ bất kỳ thông tin nhận dạng cá nhân nào (như tên, số điện thoại, vị trí, danh bạ).' : 'CHESSVERSE does not collect, transmit, or share any personally identifiable information (PII).'}</p>
            <p><strong>2. ${lang === 'vi' ? 'Lưu trữ cục bộ:' : 'Local Storage:'}</strong> ${lang === 'vi' ? 'Điểm số thành tích, cài đặt ngôn ngữ và âm lượng được lưu trữ 100% trên thiết bị của bạn qua LocalStorage an toàn.' : 'Settings, achievements, and stats are saved exclusively on your local device.'}</p>
            <p><strong>3. ${lang === 'vi' ? 'Quyền truy cập:' : 'App Permissions:'}</strong> ${lang === 'vi' ? 'Chỉ yêu cầu quyền Rung (VIBRATE) để tạo cảm giác chạm chân thực khi gõ quân cờ, không yêu cầu quyền camera hay định vị.' : 'Only requests VIBRATE permission for tactile haptic feedback during piece moves.'}</p>
            <p><strong>4. ${lang === 'vi' ? 'Chính sách trẻ em:' : 'Children\'s Online Privacy Protection:'}</strong> ${lang === 'vi' ? 'Tuân thủ nghiêm ngặt chính sách dành cho gia đình của Google Play (Google Play Families Policy).' : 'Strictly compliant with Google Play Families Policy and COPPA standards.'}</p>
          </div>
        </div>

        <!-- Developer & License -->
        <div class="dev-credits">
          <div class="credit-row">
            <span>© 2026 Chessverse Studio. All Rights Reserved.</span>
            <span class="credit-tag">Google Play Release Candidate</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="action-btn primary-btn" id="about-confirm-btn">${lang === 'vi' ? 'Đã Hiểu & Đóng' : 'Understood & Close'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#about-close-btn')?.addEventListener('click', close);
  modal.querySelector('#about-confirm-btn')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
