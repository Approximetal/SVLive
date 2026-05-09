# Plan: 项目合并与仓库整合

> 当前状态分析 + 合并方案 + 执行步骤  
> 确认后再开始改动代码

---

## 一、依赖关系梳理

### 1.1 核心项目（必须保留）

| 项目 | 大小 | 角色 |
|------|------|------|
| `strudel-dj` | ~60M 源码 (1.0G 含 node_modules) | 前端 REPL + 所有 @strudel/\* 包 |
| `vital-bridge` | ~7M 源码 (21M 含 test wav) | Python 后端，Vital 音色渲染服务器 |

`strudel-dj` 是自包含的：`packages/` 目录下有所有 `@strudel/*` 工作区包（codemirror, core, webaudio, mini, transpiler, tonal, midi, superdough 等 29 个包）。不依赖外部的 `strudel` 仓库。

`vital-bridge` 依赖：
- **`vita`** pip 包 (v0.0.5) — 已安装在 mamba `livecoding` 环境中
- **预设文件**：`/Users/zhaozy/mnt/music/Vital/` (110M) + `Jek's Vital Presets/` (2.5G) — 外部数据，不需要放进代码仓库

### 1.2 参考/上游仓库（可选保留作为 reference）

| 项目 | 大小 | 关系 |
|------|------|------|
| `strudel` | 183M (含.git) | strudel-dj 的上游 fork。strudel-dj 已完全自包含，只缺 `edo` 包。保留作为参考 |
| `MIDI-To-Strudel` | 2.1M | Python 版 MIDI→Strudel 转换算法。strudel-dj 里的 midiToStrudel.js 是基于此思路重写的 JS 版本。保留作为参考 |
| `midi-to-strudel-web` | 264K | 另一个 MIDI→Strudel web 界面。参考项目 |
| `Vita` | 207M (167M third_party) | `vita` pip 包的源码。包含大量 firebase SDK 等不必要的构建依赖。运行时不需要 |
| `vital` | 216M (167M third_party) | C++ Vital 合成器源码。同上，运行时不需要 |

### 1.3 AI 相关（需要选择性整合）

| 项目 | 大小 | 角色 |
|------|------|------|
| `live-coding-music-mcp` | ~3M 源码 (176M 含 node_modules) | MCP Server，让 Claude 通过 Playwright 操控 strudel REPL。独立项目，通过浏览器交互 |
| `strudel-claude-music-generator` | ~0M 源码 (22M 含 node_modules) | 音乐生成器。前端+后端架构，有 genre 模板 |
| `strudel-llm-docs` | 1.1M | LLM 使用文档，含 CLAUDE.md、compositions/、configs/ |

### 1.4 外围项目（无关，可忽略）

| 项目 | 大小 | 原因 |
|------|------|------|
| `ACE-Step-DAW` | 506M (471M node_modules) | 独立的 AI-native DAW，与当前系统无引用关系 |
| `StrudelLive` | 488M (468M node_modules) | 另一个 live coding 工作室，无引用关系 |
| `genre-demos` | 128K | 少数的 genre demo 文件，可选保留 |

---

## 二、大文件分析

### 2.1 可以排除的（cache / build / 第三方）

| 文件/目录 | 大小 | 处理方式 |
|-----------|------|----------|
| `strudel-dj/node_modules/` | 917M | `.gitignore` 已有 |
| `strudel-dj/website/node_modules/` | 23M | `.gitignore` 已有 |
| `strudel-dj/website/dist/` | 20M | 加到 `.gitignore` |
| `vital-bridge/render_cache/` | ~0 (已清) | `.gitignore` 已有 |
| `vital-bridge/test_output/*.wav` | ~14M | 加到 `.gitignore` |
| `vital-bridge/__pycache__/` | 64K | `.gitignore` 已有 |
| `Vita/third_party/` | 167M | 不合并 Vita 源码 |
| `vital/third_party/` | 167M | 不合并 vital 源码 |
| `ACE-Step-DAW/node_modules/` | 471M | 不合并 |
| `StrudelLive/node_modules/` | 468M | 不合并 |
| `live-coding-music-mcp/node_modules/` | 173M | MCP 自己的 .gitignore |

### 2.2 必须保留的大文件

| 文件/目录 | 大小 | 原因 |
|-----------|------|------|
| `strudel-dj/samples/` | 17M | 内置音频采样（drum machines 等），功能需要 |
| `strudel-dj/website/public/` | 9.5M | 静态资源（favicon, sounds 等） |

**预设文件（不放入代码仓库）：**
| 路径 | 大小 | 建议 |
|------|------|------|
| `/Users/zhaozy/mnt/music/Vital/` | 110M | 环境变量/配置文件指向 |
| `/Users/zhaozy/mnt/music/Jek's Vital Presets/` | 2.5G | 同上 |

---

## 三、建议的项目结构

