# AnimScript v0.1 — Tài Liệu Ngôn Ngữ & Hướng Dẫn Sử Dụng

AnimScript v0.1 là ngôn ngữ kịch bản hoạt hình 2D toán học, có cú pháp gần gũi với Python, được biên dịch bằng TypeScript và chạy trên Remotion runtime thuần toán học (deterministic, frame-order independent, 0 side-effects).

---

## 1. QUY ƯỚC HỆ TỌA ĐỘ & GÓC

- **Độ phân giải mặc định:** `1920 × 1080`, tốc độ `60 fps`.
- **Gốc tọa độ:** Góc trên cùng bên trái `(0, 0)`.
  - Trục `X` tăng dần sang phải (`0 -> 1920`).
  - Trục `Y` tăng dần xuống dưới (`0 -> 1080`).
- **Quy ước Góc World (World Angles):**
  - `0°`: Hướng thẳng lên trên (12h, vector `(0, -1)`).
  - `90°`: Hướng sang phải (3h, vector `(1, 0)`).
  - `180°`: Hướng thẳng xuống dưới (6h, vector `(0, 1)`).
  - `270°`: Hướng sang trái (9h, vector `(-1, 0)`).
- **Quy ước Góc Parent (Parent Angles):**
  - Đo theo hướng xương cha; `0°` là tiếp nối thẳng trục xương cha; góc dương xoay theo chiều kim đồng hồ.
- **Thời lượng:**
  - `duration_ms` tính bằng mili-giây. Số frame được tính bằng công thức: `Math.round((duration_ms / 1000) * fps)`.

---

## 2. CẤU TRÚC LỆNH & CÚ PHÁP

### 2.1. Cấu trúc tổng thể
```python
video(width=1920, height=1080, fps=60)

with scene("tên_cảnh", duration_ms=6000):
    # 1. Khai báo nhân vật và đạo cụ
    desk = prop("desk", width=800, height=450)
    place(desk, at=[1100, 850])
    
    actor = character("human", height=600, x=300, y=850, facing="right")

    # 2. Lời dẫn thuyết minh (Voiceover - không kích hoạt miệng/tay nhân vật)
    narrate("Lời dẫn hiển thị ở đáy màn hình chuẩn tiếng Việt.", duration_ms=4000)

    # 3. Chuỗi hành động diễn xuất
    with sequence():
        walk(actor, to=700, duration_ms=2000)
        say(actor, "Xin chào!", duration_ms=1500)
```

### 2.2. Khối điều khiển dòng thời gian
- `with sequence():`: Các lệnh bên trong chạy **tuần tự nối tiếp nhau**; lệnh sau bắt đầu ngay khi lệnh trước kết thúc.
- `with parallel():`: Các lệnh bên trong chạy **song song cùng lúc**; khối hoàn tất khi nhánh dài nhất kết thúc.

---

## 3. DANH MỤC TÀI NGUYÊN (ASSET & RIG REGISTRY)

### 3.1. Nhân vật (`character`)
- Khai báo: `character("human", height=600, x=..., y=..., facing="right"|"left")`
- **Khớp xương & Điểm neo (Hierarchical Anchors):**
  - Hình học: `topmid` (đỉnh đầu), `bottommid` (giữa hai bàn chân), `center`.
  - Đầu & Mặt: `head`, `face`, `eyes`, `mouth`, `neck`.
  - Thân & Xương chậu: `torso`, `pelvis`.
  - Cánh tay: `right_shoulder`, `right_elbow`, `right_wrist`, `right_hand`, `left_shoulder`, `left_elbow`, `left_wrist`, `left_hand`.
  - Chân: `right_hip`, `right_knee`, `right_ankle`, `right_foot`, `left_hip`, `left_knee`, `left_ankle`, `left_foot`.

### 3.2. Đạo cụ chuẩn (`prop`)
| Loại prop | Kích thước chuẩn | Các điểm neo (Anchors) chính |
| :--- | :--- | :--- |
| `desk` | 800 × 450 | `surface.left`, `surface.center`, `surface.right`, `seat`, `approach.left`, `approach.right`, `topmid`, `bottommid` |
| `cup` | 60 × 90 | `grip` (quai cốc), `topmid`, `bottommid`, `center` |
| `jar` | 140 × 200 | `label_slot` (vị trí dán nhãn), `opening` (miệng lọ), `topmid`, `bottommid` |
| `laptop` | 180 × 110 | `keyboard`, `screen`, `bottommid` |
| `lamp` | 140 × 220 | `base`, `bulb`, `topmid`, `bottommid` |
| `clock` / `metabolic_clock` | 260 × 260 | `needle` (trục kim), `center`, `topmid`, `bottommid` |
| `spider` | 70 × 50 | `center`, `bottommid` |
| `window` | 400 × 320 | `center`, `bottommid`, `topmid` |
| `meadow` | 1920 × 200 | `surface.left`, `surface.center`, `surface.right`, `topmid` |
| `chair` | 220 × 400 | `seat`, `backrest`, `bottommid` |

---

## 4. BẢNG DANH MỤC HÀNH ĐỘNG (CORE ACTIONS)

