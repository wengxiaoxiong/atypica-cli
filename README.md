# atypica CLI

`atypica` is a command line client for the atypica open API.

Current v1 scope:

- Read Pulse data from `https://atypica.ai/api`
- Guide users to generate and save a Personal API Key
- Support human-readable and `--json` output
- Check for newer CLI versions and provide an update command

## 安装

```bash
npm install -g @atypica/cli
```

也可以用：

```bash
pnpm add -g @atypica/cli
```

## 快速开始

首次配置：

```bash
atypica auth login
```

这个命令会：

- 引导你打开 `https://atypica.ai/account/api-keys`
- 提示粘贴 Personal API Key
- 本地保存到配置文件
- 用一次真实 API 请求验证 key 是否可用

查看状态：

```bash
atypica auth status
```

如果你已经有 key，也可以直接用环境变量：

```bash
export ATYPICA_API_KEY="atypica_xxx"
atypica pulse list --limit 5
```

## Pulse 命令

列出热点：

```bash
atypica pulse list --limit 5 --locale en-US
```

按分类过滤：

```bash
atypica pulse list --category "AI Tech" --order-by heatScore
```

获取分类：

```bash
atypica pulse categories --locale zh-CN
```

获取单条 pulse：

```bash
atypica pulse get 193
```

脚本模式：

```bash
atypica pulse list --limit 3 --json
```

## 更新

CLI 启动时会做非阻塞版本检查。手动检查/升级：

```bash
atypica self-update
atypica self-update --yes
```

如果不想在某次运行时检查更新：

```bash
atypica pulse list --no-update-check
```

## 配置

默认配置文件位置：

- macOS/Linux: `~/.config/atypica/config.json`
- 如果设置了 `XDG_CONFIG_HOME`，则使用 `$XDG_CONFIG_HOME/atypica/config.json`

支持环境变量覆盖：

- `ATYPICA_API_KEY`
- `ATYPICA_BASE_URL`
- `ATYPICA_UPDATE_CHECK=0`

默认 `ATYPICA_BASE_URL`：

```text
https://atypica.ai/api
```

本地保存的配置文件只存 CLI 配置；运行时如设置了 `ATYPICA_API_KEY` 或 `ATYPICA_BASE_URL`，环境变量优先。

## Example Output

```bash
$ atypica pulse list --limit 3 --locale en-US
ID   Category   Locale  Heat    Delta  Title
---  ---------  ------  ------  -----  -------------------------------
193  Science    en-US   473.97  0.31   China QKD Network: quantum chip breakthrough
...
```

```bash
$ atypica pulse get 193 --json
{
  "id": 193,
  "title": "China QKD Network: quantum chip breakthrough",
  "content": "Today's buzz highlights...",
  "category": "Science",
  "locale": "en-US",
  "heatScore": 473.97,
  "heatDelta": 0.31,
  "createdAt": "2026-02-14T02:53:04.647Z",
  "posts": []
}
```

## Development

```bash
npm install
npm run build
node --test dist/tests/*.test.js
node dist/cli.js help
```

## 开放 API 文档

- Pulse docs: `https://atypica.ai/docs/pulse`
- Developer docs: `https://atypica.ai/docs`
