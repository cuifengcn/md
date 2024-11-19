import type { AiModel, Article, IConfigOption, PreviewTheme } from '@/types';
import type { MyEditorView } from '@/utils/codeMirrorUtil/editor';
import type { Extension } from '@codemirror/state';
import type { ReadTimeResults } from 'reading-time';
import DEFAULT_CONTENT from '@/assets/example/markdown.md?raw';
import DEFAULT_CSS_CONTENT from '@/assets/example/theme-css.txt?raw';
import OUTPUT_DEFAULT from '@/assets/outputDefault.css?raw';
import {
  defaultCssThemes as _defaultCssThemes,
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
} from '@/config';
import {
  addPrefix,
  css2json,
  customCssWithTemplate,
  customizeTheme,
  downloadMD,
  exportHTML,
  formatDoc,
  mergeCss,
  sleep,
} from '@/utils';

import {
  cssThemeCompartment,
  initCssEditor,
  initCssEditorExtensions,
} from '@/utils/codeMirrorUtil'; // 确保这个导入路径正确
import { initRenderer } from '@/utils/renderer';
import { EditorState } from '@codemirror/state';
import { useDark, useStorage, useToggle } from '@vueuse/core';
import ClipboardJS from 'clipboard';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import { debounce } from 'es-toolkit';
import { marked } from 'marked';
import { defineStore } from 'pinia';
import readingTime from 'reading-time';
import { ayuLight, barf } from 'thememirror';
import { v4 as uuidv4 } from 'uuid';
import {
  computed,
  onMounted,
  reactive,
  ref,
  shallowRef,
  toRaw,
  watch,
} from 'vue';

