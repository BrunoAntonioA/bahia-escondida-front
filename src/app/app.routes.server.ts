import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ✅ Static routes → prerender
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'tables',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'sales',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'products',
    renderMode: RenderMode.Prerender,
  },

  // 🔴 Dynamic routes → server render ONLY
  {
    path: 'tables/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'sales/:id',
    renderMode: RenderMode.Server,
  },

  // Fallback
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
