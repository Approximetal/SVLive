# Vital-Bridge

> Vital 合成器渲染服务 + Essentia 音频分析 → Strudel 实时编曲

将 **Vital 合成器预设**（`.vital` 文件）渲染为音频供 Strudel 前端使用，同时提供 **Essentia 深度学习音频分析**，实现 "听到一首歌 → 分析风格 → 匹配/生成音色 → 生成 Strudel 代码" 的完整管线。

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────────────┐
│                          vital-bridge                                │
│                                                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │  Vita 引擎   │   │ Essentia 分析  │   │  LLM 代理               │ │
│  │  (C++ 绑定)  │   │ (TensorFlow)  │   │  (Claude / API proxy)   │ │
│  │              │   │              │   │                          │ │
│  │ • 渲染音频   │   │ • BPM/Key    │   │ • Claude 代码生成       │ │
│  │ • 加载预设   │   │ • 风格/流派  │   │ • Strudel 片段生成      │ │
│  │ • 宏参数控制 │   │ • 情绪检测   │   │ • 代理转发              │ │
│  │ • 批量渲染   │   │ • 人声检测   │   │                          │ │
│  └──────┬───────┘   └──────┬───────┘   └────────────┬─────────────┘ │
│         │                  │                         │               │
│  ┌──────┴──────────────────┴─────────────────────────┴─────────────┐│
│  │                      FastAPI REST Server (port 8765)             ││
│  └──────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
         │                    │                        │
         ▼                    ▼                        ▼
   ┌──────────┐      ┌──────────────┐        ┌──────────────┐
   │ Strudel  │      │ Vital 编辑器  │        │ 前端 UI      │
   │ s("preset")│    │ 导出 .vital   │        │ AITab / DJ   │
   └──────────┘      └──────────────┘        └──────────────┘
```

---

## 快速开始

### 环境要求

- **Python** ≥ 3.11（推荐 conda/mamba）
- **Vita** ≥ 0.0.5（Vital C++ 合成器 Python 绑定）
- **Essentia** + TensorFlow（可选，用于音频分析）
- **Vital 预设文件**（`.vital` 格式）

### 安装

```bash
# 创建 conda 环境
mamba create -n livecoding python=3.11
mamba activate livecoding

# 安装依赖
cd packages/vital-bridge
pip install -r requirements.txt

# 安装 Essentia（可选，需要 TensorFlow 支持）
pip install essentia-tensorflow
```

### 配置环境变量

```bash
# Vital 预设目录（必须）
export VITAL_PRESETS_DIR=~/music/Vital
export JEK_PRESETS_DIR=~/music/Jek\'s\ Vital\ Presets

# Essentia 模型目录（可选，默认 ~/essentia_models）
export ESSENTIA_MODELS_DIR=~/essentia_models
```

### 启动服务

```bash
mamba activate livecoding
cd packages/vital-bridge
uvicorn server:app --host 0.0.0.0 --port 8765 --reload
```

服务启动后访问 `http://localhost:8765/health` 确认运行状态。

---

## API 参考

### Presets 预设管理

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/presets` | 列出所有预设（支持 `source`, `pack`, `search` 参数） |
| `GET` | `/presets/tags` | 获取所有标签及分类统计 |
| `GET` | `/presets/search` | 按类型/风格/情绪标签搜索预设 |
| `POST` | `/load` | 加载指定预设到合成器 |
| `POST` | `/upload` | 上传并加载 `.vital` 预设文件 |

### Render 音频渲染

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/render` | 渲染单个音符（note, velocity, duration） |
| `POST` | `/render-batch` | 批量渲染多个音符 |
| `POST` | `/render-chromatic` | 半音阶渲染（指定起始音符和八度数） |

**宏参数控制**：渲染时可附带 `macros: {macro1: 0.5, macro2: 0.8}` 实时调整预设参数（0.0–1.0）。

### Export 预设导出

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/export` | 回写宏参数到 `.vital` 文件并导出下载 |

### Cache 渲染缓存

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cache/stats` | 缓存统计信息 |
| `DELETE` | `/cache` | 清空渲染缓存 |
| `GET` | `/cache/wav/{filename}` | 获取缓存的 WAV 文件 |

