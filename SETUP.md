# SVLive 开发环境搭建

## 环境要求

| 组件 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ 18 | 前端 (Astro + React) |
| pnpm | ≥ 8 | 包管理 |
| Python | ≥ 3.10 | vital-bridge 后端 |
| mamba/conda | 最新 | Python 环境管理 |
| Vita pip | ≥ 0.0.5 | Vital 合成器 Python 绑定 |

## 一、Python 环境

```bash
# 创建环境
mamba create -n livecoding python=3.11 -y
mamba activate livecoding

# 安装依赖
pip install vita numpy scipy fastapi uvicorn python-multipart
```

### 预设文件

需要 Vital 预设文件（`.vital` 格式）。项目不再硬编码路径，改为读取环境变量：

```bash
# 设置预设目录（写入 ~/.zshrc 或 ~/.bashrc）
export VITAL_PRESETS_DIR="$HOME/music/Vital"
export JEK_PRESETS_DIR="$HOME/music/Jek's Vital Presets"
```

不设置则默认读取 `~/music/Vital` 和 `~/music/Jek's Vital Presets`。

### 启动后端

```bash
cd packages/vital-bridge
uvicorn server:app --host 0.0.0.0 --port 8765 --reload
```

健康检查: `curl http://localhost:8765/health`

## 二、前端环境

```bash
cd packages/strudel-dj
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5173`

## 三、MCP Server（可选）

MCP Server 让 Claude Desktop 可以直接操控 Strudel REPL。

```bash
cd packages/mcp
npm install
npm run build
```

在 Claude Desktop 配置中添加：

```json
{
  "mcpServers": {
    "live-coding-music": {
      "command": "node",
      "args": ["/path/to/SVLive/packages/mcp/dist/index.js"]
    }
  }
}
```

## 四、目录结构说明

```
SVLive/
├── packages/
│   ├── strudel-dj/       ← 我们的前端代码（核心，有本地修改）
│   ├── vital-bridge/     ← 我们的后端代码（核心，有本地修改）
│   └── mcp/              ← [submodule] MCP Server（只读，上游更新）
├── reference/            ← [submodules] 只读参考项目
│   ├── strudel/          ← Strudel 上游
│   ├── Vita/             ← Vita Python 绑定
│   ├── vital/            ← Vital C++ 合成器
│   ├── MIDI-To-Strudel/  ← MIDI 转换算法
│   └── midi-to-strudel-web/
├── docs/                 ← 我们的文档
├── .gitignore
├── README.md
└── SETUP.md
```

## 五、Git Submodule 管理

```bash
# 首次克隆
git clone --recurse-submodules <repo-url>

# 更新 submodule 到最新 commit
git submodule update --remote

# 查看 submodule 状态
git submodule status

# 添加新的 submodule
git submodule add <url> reference/<name>
```

## 六、清理缓存

vital-bridge 的渲染缓存位于 `packages/vital-bridge/render_cache/`。

在前端设置面板 (Settings → Vital Preset Cache) 可查看大小并一键清除。

也可直接删除：
```bash
rm -rf packages/vital-bridge/render_cache/*
```
