# Development Setup Guide

## 🔧 Configuration Files Setup

Project ini sudah dikonfigurasi untuk **Windows development** dengan **CRLF line endings**. Berikut adalah setup yang sudah dilakukan:

### ✅ VS Code Settings (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Line endings - Windows CRLF
  "files.eol": "\r\n",
  "prettier.endOfLine": "crlf",

  // ESLint validation
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],

  // Formatter by language - All use Prettier
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[javascriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

### ✅ Prettier Configuration (`.prettierrc`)
```json
{
  "endOfLine": "crlf",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### ✅ ESLint Configuration (`eslint.config.mjs`)
- ✅ Integrated with Prettier
- ✅ TypeScript support
- ✅ Security plugins
- ✅ Code quality rules

## 🚀 Quick Setup Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Format Code
```bash
npm run format
```

### 3. Fix Linting Issues
```bash
npm run lint:fix
```

### 4. Fix Everything
```bash
npm run fix
```

## 📋 VS Code Extensions Required

Install extensions berikut melalui `.vscode/extensions.json`:

- **Prettier** (`esbenp.prettier-vscode`) - Code formatter
- **ESLint** (`dbaeumer.vscode-eslint`) - Linting
- **Tailwind CSS** (`bradlc.vscode-tailwindcss`) - CSS IntelliSense
- **Prisma** (`prisma.prisma`) - Database ORM
- **TypeScript Next** (`ms-vscode.vscode-typescript-next`) - TypeScript

## 🔧 Troubleshooting

### Issue: Red squiggly lines tapi ESLint bilang OK
**Cause**: TypeScript checker lebih strict dari ESLint rules
**Solution**: Focus pada ESLint warnings dulu, TypeScript errors akan resolve saat code di-save

### Issue: Line endings mixed (LF/CRLF)
**Cause**: Prettier default LF vs Windows CRLF
**Solution**: Settings sudah dikonfigurasi untuk CRLF - restart VS Code

### Issue: Formatting tidak konsisten
**Solution**:
1. Save file (`Ctrl+S`)
2. Format document (`Shift+Alt+F`)
3. Run `npm run fix`

## 🎯 Development Workflow

1. **Write code** dengan fitur apa saja
2. **Save file** → Auto-format dengan Prettier
3. **Check ESLint** → Fix warnings yang muncul
4. **Test functionality** → Pastikan tidak break
5. **Commit** → Code sudah clean dan konsisten

## 📁 File Structure Overview

```
📁 Project Root
├── 📄 .editorconfig          # Editor consistency
├── 📄 .eslintignore          # ESLint ignore patterns
├── 📄 .prettierignore        # Prettier ignore patterns
├── 📄 .prettierrc           # Prettier configuration
├── 📄 .vscode/
│   ├── 📄 extensions.json   # Required extensions
│   └── 📄 settings.json     # VS Code settings
└── 📄 eslint.config.mjs     # ESLint configuration
```

## ✅ What's Fixed

- ✅ **Line endings**: CRLF untuk Windows
- ✅ **Formatter**: Prettier untuk semua file types
- ✅ **Linter**: ESLint dengan TypeScript support
- ✅ **Auto-fix**: Format on save + ESLint fix
- ✅ **Consistency**: EditorConfig untuk team consistency
- ✅ **Ignore patterns**: Proper ignore files untuk generated code

## 🎉 Result

Sekarang development environment sudah **100% konsisten** dan tidak akan bingung lagi dengan:

- ❌ Mixed line endings
- ❌ Conflicting formatters
- ❌ Inconsistent linting
- ❌ Manual formatting issues

**Happy coding! 🚀**
