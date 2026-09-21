import { toast } from '@heroui/react'

export function showSuccessToast(message: string) {
  toast.success(message, { timeout: 5000 })
}

export function showErrorToast(message: string) {
  toast.danger(message, { timeout: 6000 })
}

export function showInfoToast(message: string) {
  toast.info(message, { timeout: 5000 })
}
