import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ✅ Static routes → prerender
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'ventas',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'productos',
    renderMode: RenderMode.Prerender,
  },

  // 🔴 Dynamic routes → server render ONLY
  {
    path: 'ventas/:id',
    renderMode: RenderMode.Server,
  },

  // Fallback
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
