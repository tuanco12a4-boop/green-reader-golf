# Green Reader

Game mini 3D luyện đọc green và putting với 23 dạng địa hình (3 green ban đầu và 20 green bổ sung), chạy trực tiếp trên trình duyệt máy tính và điện thoại.

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
- Kéo trực tiếp trên green để xoay camera 360 độ.
- Cuộn chuột hoặc chụm hai ngón để thu phóng mô hình 3D.
- Bật **Địa hình 3D** để xem lưới cao độ và mũi tên hướng xuống dốc.
- Nút **Góc nhìn** chuyển giữa toàn cảnh, sát mặt green và từ trên xuống.
- Bật **Đặt bóng**, sau đó chạm/click bên trong green để chuyển bóng tới vị trí muốn luyện. Trên PC có thể nhấn phím `M`.
- Nút **Đánh lại** hoặc phím `R` đưa bóng về trước cú đánh gần nhất và hoàn tác lượt gậy đó.
- Khi bóng vào lỗ, điểm green được ghi nhận và màn hình chúc mừng hiển thị số gậy, điểm cú đánh và tổng điểm. Điểm tốt nhất được lưu trên thiết bị.
- Chế độ **Tính gậy: BẬT** giữ số gậy liên tục từ cú đầu tiên đến khi vào lỗ. Trong chế độ này, **Đánh lại** bắt đầu lại toàn green và công cụ đặt bóng bị khóa.
- Khi bóng ra ngoài, bóng được thả ngay phía trong mép green tại vị trí đã rời sân và cộng thêm 1 gậy phạt. Cú tiếp theo tiếp tục từ điểm thả đó.

## 23 dạng địa hình

Thung lũng, Sống lưng, Ven biển, Cao nguyên, Yên ngựa, Hai tầng, Mai rùa, Phễu lệch, Dốc Tây, Dốc Đông, Lên đồi, Xuống đồi, Xoáy ốc, Gợn sóng, Móng ngựa, Sống chéo, Hai lòng chảo, Ruộng bậc thang, Miệng núi, Championship, Lưỡi liềm, Hai đỉnh và Mặt kính.

## Cấu trúc file

- `index.html`: giao diện và các bảng điều khiển.
- `styles.css`: thiết kế responsive cho PC, tablet và điện thoại.
- `game.js`: dựng mô hình WebGL, địa hình, vật lý lăn bóng, camera orbit, điểm số và thao tác người chơi.
- `vendor/`: Three.js, OrbitControls và giấy phép MIT đi kèm.

Không cần cài package hoặc framework ngoài.
