# Portfolio Website with CMS

A modern, responsive portfolio website built with HTML, CSS, and JavaScript, featuring a comprehensive Content Management System (CMS) for easy content updates.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dynamic Content**: All content is loaded from JSON files for easy management
- **Content Management System**: Full-featured CMS for updating portfolio content
- **Modern UI/UX**: Clean, professional design with smooth animations
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## Project Structure

```
├── index.html              # Main portfolio page
├── cms.html                # Content Management System
├── assets/
│   ├── fonts/              # custom fonts
│   └── images/             # Profile images and icons
│       ├── awards/         # Awards screenshot
│       ├── blogs/          # Blog post images
│       └── projects/       # Project screenshots
├── css/
│   ├── style.css       # Main portfolio styles
│   └── cms.css         # CMS styles
├── js/
│   ├── script.js       # Main portfolio functionality
│   ├── data-loader.js  # Dynamic content loader
│   └── cms.js          # CMS functionality
├── data/                   # JSON data files
│   ├── personal.json       # Personal information
│   ├── services.json       # Services offered
│   ├── awards.json         # Awards and recognition
│   ├── skills.json         # Technical skills
│   ├── experience.json     # Work experience
│   ├── education.json      # Educational background
│   ├── certifications.json # Professional certifications
│   ├── projects.json       # Portfolio projects
│   └── blog.json          # Blog posts
└── README.md
```

## Getting Started

### 1. View the Portfolio
Simply open `index.html` in your web browser to view the portfolio website.

### 2. Use the Content Management System
1. Open `cms.html` in your web browser
2. Navigate through different sections using the top navigation
3. Edit content directly in the forms
4. Click "Save All Changes" to download updated JSON files
5. Replace the files in the `data/` folder with the downloaded files

### 3. Local Development
For the best experience, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` to view the portfolio.

## CMS Features

The Content Management System allows you to manage:

- **Personal Information**: Name, title, contact details, bio, social links
- **Services**: What you do, service descriptions and icons
- **Awards & Recognition**: Achievements with images and descriptions
- **Skills**: Technical skills for both About and Resume sections
- **Work Experience**: Job history with achievements and date calculations
- **Education**: Academic background with courses
- **Certifications**: Professional certifications with credential details
- **Projects**: Portfolio projects with categories, descriptions, and links

### CMS Usage Tips

1. **Images**: Use relative paths starting with `./assets/` for images
2. **Categories**: Projects support categories: Web2, Web3, IoT & Embedded Systems, Graphics Design
3. **Dates**: Use YYYY-MM-DD format for dates, or "present" for current positions
4. **Social Links**: Use ionicon names for social media icons (e.g., "logo-github", "logo-linkedin")
5. **Featured Projects**: Mark important projects as featured for highlighting

## Customization

### Adding New Sections
1. Add new JSON file in `data/` folder
2. Update `data-loader.js` to load and populate the new section
3. Add corresponding HTML structure in `index.html`
4. Add CMS management in `cms.html` and `cms.js`

### Styling
- Modify `assets/css/style.css` for portfolio styling
- Modify `assets/css/cms.css` for CMS styling
- The design uses CSS custom properties for easy color scheme changes

### Adding New Project Categories
1. Update the category options in `cms.js` (createProjectElement method)
2. Update the filter options in `cms.html`
3. Update the formatCategory method in `data-loader.js`

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please open an issue on GitHub or contact the developer.