import type { PostArticleAccount } from '@/types'

declare global {
  interface Window {
    $syncer?: {
      getAccounts: (callback: (resp: PostArticleAccount[]) => void) => void
      addTask: (task, statusHandler: (status: string) => void, callback) => void
    }
  }
}
export {}
