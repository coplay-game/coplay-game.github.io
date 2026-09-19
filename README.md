# 🎉 Tìm Hình Giống Nhau — Co-play cho 2 người

Game tìm hình giống nhau dành cho **2 bé chơi cùng lúc** trên 1 màn hình (điện thoại / máy tính bảng). Màn hình chia đôi theo chiều dọc, mỗi bé một nửa. Trong mỗi vòng tròn có nhiều icon dễ thương — **có đúng 1 icon xuất hiện ở cả 2 bên**. Bé nào bấm trúng icon giống nhau trước thì thắng vòng đó!

## ✨ Tính năng
- Chia đôi màn hình dọc, nửa trên xoay 180° để 2 bé ngồi đối diện nhau.
- Vòng tròn chứa icon chiếm ~2/3 khu vực mỗi bé.
- Độ khó tăng dần: round 1 có 3 icon → tăng dần đến 20 icon (18 vòng).
- **Luật phạt bấm sai**: bé nào bấm nhầm sẽ bị khóa nửa màn hình kèm đồng hồ đếm ngược. Lần sai đầu chờ 2 giây, lần sai thứ 2 là 3 giây, lần 3 là 4 giây... (đếm ngược = số lần bấm sai + 1). Bé còn lại vẫn chơi bình thường. Số lần sai được reset mỗi vòng mới.
- Icon tự nhỏ lại khi số lượng tăng, luôn nằm gọn trong vòng tròn.
- Nút "Chơi Ngay" to, bóng bẩy ở màn hình đầu + đếm ngược 3-2-1.
- Nút dừng/thoát ở giữa vạch chia, kèm điểm số 2 bé.
- Lưu điểm và vòng chơi bằng `localStorage` (không cần server).
- **Chọn vòng bắt đầu (force level)** ngay màn hình đầu bằng nút −/+, cho phép chơi thẳng vào vòng khó.
- **Chế độ giữ nguyên độ khó** (cho bé nhỏ): bật công tắc để chơi mãi ở đúng một mức icon. Ở chế độ này, ai đạt **5 điểm** trước là thắng chung cuộc.
- **Nhân vật con vật dễ thương**: mỗi lượt chơi, hai bé được gán ngẫu nhiên một con vật (Ngựa Hồng, Dê Béo, Mèo Mập...) kèm icon, hiện tên ở mỗi nửa màn hình.
- **Lịch sử chơi** hiển thị dưới màn hình đầu: con vật thắng, tỉ số hai bên, **thời lượng ván** (ai nhanh hơn), chế độ chơi và thời gian; lưu 20 ván gần nhất, có nút xóa lịch sử riêng.
- Dùng Font Awesome cho icon, giao diện màu pastel dễ thương.

## 🎮 Cách chơi
1. Mở game, bấm **Chơi Ngay**.
2. Sau khi đếm ngược, mỗi bé tìm icon xuất hiện ở **cả hai** vòng tròn.
3. Bé nào bấm trúng trước được **+1 điểm** và sang vòng khó hơn.
   - Nếu bấm **sai**, bé đó bị khóa và phải chờ đếm ngược (2s, rồi 3s, 4s... theo số lần sai) mới bấm tiếp được.
4. Bấm nút **dừng** ở giữa để tạm dừng: chọn **Chơi tiếp** để chơi tiếp, hoặc **Kết thúc & tính điểm** để chốt điểm và ghi lịch sử ngay.
5. Ván kết thúc (và ghi lịch sử) khi **hết vòng cuối** hoặc khi **bấm Kết thúc**. Bấm **Xóa Điểm** để chơi lại từ đầu.

> Tên/nhân vật của mỗi bé hiển thị ở **góc màn hình** phía mình, không che vòng tròn icon.

## 🚀 Chạy thử
Chỉ cần mở `index.html` bằng trình duyệt là chơi được. Không cần build.

## 🌐 Deploy lên GitHub Pages
1. Đẩy toàn bộ thư mục này lên một repo GitHub.
2. Vào **Settings → Pages**.
3. Ở **Build and deployment**, chọn **Source: Deploy from a branch**.
4. Chọn branch (`main`) và thư mục `/root`, bấm **Save**.
5. Chờ ~1 phút, game sẽ chạy tại `https://<tên-user>.github.io/<tên-repo>/`.

> File `.nojekyll` đã có sẵn để GitHub Pages phục vụ file tĩnh trực tiếp.

## 📁 Cấu trúc
```
index.html    # Bố cục màn hình
styles.css    # Giao diện dễ thương, responsive mobile/tablet
game.js       # Logic game + lưu localStorage
.nojekyll     # Bỏ qua xử lý Jekyll trên GitHub Pages
```
