# Green Reader

Game mini luyện đọc green và putting với 23 dạng địa hình (3 green ban đầu và 20 green bổ sung), chạy trực tiếp trên trình duyệt máy tính và điện thoại.

Chơi online: <https://tuanco12a4-boop.github.io/green-reader-golf/>

## Chạy game

Cách nhanh nhất: mở `index.html` bằng trình duyệt.

Để tránh giới hạn của trình duyệt khi chạy file cục bộ, có thể chạy web server trong thư mục này:

```powershell
python -m http.server 4173
```

Sau đó mở `http://localhost:4173`.

## Điều khiển

- Kéo đầu đường ngắm hoặc bấm `-` / `+` để chỉnh góc đánh.
- Giữ nút **GIỮ ĐỂ LẤY LỰC**, thả để putt.
- Trên PC có thể dùng phím `Space` để lấy lực và phím mũi tên trái/phải để chỉnh hướng.
- Kéo khoảng trống trên green để di chuyển camera.
- Cuộn chuột hoặc chụm hai ngón để thu phóng.
- Bật **Đọc dốc** để xem đường đồng mức và mũi tên hướng xuống dốc.
- Bật **Đặt bóng**, sau đó chạm/click bên trong green để chuyển bóng tới vị trí muốn luyện. Trên PC có thể nhấn phím `M`.

## 23 dạng địa hình

Thung lũng, Sống lưng, Ven biển, Cao nguyên, Yên ngựa, Hai tầng, Mai rùa, Phễu lệch, Dốc Tây, Dốc Đông, Lên đồi, Xuống đồi, Xoáy ốc, Gợn sóng, Móng ngựa, Sống chéo, Hai lòng chảo, Ruộng bậc thang, Miệng núi, Championship, Lưỡi liềm, Hai đỉnh và Mặt kính.

## Cấu trúc file

- `index.html`: giao diện và các bảng điều khiển.
- `styles.css`: thiết kế responsive cho PC, tablet và điện thoại.
- `game.js`: vẽ Canvas, địa hình, vật lý lăn bóng, camera và thao tác người chơi.

Không cần cài package hoặc framework ngoài.
