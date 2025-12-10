# Alur Pengguna dan Workflow Sistem

Dokumen ini menguraikan workflow untuk setiap peran pengguna di sistem GaneshLab Consultation: Client, PIC (Person In Charge), dan Admin.

## Gambaran Umum

Sistem mendukung tiga peran pengguna utama dengan izin dan workflow yang berbeda:

- **Client**: Pengguna eksternal yang meminta konsultasi dan mengelola proyek mereka
- **PIC (Person In Charge)**: Konsultan internal yang menangani manajemen proyek dan janji temu
- **Admin**: Administrator sistem yang mengelola pengguna, perusahaan, dan pengaturan sistem secara keseluruhan

**Catatan**: Sistem juga mendukung **Guest Appointments** dimana pengguna eksternal dapat mengajukan janji temu satu kali tanpa perlu registrasi sebagai client. Guest tetap sebagai pengguna eksternal dan tidak mendapatkan akses ke dashboard sistem.

## Guest Appointment Flow

### 1. Pengajuan Appointment oleh Guest

- Guest mengunjungi halaman publik `/guest-appointment`
- Mengisi formulir appointment dengan informasi:
  - Nama lengkap dan detail kontak
  - Informasi perusahaan (nama, industri, ukuran)
  - Detail appointment (tanggal, waktu, topik konsultasi)
  - Deskripsi kebutuhan dan tujuan konsultasi
- Sistem memvalidasi input dan menyimpan sebagai "Guest Appointment Request"
- Guest menerima konfirmasi bahwa permintaan telah dikirim

### 2. Review oleh Admin

- Admin menerima notifikasi tentang guest appointment request baru
- Mengakses halaman admin guest appointments (`/dashboard/admin/guest-appointments`)
- Meninjau detail permintaan guest
- Memutuskan untuk menyetujui atau menolak berdasarkan:
  - Ketersediaan PIC
  - Kesesuaian dengan layanan yang ditawarkan
  - Kapasitas sistem saat ini

### 3. Persetujuan dan Penugasan PIC

- Jika disetujui, admin menugaskan PIC yang sesuai untuk menangani appointment
- PIC menerima notifikasi penugasan appointment guest
- Sistem mengirim konfirmasi email ke guest dengan detail appointment dan informasi PIC
- Guest tidak perlu registrasi akun, cukup datang sesuai jadwal yang ditentukan

### 4. Penolakan Request

- Jika ditolak, admin memberikan alasan penolakan
- Sistem mengirim email penolakan ke guest dengan penjelasan
- Admin dapat memberikan saran alternatif atau informasi kontak lain

### 5. Penanganan Appointment oleh PIC

- PIC menghubungi guest untuk konfirmasi detail appointment
- PIC dapat menjadwalkan ulang jika diperlukan melalui sistem
- Sistem mengirim reminder otomatis sebelum appointment
- PIC melaksanakan konsultasi sesuai jadwal

### 6. Penanganan Reschedule

- Jika diperlukan penjadwalan ulang, PIC atau admin dapat mengajukan permintaan reschedule
- Sistem mengirim notifikasi ke guest tentang perubahan jadwal
- Guest dapat mengonfirmasi atau meminta perubahan waktu lain melalui link yang disediakan
- Sistem memperbarui kalender dan mengirim konfirmasi akhir ke semua pihak

## Workflow Client

### 1. Registrasi dan Permintaan Akses

- Client mengunjungi halaman `/get-started`
- Mengisi formulir registrasi dengan informasi dasar (nama, email, detail perusahaan)
- Mengirim permintaan akses
- Menerima konfirmasi bahwa permintaan telah dikirim ke admin untuk ditinjau

### 2. Penerimaan Kredensial

- sistem otomatis membuatkan password sementara dengan email yang dimasukan olebh client
- Client menerima email dengan kredensial login (email dan kata sandi sementara)

### 3. Proses Login

- Client menavigasi ke halaman login (`/auth/login`)
- Memasukkan email dan kata sandi yang diberikan admin
- Sistem memvalidasi kredensial dan membuat sesi
- Dialihkan ke dashboard utama

