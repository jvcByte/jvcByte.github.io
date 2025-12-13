# CMS Setup Guide

## Quick Start

### For GitHub Pages (Recommended)

1. **Create GitHub Personal Access Token**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select `repo` scope
   - Copy the token

2. **Configure CMS**
   - Open `cms.html` in your browser
   - Click "⚙️ Settings"
   - Enter:
     - Owner: `jvcbyte` (your username)
     - Repo: `jvcbyte.github.io` (your repo name)
     - Branch: `main`
     - Token: (paste your token)
   - Click "Save Settings"

3. **Start Editing!**
   - Make changes in the CMS
   - Click "Save All Changes"
   - Files update automatically in your GitHub repo

## Serverless Function Setup (Optional)

If you want to use a serverless function instead of direct GitHub API:

### Vercel

1. Create `vercel.json`:
```json
{
  "functions": {
    "api/update-file.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

2. Deploy to Vercel
3. Use the function URL in CMS settings

### Netlify

1. Create `netlify.toml`:
```toml
[build]
  functions = "api"
```

2. Deploy to Netlify
3. Use the function URL in CMS settings

## Security Notes

- **Token Storage**: Tokens are stored in browser localStorage (encrypted by browser)
- **HTTPS Only**: Always use HTTPS when accessing the CMS
- **Token Scope**: Use minimal required scope (`repo` for private, `public_repo` for public)
- **Token Rotation**: Regularly rotate your tokens for security

## Troubleshooting

### "Failed to update file" error
- Check that your token has the correct scope
- Verify repository name and owner are correct
- Ensure branch name is correct (usually `main`)

### "Connection failed" error
- Check your internet connection
- Verify GitHub API is accessible
- Check browser console for detailed error messages

### Files not updating
- Check GitHub repository for new commits
- Verify file paths are correct (`data/*.json`)
- Check GitHub Pages build status

