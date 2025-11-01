# UI Theme Implementation

A modern, futuristic UI theme built with Next.js, TypeScript, and Tailwind CSS. Features glassmorphism design, custom gradients, smooth animations, and a comprehensive component library with full accessibility support.

## Features

- 🎨 **Custom Light Theme** - Beautiful color palette with #E3F2FD, #64B5F6, and complementary colors
- ✨ **Glassmorphism Design** - Frosted glass effects with backdrop blur and transparency
- 🌈 **Custom Gradients** - Beautiful gradient combinations for modern aesthetics
- 🎭 **Smooth Animations** - Fluid transitions and micro-interactions throughout
- 📱 **Fully Responsive** - Mobile-first design with adaptive layouts
- ♿ **Accessibility First** - WCAG compliant with keyboard navigation and screen reader support
- 🔧 **Reusable Components** - Modular component library with TypeScript support
- 📚 **Documentation** - Storybook integration and comprehensive docs

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework with custom configuration
- **Lucide React** - Beautiful icon library
- **Storybook** - Component documentation and testing

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start Storybook
npm run storybook
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── docs/              # Documentation pages
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Tag.tsx
│   ├── Header.tsx        # Navigation header
│   ├── SidePanel.tsx     # Sidebar navigation
│   ├── HeroSection.tsx   # Landing page hero
│   ├── FeaturesSection.tsx
│   └── ComponentsShowcase.tsx
├── lib/                  # Utilities and helpers
│   └── utils.ts
├── stories/              # Storybook stories
└── tailwind.config.js    # Custom Tailwind configuration
```

## Theme Configuration

The theme uses a custom Tailwind configuration with:

### Color Palette
- **Primary**: Blue-based palette (#E3F2FD to #0D47A1)
- **Accent**: Vibrant colors for highlights (#00BCD4, #9C27B0, #E91E63)
- **Glass**: Transparency levels for glassmorphism effects
- **Text**: Optimized contrast ratios for readability

### Custom Utilities
- `.glass-morphism` - Frosted glass effect
- `.gradient-text` - Gradient text styling
- `.focus-ring` - Consistent focus indicators
- `.hover-lift` - Smooth hover animations

### Animations
- `fade-in`, `slide-up`, `slide-down`, `scale-in`
- `float`, `glow`, `pulse-slow`
- All animations are GPU-accelerated for smooth performance

## Components

### Button
Multiple variants and sizes with loading states:
```tsx
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

### Card
Three variants with hover effects:
```tsx
<Card variant="glass" hover>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### Tag
Colorful tags with removable functionality:
```tsx
<Tag variant="primary" removable onRemove={() => {}}>
  Removable Tag
</Tag>
```

### Modal
Accessible modal with focus management:
```tsx
<Modal isOpen={isOpen} onClose={() => {}} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader**: Semantic HTML5 with proper ARIA labels
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Smart focus trapping and restoration
- **Responsive Text**: Text scales properly across devices

## Responsive Design

- **Mobile** (< 768px): Single column, hamburger menu
- **Tablet** (768px - 1024px): Two-column layouts, collapsible sidebar
- **Desktop** (> 1024px): Multi-column, fixed sidebar

## Documentation

Visit `/docs` for comprehensive documentation or run Storybook:

```bash
npm run storybook
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## License

MIT License - see LICENSE file for details.