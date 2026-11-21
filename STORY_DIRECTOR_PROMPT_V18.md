# HƯỚNG DẪN ĐẠO DIỄN & VIẾT KỊCH BẢN JSON HOẠT HÌNH 2D (CHUẨN V18 — ĐA LỚP NHẤT CỬ NHẤT ĐỘNG)

> **Mục đích file này**: Tài liệu chuẩn độc lập, dùng được cho **mọi AI** (ChatGPT, Claude, DeepSeek, Gemini...). Chỉ cần đính kèm hoặc dán file này vào khung chat và nhập chủ đề bạn muốn làm, AI sẽ tự phân tích 3 lớp và xuất ra file `.json` hợp lệ 100% để đẩy lên GitHub Actions (`Render Handcrafted JSON Movie`) render thành phim hoạt hình 2D 1080p 60fps hoàn chỉnh.

## 1. QUY TRÌNH TƯ DUY 3 LỚP BẮT BUỘC (KHÔNG LÀM TẮT)

Khi người dùng đưa ra 1 chủ đề (ví dụ: *"Sẽ ra sao nếu bạn ở trong căn phòng yên tĩnh nhất thế giới?"*), AI phải thiết kế kịch bản theo đúng **3 lớp từ tổng quan đến chi tiết**:

1. **Lớp 1 — Khung Cốt Truyện & 4 Hồi (`Story → 4 Acts`)**:

   * **Hồi 1 (Beats 1–16)**: Khởi đầu đời thường, nảy ra câu hỏi tò mò, bước vào tình huống.

   * **Hồi 2 (Beats 17–32)**: Diễn biến bất ngờ đầu tiên + giải thích cơ chế khoa học nhẹ nhàng.

   * **Hồi 3 (Beats 33–48)**: Cao trào kịch tính / hài hước / cú twist thú vị nhất.

   * **Hồi 4 (Beats 49–64)**: Cách mọi thứ kết thúc hoặc hồi phục + cái kết mở tự nhiên.

   * **Tổng thời lượng mục tiêu**: **60–64 micro-beats** (\~6 phút 15 giây – 7 phút). Chia hết cho 16 để 16 máy ảo Cloud chạy đều (4 beat/máy ảo).

2. **Lớp 2 — Chia Micro-Beat Khớp 1-1 (`Act → 16 Micro-Beats`)**:

   * Mỗi micro-beat là **1 câu ngắn gọn 16–28 từ tiếng Việt** (\~4.0s–5.5s lời đọc), diễn tả **ĐÚNG 1 tình huống/hành động**.

   * **Khớp bối cảnh tuyệt đối**: Thoại nói đang ở phòng ngủ → `BEDROOM_INDOOR`; ra sân → `COUNTRYSIDE_YARD`; ra phố → `CITY_STREET`; vào phòng khám → `DOCTOR_CLINIC`; xem biểu đồ khoa học → `SCIENCE_LAB_ROOM`. Tuyệt đối không để nhân vật đứng ở phòng ngủ mà thoại lại bảo "chạy ra bếp".

   * **Tỷ lệ cảnh sống động >= 80%**: Tối đa 10–12 beat dùng nền chấm bi `EXPLAINER_POLKA_DOT`; còn lại phải là cảnh kể chuyện có bối cảnh & nhân vật diễn thật.

3. **Lớp 3 — Đạo Diễn Nhất Cử Nhất Động (`Micro-Beat → timeline[] 2–4 Keyframe Actions`)**:

   * **Cấm để nhân vật đứng bất động 1 chỗ suốt 5–6 giây!**

   * Mỗi nhân vật trong `actors[]` bắt buộc có mảng **`timeline`** gồm **2 đến 4 chặng hành động liên hoàn** phủ kín `fromPct: 0.0` → `toPct: 1.0`, khớp đúng diễn biến từng vế câu thoại:

     * Di chuyển theo tọa độ `x` tự do (`180` đến `1740`, mặt sàn chuẩn) thay vì đứng chết 1 điểm.

     * Đổi `pose`, `expression`, `facing`, và `handProp` **ngay trong cùng 1 cảnh** (ví dụ: `0.0→0.35` chạy tới `RUN` → `0.35→0.65` cúi xuống chộp đồ `REACH_GRAB` → `0.65→1.0` giật lùi hoảng hốt `JUMP_BACK` đổi biểu cảm sang `SHOCKED`).

   * Kết hợp `camera` (`fromScale`, `toScale`, `focusX`) để phóng nhẹ vào nhân vật lúc cao trào/giật mình.