// 通过将codemirror中的MeasureRequest进行export解决
export const useStore = defineStore(`store`, () => {
  const articles = useStorage<Array<Article>>(`articles`, [
    {
      id: uuidv4(),
      title: `默认文章`,
      content: DEFAULT_CONTENT,
      createTs: Date.now(),
    },
  ]);
  const currentArticleId = useStorage<string | null>(
    `currentArticleId`,
    articles.value[0]?.id
  );

  const currentArticle = computed(() => {
    if (!currentArticleId.value) {
      return undefined;
    } else {
      return articles.value.find((a) => a.id === currentArticleId.value);
    }
  });

  // 内容编辑器编辑器
  const editor = ref<MyEditorView | null>(null);
  const editorExtensions = ref<Extension[]>();
  const editorReadTime = ref<ReadTimeResults>();

  const selectArticle = async (id: string) => {
    if (id === currentArticle.value?.id) {
      return;
    }
    const loading = ElLoading.service({
      lock: true,
      text: `载入中`,
      background: `rgba(0, 0, 0, 0.1)`,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    currentArticleId.value = id;
    toRaw(editor.value)?.setState(
      EditorState.create({
        doc: currentArticle.value?.content || ``,
        extensions: toRaw(editorExtensions.value),
      })
    );
    // eslint-disable-next-line ts/no-use-before-define
    editorRefresh();
    loading.close();
    toRaw(editor.value)?.focus();
  };

  const addArticle = async (props: Partial<Article>) => {
    props.id ??= uuidv4();
    props.createTs ??= Date.now();
    if (articles.value.find((a) => a.id === props.id)) {
      articles.value.forEach((a) => {
        if (a.id === props.id) {
          Object.assign(a, props);
        }
      });
    } else {
      // 将此文章添加到开头
      articles.value.unshift({
        id: props.id,
        ...props,
      });
      await new Promise((resolve) => setTimeout(resolve, 300)); // 等待动画完成
      selectArticle(props.id);
    }
  };
  const removeArticle = async (id: string) => {
    const ANIMATION_DELAY = 300; // ms
    const getNextArticleId = (index: number): string | undefined => {
      const nextIndex =
        index === articles.value.length - 1 ? index - 1 : index + 1;
      return articles.value[nextIndex]?.id;
    };

    const waitForAnimation = () =>
      new Promise((resolve) => setTimeout(resolve, ANIMATION_DELAY));

    const index = articles.value.findIndex((a) => a.id === id);

    if (currentArticle.value?.id === id) {
      if (articles.value.length === 1) {
        articles.value.splice(index, 1);
        currentArticleId.value = undefined;
      } else {
        const newId = getNextArticleId(index);
        if (newId) {
          articles.value.splice(index, 1);
          await waitForAnimation();
          await selectArticle(newId);
        }
      }
    } else {
      await waitForAnimation();
      articles.value.splice(index, 1);
    }
  };

  const saveArticles = () => {
    if (currentArticle.value) {
      addArticle(currentArticle.value);
    }
    localStorage.setItem(`articles`, JSON.stringify(articles.value));
  };

  // 为函数添加刷新编辑器的功能
  const withAfterRefresh =
    (fn: (...rest: any[]) => void) =>
    (...rest: any[]) => {
      fn(...rest);
      // eslint-disable-next-line ts/no-use-before-define
      editorRefresh();
    };

  // 是否开启深色模式
  const isDark = useDark();
  const _toggleDark = useToggle(isDark);
  const toggleDark = async (isDark?: boolean) => {
    if (isDark === undefined) {
      _toggleDark();
    } else {
      _toggleDark(isDark);
    }
    await sleep(1000);

    // eslint-disable-next-line ts/no-use-before-define
    editorRefresh();
  };

  // 是否开启 Mac 代码块
  const isMacCodeBlock = useStorage(`isMacCodeBlock`, true);
  const toggleMacCodeBlock = useToggle(isMacCodeBlock);

  // 是否在左侧编辑
  const isEditOnLeft = useStorage(`isEditOnLeft`, true);
  const toggleEditOnLeft = useToggle(isEditOnLeft);

  // 是否开启微信外链接底部引用
  const isCiteStatus = useStorage(`isCiteStatus`, false);
  const toggleCiteStatus = useToggle(isCiteStatus);

  const output = ref(``);

  // 主题相关
  const defaultCssThemes = ref<IConfigOption[]>(_defaultCssThemes);

  // 当前主题
  const theme = useStorage<string>(
    addPrefix(`theme`),
    defaultCssThemes.value[0].value
  );
  const cssThemeContent = ref<string>(``);
  // 文本字体
  const fontFamily = useStorage<string>(`fonts`, fontFamilyOptions[0].value);
  // 文本大小
  const fontSize = useStorage<string>(`size`, fontSizeOptions[2].value);
  // 主色
  const primaryColor = useStorage<string>(`color`, colorOptions[0].value);
  // 背景
  const background = useStorage<string>(`background`, null);
  // 代码块主题
  const codeBlockTheme = useStorage<string>(
    `codeBlockTheme`,
    codeBlockThemeOptions[23].value
  );
  // 图注格式
  const legend = useStorage<string>(`legend`, legendOptions[3].value);

  const fontSizeNumber = computed(() => fontSize.value.replace(`px`, ``));

  const fetchCodeBlockThemeContent = async () => {
    const res = await fetch(codeBlockTheme.value);
    return await res.text();
  };

  const output2Html = async (options?: {
    styles?: string;
  }): Promise<string> => {
    const styles = cssThemeContent.value;
    // 公众号不支持 position， 转换为等价的 translateY
    const htmlContent = document
      .getElementById(`output`)!
      // eslint-disable-next-line antfu/consistent-chaining
      .innerHTML.replace(/top:(.*?)em/g, `transform: translateY($1em)`);

    // 从 store.codeBlockTheme网址 获取css内容
    const codeBlockCss = await fetchCodeBlockThemeContent();

    const content = mergeCss(`<html>
          <head>
            <style>${OUTPUT_DEFAULT}</style>
            <style>${styles}</style>
            <style>${codeBlockCss}</style>
            <style>${background.value}</style>
            <style>${options?.styles}</style>
          </head>
          <body>
            <section class="output">
              ${htmlContent}
            </section>
          </body>
        </html>`);
    return content;
  };

  // 格式化文档
  const formatContent = () => {
    formatDoc(editor.value!.state.doc.toString()).then((doc) => {
      if (currentArticle.value) {
        currentArticle.value.content = doc;
      }
      if (editor.value) {
        toRaw(editor.value).dispatch(
          toRaw(editor.value).state.update({
            changes: { from: 0, to: doc.length, insert: doc },
          })
        );
      }
    });
  };

  // 切换 highlight.js 代码主题
  const codeThemeChange = () => {
    const cssUrl = codeBlockTheme.value;
    const el = document.querySelector(`#hljs`);
    if (el) {
      el.setAttribute(`href`, cssUrl);
    } else {
      const link = document.createElement(`link`);
      link.setAttribute(`type`, `text/css`);
      link.setAttribute(`rel`, `stylesheet`);
      link.setAttribute(`href`, cssUrl);
      link.setAttribute(`id`, `hljs`);
      document.head.appendChild(link);
    }
  };

  // 自义定 CSS 编辑器
  const cssEditor = ref<MyEditorView | null>(null);
  const cssEditorExtensions = ref<Extension[]>();

  const setCssEditorValue = async (content: string) => {
    if (cssEditor.value) {
      const loading = ElLoading.service({
        lock: true,
        text: `载入中`,
        background: `rgba(0, 0, 0, 0.1)`,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      toRaw(cssEditor.value).setState(
        EditorState.create({
          doc: content,
          extensions: toRaw(cssEditorExtensions.value),
        })
      );
      loading.close();
    }
  };
  // 自定义 CSS 内容
  const cssContent = useStorage(`__css_content`, DEFAULT_CSS_CONTENT);
  const cssContentConfig = useStorage(addPrefix(`css_content_config`), {
    active: `方案1`,
    tabs: [
      {
        title: `方案1`,
        name: `方案1`,
        // 兼容之前的方案
        content: cssContent.value.trim() || DEFAULT_CSS_CONTENT,
      },
    ],
  });
  onMounted(() => {
    // 清空过往历史记录
    cssContent.value = ``;
  });
  const getCurrentTab = () =>
    cssContentConfig.value.tabs.find((tab) => {
      return tab.name === cssContentConfig.value.active;
    })!;
  const tabChanged = (name: string) => {
    cssContentConfig.value.active = name;
    const content = cssContentConfig.value.tabs.find((tab) => {
      return tab.name === name;
    })!.content;
    setCssEditorValue(content);
  };

  // 重命名 css 方案
  const renameTab = (name: string) => {
    const tab = getCurrentTab()!;
    tab.title = name;
    tab.name = name;
    cssContentConfig.value.active = name;
  };

  const addCssContentTab = (name: string) => {
    cssContentConfig.value.tabs.push({
      name,
      title: name,
      content: DEFAULT_CSS_CONTENT,
    });
    cssContentConfig.value.active = name;
    setCssEditorValue(DEFAULT_CSS_CONTENT);
  };
  const validatorTabName = (val: string) => {
    return cssContentConfig.value.tabs.every(({ name }) => name !== val);
  };

  const renderer = initRenderer({
    // theme: customCssWithTemplate(
    //   css2json(getCurrentTab().content),
    //   primaryColor.value,
    //   customizeTheme(themeMap[theme.value], {
    //     fontSize: fontSizeNumber.value,
    //     color: primaryColor.value,
    //   })
    // ),
    fonts: fontFamily.value,
    size: fontSizeNumber.value,
  });

  // 更新编辑器
  const editorRefresh = () => {    
    codeThemeChange();
    renderer.reset({ status: isCiteStatus.value, legend: legend.value });

    let outputTemp = marked.parse(
      editor.value?.state.doc.toString() || ``
    ) as string;
    const originTemp = outputTemp;
    // 去除第一行的 margin-top
    // outputTemp = outputTemp.replace(/(style=".*?)"/, `$1;margin-top: 0"`);
    // 引用脚注
    outputTemp += renderer.buildFootnotes();
    // 附加的一些 style
    outputTemp += renderer.buildAddition();

    if (isMacCodeBlock.value) {
      outputTemp += `
        <style>
          .hljs.code__pre > .mac-sign {
            display: inline-block;
          }

          .hljs.code__pre {
            padding: 0!important;
          }

          .hljs.code__pre code {
            display: -webkit-box;
            padding: 0.5em 1em 1em;
            overflow-x: auto;
            text-indent: 0;
          }
        </style>
      `;
    }
    if (background) {
      outputTemp += `
        <style>${background.value}</style>
      `;
    }

    output.value = outputTemp;
    // 更新readtime
    const tempDiv = document.createElement(`div`);
    tempDiv.innerHTML = originTemp;
    editorReadTime.value = readingTime(tempDiv.textContent || ``);
  };

  const mergeCssTheme = () => {
    // 将主题和cssEditor中的样式进行 merge
    cssThemeContent.value = `
      ${theme.value}
      ${cssEditor.value?.state.doc.toString() || ``}
      * {
        font-family: ${fontFamily.value};
        font-size: ${fontSize.value};
        --md-primary-color: ${primaryColor.value};
      }
    `;
  };

  // 更新 CSS
  const updateCss = () => {
    if (!cssEditor.value) {
      return;
    }

    mergeCssTheme();

    // const json = css2json(cssEditor.value!.state.doc.toString());
    // const newTheme = customCssWithTemplate(
    //   json,
    //   primaryColor.value,
    //   customizeTheme(themeMap[theme.value], {
    //     fontSize: fontSizeNumber.value,
    //     color: primaryColor.value,
    //   })
    // );
    // renderer.setOptions({
    //   theme: newTheme,
    // });
    editorRefresh();
  };
  // 初始化 CSS 编辑器
  onMounted(() => {
    const cssEditorDom = document.querySelector<Element>(`#cssEditor`)!;
    cssEditorExtensions.value = initCssEditorExtensions((_) => {
      updateCss();
      getCurrentTab().content = cssEditor.value?.state.doc.toString() || ``;
    });
    cssEditor.value = initCssEditor(cssEditorDom, {
      extensions: toRaw(cssEditorExtensions.value),
      initContent: getCurrentTab().content,
    });
    const watchTheme = () => {
      const theme = isDark.value ? barf : ayuLight;
      toRaw(cssEditor.value)?.dispatch({
        effects: cssThemeCompartment.reconfigure(theme),
      });
    };
    updateCss();
    watchTheme();
    watch(isDark, watchTheme);
  });

  const themeChanged = withAfterRefresh((newTheme: string) => {
    theme.value = newTheme;
    mergeCssTheme();
  });

  const fontChanged = withAfterRefresh((fonts) => {
    fontFamily.value = fonts;
    mergeCssTheme();
  });

  const sizeChanged = withAfterRefresh((size) => {
    fontSize.value = size;
    mergeCssTheme();
  });

  const colorChanged = withAfterRefresh((newColor) => {
    primaryColor.value = newColor;
    mergeCssTheme();
  });
  const backgroundChanged = withAfterRefresh((newBackground) => {
    background.value = newBackground;
    mergeCssTheme();
  });

  const codeBlockThemeChanged = withAfterRefresh((newTheme) => {
    codeBlockTheme.value = newTheme;
  });

  const legendChanged = withAfterRefresh((newVal) => {
    legend.value = newVal;
  });

  const macCodeBlockChanged = withAfterRefresh(() => {
    toggleMacCodeBlock();
  });

  const citeStatusChanged = withAfterRefresh(() => {
    toggleCiteStatus();
  });

  // 重置样式
  const resetStyle = () => {
    isCiteStatus.value = false;
    isMacCodeBlock.value = true;

    themeChanged(defaultCssThemes.value[0].value);
    fontChanged(fontFamilyOptions[0].value);
    sizeChanged(fontSizeOptions[2].value);
    colorChanged(colorOptions[0].value);
    backgroundChanged(``);
    codeBlockThemeChanged(codeBlockThemeOptions[2].value);
    legendChanged(legendOptions[3].value);

    cssContentConfig.value = {
      active: `方案 1`,
      tabs: [
        {
          title: `方案 1`,
          name: `方案 1`,
          // 兼容之前的方案
          content: cssContent.value || DEFAULT_CSS_CONTENT,
        },
      ],
    };
    if (cssEditor.value) {
      const editor = toRaw(cssEditor.value);
      editor.dispatch(
        editor.state.update({
          changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: DEFAULT_CSS_CONTENT,
          },
        })
      );
    }

    updateCss();
    editorRefresh();
  };

  // 导出编辑器内容为 HTML，并且下载到本地
  const exportEditorContent2HTML = async () => {
    const htmlStr = await output2Html({
      styles: `body {width: 750px; margin: auto;}`,
    });
    const downLink = document.createElement(`a`);

    downLink.download = `content.html`;
    downLink.style.display = `none`;
    const blob = new Blob([htmlStr]);

    downLink.href = URL.createObjectURL(blob);
    document.body.appendChild(downLink);
    downLink.click();
    document.body.removeChild(downLink);
  };

  // 导出编辑器内容为 PDF， 并且下载到本地
  const exportEditorContent2PDF = async () => {
    const iframe = document.createElement(`iframe`);
    iframe.id = `pdf-iframe`;
    iframe.className = `pdf-iframe`;
    iframe.setAttribute(`allowprinting`, `true`);

    iframe.style.display = `none`;
    iframe.style.width = `100%`;
    iframe.style.height = `100%`;
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(await output2Html());
      iframeDoc.close();
      iframe.focus();
      iframe.contentWindow?.print();
    }

    // 打印完成后移除 iframe
    await sleep(100000);
    document.body.removeChild(iframe);
  };

  // 导出编辑器内容到本地
  const exportEditorContent2MD = () => {
    downloadMD(editor.value!.state.doc.toString());
  };

  // 导入 Markdown 文档
  const importMarkdownContent = () => {
    const body = document.body;
    const input = document.createElement(`input`);
    input.type = `file`;
    input.name = `filename`;
    input.accept = `.md`;
    input.onchange = () => {
      const file = input.files![0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file);
      // TODO: 导入应该是新文件
      reader.onload = (event) => {
        if (editor.value) {
          toRaw(editor.value)?.setState(
            EditorState.create({
              doc: event.target!.result as string,
              extensions: toRaw(editorExtensions.value),
            })
          );
          ElMessage.success(`文档导入成功`);
        }
      };
    };

    body.appendChild(input);
    input.click();
    body.removeChild(input);
  };

  // 重置样式
  const resetStyleConfirm = () => {
    ElMessageBox.confirm(`此操作将丢失本地自定义样式，是否继续？`, `提示`, {
      confirmButtonText: `确定`,
      cancelButtonText: `取消`,
      type: `warning`,
      center: true,
    })
      .then(() => {
        resetStyle();
        ElMessage.success({
          message: `样式重置成功~`,
        });
      })
      .catch((reason) => {
        console.log(reason);

        toRaw(editor.value)!.focus();
      });
  };

  return {
    articles,
    currentArticle,
    selectArticle,
    addArticle,
    removeArticle,
    saveArticles,

    isDark,
    toggleDark,

    isEditOnLeft,
    toggleEditOnLeft,

    isMacCodeBlock,
    isCiteStatus,
    citeStatusChanged,

    output,
    output2Html,
    editor,
    editorExtensions,
    editorReadTime,
    cssEditor,
    defaultCssThemes,
    cssThemeContent,
    theme,
    fontFamily,
    fontSize,
    primaryColor,
    background,
    codeBlockTheme,
    legend,

    editorRefresh,

    themeChanged,
    fontChanged,
    sizeChanged,
    colorChanged,
    backgroundChanged,
    codeBlockThemeChanged,
    fetchCodeBlockThemeContent,
    legendChanged,
    macCodeBlockChanged,

    formatContent,
    exportEditorContent2HTML,
    exportEditorContent2MD,
    exportEditorContent2PDF,

    importMarkdownContent,

    resetStyleConfirm,

    cssContentConfig,
    addCssContentTab,
    validatorTabName,
    setCssEditorValue,
    tabChanged,
    renameTab,
  };
});

export const useDisplayStore = defineStore(`display`, () => {
  // 是否展示 CSS 编辑器
  const isShowCssEditor = ref(false);
  const toggleShowCssEditor = useToggle(isShowCssEditor);

  // 是否展示插入表格对话框
  const isShowInsertFormDialog = ref(false);
  const toggleShowInsertFormDialog = useToggle(isShowInsertFormDialog);

  // 是否展示上传图片对话框
  const isShowUploadImgDialog = ref(false);
  const toggleShowUploadImgDialog = useToggle(isShowUploadImgDialog);

  // 是否显示新增文章对话框
  const isShowAddArticleDialog = ref(false);

  // 是否展示文章提交对话框
  const isShowArticleSubmitDialog = ref(false);

  // 是否显示主题设置对话框
  const isShowThemeDialog = ref(false);
  const toggleShowThemeDialog = useToggle(isShowThemeDialog);

  // 是否显示为pc模式
  const isPCMode = useStorage(`isPCMode`, false);
  const togglePCMode = useToggle(isPCMode);

  const isShowCrdDialog = ref(false);

  return {
    isShowCssEditor,
    toggleShowCssEditor,
    isShowInsertFormDialog,
    toggleShowInsertFormDialog,
    isShowUploadImgDialog,
    toggleShowUploadImgDialog,
    isShowAddArticleDialog,
    isShowArticleSubmitDialog,
    isShowThemeDialog,
    toggleShowThemeDialog,
    isPCMode,
    togglePCMode,
    isShowCrdDialog,
  };
});

export const useAiModelStore = defineStore(`AiModel`, () => {
  const models = reactive<AiModel[]>([
    {
      name: `glm-4-flash`,
      from: `bigmodel`,
      desc: `智谱AI首个免费API, 零成本调用大模型`,
      baseUrl: `https://open.bigmodel.cn/api/paas/v4`,
      apiKey: ``,
      refUrl: `https://bigmodel.cn/usercenter/apikeys`,
    },
    {
      name: `glm-4-plus`,
      from: `bigmodel`,
      desc: `智谱清言的高智能旗舰: 性能全面提升，长文本和复杂任务能力显著增强`,
      baseUrl: `https://open.bigmodel.cn/api/paas/v4`,
      apiKey: ``,
      refUrl: `https://bigmodel.cn/usercenter/apikeys`,
    },
    {
      name: `deepseek-chat`,
      from: `deepseek`,
      desc: `北京深度求索人工智能基础技术研究有限公司推出的深度合成服务算法`,
      baseUrl: `https://api.deepseek.com`,
      apiKey: ``,
      refUrl: `https://platform.deepseek.com/api_keys`,
    },
    {
      name: `ChatGPT-3.5`,
      from: `openai`,
      desc: `OpenAI 的 GPT-3.5 模型`,
      baseUrl: `https://api.openai.com/v1`,
      apiKey: ``,
      refUrl: `https://platform.openai.com/api-keys`,
    },
  ]);

  const selectedAiModel = useStorage<AiModel>(
    `selectedAiModel`,
    toRaw(models[0])
  );

  // 显示选择模型面板
  const isShowSelectAiModelDialog = ref(false);
  const toggleShowSelectAiModelDialog = useToggle(isShowSelectAiModelDialog);

  const selectAiModel = (model: AiModel) => {
    ElMessage.success(`已选择 ${model.name}`);
    selectedAiModel.value = model;
  };

  // 显示生成面板
  const isShowPromptDialog = ref(false);
  const toggleShowPromptDialog = useToggle(isShowPromptDialog);

  return {
    models,
    selectedAiModel,
    isShowSelectAiModelDialog,
    toggleShowSelectAiModelDialog,
    selectAiModel,
    isShowPromptDialog,
    toggleShowPromptDialog,
  };
});
