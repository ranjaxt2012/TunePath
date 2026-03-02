# Figma API Setup Guide

## 🔑 Getting Your Figma Token

### 1. Create Personal Access Token
1. Go to [Figma.com](https://www.figma.com)
2. Click on your profile picture → **Account Settings**
3. Scroll down to **Personal Access Tokens**
4. Click **Create new token**
5. Give it a name (e.g., "TunePath Development")
6. Set **Permissions** to **Read**
7. Click **Create**
8. **Copy the token** (it won't be shown again!)

### 2. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and replace `YOUR_FIGMA_TOKEN`:
   ```bash
   FIGMA_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. Restart Development Server

```bash
npx expo start
```

## 🎯 File Key Information

Your TunePath Master Flow file:
- **URL**: `https://www.figma.com/design/4kswPvyNuBl3zX7prQIEGT/TunePath---Master-Flow`
- **File Key**: `4kswPvyNuBl3zX7prQIEGT`

## 🚀 Testing Figma Access

Once configured, you can test access:

```bash
# Test Figma API connection
curl -H "X-Figma-Token: YOUR_FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/4kswPvyNuBl3zX7prQIEGT"
```

## 📱 Available Screens

Once Figma access is working, we can import:

- ✅ Welcome (01 - Welcome) - Done
- ✅ Select Instrument (03 - Select Instrument) - Done  
- ✅ Select Level (04 - Select Level) - Done
- ✅ Home (05 - Home) - Done
- ✅ Lesson Player (07 - Lesson Player) - Done
- 🔄 More screens from your Figma file

## 🔒 Security Notes

- **Never commit** `.env` file to version control
- **Add `.env`** to `.gitignore` if not already there
- **Token expires** after 30 days - you'll need to regenerate
- **Keep token secure** - only share with trusted team members

## 🐛 Troubleshooting

### 403 Forbidden Error
- Token expired → Create new token
- Wrong permissions → Ensure "Read" permissions
- Invalid token → Double-check copied token

### Connection Issues
- Check internet connection
- Verify file key is correct
- Ensure token has proper access to file

---

**Once you have the token, just let me know and I can import any screen you want!** 🎨