## 2. LUẬT NGÔN NGỮ, GIỌNG ĐỌC & PHONG CÁCH (BẮT BUỘC)

1. **Văn phong kể chuyện ngôi thứ nhất tự nhiên**: Hồn nhiên, tò mò, có miếng hài đời thường (kiểu *"Sẽ ra sao nếu..."* + khoa học vui). **TUYỆT ĐỐI KHÔNG** viết giọng tuyên truyền, giáo điều, khuyên răn (cấm các câu như *"Đừng bao giờ thử!"*, *"Sức khỏe là quan trọng nhất"*, *"Hãy nhớ 3 quy tắc..."*).

2. **Tách `text` (phụ đề) và `ttsText` (giọng đọc VieNeu-TTS `Hải Đăng`)**:

   * Mọi chữ số, từ tiếng Anh, thuật ngữ khoa học trong `ttsText` phải phiên âm thuần Việt dễ đọc.

   * **QUY TẮC CẤM CHỮ `z` TRONG `ttsText`**: VieNeu-TTS hay đọc nhầm chữ `z` thành chữ cái tiếng Anh *"dét"*. Luôn viết `"coóc-ti-dôn"` (không viết `coóc-ti-zôn`), `"a-đê-nô-din"` (không viết `a-đê-nô-zin`), `"ô-xy"`, `"ca-phê-in"`, `"đô-pa-min"`, `"rêm"`.

3. **Bóng thoại (`bubble`) chọn lọc & đời thường**:

   * Chỉ gắn `bubble` ở khoảng **25%–35% số cảnh** thực sự cần điểm nhấn hài hước hoặc cảm thán.

   * Ngắn **1–4 từ** tự nhiên người Việt hay thốt ra (vd: `"Toang rồi!"`, `"Ủa gì vậy?!"`, `"Thật á?!"`, `"Hết pin rồi..."`, `"Tỉnh như sáo!"`).

   * **Cấm tuyệt đối** bóng thoại mô tả hành động sáo rỗng (như `"Cười... ha ha..."`, `"Đang suy nghĩ..."`, `"Sợ quá đi"`).

4. **Không bịa số `%` giả**: Chỉ nêu số liệu khoa học có thật (như kỷ lục 264 giờ năm 1964, chu kỳ 24 giờ...), không tự chế số phần trăm.

5. **100% nhãn chữ hiển thị là tiếng Việt có dấu** — tuyệt đối không để chữ tiếng Anh như `"Clock"`, `"Soda"`, `"Notebook"`.

## 3. TỪ ĐIỂN ENUM HỢP LỆ 100% CỦA ENGINE V18

### A. Bối cảnh (`stageType`) — 10 bối cảnh 60fps

* `COUNTRYSIDE_YARD`: Sân nhà quê, hàng rào gỗ, đồng lúa vàng, nhà mái ngói đỏ.

* `SIMPLE_GRASS_FIELD`: Bãi cỏ xanh, đồi cỏ, cây xoài cổ thụ.

* `BEDROOM_INDOOR`: Phòng ngủ có giường xanh, tủ đèn ngủ, cửa sổ (sáng/đêm/mưa). *(Lưu ý: ban đêm cửa sổ đã có sẵn trăng sao — KHÔNG gắn thêm `visualProp: "MOON_STARS"`).*

* `CITY_STREET`: Đường phố, dãy nhà nhiều màu, ô tô chạy ngang, đèn đường.

* `SCIENCE_LAB_ROOM`: Phòng thí nghiệm / nghiên cứu có bảng sóng não, ống nghiệm, kính hiển vi, đồng hồ tường.

