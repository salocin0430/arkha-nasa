# ARKHA Project Configuration

## 🚀 Quick Reference

### URLs
- **Local Development**: http://localhost:3000 (or 3001)
- **Network Access**: http://192.168.1.2:3000
- **Supabase Dashboard**: [Your Supabase Project URL]

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Project Structure
```
arkha/
├── src/app/                 # Next.js pages
├── src/components/          # UI components
├── src/hooks/              # Custom hooks
├── src/infrastructure/     # External services
├── src/application/        # Business logic
├── src/domain/            # Business entities
├── public/                # Static assets
└── .env.local            # Environment config
```

### Database Schema
- **Users**: Uses Supabase `auth.users` table
- **Missions**: Custom table (to be implemented)
- **Modules**: Custom table (to be implemented)

### Authentication
- **Provider**: Supabase Auth
- **Email Confirmation**: Disabled
- **Session**: Automatic with localStorage backup
- **Protected Routes**: /mission-builder/*, /gallery, /profile

### Styling
- **Framework**: Tailwind CSS v3.4.0
- **Colors**: Electric Blue (#0042A6), Deep Blue (#07173F), Neon Yellow (#EAFE07)
- **Layout**: No-scroll design (h-screen, h-full)
- **Navbar**: Fixed with pt-32 content padding

### Current Features
✅ Authentication & User Management
✅ Protected Routes
✅ Persistent Navigation
✅ Mission Dashboard
✅ Mission Configuration
✅ Gallery with Modern Design
✅ User Profile
✅ Responsive Design
✅ Network Access

### Next Steps
🚧 3D Model Loading (Three.js)
🚧 Space Neighborhood Algorithm
🚧 Mission Validation Rules
🚧 3D Interaction Controls
🚧 Mission Saving/Sharing

### Known Solutions
- **Text Ghosting**: Removed backdrop-blur-sm from navbar
- **Content Overlap**: Added pt-32 padding to main content
- **Duplicate Navbars**: Removed local Navbar components
- **Auth State**: Implemented useAuth hook with ProtectedRoute

---

**Last Updated**: January 2025
**Status**: UI/UX Complete, 3D Implementation Pending