### 4. Pengaturan Profil Perusahaan

- Saat login pertama, client diminta untuk melengkapi profil perusahaan
- Harus mengisi detail perusahaan, informasi kontak, dan bidang wajib lainnya

### 5. Pembuatan Proyek

- Setelah profil perusahaan disetujui, client dapat membuat proyek baru
- Mengisi detail proyek, persyaratan, dan memilih jenis konsultasi
- Mengirim proyek untuk penugasan PIC dan persetujuan

### 6. Menunggu Persetujuan Proyek

- Status proyek menunjukkan "Pending Approval"
- Client tidak dapat melanjutkan sampai PIC meninjau dan menyetujui proyek

### 7. Penjadwalan Janji Temu

- Setelah proyek disetujui, client dapat menjadwalkan janji temu
- Melihat kalender ketersediaan PIC
- Memesan slot waktu untuk konsultasi/pertemuan
- Dapat meminta penjadwalan ulang jika diperlukan

### 8. Penanganan Reschedule

- Client dapat mengajukan permintaan reschedule melalui dashboard
- Sistem mengirim notifikasi ke PIC yang ditugaskan
- PIC meninjau dan menyetujui atau menolak permintaan reschedule
- Jika disetujui, sistem memperbarui kalender dan mengirim konfirmasi ke client
- Jika ditolak, PIC memberikan alasan dan saran waktu alternatif

### 9. Manajemen Proyek

- Mengakses papan Kanban untuk melacak kemajuan proyek
- Melihat timeline proyek dan milestone
- Berkomunikasi dengan PIC yang ditugaskan melalui sistem chat

### 10. Gambaran Umum Dashboard

- Melihat status proyek secara keseluruhan dan janji temu mendatang
- Mengakses laporan proyek dan dokumentasi
- Mengelola pengaturan akun dan notifikasi

## Workflow PIC (Person In Charge)

### 1. Login

- PIC login menggunakan kredensial yang diberikan
- Akses diberikan berdasarkan izin peran PIC

### 2. Akses Dashboard

- Melihat proyek yang ditugaskan dan persetujuan yang tertunda
- Melihat kalender dengan janji temu yang dijadwalkan
- Mengakses notifikasi dan pembaruan

### 3. Manajemen Proyek

- Meninjau permintaan proyek masuk dari client
- Menyetujui atau menolak proyek berdasarkan kapasitas dan persyaratan
- Menugaskan proyek ke diri sendiri atau PIC lain (jika berlaku)

### 4. Penanganan Guest Appointments

- Menerima penugasan appointment dari guest eksternal
- Menghubungi guest untuk konfirmasi detail appointment
- Mengelola jadwal dan menangani penjadwalan ulang jika diperlukan
- Melaksanakan konsultasi dengan guest sesuai jadwal

### 5. Manajemen Papan Kanban

- Memperbarui status proyek melalui workflow Kanban
- Memindahkan tugas antar kolom (To Do, In Progress, Done, dll.)
- Menambahkan komentar dan pembaruan ke kartu proyek

### 6. Penanganan Janji Temu

- Mengelola kalender ketersediaan pribadi
- Mengkonfirmasi atau menjadwalkan ulang janji temu client
- Melakukan pertemuan virtual dan konsultasi

### 7. Komunikasi Client

- Menjawab pesan client di sistem chat
- Memberikan pembaruan proyek dan umpan balik
- Menangani permintaan penjadwalan ulang

### 8. Pelaporan dan Dokumentasi

- Memperbarui kemajuan proyek dan deliverables
- Menghasilkan laporan untuk tinjauan admin
- Mempertahankan dokumentasi proyek

## Workflow Admin

### 1. Akses Sistem

- Admin login dengan hak istimewa yang lebih tinggi
- Akses penuh ke semua fitur dan data sistem

### 2. Akses Dashboard

- Melihat statistik sistem secara keseluruhan (total pengguna, proyek aktif, kesehatan sistem)
- Memantau metrik kinerja PIC dan client
- Mengakses notifikasi sistem dan pembaruan penting
- Melihat ringkasan aktivitas harian dan bulanan

