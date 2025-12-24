# Panduan Penerapan Localization

## Status Sekarang

✅ Foundation localization sudah selesai:

- Middleware dan i18n config
- NextIntlClientProvider
- Language switcher dengan routing yang benar
- Translation files (en.json, id.json)
- Home page dan sidebar sudah terlokalisasi

**Langkah selanjutnya:** Terapkan localization ke page dan komponen lainnya.

---

## Struktur Localization yang Sudah Ada

### 1. File Konfigurasi

- **`i18n.ts`** (root): Config next-intl, message loader
- **`src/i18n/routing.ts`**: Routing config dengan locales dan Link component
- **`middleware.ts`**: Mendeteksi dan route ke locale yang sesuai

### 2. Translation Files

- **`src/messages/en.json`**: English translations
- **`src/messages/id.json`**: Indonesian translations

### 3. Namespace yang Sudah Disiapkan

```json
{
  "Common": { ... },
  "Nav": { ... },
  "Sidebar": { ... },
  "Auth": { ... },
  "Dashboard": { ... },
  "Projects": { ... },
  "Errors": { ... },
  "Metadata": { ... },
  "Home": { ... }
}
```

---

## Langkah-Langkah Penerapan Localization

### A. Untuk Page/Komponen Client (`.tsx` dengan "use client")

#### 1. Import hooks

```tsx
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl"; // jika perlu tahu locale aktif
import { Link } from "@/i18n/routing"; // untuk links yang locale-aware
```

#### 2. Gunakan hook di komponen

```tsx
export default function MyPage() {
  const t = useTranslations("PageNamespace"); // e.g., "Auth", "Dashboard"
  const locale = useLocale(); // opsional

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <Link href="/some-path">{t("linkText")}</Link>
    </div>
  );
}
```

#### 3. Tambahkan translation keys ke messages

**`src/messages/en.json`:**

```json
{
  "PageNamespace": {
    "title": "My Page Title",
    "description": "My page description",
    "linkText": "Click here"
  }
}
```

**`src/messages/id.json`:**

```json
{
  "PageNamespace": {
    "title": "Judul Halaman Saya",
    "description": "Deskripsi halaman saya",
    "linkText": "Klik di sini"
  }
}
```

---

### B. Untuk Page/Komponen Server (tanpa "use client")

#### 1. Import server function

```tsx
import { getTranslations } from "next-intl/server";
```

#### 2. Gunakan di dalam page/komponen

```tsx
export default async function MyPage() {
  const t = await getTranslations("PageNamespace");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

#### 3. Untuk metadata (generateMetadata)

```tsx
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");

  return {
    title: t("myPageTitle"),
    description: t("myPageDescription"),
  };
}

export default async function MyPage() {
  // ...
}
```

---

### C. Untuk Link yang Locale-Aware

Selalu gunakan `Link` dari `@/i18n/routing`, bukan `next/link`:

```tsx
import { Link } from "@/i18n/routing";

// Link ini otomatis preserve locale saat diklik
<Link href="/dashboard">{t("linkText")}</Link>

// Untuk root path (/)
<Link href="/">{t("home")}</Link>

// Link dengan dynamic path
<Link href={`/project/${id}`}>{t("viewProject")}</Link>
```

---

## Contoh Konkret: Melokalisasi Auth Pages

### Step 1: Buka `src/app/auth/login/page.tsx`

### Step 2: Tambahkan "use client" di atas (jika belum ada)

```tsx
"use client";
```

### Step 3: Import localization hooks

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
```

### Step 4: Gunakan hooks di komponen

```tsx
export default function LoginPage() {
  const t = useTranslations("Auth");

  return (
    <div className="...">
      <h1>{t("loginTitle")}</h1>
      <p>{t("loginDescription")}</p>
      <button>{t("signIn")}</button>
      <Link href="/auth/register">{t("noAccount")}</Link>
    </div>
  );
}
```

### Step 5: Tambahkan keys ke `src/messages/en.json`

```json
{
  "Auth": {
    "loginTitle": "Sign In",
    "loginDescription": "Enter your credentials to sign in",
    "signIn": "Sign In",
    "noAccount": "Don't have an account? Register",
    "registerTitle": "Create Account",
    "registerDescription": "Fill in your details to create an account",
    "register": "Register",
    "haveAccount": "Already have an account? Sign In",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password?",
    "signUp": "Sign Up"
  }
}
```

### Step 6: Terjemahkan ke `src/messages/id.json`

```json
{
  "Auth": {
    "loginTitle": "Masuk",
    "loginDescription": "Masukkan kredensial Anda untuk masuk",
    "signIn": "Masuk",
    "noAccount": "Tidak punya akun? Daftar",
    "registerTitle": "Buat Akun",
    "registerDescription": "Isi detail Anda untuk membuat akun",
    "register": "Daftar",
    "haveAccount": "Sudah punya akun? Masuk",
    "email": "Email",
    "password": "Sandi",
    "confirmPassword": "Konfirmasi Sandi",
    "forgotPassword": "Lupa Sandi?",
    "signUp": "Daftar"
  }
}
```

