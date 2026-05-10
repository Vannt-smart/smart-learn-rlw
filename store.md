# Hướng dẫn đưa ứng dụng Smart Learn lên Google Play Store

Tài liệu này hướng dẫn chi tiết các bước chuẩn bị và quy trình đưa ứng dụng **Smart Learn** lên cửa hàng ứng dụng Google Play.

---

## 1. Chuẩn bị tài khoản và công cụ
- **Tài khoản Google Play Console:** Bạn cần đăng ký tài khoản nhà phát triển Google với phí một lần là **25 USD**.
- **Công cụ đóng gói (Wrapper):** Vì hiện tại Smart Learn là ứng dụng Web, bạn cần sử dụng **Capacitor** hoặc **Cordova** để đóng gói thành tệp `.apk` hoặc `.aab` (Android App Bundle).
  - *Khuyên dùng:* **Capacitor** (hiện đại và dễ tích hợp với Vite/React).
- **Hình ảnh quảng bá:**
  - **Icon:** 512x512px (PNG 32-bit).
  - **Feature Graphic:** 1024x500px.
  - **Screenshots:** Ít nhất 2 ảnh chụp màn hình điện thoại (tỷ lệ 16:9 hoặc 9:16).

---

## 2. Các bước thực hiện chi tiết

### Bước 1: Đóng gói ứng dụng thành Android Project
1. Cài đặt Capacitor vào dự án:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init SmartLearn net.smartlearnapp.app
   ```
2. Build dự án web: `npm run build`
3. Thêm nền tảng Android:
   ```bash
   npx cap add android
   npx cap copy
   npx cap open android
   ```
4. Sử dụng **Android Studio** để tạo tệp **Signed App Bundle (.aab)**. Đây là định dạng Google yêu cầu thay vì .apk.

### Bước 2: Thiết lập thông tin trên Google Play Console
1. **Tạo ứng dụng mới:** Chọn loại ứng dụng (App), hình thức thanh toán (Free/Paid).
2. **Cài đặt cửa hàng (Main Store Listing):** Nhập tên app, mô tả ngắn, mô tả chi tiết (xem phần dưới).
3. **Phân loại ứng dụng:** Chọn "Education" (Giáo dục).
4. **Thông tin liên hệ:** Email, website, số điện thoại.
5. **Chính sách bảo mật (Privacy Policy):** Cần có một link URL dẫn đến chính sách bảo mật của ứng dụng (ví dụ: `https://smartlearnapp.net/privacy-policy`).

### Bước 3: Hoàn thành các bảng câu hỏi bắt buộc
- **Quyền truy cập ứng dụng:** Khai báo nếu app yêu cầu đăng nhập (cần cung cấp tài khoản test cho Google).
- **Xếp hạng nội dung (Content Rating):** Trả lời các câu hỏi về mức độ bạo lực, ngôn từ... để nhận chứng chỉ độ tuổi.
- **An toàn dữ liệu (Data Safety):** Khai báo các loại dữ liệu người dùng mà app thu thập (Email, thông tin cá nhân).

### Bước 4: Tải lên bản phát hành (Release)
1. Vào mục **Production** -> **Create new release**.
2. Tải lên tệp `.aab` đã tạo ở Bước 1.
3. Gửi bản phát hành để Google xem xét (thường mất 3-7 ngày cho lần đầu tiên).

---

## 3. Thông tin mô tả ứng dụng (Store Content)

Dưới đây là nội dung đề xuất để bạn copy vào Google Play Console:

### Tiêu đề ứng dụng (App Title)
**Smart Learn - Học tập thông minh**

### Mô tả ngắn (Short Description)
Nền tảng học tập hiện đại: Flashcard, trắc nghiệm, trò chơi giáo dục và quản lý giáo trình thông minh.

### Mô tả chi tiết (Full Description)
**Smart Learn** là ứng dụng học tập toàn diện, được thiết kế để giúp học sinh tối ưu hóa quy trình tự học và hỗ trợ giáo viên quản lý nội dung bài giảng một cách khoa học, chuyên nghiệp.

**✨ CÁC TÍNH NĂNG NỔI BẬT DÀNH CHO HỌC SINH:**
- **Sổ tay môn học cá nhân:** Quản lý giáo trình và bài học trực quan, phân loại theo từng chủ đề.
- **Học tập đa phương thức:** Tích hợp Nội dung, Trắc nghiệm, Flashcard và Tổng kết trong cùng một bài học.
- **Luyện tập Quizlet & Flashcard:** Hỗ trợ Auto-play, Shuffle và Fullscreen giúp ghi nhớ kiến thức hiệu quả.
- **Trò chơi học tập tương tác:** Rèn luyện trí tuệ qua các game: Chép chính tả, Đuổi hình bắt chữ, Ca dao tục ngữ và Nhanh như chớp.
- **Công cụ Pomodoro:** Đồng hồ đếm ngược giúp bạn tập trung tối đa trong các phiên học tập.
- **Theo dõi tiến độ:** Hệ thống Streak (chuỗi ngày học) và bảng thống kê kết quả trực quan.
- **Thời khóa biểu thông minh:** Quản lý lịch học đa nhóm, ghi chú nhiệm vụ rõ ràng.

**🏫 CÔNG CỤ DÀNH CHO GIÁO VIÊN & QUẢN TRỊ:**
- **Biên tập bài học thông minh:** Tạo bài giảng tích hợp slide ảnh, video và câu hỏi trắc nghiệm dễ dàng.
- **Quản lý kho câu hỏi:** Import hàng loạt (Bulk Import) câu hỏi trắc nghiệm và flashcard từ Excel/Word.
- **Hệ thống phân quyền:** Quản lý học sinh, cấp độ học tập và gói hội viên chuyên nghiệp.

**Tại sao nên chọn Smart Learn?**
- Giao diện hiện đại, mượt mà và dễ sử dụng.
- Nội dung được cá nhân hóa theo trình độ của từng người dùng.
- Hỗ trợ học tập mọi lúc, mọi nơi trên thiết bị di động.

Hãy bắt đầu hành trình chinh phục tri thức cùng Smart Learn ngay hôm nay!

---
*Thông tin hỗ trợ:*
- Website: http://smartlearnapp.net/
- Email: support@smartlearnapp.net
- Phiên bản: 1.0.0
