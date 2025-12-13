# Portfolio CMS Usage

## How to Use the CMS

### ✅ **Online File Updates via GitHub API**

1. **Open the CMS**: Open `cms.html` in your browser (works on any modern browser)
2. **Configure GitHub**: Click the "⚙️ Settings" button and enter your GitHub repository details
3. **Edit your content**: Make changes to any section (personal info, services, awards, etc.)
4. **Save changes**: Click "Save All Changes" button
5. **Done!** All JSON files are updated directly in your GitHub repository

### 🔧 **Initial Setup**

#### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Portfolio CMS"
4. Select the `repo` scope (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

#### Step 2: Configure CMS Settings

1. Open `cms.html` in your browser
2. Click the "⚙️ Settings" button
3. Fill in:
   - **GitHub Username/Organization**: Your GitHub username (e.g., `jvcbyte`)
   - **Repository Name**: Your repository name (e.g., `jvcbyte.github.io`)
   - **Branch**: Usually `main` or `master`
   - **GitHub Personal Access Token**: Paste the token you created
   - **API Endpoint** (Optional): Leave empty to use GitHub API directly, or use a serverless function URL
4. Click "Save Settings"
5. (Optional) Click "Test Connection" to verify it works

### 📁 **How It Works**

1. The CMS uses GitHub API to update files directly in your repository
2. When you click "Save All Changes", it:
   - Sends updates to GitHub API for each JSON file
   - Creates commits automatically with message "Update [filename] via CMS"
   - Updates files in the `data/` folder of your repository
3. Changes are live immediately after GitHub Pages rebuilds (usually within seconds)

### 🚨 **Important Notes**

- **Security**: Your GitHub token is stored locally in your browser (localStorage)
- **Token Scope**: The token needs `repo` scope to update files
- **Public Repos**: For public repositories, you can use a token with `public_repo` scope
- **Rate Limits**: GitHub API has rate limits, but normal usage should be fine
- **Backup**: Always commit your changes to Git before major edits (though CMS auto-commits)

### 🔄 **Alternative: Using Serverless Function**

If you prefer to use a serverless function (Vercel, Netlify, etc.):

1. Deploy the `api/update-file.js` file to your serverless platform
2. In CMS settings, enter the API endpoint URL
3. The function will handle GitHub API calls securely
4. Your token is still required but handled server-side

### 🎯 **What Gets Updated**

When you save, these files are updated directly:
- `data/personal.json` - Personal information and bio
- `data/services.json` - Services offered
- `data/awards.json` - Awards and recognition
- `data/skills.json` - Skills for about and resume pages
- `data/experience.json` - Work experience
- `data/education.json` - Education history
- `data/certifications.json` - Certifications
- `data/projects.json` - Portfolio projects
- `data/blog.json` - Blog posts

### 🔄 **Workflow**

1. Edit content in CMS
2. Click "Save All Changes"
3. Files are updated automatically in data/ folder
4. Commit changes to Git
5. Push to GitHub for live updates

**No servers, no downloads, no prompts - just automatic file updates!** 🎉