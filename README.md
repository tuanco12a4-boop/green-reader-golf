# Green Reader

Game mini 3D luyện đọc green và putting với 23 dạng địa hình (3 green ban đầu và 20 green bổ sung), chạy trực tiếp trên trình duyệt máy tính và điện thoại.

## Link chơi online

- Green Reader 3D: <https://tuanco12a4-boop.github.io/green-reader-golf/>
- Tính khoảng cách bóng golf: <https://tuanco12a4-boop.github.io/green-reader-golf/distance/>

## Chạy game

Cách nhanh nhất: mở `index.html` bằng trình duyệt.

Để tránh giới hạn của trình duyệt khi chạy file cục bộ, có thể chạy web server trong thư mục này:

```powershell
python -m http.server 4173
```

Sau đó mở `http://localhost:4173`.

## Hướng dẫn trên máy tính

1. Giữ chuột trái và kéo trên green để xoay camera. Cuộn con lăn để zoom.
2. Bật **Địa hình 3D** để xem lưới cao độ và mũi tên hướng xuống dốc.
3. Nhấp vào green để căn hướng, hoặc dùng phím `←` / `→` để chỉnh từng độ.
4. Giữ phím `Space` hoặc nút **GIỮ ĐỂ LẤY LỰC**. Thả khi thanh lực đạt mức mong muốn.
5. Nhấn `R` để đánh lại. Trong **Luyện tự do**, nhấn `M` rồi nhấp vào green để đặt bóng.

## Hướng dẫn trên điện thoại

1. Kéo một ngón tay trên green để xoay camera. Chụm hoặc mở hai ngón để zoom.
2. Chạm **Địa hình 3D** để xem độ dốc; chạm **Góc nhìn** để đổi góc camera.
3. Chạm một điểm trên green để căn hướng, hoặc dùng nút `−` / `+` để tinh chỉnh.
4. Giữ nút **GIỮ ĐỂ LẤY LỰC**, theo dõi thanh lực rồi nhấc tay để putt.
5. Trong **Luyện tự do**, bật **Đặt bóng** rồi chạm vị trí muốn luyện. Nút **Đánh lại** trở về trước cú gần nhất.

## Luật chơi và tính điểm

- Chế độ **Tính gậy: BẬT** cộng liên tục mỗi cú từ đầu green đến khi vào lỗ.
- Khi bóng ra ngoài, bóng được thả ngay phía trong mép green tại nơi rời sân và cộng thêm 1 gậy phạt.
- Trong chế độ tính gậy, **Đánh lại** bắt đầu lại toàn green và công cụ đặt bóng bị khóa.
- Khi bóng vào lỗ, màn hình chúc mừng hiển thị số gậy, điểm cú đánh và tổng điểm. Điểm tốt nhất được lưu trên thiết bị.
- Nút dấu `?` ở góc trên bên phải mở hướng dẫn trong game; game tự chọn tab phù hợp với thiết bị.

## 23 dạng địa hình

Thung lũng, Sống lưng, Ven biển, Cao nguyên, Yên ngựa, Hai tầng, Mai rùa, Phễu lệch, Dốc Tây, Dốc Đông, Lên đồi, Xuống đồi, Xoáy ốc, Gợn sóng, Móng ngựa, Sống chéo, Hai lòng chảo, Ruộng bậc thang, Miệng núi, Championship, Lưỡi liềm, Hai đỉnh và Mặt kính.

## Cấu trúc file

- `index.html`: giao diện và các bảng điều khiển.
- `styles.css`: thiết kế responsive cho PC, tablet và điện thoại.
- `game.js`: dựng mô hình WebGL, địa hình, vật lý lăn bóng, camera orbit, điểm số và thao tác người chơi.
- `vendor/`: Three.js, OrbitControls và giấy phép MIT đi kèm.

Không cần cài package hoặc framework ngoài.
