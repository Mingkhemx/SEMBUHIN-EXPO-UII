import { createFileRoute } from '@tanstack/react-router'
import { AdminApiUsage } from '@/panel-admin/AdminApiUsage'

export const Route = createFileRoute('/admin/api-usage')({
  head: () => ({
    meta: [
      { title: 'API Usage — Admin Panel — Sembuhin' },
      { name: 'description', content: 'Monitor penggunaan AI API dan limits' },
    ],
  }),
  component: AdminApiUsage,
})