---

## Contoh Konkret: Melokalisasi Static Pages (Privacy, Terms)

### Untuk `src/app/privacy-policy/page.tsx` (Server Component)

```tsx
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations("PrivacyPolicy");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 pb-8 pt-24">
        <h1>{t("title")}</h1>
        <p>{t("introduction")}</p>

        <section>
          <h2>{t("dataCollection.title")}</h2>
          <p>{t("dataCollection.description")}</p>
        </section>

        {/* Tambahkan section lainnya sesuai kebutuhan */}
      </div>
    </div>
  );
}
```

### Keys yang diperlukan di messages:

```json
{
  "PrivacyPolicy": {
    "title": "Privacy Policy",
    "introduction": "We value your privacy...",
    "dataCollection": {
      "title": "Data Collection",
      "description": "We collect..."
    }
  }
}
```

---

## Best Practices

### 1. Naming Namespace

- Gunakan nama yang sesuai dengan page/feature
- Contoh: `Auth`, `Dashboard`, `Projects`, `Chat`, `Appointments`

### 2. Naming Keys

- Gunakan camelCase untuk keys
- Gunakan dot notation untuk nested objects
- Contoh: `Auth.loginTitle`, `Common.appName`

### 3. Links

- **Selalu** gunakan `Link` dari `@/i18n/routing`
- Jangan gunakan `next/link` untuk locale-aware navigation

### 4. Metadata

- Gunakan `Metadata.*` namespace untuk generateMetadata
- Selalu localize title, description, og:title, etc

### 5. Error Handling

- Gunakan `Errors.*` namespace untuk pesan error
- Contoh: `t("Errors.notFound")`, `t("Errors.unauthorized")`

### 6. Translations for Dynamic Content

Jika ada konten dinamis yang perlu translated:

```tsx
const statusMap = {
  pending: t("Common.pending"),
  completed: t("Common.completed"),
  failed: t("Common.failed"),
};

return <span>{statusMap[status]}</span>;
```

---

## Checklist: Page yang Perlu Dilokalisasi

Berdasarkan struktur project:

### Auth Pages

- [ ] `src/app/auth/login/page.tsx`
- [ ] `src/app/auth/register/page.tsx`
- [ ] `src/app/auth/forgot-password/page.tsx`
- [ ] `src/app/auth/reset-password/page.tsx`

### External Pages

- [ ] `src/app/(external)/page.tsx` (jika ada)
- [ ] `src/app/(external)/guest-appointment/page.tsx`
- [ ] `src/app/(external)/guest/reschedule/[requestId]/page.tsx`

### Main/Dashboard Pages

- [ ] `src/app/(main)/dashboard/page.tsx`
- [ ] `src/app/(main)/dashboard/appointments/page.tsx`
- [ ] `src/app/(main)/dashboard/projects/page.tsx`
- [ ] `src/app/(main)/dashboard/chat/page.tsx`
- [ ] Dan page dashboard lainnya

### Static Pages

- [ ] `src/app/privacy-policy/page.tsx` ✅ (sudah ada struktur, perlu keys)
- [ ] `src/app/terms-of-service/page.tsx` ✅ (sudah ada struktur, perlu keys)

### Admin Pages

- [ ] `src/app/(main)/dashboard/admin/**/*.tsx`

---

## Tips & Troubleshooting

### 1. "Couldn't find next-intl config"

- Pastikan `i18n.ts` ada di root directory
- Run `npm run dev` ulang

### 2. Link tidak switch locale

- Pastikan menggunakan `Link` dari `@/i18n/routing`
- Jangan gunakan `next/link`

### 3. Translation key tidak muncul

- Check namespace di `useTranslations("Namespace")`
- Pastikan key ada di en.json dan id.json
- Reload browser (hard refresh Ctrl+Shift+R)

### 4. Metadata tidak localized

- Gunakan `getTranslations()` di `generateMetadata()`
- Jangan lupa di route params tambahkan `{ locale }`

---

## Timeline Implementasi yang Disarankan

1. **Auth Pages** (1-2 hari) - High priority, user-facing
2. **Dashboard Pages** (2-3 hari) - Main application
3. **Admin Pages** (1-2 hari) - Internal tools
4. **External/Guest Pages** (1 hari) - Guest-facing
5. **All Metadata** (1-2 hari) - SEO important
6. **Remaining Components** (As needed)

---

## Next Steps

1. Pilih page dari checklist di atas
2. Ikuti langkah-langkah di section A/B/C sesuai tipe page
3. Test dengan switch locale di navbar
4. Commit changes
5. Repeat untuk page berikutnya

Semua tools sudah siap! Tinggal terapkan ke setiap page. 🚀
