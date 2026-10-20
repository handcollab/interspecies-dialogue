# 三界共語 · Three Realms in Dialogue — 極簡版

植物、舞者與 AI 以平等的身分對話的現場展演。這是作品網站的**極簡版**：文字為主、深色、安靜，影音只在你要看的時候才載入。

A quiet, text-led website for *Three Realms in Dialogue*, a live performance in which plants, a dancer and an AI speak as equals.

## 內容

- **植物**：200 段氣孔顯微錄影的實驗經過、可篩選的圓點圖與表格、55 段開口標註的曲線（先列 4 段代表，其餘收合）。
- **AI · 聲音**：《單向讀取》（節錄與全曲）與音樂性四段，附波形播放器；展演聲音只有文字說明，不附音檔。
- **AI · 影像**：A 到 F5 與雙投影各版本的無聲片段。
- **AIGC 動畫**：五種風格 28 支（每種先列 4 支，其餘收合）；另有 20 支「長出五官」的動畫收在獨立區塊，需點擊才會顯示。
- **人類**：舞者的敘事表與 AI 的回應。
- **資料**：`data/` 內含完整的實驗紀錄與開口標註（CSV / JSON）及欄位說明。

## 隱私

本站不公開任何參與者的姓名、帳號、面孔、身體或聲音，參與者一律以角色標示。有人聲的實驗影片一律靜音；實驗場地的影像只保留植物與設備；所有圖片與影片都已移除中繼資料。

## 結構

```
index.html            單頁網站
favicon.svg
assets/css/site.css   樣式
assets/js/site.js     互動（原生 JavaScript，無框架、無建置步驟）
assets/js/data.js     圓點圖、標註曲線與波形用的資料
assets/media/         圖片、影片、聲音
assets/fonts/         Noto Sans TC / Noto Serif TC 的子集字型（SIL OFL 1.1）
assets/og.jpg         分享預覽圖
data/                 可下載的資料
.nojekyll
```

## 部署（GitHub Pages）

1. 把整個資料夾推到一個 repository 的根目錄。
2. Settings → Pages → Source 選 `main` 分支、`/ (root)`。
3. 所有路徑都是相對路徑，放在 `https://<帳號>.github.io/<repository>/` 底下即可運作。

部署後建議調整兩處：

- **網址**：本站 https://handcollab.github.io/three-realms/ ；展示版 https://handcollab.github.io/three-realms-showcase/
- **分享預覽圖**：`og:image` 與 `twitter:image` 目前是相對路徑 `assets/og.jpg`；Facebook、LINE、X 需要完整網址。知道網址後，把這兩處改成 `https://<帳號>.github.io/<repository>/assets/og.jpg`。

本機預覽：在這個資料夾執行 `python -m http.server`，再開 `http://localhost:8000/`。

中文字型（Noto Sans TC、Noto Serif TC）是放在本站的子集，只含本頁用到的字；如果之後改了文字、加了新字，新字會先用系統字型顯示，需要重新產生子集。等寬字 JetBrains Mono 由 Google Fonts 提供，非阻塞載入。

© 三界共語 2026