### Essentia 音频分析

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/essentia/analyze` | 上传音频文件，返回完整音乐分析 |
| `GET` | `/essentia/status` | 检查 Essentia 可用性和模型加载状态 |

#### `/essentia/analyze` 返回字段

```json
{
  "status": "ok",
  "essentia_available": true,
  "audio_meta": {
    "original_sr": 44100, "channels": 2,
    "duration_sec": 211.3, "codec": "mp3"
  },
  "genre": "house",
  "genre_top3": [
    {"genre": "house", "confidence": 0.32},
    {"genre": "electronic", "confidence": 0.21},
    {"genre": "pop", "confidence": 0.14}
  ],
  "bpm": {"value": 124, "confidence": 0.87},
  "key": {"value": "E", "scale": "major", "confidence": 0.78},
  "mood": "energetic",
  "mood_scores": {
    "arousal": 0.71, "valence": 0.65,
    "party": 0.58, "relaxed": 0.22, "sad": 0.08
  },
  "instruments": ["drum", "bass", "lead", "pad"],
  "soundTags": ["punchy", "bright", "groovy"],
  "voice": {"present": true, "probability": 0.80},
  "danceability": {"probability": 0.85},
  "description": "124 BPM, E major, house, energetic mood (voiced)",
  "analysis_mode": "tensorflow+heuristic"
}
```

### LLM / Agent 代理

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/claude/run` | 执行 Claude 代码生成任务 |
| `POST` | `/proxy/verify` | 代理验证请求 |
| `ANY` | `/api-proxy/{path}` | 通用 API 代理转发（支持 SSE 流式） |
| `POST` | `/log/save` | 保存 LLM 交互日志 |
| `GET` | `/log/list` | 列出 LLM 日志 |

### System 系统

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | 服务根信息 |
| `GET` | `/health` | 健康检查 |

---

## Essentia 音频分析管线

### 双采样率架构

解决 BPM/Key 检测精度的关键设计：

```
输入音频 (任意格式/采样率/通道数)
        │
        ▼
  AudioLoader (检测元数据: SR, 通道, 编码, 码率)
        │
        ├──→ 44100 Hz: 频谱分析, BPM, Key, Danceability
        │    (需要高频细节: Nyquist=22050 Hz 覆盖镲片泛音)
        │
        └──→ 16000 Hz: TensorFlow 深度学习模型
             (MusiCNN 专用采样率)
```

**为什么双采样率？** BPM 检测依赖高频瞬态信息（镲片、打击乐），16000 Hz (Nyquist=8kHz) 会丢失 8kHz 以上的泛音，导致 OnsetDetection 漏检、Key 偏移。频谱分析需要 44100 Hz 的完整频带。

### 分析模式

| 模式 | 效果 | 依赖 |
|------|------|------|
| **TensorFlow + Heuristic** | MusiCNN 深度学习标签 + DEAM 情绪回归 + 启发式 BPM/Key/Danceability | 6 个 `.pb` 模型 |
| **Heuristic only** | 纯启发式算法（无 ML） | 仅 Essentia 基础库 |

### 下载 Essentia 模型

模型存放在 `~/essentia_models/`（可通过 `ESSENTIA_MODELS_DIR` 环境变量修改）：

```bash
mkdir -p ~/essentia_models && cd ~/essentia_models

# 1. MusiCNN 嵌入模型 (3MB) — 50 类音乐标签预测
curl -L -C - -o msd-musicnn-1.pb \
  "https://essentia.upf.edu/documentation/models/msd-musicnn-1.pb"
curl -L -C - -o msd-musicnn-1.json \
  "https://essentia.upf.edu/documentation/models/msd-musicnn-1.json"

# 2. DEAM 情绪回归模型 (81KB) — Arousal/Valence
curl -L -C - -o deam-msd-musicnn-2.pb \
  "https://essentia.upf.edu/documentation/models/deam-msd-musicnn-2.pb"
curl -L -C - -o deam-msd-musicnn-2.json \
  "https://essentia.upf.edu/documentation/models/deam-msd-musicnn-2.json"

# 3. 情绪分类器 (81KB each)
curl -L -C - -o mood_party-msd-musicnn-1.pb \
  "https://essentia.upf.edu/documentation/models/mood_party-msd-musicnn-1.pb"
curl -L -C - -o mood_relaxed-msd-musicnn-1.pb \
  "https://essentia.upf.edu/documentation/models/mood_relaxed-msd-musicnn-1.pb"
curl -L -C - -o mood_sad-msd-musicnn-1.pb \
  "https://essentia.upf.edu/documentation/models/mood_sad-msd-musicnn-1.pb"

# 4. 人声检测分类器 (81KB)
curl -L -C - -o voice_instrumental-msd-musicnn-1.pb \
  "https://essentia.upf.edu/documentation/models/voice_instrumental-msd-musicnn-1.pb"
```

### TF 模型两阶段推理

