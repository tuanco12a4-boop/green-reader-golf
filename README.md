# Tính Khoảng Cách Bóng Golf

Game golf 18 hố luyện đọc cọc khoảng cách, chọn gậy và tránh bẫy. Game chạy trực tiếp trên trình duyệt máy tính và điện thoại, không cần cài framework.

Chơi online: <https://tuanco12a4-boop.github.io/green-reader-golf/>

## Chạy game

Có thể mở trực tiếp `index.html`, hoặc chạy local server trong thư mục dự án:

```powershell
python -m http.server 4173
```

Sau đó mở `http://localhost:4173`.

## Cách chơi

1. Chọn tee đen, xanh, trắng hoặc đỏ và chọn đơn vị yard/mét.
2. Nhấn **Phát bóng** để bóng bay từ tee box xuống fairway.
3. Quan sát cọc màu và cờ trên green, sau đó nhập khoảng cách còn lại.
4. Nếu sai số không quá 20 yard hoặc 20 mét, túi gậy sẽ được mở.
5. Chọn gỗ, sắt hoặc wedge phù hợp rồi đánh tiếp. Bóng xuống nước bị cộng một gậy phạt; bóng trong cát hoặc rough bị giảm tầm đánh.
6. Hoàn thành đủ 18 hố và xem tổng điểm trong scorecard.

Quy ước cọc: đen 250 yard, xanh 200 yard, trắng 150 yard, đỏ 100 yard. Cờ đỏ nằm đầu green, cờ trắng ở giữa và cờ xanh ở cuối green.

## Dữ liệu sân

Khoảng cách và par của 18 hố được lấy từ `C:\Users\TUAN\Downloads\bang_scorecard_golf.xlsx`:

- 4 bộ tee: BLACK, BLUE, WHITE, RED.
- 18 hố gồm Par 3, Par 4 và Par 5.
- Mỗi hố có bố cục riêng với fairway, rough, cây, bẫy cát và/hoặc bẫy nước.

## Cấu trúc file

- `index.html`: giao diện game, bảng điều khiển, hướng dẫn và scorecard.
- `styles.css`: giao diện responsive cho máy tính, tablet và điện thoại.
- `game.js`: dữ liệu 18 hố, vẽ sân bằng Canvas, hoạt ảnh bóng, tính khoảng cách, chọn gậy, bẫy và điểm số.

Game lưu hố hiện tại, tee, đơn vị và scorecard bằng `localStorage` trên thiết bị.