* `DOCTOR_CLINIC`: Phòng khám có bảng đo thị lực, giường khám, chữ thập xanh.

* `WATER_POND_OCEAN`: Mặt nước ao/biển có sóng gợn 60fps.

* `UNDERGROUND_EARTH_CUTAWAY`: Mặt cắt lòng đất / đường hầm sâu.

* `SPACE_COSMOS`: Vũ trụ đầy sao, hành tinh quay *(nhân vật tự đội mũ phi hành gia — chỉ dùng khi thực sự nói về không gian/ẩn dụ vũ trụ)*.

* `EXPLAINER_POLKA_DOT`: Nền chấm bi tối giản giải thích cơ chế khoa học *(tối đa 10–12 beat/tập)*.

### B. Thời gian, Thời tiết, Chuyển cảnh & Nhạc nền

* `timeOfDay`: `"DAY"` | `"SUNSET"` | `"NIGHT"`

* `weather`: `"CLEAR"` | `"RAIN"` | `"STORM"` | `"FLOOD"`

* `transitionIn`: `"CROSSFADE"` *(mặc định, 30 frames = 0.5s)* | `"CUT"` *(dùng cho cú giật mình đột ngột)*

* `pauseAfterSec`: `0.4` *(giữa các câu bình thường)* hoặc `0.6` *(cuối hồi/kết phim)*

* `bgmMood`: `"BGM_STORY_CALM"` | `"BGM_TENSE_PULSE"` | `"BGM_WARM_OUTRO"`

### C. Nhân vật (`preset`), Biểu cảm (`expression`) & Đạo cụ cầm tay (`handProp`)

* `preset`: `"BOY"` | `"GRANDPA"` | `"GRANDMA"` | `"DOCTOR"` | `"NEIGHBOR"`

* `expression`: `"HAPPY"` | `"CURIOUS"` | `"SHOCKED"` | `"SCARED"` | `"TIRED"` | `"PROUD"` | `"ANGRY"` | `"THINKING"`

* `handProp`: `"NONE"` | `"STICK"` | `"MAGNIFYING_GLASS"` | `"BUCKET"` | `"NOTEBOOK"` | `"PHONE"` | `"FLASHLIGHT"` | `"CUP_SODA"` | `"NET"`

### D. 18 Tư thế Nhất Cử Nhất Động (`pose` trong `timeline[]`)

* **Di chuyển**: `"WALK"` (đi bộ 60fps), `"RUN"` (chạy nhanh nghiêng thân), `"TURN_AROUND"` (quay người đổi hướng), `"JUMP_BACK"` (nhảy bật giật lùi hoảng hốt).

* **Tương tác & Hành động tay**: `"REACH_GRAB"` (vươn tay chộp/cầm đồ), `"PAT_SHOULDER"` (đưa tay vỗ vai người đứng cạnh), `"SWEEP_LIGHT"` (lia đèn pin lên xuống), `"SIP_DRINK"` (đưa cốc lên nhấp uống), `"WRITE_NOTE"` (cầm sổ ghi chép liên tục).

* **Cử chỉ & Biểu đạt**: `"POINT_FORWARD"` (chỉ thẳng về trước), `"POINT_UP"` (giơ tay chỉ lên trời/bóng suy nghĩ), `"SCRATCH_HEAD"` (gãi đầu ngơ ngác), `"FACEPALM"` (vỗ trán bất lực), `"ARMS_UP_CHEER"` (giơ hai tay ăn mừng), `"STRETCH_YAWN"` (vươn vai ngáp ngủ), `"CROUCH_LOOK"` (cúi rạp người săm soi), `"SHIVER_PANIC"` (run lập cập), `"LIE_SLEEP"` (nằm đắp chăn ngủ có `Z z z` — chỉ dùng ở `BEDROOM_INDOOR` gần giường `x ≈ 1400`).

### E. 16 Đạo cụ Minh Họa Động 60fps (`visualProp` — tự đặt trong bóng suy nghĩ an toàn)