```
音频 (16000 Hz)
    │
    ▼
TensorflowPredictMusiCNN (output: model/Sigmoid)
    ├──→ 50 维 MSD 标签概率 (genre 分类)
    └──→ 200 维 embeddings (output: model/dense/BiasAdd)
              │
              ├──→ TensorflowPredict2D → 4 分类 mood (party/relaxed/sad/not)
              ├──→ TensorflowPredict2D → voice_instrumental 二分类
              └──→ TensorflowPredict2D → DEAM arousal/valence 回归 (1-9 → 归一化 0-1)
```

---

## 音色匹配系统（计划中）

目标工作流：**听到一首歌 → 自动匹配/生成近似 Vital 音色 → 导出编辑或生成 Strudel 代码**

详见 [SOUND_TO_VITAL_MAPPING.md](SOUND_TO_VITAL_MAPPING.md) 中的完整技术调研。

### 三阶段路线图

#### Phase 1: AudioRAG 向量检索（近期，1-2 周）

```
用户上传音频 → Essentia 分析 (28 特征 + 200d embedding)
                    ↓
            向量检索 (余弦相似度 + 多特征融合)
                    ↓
            Top-K Vital 预设 → LLM 生成 Strudel 代码
```

**原理**：离线渲染所有 `.vital` 预设 → 提取 MFCC + 频谱 + MusiCNN embedding → 构建 FAISS 向量索引。查询时对用户音频提取相同特征，多特征加权余弦相似度匹配。

**优势**：
- 零训练成本，直接可用
- 已有 Essentia 分析管线 + Jek's Presets 数百个预设
- 覆盖 bass / lead / pad / pluck / keys / fx 等主要类别

#### Phase 2: SPSA 参数微调（中期，2-4 周）

```
Top-K 匹配预设 → 选最佳候选 → SPSA 迭代微调参数
                                    ↓
                    每轮: 扰动 N 个参数 → 渲染 → 特征提取 → 损失计算
                                    ↓
                    收敛 → 输出 .vital 文件 (可直接导入 Vital 编辑)
```

