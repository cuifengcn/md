<script setup lang="ts">
import type { AiGenerateType } from '@/types';
import type MyEditorView from '@/utils/codeMirrorUtil/editor';
import type { ComponentPublicInstance } from 'vue';
import AiDialog from '@/components/ai/AiDialog.vue';
import ContextMenuVue from '@/components/CodemirrorEditor/ContextMenu/index.vue';
import CssEditor from '@/components/CodemirrorEditor/CssEditor.vue';
import EditorFooter from '@/components/CodemirrorEditor/EditorFooter/index.vue';

import EditorHeader from '@/components/CodemirrorEditor/EditorHeader/index.vue';
import InsertFormDialog from '@/components/CodemirrorEditor/InsertFormDialog.vue';
import UploadImgDialog from '@/components/CodemirrorEditor/UploadImgDialog.vue';
import RunLoading from '@/components/RunLoading.vue';
import SideToolBar from '@/components/SideToolBar/index.vue';

import { useDisplayStore, useStore } from '@/stores';
import { checkImage, toBase64 } from '@/utils';
import {
  initCodemirrorEditor,
  initEditorExtensions,
  keymapActions,
} from '@/utils/codeMirrorUtil';

import fileApi from '@/utils/file';

import styled from '@vue-styled-components/core';
import { ElCol, ElMessage } from 'element-plus';
import { debounce } from 'es-toolkit';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue';

const store = useStore();
const displayStore = useDisplayStore();

const {
  output,
  editor,
  editorExtensions,
  currentArticle,
  cssThemeContent,
  isDark,
} = storeToRefs(store);
const { isShowCssEditor, isPCMode } = storeToRefs(displayStore);

const {
  editorRefresh,

  formatContent,
} = store;

const { toggleShowUploadImgDialog } = displayStore;

const isImgLoading = ref(false);

const preview = ref<typeof ElCol | null>(null);
const scrollingTarget = ref<`editor` | `preview` | null>(null);
const scrollingTimeout = ref<NodeJS.Timeout>();

const inputProps = { content: String };
const StyledProvider = styled(`div`, inputProps)`
  ${(props) => props.content}
`;

// ai dialog参数
const initGenerateType = ref<AiGenerateType>();

// 使浏览区与编辑区滚动条建立同步联系
function listenPreviewScroll() {
  function previewScrollCB() {
    if (scrollingTarget.value != null) {
      return;
    }
    clearTimeout(scrollingTimeout.value);
    scrollingTarget.value = `preview`;
    const source = preview.value!.$el;
    const target = document.querySelector<HTMLElement>(`#editor .cm-scroller`)!;

    const percentage =
      source.scrollTop / (source.scrollHeight - source.offsetHeight);

    const height = percentage * (target.scrollHeight - target.offsetHeight);

    target.scrollTo(0, height);
    scrollingTimeout.value = setTimeout(() => {
      scrollingTarget.value = null;
    }, 10);
  }

  preview.value!.$el.addEventListener(`scroll`, previewScrollCB, false);
}

onMounted(() => {
  listenPreviewScroll();
});

// 更新编辑器
function onEditorRefresh() {
  editorRefresh();
}

const backLight = ref(false);
const isCoping = ref(false);

function startCopy() {
  isCoping.value = true;
  backLight.value = true;
}

// 拷贝结束
function endCopy() {
  backLight.value = false;
  setTimeout(() => {
    isCoping.value = false;
  }, 800);
}

function beforeUpload(file: File) {
  // validate image
  const checkResult = checkImage(file);
  if (!checkResult.ok) {
    ElMessage.error(checkResult.msg);
    return false;
  }

  // check image host
  const imgHost = localStorage.getItem(`imgHost`) || `default`;
  localStorage.setItem(`imgHost`, imgHost);

  const config = localStorage.getItem(`${imgHost}Config`);
  const isValidHost = imgHost === `default` || config;
  if (!isValidHost) {
    ElMessage.error(`请先配置 ${imgHost} 图床参数`);
    return false;
  }
  return true;
}

// 图片上传结束
function uploaded(imageUrl: string) {
  if (!imageUrl) {
    ElMessage.error(`上传图片未知异常`);
    return;
  }
  toggleShowUploadImgDialog(false);
  const markdownImage = `![](${imageUrl})`;

  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  const range = editor.value!.state.selection.ranges[0];
  editor.value!.dispatch({
    changes: {
      from: range.from,
      // to: range.to,
      insert: `\n${markdownImage}\n`,
    },
  });
  ElMessage.success(`图片上传成功`);
}
function uploadImage(
  file: File,
  cb?: { (url: any): void; (arg0: unknown): void } | undefined
) {
  isImgLoading.value = true;

  toBase64(file)
    .then((base64Content) => fileApi.fileUpload(base64Content, file))
    .then((url) => {
      if (cb) {
        cb(url);
      } else {
        uploaded(url);
      }
    })
    .catch((err) => {
      ElMessage.error(err.message);
    })
    .finally(() => {
      isImgLoading.value = false;
    });
}

