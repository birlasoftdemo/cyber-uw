import { toast } from '@heroui/react'

export function stubToast(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined)
}

export function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}