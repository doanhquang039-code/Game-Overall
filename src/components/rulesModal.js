// Rules and Tutorial Modal for all 7 Chess & Board Games (Bilingual)
import { i18n } from '../i18n/translations.js';

const RULES_DATA = {
  vi: {
    chess: {
      title: 'Luật Chơi Cờ Vua Quốc Tế (International Chess)',
      badge: '8x8 • 64 Ô',
      content: `
        <h4>1. Mục Tiêu Trận Đấu</h4>
        <p>Chiếu bí (Checkmate) Vua đối phương khi Vua bị tấn công và không còn nước đi hợp lệ nào để thoát thân.</p>
        <h4>2. Binh Chủng & Quy Tắc Di Chuyển</h4>
        <ul>
          <li><strong>Vua (King):</strong> Di chuyển 1 ô theo mọi hướng. Không thể đi vào ô bị chiếu.</li>
          <li><strong>Hậu (Queen):</strong> Di chuyển tự do theo hàng ngang, dọc hoặc đường chéo.</li>
          <li><strong>Xe (Rook):</strong> Di chuyển thẳng theo hàng ngang hoặc cột dọc.</li>
          <li><strong>Tượng (Bishop):</strong> Di chuyển theo đường chéo cùng màu ô xuất phát.</li>
          <li><strong>Mã (Knight):</strong> Nhảy hình chữ L (2 ô một hướng rồi 1 ô vuông góc), có thể nhảy qua đầu quân khác.</li>
          <li><strong>Tốt (Pawn):</strong> Tiến 1 ô (nước đầu có thể tiến 2 ô), ăn chéo 1 ô phía trước.</li>
        </ul>
        <h4>3. Nước Đi Đặc Biệt</h4>
        <ul>
          <li><strong>Phong cấp (Promotion):</strong> Tốt đến hàng 8 được phong cấp thành Hậu, Xe, Tượng hoặc Mã!</li>
          <li><strong>Nhập thành (Castling):</strong> Di chuyển Vua 2 ô về phía Xe và đưa Xe nhảy qua Vua.</li>
          <li><strong>Bắt tốt qua đường (En Passant):</strong> Ăn Tốt đối phương vừa tiến 2 ô ngang qua ô kiểm soát của bạn.</li>
        </ul>
      `
    },
    xiangqi: {
      title: 'Luật Chơi Cờ Tướng (Xiangqi - Chinese Chess)',
      badge: '9x10 • Sở Hà Hán Giới',
      content: `
        <h4>1. Mục Tiêu Trận Đấu</h4>
        <p>Chiếu bí hoặc làm cho Tướng đối phương hết nước đi hợp lệ (hết nước đi là THUA).</p>
        <h4>2. Binh Chủng & Quy Tắc</h4>
        <ul>
          <li><strong>Tướng / Soái:</strong> Đi 1 ô ngang dọc trong Cung Cửu Cung. <em>Không được để 2 Tướng đối mặt trực diện trên cùng cột không có quân cản!</em></li>
          <li><strong>Sĩ:</strong> Đi chéo 1 ô trong Cung Cửu Cung.</li>
          <li><strong>Tượng:</strong> Đi chéo 2 ô (2x2), không được qua sông, bị cản nếu có quân ở mắt tượng.</li>
          <li><strong>Xe:</strong> Đi ngang dọc tùy ý, uy lực công phá mạnh nhất.</li>
          <li><strong>Pháo:</strong> Đi như Xe khi không ăn; phải nhảy qua đúng 1 quân (ngòi pháo) để ăn quân!</li>
          <li><strong>Mã:</strong> Đi chữ nhật (1 thẳng 1 chéo), bị cản nếu có quân đứng sát chân mã.</li>
          <li><strong>Binh/Tốt:</strong> Chưa qua sông đi thẳng 1 bước; đã qua sông có thể đi thẳng hoặc rẽ ngang.</li>
        </ul>
      `
    },
    caro: {
      title: 'Luật Chơi Cờ Caro (Gomoku - Năm Quân Thẳng Hàng)',
      badge: '15x15 • Giao Điểm',
      content: `
        <h4>1. Mục Tiêu Trận Đấu</h4>
        <p>Tạo thành chuỗi liên tục gồm 5 quân cờ liên tiếp theo hàng ngang, hàng dọc hoặc đường chéo.</p>
        <h4>2. Mẹo Chiến Thuật</h4>
        <ul>
          <li><strong>Tạo thế 4 mở 2 đầu:</strong> Thế cờ chắc chắn thắng vì đối phương chỉ chặn được 1 đầu.</li>
          <li><strong>Nước đôi (Forking):</strong> Cùng lúc tạo ra 2 hướng tấn công để đối phương không thể phòng thủ cả hai.</li>
        </ul>
      `
    },
    othello: {
      title: 'Luật Chơi Cờ Lật (Othello / Reversi)',
      badge: '8x8 • Đảo Đảo Càn Khôn',
      content: `
        <h4>1. Mục Tiêu Trận Đấu</h4>
        <p>Chiếm số lượng quân cờ trên bàn nhiều hơn đối phương khi kết thúc ván đấu.</p>
        <h4>2. Quy Tắc Lật Quân</h4>
        <ul>
          <li>Đặt quân kẹp giữa quân đối phương và một quân khác của bạn theo hàng thẳng hoặc chéo.</li>
          <li>Toàn bộ quân địch bị kẹp ở giữa sẽ lật sang màu của bạn!</li>
          <li><strong>Chiếm 4 góc (Corners):</strong> Vị trí góc không bao giờ bị lật lại, là chìa khóa chiến thắng!</li>
        </ul>
      `
    },
    coganh: {
      title: 'Luật Chơi Cờ Gánh Dân Gian Việt Nam',
      badge: '5x5 • Di Sản Cổ Truyền',
      content: `
        <h4>1. Di Sản Trí Tuệ Dân Gian</h4>
        <p>Trò chơi cờ dân gian truyền thống của người Việt trên bàn cờ 25 giao điểm kết nối bởi các đường chéo.</p>
        <h4>2. Tuyệt Chiêu Thu Phục Quân</h4>
        <ul>
          <li><strong>Chiêu "Gánh":</strong> Bước vào chính giữa 2 quân đối phương trên cùng đường thẳng, CẢ HAI quân đó sẽ bị đổi màu về phía bạn!</li>
          <li><strong>Chiêu "Vây / Chẹt":</strong> Khóa kín toàn bộ đường đi của một nhóm quân địch, nhóm quân đó sẽ bị thu phục hoàn toàn.</li>
          <li><strong>Chiêu "Mở Cờ":</strong> Cố tình mở khe cho địch gánh để chuẩn bị nước phản công gánh số lượng quân lớn hơn.</li>
        </ul>
      `
    },
    go: {
      title: 'Luật Chơi Cờ Vây (Go / Weiqi 9x9)',
      badge: '9x9 • Kỳ Đạo Nhập Môn',
      content: `
        <h4>1. Mục Tiêu Trận Đấu</h4>
        <p>Vây bắt quân địch không còn đường thở (khí) và bao chiếm diện tích lãnh thổ lớn hơn trên bàn cờ.</p>
        <h4>2. Khí (Liberties) & Bắt Quân</h4>
        <ul>
          <li>Mỗi quân cờ có tối đa 4 khí là các giao điểm trống liền kề trực giao.</li>
          <li>Khi một quân hoặc nhóm quân bị đối phương bịt kín toàn bộ khí (0 liberties), chúng sẽ bị bắt làm tù binh!</li>
          <li><strong>Luật Cấm Tự Sát:</strong> Không được đặt quân vào ô không còn khí, trừ phi nước đi đó bắt được quân đối phương.</li>
          <li><strong>Luật Ko (Kiếp):</strong> Không được lặp lại ngay lập tức trạng thái bàn cờ ở nước trước đó.</li>
        </ul>
      `
    },
    checkers: {
      title: 'Luật Chơi Cờ Đam (Classic Checkers / Draughts)',
      badge: '8x8 • Nhảy Bắt Liên Hoàn',
      content: `
        <h4>1. Mục Tiêu Trận Đấu</h4>
        <p>Bắt sạch toàn bộ quân của đối phương hoặc khiến đối phương không còn nước đi hợp lệ nào.</p>
        <h4>2. Cách Di Chuyển & Nhảy Bắt</h4>
        <ul>
          <li>Quân thường di chuyển chéo 1 ô về phía trước trên các ô màu tối.</li>
          <li><strong>Nhảy bắt quân:</strong> Nhảy qua đầu quân địch liền kề vào ô trống ngay phía sau để ăn quân. Có thể nhảy liên hoàn nhiều quân liên tiếp!</li>
          <li><strong>Phong Vua (King 👑):</strong> Khi đến hàng cuối cùng của đối phương, quân được phong Vua và có thể đi/nhảy chéo cả tiến lẫn lùi!</li>
        </ul>
      `
    }
  },

  en: {
    chess: {
      title: 'International Chess Rules',
      badge: '8x8 • 64 Squares',
      content: `
        <h4>1. Objective</h4>
        <p>Checkmate the enemy King so it is under direct attack with no legal escape moves.</p>
        <h4>2. Piece Movement</h4>
        <ul>
          <li><strong>King:</strong> Moves 1 square in any direction. Cannot move into check.</li>
          <li><strong>Queen:</strong> Moves any distance along ranks, files, or diagonals.</li>
          <li><strong>Rook:</strong> Moves any distance along ranks or files.</li>
          <li><strong>Bishop:</strong> Moves any distance along diagonals of matching color.</li>
          <li><strong>Knight:</strong> Moves in an L-shape (2 squares one way, 1 square perpendicular). Can jump over pieces.</li>
          <li><strong>Pawn:</strong> Moves forward 1 square (or 2 on first move), captures diagonally forward.</li>
        </ul>
      `
    },
    xiangqi: {
      title: 'Xiangqi (Chinese Chess) Rules',
      badge: '9x10 • Chu-Han River',
      content: `
        <h4>1. Objective</h4>
        <p>Checkmate or stalemate the opposing General.</p>
        <h4>2. Key Rules</h4>
        <ul>
          <li><strong>General:</strong> Confined to the 3x3 Palace. Generals cannot face each other directly on the same file.</li>
          <li><strong>Cannon:</strong> Moves like a Chariot; must jump over exactly one piece (screen) to capture.</li>
          <li><strong>Horse:</strong> L-shaped moves; can be blocked by a piece on its foot.</li>
          <li><strong>Elephant:</strong> 2-square diagonal move; cannot cross the river and can be blocked by an eye piece.</li>
        </ul>
      `
    },
    caro: {
      title: 'Gomoku (Caro / 5-in-a-row) Rules',
      badge: '15x15 • Intersections',
      content: `
        <h4>1. Objective</h4>
        <p>Be the first player to form an unbroken chain of 5 stones horizontally, vertically, or diagonally.</p>
      `
    },
    othello: {
      title: 'Othello / Reversi Rules',
      badge: '8x8 • Reversible Disks',
      content: `
        <h4>1. Objective</h4>
        <p>Have the majority of disks turned to your color when the board fills or neither player has legal moves.</p>
        <h4>2. Strategy</h4>
        <p>Flank enemy disks to flip them. Corners cannot be flipped—capture them for maximum advantage.</p>
      `
    },
    coganh: {
      title: 'Co Ganh (Vietnamese Folk Chess) Rules',
      badge: '5x5 • Traditional Heritage',
      content: `
        <h4>1. Heritage</h4>
        <p>Traditional Vietnamese 5x5 board game with 25 points connected by grid lines and diagonals.</p>
        <h4>2. Special Mechanics</h4>
        <ul>
          <li><strong>Ganh (Double Flank):</strong> Step into the exact midpoint between 2 enemy pieces to convert BOTH!</li>
          <li><strong>Vay (Suffocation):</strong> Encircle an enemy piece group so it has 0 legal moves to capture all of them.</li>
        </ul>
      `
    },
    go: {
      title: 'Go / Weiqi (9x9) Rules',
      badge: '9x9 • Tactical Go',
      content: `
        <h4>1. Objective</h4>
        <p>Surround opponent stones with no remaining liberties and claim more territory on the 9x9 board.</p>
      `
    },
    checkers: {
      title: 'Classic Checkers / Draughts Rules',
      badge: '8x8 • Jump & Crown',
      content: `
        <h4>1. Objective</h4>
        <p>Capture all opponent pieces or leave them with no legal moves.</p>
        <h4>2. Kings</h4>
        <p>Pieces reaching the back rank are crowned Kings 👑 and can move & jump in all diagonal directions.</p>
      `
    }
  }
};

export function showRulesModal(gameId) {
  let modal = document.getElementById('rules-modal-backdrop');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rules-modal-backdrop';
    modal.className = 'rules-modal-backdrop';
    document.body.appendChild(modal);
  }

  const lang = i18n.getLang();
  const langRules = RULES_DATA[lang] || RULES_DATA.vi;
  const rule = langRules[gameId] || langRules.chess;

  modal.innerHTML = `
    <div class="rules-modal-card">
      <div class="modal-header">
        <div>
          <span class="modal-badge">${rule.badge}</span>
          <h2 class="modal-title">${rule.title}</h2>
        </div>
        <button class="modal-close-btn" id="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${rule.content}
      </div>
      <div class="modal-footer">
        <button class="primary-btn" id="modal-ok">✓ ${lang === 'vi' ? 'Đã Hiểu • Bắt Đầu Chơi' : 'Understood • Let\'s Play'}</button>
      </div>
    </div>
  `;

  modal.classList.add('visible');

  const close = () => modal.classList.remove('visible');
  modal.querySelector('#modal-close').addEventListener('click', close);
  modal.querySelector('#modal-ok').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
