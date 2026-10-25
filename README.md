# 三界共語 · Interspecies Dialogue — 極簡版

植物、舞者與 AI 以平等的身分對話的現場展演。這是作品網站的**極簡版**：文字為主、深色、安靜，影音只在你要看的時候才載入。

A quiet, text-led website for *Interspecies Dialogue* (三界共語), a live performance in which plants, a dancer and an AI speak as equals.

## 內容

- **植物**：實驗經過（前後數百次測試，本站精選節錄其中 200 段氣孔顯微錄影）、可篩選的圓點圖與表格、55 段開口標註的曲線（先列 4 段代表，其餘收合）。
- **AI · 聲音**：《單向讀取》（節錄與全曲）與音樂性四段，附波形播放器；展演聲音只有文字說明，不附音檔。
- **AI · 影像**：開頭是作品影片（嵌入製作團隊在 YouTube 頻道發布的影片，按下播放才載入）；接著是 A 到 F5 與雙投影各版本的無聲片段。
- **AIGC 動畫**：五種風格 28 支（每種先列 4 支，其餘收合）；另有 20 支「長出五官」的動畫收在獨立區塊，需點擊才會顯示。
- **人類**：舞者的敘事表與 AI 的回應。
- **資料**：`data/` 內含這 200 段精選紀錄與 55 段開口標註（CSV / JSON）及欄位說明。
- **製作名單**：刊載三界共語首部曲（展覽）、二部曲（表演）與三部曲（展覽）的製作名單；二部曲、三部曲依官方 Credit List 原文，首部曲由團隊提供、依相同稱謂與格式整理。

## 隱私

實驗影像、聲音與實驗紀錄不呈現參與者的面孔、身體與聲音，也不含帳號等個人資訊；製作名單依官方 Credit List 與團隊提供的名單具名，姓名只出現在頁面末段的「製作名單」。有人聲的實驗影片一律靜音；實驗場地的影像只保留植物與設備；所有圖片與影片都已移除中繼資料。

影像章節開頭的作品影片嵌入自製作團隊在 YouTube 頻道發布的影片，內容以原片為準。頁面上先放的是本站自己的顯微畫格當封面；按下播放之前，頁面不會連線到 YouTube，按下後才以 YouTube 的隱私加強模式載入播放器。

Lab footage, sound and data records show no participant's face, body or voice; people are named only in the credits section, as listed in the official credit list and the list supplied by the team.

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

網址：

- **本站** https://handcollab.github.io/interspecies-dialogue/ ；**展示版** https://handcollab.github.io/interspecies-dialogue-showcase/ ；**展示版（英文）** https://handcollab.github.io/interspecies-dialogue-showcase-en/
- **分享預覽圖**：`og:url`、`og:image` 與 `twitter:image` 都已寫成上面這個本站網址底下的完整網址（Facebook、LINE、X 需要）。repository 若再改名，`index.html` 裡這幾處與兩個展示版的連結要一起改。

本機預覽：在這個資料夾執行 `python -m http.server`，再開 `http://localhost:8000/`。

中文字型（Noto Sans TC、Noto Serif TC）是放在本站的子集，只含本頁用到的字；如果之後改了文字、加了新字，新字會先用系統字型顯示，需要重新產生子集。等寬字 JetBrains Mono 由 Google Fonts 提供，非阻塞載入。

© 三界共語 Interspecies Dialogue 2026
