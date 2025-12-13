# Portfolio CMS Usage

## How to Use the CMS

### ✅ **Direct File Saving (No Downloads!)**

1. **Open the CMS**: Open `cms.html` in Chrome or Edge browser
2. **Edit your content**: Make changes to any section (personal info, services, awards, etc.)
3. **Save changes**: Click "Save All Changes" button
4. **Select project folder**: Choose your project root directory when prompted
5. **Done!** All JSON files in the `data/` folder are updated directly

### 🔧 **Requirements**

- **Browser**: Chrome or Edge (File System Access API support required)
- **Permissions**: Allow file system access when prompted

### 📁 **How It Works**

1. The CMS uses the **File System Access API** to write directly to your JSON files
2. When you click "Save All Changes", it asks for your project directory
3. It then updates each JSON file in the `data/` folder with your changes
4. No downloads, no manual file replacement needed!

### 🚨 **Important Notes**

- **First time**: You'll need to select your project root directory
- **Browser support**: Only works in Chrome/Edge (modern browsers with File System Access API)
- **Permissions**: Browser will ask for file system access - click "Allow"
- **Backup**: Always commit your changes to Git before major edits

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
3. Select project directory (first time only)
4. Files are updated automatically
5. Commit changes to Git
6. Push to GitHub for live updates

**No servers, no downloads, just direct file manipulation!** 🎉