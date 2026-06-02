# SVLive — Strudel Vital Live

AI 驱动的实时音乐创作环境，集成了 **Strudel** live coding 语言、**Vital** 合成器引擎、MIDI 导入、以及 Claude AI 辅助。

## 项目结构 (Monorepo)

```
SVLive/
├── packages/
│   ├── strudel-dj/       # 前端 — Strudel REPL + Vital 集成
│   ├── vital-bridge/     # 后端 — Vital 音色渲染服务器 (FastAPI)
│   └── mcp/              # MCP Server — Claude ↔ Strudel 交互 (submodule)
├── reference/            # 参考/上游项目 (git submodules)
│   ├── strudel/          # Strudel 上游 monorepo
│   ├── Vita/             # Vita Python 绑定源码
│   ├── vital/            # Vital C++ 合成器源码
│   ├── MIDI-To-Strudel/  # MIDI 转换参考实现
│   └── ...
├── docs/                 # 文档
├── .gitignore
└── README.md
```

## 快速开始

### 前置依赖

- **Node.js** ≥ 18 + pnpm
- **Python** ≥ 3.10 + [mamba](https://mamba.readthedocs.io/) (推荐)
- **Vital 预设文件** — 见下方配置

### 1. 启动后端 (vital-bridge)

```bash
mamba activate livecoding
cd packages/vital-bridge

# 配置预设目录（可选，默认 ~/music/Vital）
export VITAL_PRESETS_DIR="/path/to/Vital"
export JEK_PRESETS_DIR="/path/to/Jek's Vital Presets"

uvicorn server:app --host 0.0.0.0 --port 8765 --reload
```

### 2. 启动前端 (strudel-dj)

```bash
cd packages/strudel-dj
pnpm install
pnpm dev
# 打开 http://localhost:5173
```

### 3. (可选) 使用 MCP Server

```bash
cd packages/mcp
npm install
# 在 Claude Desktop 配置中添加此 MCP server
```

## 功能

- 🎹 **Vital 合成器** — 浏览 2300+ 预设，实时试听，一键加载
- 🎵 **MIDI 导入** — 拖入 .mid 文件，自动生成 Strudel 代码
- 🤖 **AI 辅助** — Claude 帮你写 pattern、调音色
- 💾 **智能缓存** — 音色首次使用才渲染，缓存可一键清理
- 🎛️ **实时编码** — 修改代码立即听到效果

## 环境变量

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `VITAL_PRESETS_DIR` | Vital 官方预设目录 | `~/music/Vital` |
| `JEK_PRESETS_DIR` | Jek 自定义预设目录 | `~/music/Jek's Vital Presets` |

## 子模块更新

```bash
# 克隆时带上 submodule
git clone --recurse-submodules <this-repo>

# 更新所有 submodule 到最新
git submodule update --remote
```