| Hành động | Cú pháp ví dụ | Cơ chế vật lý & Ràng buộc |
| :--- | :--- | :--- |
| `place` | `place(obj, at=[960, 850])` | Đặt đối tượng tức thời vào tọa độ chỉ định. |
| `align` | `align(cup.bottommid, to=desk.surface.right)` | Căn chỉnh điểm neo đối tượng vào điểm neo đích. |
| `walk` | `walk(hero, to=850, duration_ms=2500)` | Di chuyển thân kết hợp chu kỳ bước chân; khóa chân chống bám đất (stance lock); tay cầm đồ vật không bị vung vẩy. |
| `jump` | `jump(hero, to=1200, height=160, duration_ms=1500)` | 3 pha chuẩn: chùng gối lấy đà (20%), bay quỹ đạo parabol (60%), tiếp đất nhún giảm chấn (20%). |
| `reach` | `reach(hero.right_hand, to=cup.grip, duration_ms=800)` | **IK giải tích 2-khớp (2-Bone Analytical IK)**: bảo toàn độ dài xương, không co giãn dị dạng, tự động gập cùi chỏ tự nhiên. |
| `grab` | `grab(hero, object=cup, hand="right", duration_ms=500)` | Tiếp cận, tiếp xúc và gắn vật thể vào tay cầm (parenting link). |
| `release` | `release(hero, object=cup, hand="right", duration_ms=200)` | Tháo liên kết và **giữ nguyên tọa độ world transform** tại điểm buông; không bật vật về gốc. |
| `put_down` | `put_down(hero, object=cup, on=desk.surface.left, duration_ms=800)` | Đặt vật thể tiếp xúc mặt đỡ rồi mới tháo liên kết. |
| `sit` | `sit(coder, on=desk.seat, duration_ms=600)` | Hạ hông xuống độ cao ghế, gập đùi ngang ẩn dưới yếm bàn, thân nằm sau bàn, tay đặt trên bàn phím. |
| `look_at` | `look_at(actor, target=[600, 400], duration_ms=400)` | Hướng đầu và tròng mắt về phía mục tiêu. |
| `move` | `move(actor, to=[1200, 850], duration_ms=1000)` | Dịch chuyển mượt mà theo hàm `easeInOut`. |
| `rotate` | `rotate(needle, angle=-60, duration_ms=1200)` | Xoay đối tượng quanh pivot. |
| `wait` | `wait(duration_ms=1000)` | Giữ nguyên trạng thái trong khoảng thời gian chỉ định. |
| `narrate` | `narrate("Lời dẫn...", duration_ms=3000)` | Phụ đề thuyết minh dưới đáy, **tuyệt đối không kích hoạt cử động miệng/tay**. |
| `say` | `say(actor, "Để sau!", duration_ms=1800)` | Hiện bong bóng thoại an toàn không che mặt và nhép miệng nhân vật. |
| `label_prop`| `label_prop(jar, "Tám", slot="label_slot")` | Nhãn dán vật lý gắn chặt trên thân lọ, không phải bong bóng thoại. |
| `camera_focus`| `camera_focus(targets=[jar], padding=180, duration_ms=800)`| Tính bounding box các mục tiêu, zoom điện ảnh và chừa vùng phụ đề an toàn. |
| `camera_reset`| `camera_reset(duration_ms=800)` | Khôi phục toàn cảnh 1920×1080. |

---

## 5. VÒNG LẶP SỬA LỖI TỰ ĐỘNG VỚI GEMINI API

Khi người dùng nhập kịch bản tiếng Việt trên giao diện Web Studio:
1. Gemini API nhận danh mục quy tắc AnimScript v0.1 và sinh mã.
2. Mã được biên dịch ngay bằng `compileAnimScript()`.
3. Nếu phát hiện lỗi (ví dụ anchor sai, cú pháp thiếu ngoặc, xung đột kênh điều khiển chi), danh sách lỗi chi tiết kèm dòng, cột và gợi ý sửa được gửi ngược lại cho Gemini.
4. Gemini tự sửa tối đa 2 vòng cho đến khi đạt mã hợp lệ 100%.

---

## 6. LỆNH NPM ĐỂ KIỂM TRA, PREVIEW VÀ RENDER

```powershell
cd web-studio

# 1. Chạy toàn bộ Unit Test (9/9 test kiểm chứng góc, IK, anchor, grab/release, determinism)
node -r ./scripts/register-ts.cjs --test src/animscript/tests/animscript.test.ts

# 2. Kiểm tra typecheck TypeScript toàn dự án
npm run typecheck

# 3. Chạy Server Studio Preview giao diện
npm run dev

# 4. Render các video MP4 chuẩn 1080p60:
npx remotion render src/remotion/index.ts AnimScriptDemo1 out/AnimScriptDemo1.mp4 --gl=angle
npx remotion render src/remotion/index.ts AnimScriptDemo2 out/AnimScriptDemo2.mp4 --gl=angle
npx remotion render src/remotion/index.ts AnimScriptDemo3 out/AnimScriptDemo3.mp4 --gl=angle
npx remotion render src/remotion/index.ts AnimScriptDemo4 out/AnimScriptDemo4.mp4 --gl=angle
```
