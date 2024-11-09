import type { PostArticleAccount } from '@/types';

declare global {
  interface Window {
    $syncer?: {
      getAccounts: (callback: (resp: PostArticleAccount[]) => void) => void;
      addTask: (
        task,
        statusHandler: (status: string) => void,
        callback
      ) => void;
    };
    MathJax: {
      texReset: () => void;
      tex2svg: (text: string, options: any) => HTMLElement;
    };
  }
}

export {};
