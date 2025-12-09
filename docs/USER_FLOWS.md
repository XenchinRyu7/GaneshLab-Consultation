# Alur Pengguna dan Workflow Sistem

Dokumen ini menguraikan workflow untuk setiap peran pengguna di sistem GaneshLab Consultation: Client, PIC (Person In Charge), dan Admin.

## Gambaran Umum

Sistem mendukung tiga peran pengguna utama dengan izin dan workflow yang berbeda:

- **Client**: Pengguna eksternal yang meminta konsultasi dan mengelola proyek mereka
- **PIC (Person In Charge)**: Konsultan internal yang menangani manajemen proyek dan janji temu
- **Admin**: Administrator sistem yang mengelola pengguna, perusahaan, dan pengaturan sistem secara keseluruhan

## Workflow Client

### 1. Registrasi dan Permintaan Akses

- Client mengunjungi halaman `/get-started`
- Mengisi formulir registrasi dengan informasi dasar (nama, email, detail perusahaan)
- Mengirim permintaan akses
- Menerima konfirmasi bahwa permintaan telah dikirim ke admin untuk ditinjau

### 2. Penerimaan Kredensial

- Admin meninjau permintaan dan membuat kredensial login
- Client menerima email dengan kredensial login (email dan kata sandi sementara)

### 3. Proses Login

- Client menavigasi ke halaman login (`/auth/login`)
- Memasukkan email dan kata sandi yang diberikan admin
- Sistem memvalidasi kredensial dan membuat sesi
- Dialihkan ke dashboard utama

### 4. Pengaturan Profil Perusahaan

- Saat login pertama, client diminta untuk melengkapi profil perusahaan
- Harus mengisi detail perusahaan, informasi kontak, dan bidang wajib lainnya
- Profil harus disetujui sebelum melanjutkan ke pembuatan proyek

### 5. Pembuatan Proyek

- Setelah profil perusahaan disetujui, client dapat membuat proyek baru
- Mengisi detail proyek, persyaratan, dan memilih jenis konsultasi
- Mengirim proyek untuk penugasan PIC dan persetujuan

### 6. Menunggu Persetujuan Proyek

- Status proyek menunjukkan "Menunggu Persetujuan"
- Client tidak dapat melanjutkan sampai PIC meninjau dan menyetujui proyek
- Mungkin menerima notifikasi tentang pembaruan status proyek

### 7. Penjadwalan Janji Temu

- Setelah proyek disetujui, client dapat menjadwalkan janji temu
- Melihat kalender ketersediaan PIC
- Memesan slot waktu untuk konsultasi/pertemuan
- Dapat meminta penjadwalan ulang jika diperlukan

### 8. Manajemen Proyek

- Mengakses papan Kanban untuk melacak kemajuan proyek
- Melihat timeline proyek dan milestone
- Berkomunikasi dengan PIC yang ditugaskan melalui sistem chat

### 9. Gambaran Umum Dashboard

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

### 4. Manajemen Papan Kanban

- Memperbarui status proyek melalui workflow Kanban
- Memindahkan tugas antar kolom (To Do, In Progress, Done, dll.)
- Menambahkan komentar dan pembaruan ke kartu proyek

### 5. Penanganan Janji Temu

- Mengelola kalender ketersediaan pribadi
- Mengkonfirmasi atau menjadwalkan ulang janji temu client
- Melakukan pertemuan virtual dan konsultasi

### 6. Komunikasi Client

- Menjawab pesan client di sistem chat
- Memberikan pembaruan proyek dan umpan balik
- Menangani permintaan penjadwalan ulang

### 7. Pelaporan dan Dokumentasi

- Memperbarui kemajuan proyek dan deliverables
- Menghasilkan laporan untuk tinjauan admin
- Mempertahankan dokumentasi proyek

## Workflow Admin

### 1. Akses Sistem

- Admin login dengan hak istimewa yang lebih tinggi
- Akses penuh ke semua fitur dan data sistem

### 2. Manajemen Pengguna

- Meninjau dan menyetujui permintaan registrasi client
- Membuat akun pengguna dengan peran yang sesuai
- Mengelola izin pengguna dan tingkat akses
- Menonaktifkan atau memodifikasi akun pengguna sesuai kebutuhan

### 3. Manajemen Perusahaan

- Meninjau dan menyetujui profil perusahaan
- Mengelola informasi dan pengaturan perusahaan
- Menangani permintaan dan pembaruan terkait perusahaan

### 4. Pengawasan Proyek

- Memantau semua proyek di seluruh sistem
- Menugaskan ulang proyek antar PIC jika diperlukan
- Meninjau kemajuan proyek dan campur tangan jika diperlukan
- Menyetujui keputusan proyek kritis

### 5. Konfigurasi Sistem

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
- PIC: penugasan baru, pesan client
- Admins: peringatan sistem, permintaan persetujuan

## Penanganan Error dan Kasus Tepi

### Akses Ditolak

- Pengguna yang mencoba tindakan yang tidak sah dialihkan
- Pesan error yang jelas menjelaskan persyaratan izin

### Kedaluwarsa Sesi

- Logout otomatis setelah tidak aktif
- Pengguna diminta untuk login ulang

### Validasi Data

- Semua formulir menyertakan validasi sisi client dan sisi server
- Pengguna dipandu melalui koreksi input yang tidak valid

### Resolusi Konflik

- Konflik janji temu terdeteksi dan dicegah
- Admin dapat menyelesaikan konflik yang ditingkatkan secara manual