`"ALARM_CLOCK_RINGING"` | `"SODA_CAN_FIZZ"` | `"COFFEE_STEAM"` | `"BRAIN_GLOW"` | `"NEURON_SIGNAL"` | `"BATTERY_LOW"` | `"BUG_SWARM"` | `"HEART_BEAT"` | `"THERMOMETER_HOT"` | `"GHOST_SHADOW"` | `"SOUND_WAVES"` | `"EARTH_CUTAWAY"` | `"NOTEBOOK_OPEN"` | `"MOON_STARS"` | `"WATER_RIPPLE"` | `"TROPHY_STAR"`

## 4. CẤU TRÚC JSON CHUẨN V18 (MẪU COPY-PASTE)

```
{
  "title": "Tiêu Đề Tập Phim Hấp Dẫn",
  "slug": "ten_khong_dau_v18",
  "version": "18.0",
  "beats": [
    {
      "id": "b01",
      "actTitle": "Hồi 1: Khởi Đầu",
      "headerTitle": "HỒI 1: CÂU HỎI LẠ LÙNG",
      "text": "Tôi vớ vội chiếc đèn pin trên tủ đầu giường bật sáng rực rồi quét thẳng vào góc tường tối om.",
      "ttsText": "Tôi vớ vội chiếc đèn pin trên tủ đầu giường bật sáng rực rồi quét thẳng vào góc tường tối om.",
      "stageType": "BEDROOM_INDOOR",
      "timeOfDay": "NIGHT",
      "weather": "RAIN",
      "transitionIn": "CROSSFADE",
      "transitionFrames": 30,
      "pauseAfterSec": 0.4,
      "bgmMood": "BGM_TENSE_PULSE",
      "camera": { "fromScale": 1.0, "toScale": 1.08, "focusX": 960, "focusY": 540 },
      "actors": [
        {
          "preset": "BOY",
          "bubble": "Cái gì thế?!",
          "bubbleStartPct": 0.65,
          "bubbleEndPct": 0.98,
          "timeline": [
            { "fromPct": 0.0, "toPct": 0.30, "startX": 380, "endX": 780, "facing": "RIGHT", "pose": "RUN", "expression": "SCARED", "handProp": "NONE" },
            { "fromPct": 0.30, "toPct": 0.50, "startX": 780, "endX": 820, "facing": "RIGHT", "pose": "REACH_GRAB", "expression": "SHOCKED", "handProp": "FLASHLIGHT" },
            { "fromPct": 0.50, "toPct": 0.80, "startX": 820, "endX": 840, "facing": "RIGHT", "pose": "SWEEP_LIGHT", "expression": "CURIOUS", "handProp": "FLASHLIGHT" },
            { "fromPct": 0.80, "toPct": 1.0, "startX": 840, "endX": 840, "facing": "RIGHT", "pose": "SCRATCH_HEAD", "expression": "CURIOUS", "handProp": "FLASHLIGHT" }
          ]
        }
      ],
      "visualProp": "BUG_SWARM",
      "callout": { "text": "ẢO GIÁC ĐÊM THỨ 3" }
    }
  ]
}

```

## 5. CÂU LỆNH MẪU ĐỂ DÙNG VỚI BẤT KỲ AI NÀO (CHATGPT / CLAUDE / DEEPSEEK / GEMINI)

> *"Hãy đọc kỹ toàn bộ quy chuẩn trong file `STORY_DIRECTOR_PROMPT_V18.md`. Sau đó lập dàn ý 4 Hồi và viết cho tôi trọn bộ file JSON chuẩn V18 (đúng 64 micro-beats, mỗi beat có `timeline[]` 2–4 nhất cử nhất động chi tiết, khớp bối cảnh 1-1, không dùng chữ `z` trong `ttsText`, không giọng giáo điều) cho chủ đề: **\[ĐIỀN CHỦ ĐỀ CỦA BẠN VÀO ĐÂY\]**. Vì file dài, hãy xuất lần lượt từng Hồi (mỗi lần 16 beats) ở dạng JSON sạch để tôi ghép lại."*