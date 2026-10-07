# Nancy Calendar — releases (Android + Windows)

Repo này **chỉ** chứa bản phát hành của ứng dụng Nancy Calendar. Không có mã nguồn.
Mỗi bản phát hành được build, ký và tải lên tự động bởi GitHub Actions. Mỗi Release `vX.Y.Z`
chứa bản cho mọi nền tảng của cùng một phiên bản.

## Android

Vào [Releases mới nhất](https://github.com/OurGithubte/nancy-calendar-releases/releases/latest),
tải file `Nancy-Calendar-vX.Y.Z.apk` trên điện thoại Android và mở để cài đặt.

Ứng dụng tự kiểm tra bản mới qua `version.json` của release mới nhất
(Cài đặt → Giới thiệu → Kiểm tra cập nhật).

## Windows 10/11

Tải `Nancy-Calendar-Windows-vX.Y.Z-Setup.exe` (khuyến nghị — cài cho người dùng hiện tại, không cần
quyền admin) hoặc `Nancy-Calendar-Windows-vX.Y.Z.msi` (cài cho cả máy).

Installer chưa ký Authenticode nên Windows SmartScreen có thể cảnh báo: chọn **More info → Run anyway**.
Bản cập nhật được xác minh bằng chữ ký updater (Tauri/minisign) trước khi cài; app tự kiểm tra bản mới
qua `latest.json` của release mới nhất (Cài đặt → Giới thiệu → Kiểm tra cập nhật).

Kiểm tra file tải về: so SHA-256 với `SHA256SUMS-Windows.txt` trong release.
