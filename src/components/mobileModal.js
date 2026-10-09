// Mobile & Android App Setup Modal with QR Code Scanner & PWA Instructions
import QRCode from 'qrcode';
import { i18n } from '../i18n/translations.js';

export async function showMobileModal() {
  let modal = document.getElementById('mobile-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mobile-modal-backdrop';
    modal.className = 'rules-modal-backdrop';
    document.body.appendChild(modal);
  }

  const lang = i18n.getLang();
  const mobileUrl = 'http://192.168.1.104:5173/';

  // Generate QR Code data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(mobileUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
  }

  modal.innerHTML = `
    <div class="rules-modal-card mobile-modal-card">
      <div class="modal-header">
        <div>
          <span class="modal-badge">📱 ANDROID & MOBILE APP</span>
          <h2 class="modal-title">${lang === 'vi' ? 'Chơi & Cài Đặt Trên Android' : 'Play & Install on Android'}</h2>
        </div>
        <button class="modal-close-btn" id="mobile-close">&times;</button>
      </div>

      <div class="modal-body mobile-modal-body">
        <!-- QR Code Section -->
        <div class="qr-code-section">
          <div class="qr-box">
            ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Code" class="qr-img" />` : '<p>Đang tạo mã QR...</p>'}
          </div>
          <div class="qr-info">
            <h3 class="qr-title">📲 ${lang === 'vi' ? 'Quét Mã Bằng Điện Thoại' : 'Scan With Your Phone'}</h3>
            <p class="qr-desc">
              ${lang === 'vi' 
                ? 'Dùng Camera điện thoại, Zalo hoặc trình quét mã để mở game ngay trên điện thoại (cùng mạng Wi-Fi).' 
                : 'Use your phone camera or QR scanner to open the game on mobile (same Wi-Fi network).'}
            </p>
            <div class="url-copy-box">
              <input type="text" readonly value="${mobileUrl}" class="url-input" id="mobile-url-input" />
              <button class="primary-btn copy-btn" id="btn-copy-url">
                ${lang === 'vi' ? 'Sao Chép Link' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        <!-- 3-Step PWA Installation Guide -->
        <div class="pwa-steps-guide">
          <h4 class="guide-heading">✨ ${lang === 'vi' ? 'Cách Cài Thành App Android Trong 3 Bước:' : 'How to Install as an Android App:'}</h4>
          <div class="steps-list">
            <div class="step-card">
              <div class="step-num">1</div>
              <div class="step-content">
                <strong>${lang === 'vi' ? 'Quét mã hoặc mở link' : 'Scan QR or Open link'}</strong>
                <p>${lang === 'vi' ? 'Mở đường link trên bằng trình duyệt Google Chrome trên điện thoại Android.' : 'Open the link in Google Chrome on your Android device.'}</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">2</div>
              <div class="step-content">
                <strong>${lang === 'vi' ? 'Bấm "Cài đặt ứng dụng"' : 'Tap "Install App"'}</strong>
                <p>${lang === 'vi' ? 'Bấm vào menu 3 chấm (⋮) góc trên phải của Chrome -> chọn "Cài đặt ứng dụng" (hoặc "Thêm vào màn hình chính").' : 'Tap menu (⋮) in Chrome -> choose "Install App" (or "Add to Home Screen").'}</p>
              </div>
            </div>

            <div class="step-card">
              <div class="step-num">3</div>
              <div class="step-content">
                <strong>${lang === 'vi' ? 'Trải nghiệm như App thật' : 'Enjoy like a Native App'}</strong>
                <p>${lang === 'vi' ? 'Biểu tượng ChessVerse sẽ xuất hiện ngoài màn hình chính, mở lên toàn màn hình không có thanh URL!' : 'ChessVerse icon will appear on your home screen, launching full screen!'}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Native APK Project Note -->
        <div class="native-apk-note">
          <div class="apk-icon">🤖</div>
          <div class="apk-info">
            <strong>${lang === 'vi' ? 'Dự Án Android Native (Capacitor):' : 'Native Android Project (Capacitor):'}</strong>
            <p>${lang === 'vi' 
              ? 'Thư mục <code>D:\\Game Overall\\android</code> đã được cấu hình sẵn. Bạn có thể mở trực tiếp bằng Android Studio hoặc chạy Gradle để đóng gói file .APK.' 
              : 'The <code>D:\\Game Overall\\android</code> folder is ready. Open with Android Studio or Gradle to build a standalone .APK.'}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="primary-btn" id="mobile-ok">${lang === 'vi' ? 'Đã Hiểu' : 'Got It'}</button>
      </div>
    </div>
  `;

  modal.classList.add('visible');

  // Copy URL button handler
  const copyBtn = modal.querySelector('#btn-copy-url');
  const urlInput = modal.querySelector('#mobile-url-input');
  if (copyBtn && urlInput) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(urlInput.value).then(() => {
        copyBtn.textContent = lang === 'vi' ? 'Đã Sao Chép! ✓' : 'Copied! ✓';
        setTimeout(() => {
          copyBtn.textContent = lang === 'vi' ? 'Sao Chép Link' : 'Copy Link';
        }, 2000);
      });
    });
  }

  const close = () => modal.classList.remove('visible');
  modal.querySelector('#mobile-close').addEventListener('click', close);
  modal.querySelector('#mobile-ok').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