```
LiveCoding/
├── strudel-dj/              # 前端（已有，直接保留）
│   ├── packages/            # @strudel/* 包
│   ├── website/             # Astro 站点 + REPL
│   ├── samples/             # 音频采样
│   └── ...
├── vital-bridge/            # 后端（已有，直接保留）
│   ├── server.py
│   ├── requirements.txt
│   └── ...
├── docs/                    # 文档（从 strudel-llm-docs + 其他抽取）
│   ├── CLAUDE.md
│   ├── compositions/
│   └── configs/
├── mcp/                     # MCP Server（从 live-coding-music-mcp 移入，去 node_modules）
├── reference/               # 参考项目（可选）
│   ├── strudel/             # 上游 fork
│   ├── MIDI-To-Strudel/     # 原始 MIDI 转换算法
│   └── midi-to-strudel-web/
└── .gitignore               # 顶层 gitignore
```

或者考虑 monorepo 结构：

```
LiveCoding/
├── packages/
│   ├── strudel-dj/          # 前端
│   ├── vital-bridge/        # 后端
│   └── mcp/                 # MCP Server
├── docs/
├── reference/
└── .gitignore
```

---

## 四、项目名称建议

按风格分类：

### 音乐 + 代码类
1. **Vivace** — 音乐术语（活泼的），暗示 Vital + Live
2. **Mezzo** — 音乐术语（中等），简洁优雅
3. **AlgoRhythm** — Algorithm + Rhythm 双关
4. **CodeCoda** — Code + Coda（乐章结尾）
5. **SonicCodex** — 声音法典
6. **MuseCode** — 缪斯 + 代码
7. **NeonPulse** — 霓虹脉冲，现代感

### 合成器主题
8. **Synthia** — Synth + 女性名，好记
9. **VitalCoding** — 直接明了
10. **StrudelLabs** — Strudel 实验室
11. **Synthestra** — Synthesizer + Orchestra

### 中文友好
12. **织音** (ZhiYin) — 编织音乐
13. **声码** (ShengMa) — 声音代码
14. **灵动** (LingDong) — 灵活的律动

### 简洁有力
15. **Pulse** — 脉冲/律动
16. **Echo** — 回声
17. **Nova** — 新星
18. **CodaForge** — 乐章锻造

---

## 五、执行步骤

### Phase 1: 清理 & 准备 (不改代码)
1. 确认新仓库名称
2. 创建新 git 仓库（GitHub / Codeberg）
3. 确认 `strudel-dj` 和 `vital-bridge` 的 `.gitignore` 覆盖所有 cache 文件
4. 检查 `strudel-dj` 是否有未提交的本地修改需要保留

### Phase 2: 核心项目整合
1. 迁移 `strudel-dj/` → 新仓库（保留完整 git 历史用 `git subtree` 或直接复制）
2. 迁移 `vital-bridge/` → 新仓库
3. 修正 `vital-bridge/server.py` 中的硬编码路径：
   - `PRESETS_DIR` → 从环境变量或配置文件读取
   - `JEK_PRESETS_DIR` → 同上
   - 帮助文本中的路径示例 → 更新为新路径
4. 写顶层 `README.md`，说明项目结构、启动方式
5. 写 `SETUP.md`，列出依赖（Node.js, mamba env, vita pip 包等）

### Phase 3: 辅助项目整合
1. 将 `strudel-llm-docs/` 中关键文档（CLAUDE.md, compositions/）放入 `docs/`
2. 将 `live-coding-music-mcp/` 放入 `mcp/`，保留功能代码
3. `reference/` 目录放入不常改动的参考项目（strudel, MIDI-To-Strudel 等）
4. 不合并 `ACE-Step-DAW`、`StrudelLive`（无关）

### Phase 4: 环境配置
1. 所有硬编码路径改为配置驱动：
   - `vital-bridge` 支持环境变量 `VITAL_PRESETS_DIR`, `JEK_PRESETS_DIR`
   - 前端 `VITAL_BRIDGE_URL` 可配置（目前硬编码 `http://localhost:8765`）
2. 写 `docker-compose.yml`（可选，方便一键启动）
3. 写启动脚本 `start.sh` / `dev.sh`

### Phase 5: 验证
1. 在新仓库目录下 `pnpm install && pnpm dev` 启动前端
2. 启动 vital-bridge
3. 测试完整流程：MIDI import → 选 preset → 生成代码 → 播放
4. 测试 Vital tab：浏览音色 → 试听 → 加载

---

## 六、需要你确认的事项

1. **仓库名** — 从上面列表中选一个，或者你自己想一个
2. **结构** — 用方案 A（平铺）还是方案 B（monorepo）？
3. **参考项目** — `strudel`、`MIDI-To-Strudel` 等是否放进 `reference/`？
4. **预设路径** — 同意把硬编码路径改成环境变量配置？
5. **MCP Server** — 是否整合进新仓库？
