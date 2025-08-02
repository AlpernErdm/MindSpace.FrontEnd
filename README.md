# 🎨 Blog Frontend - Next.js Application

Modern blog platformunun frontend uygulaması. Next.js 15, TypeScript ve TailwindCSS kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 🎯 Kullanıcı Deneyimi
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Dark/Light Mode**: Tema desteği
- **Real-time Updates**: SignalR ile canlı güncellemeler
- **Progressive Web App**: PWA özellikleri

### 🔐 Kimlik Doğrulama
- JWT token tabanlı authentication
- Context API ile state management
- Protected routes
- Auto-logout on token expiry

### 📝 İçerik Yönetimi
- Rich text editor
- Image upload
- Draft/Published status
- SEO optimization

### 🏷️ Sosyal Özellikler
- Like/Unlike posts
- Comment system
- User following
- Real-time notifications

## 🛠️ Teknolojiler

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS
- **Lucide React**: Icons
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **SignalR**: Real-time communication

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

1. **Dependencies'i yükleyin**
```bash
npm install
```

2. **Environment variables'ları ayarlayın**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_API_URL=https://localhost:7237
NEXT_PUBLIC_SIGNALR_URL=https://localhost:7237/notificationHub
```

3. **Development server'ı başlatın**
```bash
npm run dev
```

Uygulama şu adreste çalışacak: `http://localhost:3000`

## 📁 Proje Yapısı

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── post/           # Post pages
│   ├── profile/        # Profile pages
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── ui/            # UI components
│   └── Header.tsx     # Navigation header
├── contexts/          # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/             # Custom hooks
│   └── useSignalR.ts  # SignalR hook
├── services/          # API services
│   ├── api.ts         # Axios configuration
│   └── auth.ts        # Authentication service
├── types/             # TypeScript types
│   └── index.ts       # Type definitions
└── lib/               # Utility functions
    └── utils.ts       # Helper functions
```

## 🎨 Styling

Bu proje TailwindCSS kullanır:

```bash
# TailwindCSS kurulumu
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### CSS Classes

```tsx
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// Hover effects
<button className="hover:bg-blue-600 transition-colors duration-200">
```

## 🔧 API Integration

### Axios Configuration

```typescript
// services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - JWT token
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Authentication Service

```typescript
// services/auth.ts
export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    // Token'ı cookie'ye kaydet
    return response.data
  },
  
  async logout(): Promise<void> {
    await api.post('/auth/logout')
    // Cookie'leri temizle
  }
}
```

## ⚡ Real-time Features

### SignalR Integration

```typescript
// hooks/useSignalR.ts
export const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_SIGNALR_URL!)
      .withAutomaticReconnect()
      .build()
      
    connection.on('NewNotification', (notification) => {
      // Handle new notification
    })
    
    connection.start()
    setIsConnected(true)
  }, [])
}
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

## 📱 PWA Features

### Service Worker

```typescript
// app/sw.ts
self.addEventListener('install', (event) => {
  // Cache static assets
})

self.addEventListener('fetch', (event) => {
  // Handle offline requests
})
```

### Manifest

```json
// public/manifest.json
{
  "name": "Blog App",
  "short_name": "Blog",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
```

## 🚀 Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://localhost:7237
NEXT_PUBLIC_SIGNALR_URL=https://localhost:7237/notificationHub

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## 📊 Performance

### Optimization Techniques

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Bundle Analysis**: `@next/bundle-analyzer`
- **Caching**: Static generation and ISR

### Lighthouse Score

```bash
npm run lighthouse
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