// 初始化编辑器
function initEditor() {
  const editorDom = document.querySelector<Element>(`#editor`)!;

  editorExtensions.value = initEditorExtensions(
    (update) => {
      if (update.docChanged) {
        if (store.articles.length === 0) {
          displayStore.isShowAddArticleDialog = true;
          return;
        }
        debounce(() => {
          onEditorRefresh();
          if (currentArticle.value) {
            currentArticle.value.content = update.state.doc.toString();
          }
        }, 300)();
        store.editorReadTime = toRaw(store.editor)?.readTime();
      }
      return false;
    },
    (event, _) => {
      // paste handler
      if (
        !(event.clipboardData && event.clipboardData.items) ||
        isImgLoading.value
      ) {
        return false;
      }
      for (let i = 0, len = event.clipboardData.items.length; i < len; ++i) {
        const item = event.clipboardData.items[i];
        if (item.kind === `file`) {
          // 校验图床参数
          const pasteFile = item.getAsFile()!;
          const isValid = beforeUpload(pasteFile);
          if (!isValid) {
            continue;
          }
          uploadImage(pasteFile);
        }
      }
      return false;
    },
    (_, __) => {
      if (scrollingTarget.value != null) {
        return false;
      }
      clearTimeout(scrollingTimeout.value);
      scrollingTarget.value = `editor`;

      const source =
        document.querySelector<HTMLElement>(`#editor .cm-scroller`)!;
      const target = preview.value!.$el;
      const percentage =
        source.scrollTop / (source.scrollHeight - source.offsetHeight);
      const height = percentage * (target.scrollHeight - target.offsetHeight);
      target.scrollTo(0, height);
      scrollingTimeout.value = setTimeout(() => {
        scrollingTarget.value = null;
      }, 10);
      return false;
    }
  );

  editor.value = initCodemirrorEditor(editorDom, {
    extensions: toRaw(editorExtensions.value),
    initContent: currentArticle.value?.content || ``,
  });
  // // 初始化显示
  // store.editorReadTime = toRaw(store.editor)?.readTime();
}

const container = ref(null);

// 工具函数，添加格式
function addFormat(cmd: string | number) {
  const action = keymapActions.find((bind) => bind.key === cmd);
  if (action && editor.value) {
    action.run!(editor.value! as MyEditorView);
  }
}

const codeMirrorWrapper = ref<ComponentPublicInstance<typeof ElCol> | null>(
  null
);