**原理**：[SPSA](https://www.jhuapl.edu/SPSA/)（Simultaneous Perturbation Stochastic Approximation）是无梯度优化算法，每次随机扰动少量参数，通过比较音频特征差异来逼近目标音色。

**为什么 SPSA 比神经网络方案更可行**：

| 方法 | 训练数据 | 时间 | 我们的优势 |
|------|---------|------|-----------|
| MicroMusic (神经回归) | 100万+ 标注样本 | 数月 GPU | ❌ 无 |
| AST (论文 arXiv:2407.16643) | 合成数据集 | 数周 GPU | ❌ 无 |
| **SPSA** | **零** | 2-4 分钟/音色 | ✅ Vita 渲染引擎 |
| AudioRAG | 零 | 实时 | ✅ Essentia + 预设库 |

**损失函数**：
```
L = w₁·MFCC 距离 + w₂·频谱质心差 + w₃·频谱衰减差 + w₄·不规则度差 + w₅·embedding 余弦距离
```

#### Phase 3: LLM 增强体验层（持续迭代）

```
匹配结果 + 音频分析 → LLM 解释 (为什么匹配此音色)
                    → 生成 Strudel 代码 (音色参数已内嵌)
                    → 用户可在 Vital 编辑 → 导出 → 迭代
```

### 与其他方案的对比

| 方法 | 可行性 | 精度 | 延迟 | 可解释性 |
|------|--------|------|------|----------|
| MicroMusic (UW 论文) | ❌ 闭源 | 理论最高 | 预训练 | 黑盒 |
| AST Transformer | ⚠️ 需复现 | 高 | 预训练 | 低 |
| GA 遗传算法 | ✅ | 中-高 | 分钟级 | 低 |
| **AudioRAG** | ✅ | 中 | <1s | 高(预设名) |
| **SPSA** | ✅ | 高 | 2-4 分钟 | 高(参数值) |
| AudioRAG → SPSA | ✅ | 高 | 混合 | 高 |

---

## 项目结构

```
packages/vital-bridge/
├── server.py                  # FastAPI 主服务 (1180 行)
│   ├── 预设管理: /presets, /load, /upload
│   ├── 音频渲染: /render, /render-batch, /render-chromatic
│   ├── 预设导出: /export
│   ├── Essentia:  /essentia/analyze, /essentia/status
│   ├── LLM 代理:  /claude/run, /api-proxy
│   └── 日志系统:  /log/save, /log/list
│
├── essentia_analysis.py       # Essentia 音频分析引擎 (810 行)
│   ├── 智能音频加载: AudioLoader → 自动下混 → 重采样
│   ├── 双采样率: 44100 (BPM/Key/频谱) + 16000 (TF 模型)
│   ├── BPM/Key 检测: PercivalBpmEstimator + HPCP Key
│   ├── 频谱特征: Centroid/Spread/Skewness/Kurtosis/Rolloff/Flatness/Decrease
│   ├── TF 推理: MusiCNN → embeddings → classifiers
│   ├── 流派分类: MSD 50 标签映射 (16 类 + top3)
│   ├── 情绪分析: DEAM arousal/valence + party/relaxed/sad classifiers
│   └── 缓存: SHA256 文件哈希 → JSON 缓存
│
├── tag_presets.py             # 预设自动标签系统
│   └── 正则匹配: 文件名关键词 → type/style/mood tags
│
├── preset_tags.json           # 标签索引 (1MB+)
│   ├── 预设列表 (name/pack/path/types/styles/tags)
│   ├── 倒排索引 (tag → preset_names)
│   └── 统计信息 (type_counts/style_counts)
│
├── SOUND_TO_VITAL_MAPPING.md  # 音色映射技术文档 (521 行)
│   ├── Part 1: 28 Essentia 声学特征详解
│   ├── Part 2: Vital ~300 参数结构
│   ├── Part 3: 特征 → 参数映射矩阵
│   ├── Part 4: 预设匹配算法设计
│   └── Part 5: 4 阶段实现计划
│
├── test_server.py             # API 集成测试
├── test_vita.py               # Vita 引擎单元测试
├── requirements.txt           # Python 依赖
│
├── render_cache/              # 渲染 WAV 缓存 (278 文件)
├── llm_logs/                  # LLM 交互日志
└── essentia_cache/            # Essentia 分析结果缓存
```

---

## 配置参考

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `VITAL_PRESETS_DIR` | `~/music/Vital` | Vital 预设文件目录 |
| `JEK_PRESETS_DIR` | `~/music/Jek's Vital Presets` | Jek's 预设合集目录 |
| `ESSENTIA_MODELS_DIR` | `~/essentia_models` | Essentia TensorFlow 模型目录 |

**服务端口**：`8765`（在 server.py 启动命令中指定）

---

## 开发

### 依赖

```
vita>=0.0.5           # Vital C++ 合成器 Python 绑定
numpy>=1.24           # 数组计算
scipy>=1.10           # 信号处理（缓存键降级）
fastapi>=0.104        # Web 框架
uvicorn[standard]     # ASGI 服务器
python-multipart      # 文件上传支持
httpx>=0.27           # HTTP 客户端（代理转发）
essentia-tensorflow   # 音频分析 + TF 推理（可选）
```

### 运行测试

```bash
python test_vita.py     # Vita 引擎单元测试
python test_server.py   # API 端到端测试
```

### 代码规范

- **双采样率规则**：BPM/Key/频谱分析使用 `ANALYSIS_SR=44100`，TF 模型使用 `MODEL_SR=16000`
- **缓存策略**：渲染缓存（按 preset_hash + 参数哈希）、Essentia 缓存（按音频文件 SHA256）
- **Vital JSON 结构**：`synth.to_json()` → `{ "settings": { ... }, "modulation_connections": [ ... ] }`
- **音频格式**：渲染输出 44100 Hz, stereo, 16-bit PCM WAV
- **Macro 参数**：键名支持 `macro1`/`macro_control_1` 两种格式，值域 0.0–1.0

---

## 相关调研与参考

### 论文

- **MusiCNN**: Pons, J. et al. "End-to-end Learning for Music Audio Tagging at Scale" (ISMIR 2018)
- **DEAM**: Aljanaki, A. et al. "The DEAM Dataset: Emotion Annotation" (ISMIR 2017)
- **SPSA**: Spall, J.C. "Multivariate Stochastic Approximation Using a Simultaneous Perturbation Gradient Approximation" (1992)
- **MicroMusic**: "MicroMusic: Synthesizer Sound Matching via Neural Regression" (UWaterloo, 闭源)
- **AST Matching**: Bruford, F. et al. "Synthesizer Sound Matching Using Audio Spectrogram Transformers" (arXiv:2407.16643, 2024)
- **DDSP**: Engel, J. et al. "DDSP: Differentiable Digital Signal Processing" (ICLR 2020)
- **Neural Wavetable**: "Neural Wavetable: A Generalizable Framework for Timbre Transfer" (arXiv:1811.05550)
- **InverSynth**: "Deep Estimation of Synthesizer Parameter Configurations" (DAFx 2019)

### 相关项目

- [Essentia](https://essentia.upf.edu/) — 开源音频分析库
- [Vital](https://vital.audio/) — 开源波表合成器
- [Strudel](https://strudel.tidalcycles.org/) — 实时编码音乐环境
- [Jek's Vital Presets](https://github.com/jek-jek/WaveGen/) — Vital 预设合集
