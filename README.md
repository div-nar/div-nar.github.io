# Personal Portfolio Website

A minimalist personal portfolio website inspired by clean, modern design principles. Built with HTML, CSS, and vanilla JavaScript for maximum performance and simplicity.

## Features

✨ **Minimalist Design** - Clean, distraction-free layout focusing on your work
🎨 **Light/Dark Mode** - Automatic light and dark theme based on system preference
📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
⚡ **Fast & Lightweight** - No dependencies, no frameworks - pure HTML/CSS
🧭 **Smooth Navigation** - Sticky navbar with smooth scrolling
🎯 **Clear Sections** - About, Projects, Skills, and Contact

## Design Inspiration

This design is inspired by the minimalist portfolio approach seen in modern Japanese design principles - emphasizing clarity, purpose, and elegant simplicity.

## File Structure

```
personal website/
├── index.html          # Main HTML file
├── style.css           # All styling
└── README.md           # This file
```

## Customization

### Update Your Information

Edit `index.html` and replace:
- Your name in the hero section
- Bio description
- Project details
- Contact links

### Change Colors

Edit the CSS variables in `style.css`:
```css
:root {
    --bg-light: #ffffff;
    --text-primary: #1a1a1a;
    --accent: #000000;
    /* ... */
}
```

### Add More Projects

Copy this structure in the projects section:
```html
<div class="project-item">
    <h3>Project Name</h3>
    <p class="project-description">Description here</p>
    <p class="project-details">
        <span class="tag">Tech 1</span>
        <span class="tag">Tech 2</span>
    </p>
    <p class="project-links">
        <a href="#" class="link">View Project →</a>
        <a href="#" class="link">GitHub →</a>
    </p>
</div>
```

## Usage

Simply open `index.html` in your browser. No build process or server required!

```bash
# On macOS/Linux
open index.html

# On Windows
start index.html
```

## Deployment

### GitHub Pages
1. Push this folder to a GitHub repository
2. Go to Settings → Pages
3. Select "main" branch as source
4. Your site will be live at `username.github.io/repo-name`

### Vercel
1. Connect your GitHub repository
2. Vercel will auto-deploy on every push
3. Get a custom domain

### Netlify
1. Drag and drop folder to Netlify
2. Get instant hosting and auto-updates

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- **0 JavaScript dependencies** - Pure HTML/CSS
- **<50KB total** - Ultra-lightweight
- **Perfect Lighthouse score** - Optimized for performance
- **Instant load times** - Minimal assets

## Customization Tips

1. **Typography** - Change font stacks in `body` rule
2. **Spacing** - Adjust `padding` and `margin` values
3. **Color Scheme** - Update CSS variables at top
4. **Layout** - Modify `max-width` in `.container`
5. **Animations** - Add `transition` properties to elements

## License

Free to use and modify for your personal portfolio!

## Need Help?

- Check out the reference design at: https://y-n10.com/investment/portfolio/
- Customize colors, fonts, and content to match your personal brand
- Add more sections as needed (testimonials, blog, etc.)