// 转换 markdown 中的本地图片为线上图片
// todo 处理事件覆盖
function mdLocalToRemote() {
  const dom = codeMirrorWrapper.value!.$el as HTMLElement;

  // 上传 md 中的图片
  const uploadMdImg = async ({
    md,
    list,
  }: {
    md: { str: string; path: string; file: File };
    list: { path: string; file: File }[];
  }) => {
    const mdImgList = [
      ...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || []),
    ].filter((item) => {
      return item; // 获取所有相对地址的图片
    });
    const root = md.path.match(/.+?\//)![0];
    const resList = await Promise.all<{ matchStr: string; url: string }>(
      mdImgList.map((item) => {
        return new Promise((resolve) => {
          let [, , matchStr] = item;
          matchStr = matchStr.replace(/^.\//, ``); // 处理 ./img/ 为 img/ 统一相对路径风格
          const { file } =
            list.find((f) => f.path === `${root}${matchStr}`) || {};
          uploadImage(file!, (url) => {
            resolve({ matchStr, url });
          });
        });
      })
    );
    resList.forEach((item) => {
      md.str = md.str
        .replace(`](./${item.matchStr})`, `](${item.url})`)
        .replace(`](${item.matchStr})`, `](${item.url})`);
    });
    const state = editor.value!.state;
    editor.value!.dispatch(
      state.update({
        changes: { from: 0, to: state.doc.length, insert: md.str },
      })
    );
  };

  dom.ondragover = (evt) => evt.preventDefault();
  dom.ondrop = async (evt: any) => {
    evt.preventDefault();
    for (const item of evt.dataTransfer.items) {
      item
        .getAsFileSystemHandle()
        .then(async (handle?: { kind: string; getFile: () => any }) => {
          if (!handle) {
            return;
          }

          if (handle.kind === `directory`) {
            const list = (await showFileStructure(handle)) as {
              path: string;
              file: File;
            }[];
            const md = await getMd({ list });
            uploadMdImg({ md, list });
          } else {
            const file = await handle.getFile();
            console.log(`file`, file);
          }
        });
    }
  };

  // 从文件列表中查找一个 md 文件并解析
  async function getMd({ list }: { list: { path: string; file: File }[] }) {
    return new Promise<{ str: string; file: File; path: string }>((resolve) => {
      const { path, file } = list.find((item) => item.path.match(/\.md$/))!;
      const reader = new FileReader();
      reader.readAsText(file!, `UTF-8`);
      reader.onload = (evt) => {
        resolve({
          str: evt.target!.result as string,
          file,
          path,
        });
      };
    });
  }

  // 转换文件系统句柄中的文件为文件列表
  async function showFileStructure(root: any) {
    const result = [];
    let cwd = ``;
    try {
      const dirs = [root];
      for (const dir of dirs) {
        cwd += `${dir.name}/`;
        for await (const [, handle] of dir) {
          if (handle.kind === `file`) {
            result.push({
              path: cwd + handle.name,
              file: await handle.getFile(),
            });
          } else {
            result.push({
              path: `${cwd + handle.name}/`,
            });
            dirs.push(handle);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    return result;
  }
}

onMounted(() => {
  initEditor();
  onEditorRefresh();
  mdLocalToRemote();
});
onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div ref="container" class="container flex flex-1 flex-col">
    <EditorHeader
      @add-format="addFormat"
      @format-content="formatContent"
      @start-copy="startCopy"
      @end-copy="endCopy"
    />
    <main class="container-main w-full flex-1">
      <el-row class="container-main-section mr-[25px] h-full border-1 rounded">
        <ElCol
          ref="codeMirrorWrapper"
          :span="isShowCssEditor ? 8 : 12"
          :lg="isShowCssEditor ? 8 : 14"
          :xl="isShowCssEditor ? 8 : isPCMode ? 12 : 16"
          class="codeMirror-wrapper border-r-1"
          :class="{
            'order-1': !store.isEditOnLeft,
          }"
        >
          <!-- <ContextMenu>
            <ContextMenuTrigger>
              <div id="editor" />
            </ContextMenuTrigger>
          </ContextMenu> -->
          <ContextMenuVue />
        </ElCol>
        <ElCol
          id="preview"
          ref="preview"
          :span="isShowCssEditor ? 8 : 12"
          :lg="isShowCssEditor ? 8 : 10"
          :xl="isShowCssEditor ? 8 : isPCMode ? 12 : 8"
          class="preview-wrapper p-5"
        >
          <div id="output-wrapper" :class="{ output_night: !backLight }">
            <div
              class="preview border shadow-xl"
              :class="{ 'preview-pc': isPCMode }"
            >
              <StyledProvider :content="cssThemeContent">
                <section
                  id="output"
                  class="output"
                  :class="{ dark: isDark }"
                  v-html="output"
                />
              </StyledProvider>

              <div v-if="isCoping" class="loading-mask">
                <div class="loading-mask-box">
                  <div class="loading__img" />
                  <span>正在生成</span>
                </div>
              </div>
              <ElBacktop
                :right="2"
                :bottom="25"
                target="#preview"
                style="box-shadow: none"
              />
            </div>
          </div>
        </ElCol>
        <CssEditor />
      </el-row>
      <SideToolBar />
    </main>
    <EditorFooter />

    <UploadImgDialog @upload-image="uploadImage" />

    <InsertFormDialog />
    <AiDialog
      :generate-type="initGenerateType"
      :immediate="!!initGenerateType"
    />
    <!-- <PromptDialog
      :generate-type="initGenerateType"
      :immediate="!!initGenerateType"
    /> -->
    <RunLoading />
  </div>
</template>

<style lang="less" scoped>
@import url('../assets/less/app.less');
</style>

<style lang="less" scoped>
.context-menu,
.context-menu-toolbar {
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);
}

.container {
  height: 100vh;
  width: 100%;
  padding: 0;
  max-width: none;
  // min-width: calc(100vw - 210px);
}

.container-main {
  overflow: hidden;
  padding-left: 20px;
  padding-right: 20px;
}

#output-wrapper {
  position: relative;
  user-select: text;
  width: 100%;
  height: 100%;
}

.loading-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);

  .loading-mask-box {
    position: sticky;
    top: 50%;
    transform: translateY(-50%);

    .loading__img {
      width: 75px;
      height: 75px;
      background: url('../assets/images/favicon.png') no-repeat;
      margin: 1em auto;
      background-size: cover;
    }
  }
}

:deep(.preview-table) {
  border-spacing: 0;
}

.codeMirror-wrapper,
.preview-wrapper {
  height: 100%;
}

.codeMirror-wrapper {
  overflow-x: auto;
}

.codeMirror-wrapper::-webkit-scrollbar {
  width: 0;
}
</style>
