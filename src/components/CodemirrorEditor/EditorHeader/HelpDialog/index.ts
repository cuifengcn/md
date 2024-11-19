export const headingsHelp: string[] = [
  `
# 一级标题

## 二级标题

### 三级标题

#### 四级标题
`,
];
export const listHelp: string[] = [
  `
  - 无序列表 1
  - 无序列表 2
    - 无序列表 2.1
    - 无序列表 2.2
`,
  `
1. 有序列表 1
2. 有序列表 2
3. 有序列表 3
`,
];
export const strongHelp: string[] = [
  `
**这个是粗体**`,
  `
*这个是斜体*`,
  `
~~这个是删除线~~`,
  `
***这个是粗体加斜体***`,
  `
**~~这个是粗体加删除线~~**`,
  `
*~~这个是斜体加删除线~~*`,
  `
**~~*这个是粗体加斜体加删除线*~~**`,
];
export const linkHelp: string[] = [
  `
[MD Intelligence功能介绍](https://baidu.com)`,
  `
图片还可以和链接嵌套使用，能够实现推荐卡片的效果，用法如下：

[![MD Intelligence功能介绍](https://picsum.photos/536/354)](https://baidu.com)`,
];
export const seperateHelp: string[] = [`---`];
export const quoteHelp: string[] = [
  `
一级引用如下：

> ### 一级引用示例
> 
> 勇者愤怒，抽刃向更强者；怯者愤怒，却抽刃向更弱者。 **——鲁迅**
`,
  `
二级引用如下：

>> ### 二级引用示例
>>
>> 勇者愤怒，抽刃向更强者；怯者愤怒，却抽刃向更弱者。 **——鲁迅**
 `,
  `
三级引用如下：

>>> ### 三级引用示例
>>>
>>> 勇者愤怒，抽刃向更强者；怯者愤怒，却抽刃向更弱者。 **——鲁迅**
 `,
];
export const codeBlockHelp: string[] = [
  `
\`\`\`java
// FileName: HelloWorld.java
public class HelloWorld {
  // Java 入口程序，程序从此入口
  public static void main(String[] args) {
    System.out.println("Hello,World!"); // 向控制台打印一条语句
  }
}
\`\`\`
`,
  `
支持以下语言种类：
\`\`\`
bash
clojure，cpp，cs，css
dart，dockerfile, diff
erlang
go，gradle，groovy
haskell
java，javascript，json，julia
kotlin
lisp，lua
makefile，markdown，matlab
objectivec
perl，php，python
r，ruby，rust
scala，shell，sql，swift
tex，typescript
verilog，vhdl
xml
yaml
\`\`\`
`,
  `
diff 效果：

\`\`\`diff
+ 新增项
- 删除项
\`\`\`
`,
];
export const formulaHelp: string[] = [
  `
行内公式：$ 1+1=2 $
  `,
  `
块公式：

$$
1+1=2
$$
  `,
];

export const containerHelp: string[] = [
  `
:::block-1
这是容器块1
:::
`,
  `
:::block-2
这是容器块2
:::
`,
  `
:::block-3
这是容器块3
:::
`,
];

export const tipsHelp: string[] = [
  `
> [!NOTE]
> 突出显示用户应考虑的信息，即使在浏览时也是如此。
`,
  `
> [!TIP]
> 帮助用户取得更大成功的可选信息。
`,
  `
> [!IMPORTANT]
> 用户成功所需的重要信息。
`,
  `
> [!WARNING]
> 由于存在潜在风险，需要用户立即关注的关键内容。
`,
  `
> [!CAUTION]
> 操作的潜在负面后果。
`,
];
export const memaidHelp: string[] = [
  `
\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\`
`,
  `
\`\`\`mermaid
pie
  title Key elements in Product X
  "Calcium" : 42.96
  "Potassium" : 50.05
  "Magnesium" : 10.01
  "Iron" : 5
\`\`\`
`,
  `
\`\`\`mermaid
pie
  title 为什么总是宅在家里？
  "喜欢宅" : 45
  "天气太热" : 70
  "穷" : 500
  "没人约" : 95
\`\`\`
`,
];
export const imageHelp: string[] = [
  `
![这里写图片描述](https://picsum.photos/536/354)
`,
  `
![示例图片](https://picsum.photos/536/354 "示例图片标题")
`,
];
export const tableHelp: string[] = [
  `
| 姓名   | 年龄 | 城市     |
| ------ | ---- | -------- |
| 张三   | 25   | 北京     |
| 李四   | 30   | 上海     |
| 王五   | 28   | 广州     |
`,
];
