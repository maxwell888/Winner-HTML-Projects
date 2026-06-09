# SanEr / 三儿

三儿的配置文件目录。所有 .md / .learnings / memory 同步到这里。

主仓:Maxwell888/Winner-HTML-Projects/Javis/SanEr/

## 包含

- 6 个核心配置: AGENTS.md IDENTITY.md SOUL.md TOOLS.md MEMORY.md USER.md
- 5 个 daily memory: memory/2026-06-05.md ~ 2026-06-09.md
- 3 个 .learnings: ERRORS.md FEATURE_REQUESTS.md LEARNINGS.md

## 同步规则

- 推 / 改 / 删任何文件都走 `PUT` REST API (api.github.com)
- 连发之间 `sleep 2`
- 单会话 ≤ 10 个 PUT