### 3. Manajemen Pengguna

- Meninjau dan menyetujui permintaan registrasi client
- Membuat akun pengguna dengan peran yang sesuai
- Mengelola izin pengguna dan tingkat akses
- Menonaktifkan atau memodifikasi akun pengguna sesuai kebutuhan

### 4. Manajemen Guest Appointments

- Meninjau permintaan appointment dari guest eksternal
- Menugaskan PIC yang sesuai untuk menangani appointment guest
- Mengirim konfirmasi email ke guest dengan detail appointment
- Mengelola antrian dan prioritas appointment requests
- Menolak requests dengan alasan dan mengirim email penolakan

### 5. Manajemen Perusahaan

- Meninjau dan menyetujui profil perusahaan
- Mengelola informasi dan pengaturan perusahaan
- Menangani permintaan dan pembaruan terkait perusahaan

### 6. Pengawasan Proyek

- Memantau semua proyek di seluruh sistem
- Menugaskan ulang proyek antar PIC jika diperlukan
- Meninjau kemajuan proyek dan campur tangan jika diperlukan
- Menyetujui keputusan proyek kritis

### 7. Konfigurasi Sistem

- Mengelola pengaturan dan konfigurasi sistem
- Mengkonfigurasi pengaturan kalender dan janji temu
- Mengatur template notifikasi dan workflow

### 6. Pelaporan dan Analitik

- Menghasilkan laporan seluruh sistem
- Memantau aktivitas pengguna dan performa sistem
- Menganalisis tingkat keberhasilan proyek dan performa PIC

### 7. Manajemen Janji Temu dan Kalender

- Mengganti jadwal janji temu jika diperlukan
- Mengelola ketersediaan PIC di seluruh sistem
- Menangani konflik penjadwalan yang ditingkatkan

### 8. Audit dan Kepatuhan

- Meninjau log sistem dan jejak audit
- Memastikan kepatuhan dengan kebijakan perlindungan data
- Menangani operasi ekspor/impor data

## Alur Umum

### Guest Appointment Request

- Guest eksternal dapat mengajukan appointment tanpa registrasi
- Mengisi formulir di halaman publik `/guest-appointment`
- Admin meninjau dan menyetujui/menolak request
- Jika disetujui, PIC ditugaskan dan guest menerima email konfirmasi
- Jika ditolak, guest menerima email penolakan dengan alasan

### Reset Kata Sandi

- Tersedia untuk semua peran
- Pengguna meminta reset kata sandi via email
- Menerima link reset dengan token sementara
- Membuat kata sandi baru dan login

### Manajemen Profil

- Semua pengguna dapat memperbarui informasi profil mereka
- Client dapat memperbarui detail perusahaan (tunduk pada persetujuan)
- PIC dan Admin dapat memperbarui informasi profesional

### Sistem Notifikasi

- Semua pengguna menerima notifikasi untuk acara yang relevan
- Client: pembaruan proyek, pengingat janji temu
- PIC: penugasan baru, pesan client, guest appointment assignments
- Admin: peringatan sistem, permintaan persetujuan, guest appointment requests

## Penanganan Error dan Kasus Tepi

### Akses Ditolak

- Pengguna yang mencoba tindakan yang tidak sah dialihkan
- Pesan error yang jelas menjelaskan persyaratan izin

### Kedaluwarsa Sesi

- Logout otomatis setelah tidak aktif
- Pengguna diminta untuk login ulang

### Validasi Data

- Semua formulir menyertakan validasi sisi client dan sisi server
- Guest appointment forms memerlukan validasi email dan informasi kontak
- Pengguna dipandu melalui koreksi input yang tidak valid

### Guest Request Limits

- Sistem dapat membatasi jumlah guest appointment requests per hari
- Admin dapat mengatur prioritas berdasarkan jenis konsultasi
- Guest menerima feedback langsung tentang status permintaan mereka
- Guest tetap sebagai eksternal user tanpa akses ke sistem dashboard

### Resolusi Konflik

- Konflik janji temu terdeteksi dan dicegah
- Admin dapat menyelesaikan konflik yang ditingkatkan secara manual
