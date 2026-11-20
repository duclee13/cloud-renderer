/**
 * Precompiled AnimScript Demo IRs for Remotion Compositions & Preview
 */

import { compileAnimScript } from "../../animscript";

export const DEMO_1_SCRIPT = `# AnimScript Demo 1: Di bo roi nhay tren dong co
video(width=1920, height=1080, fps=60)

with scene("meadow_walk_and_jump", duration_ms=6000):
    ground = prop("meadow", width=1920, height=200)
    place(ground, at=[960, 850])

    hero = character("human", height=600, x=300, y=850, facing="right")

    narrate("Nhân vật đi bộ tự nhiên trên đồng cỏ với hai chân tách biệt.", duration_ms=2500)

    with sequence():
        walk(hero, to=850, duration_ms=2500)
        wait(duration_ms=400)
        jump(hero, to=1350, height=160, duration_ms=1500)
        wait(duration_ms=1000)
`;

export const DEMO_2_SCRIPT = `# AnimScript Demo 2: Cam coc, mang di roi dat len ban
video(width=1920, height=1080, fps=60)

with scene("cup_delivery", duration_ms=7500):
    desk = prop("desk", width=800, height=450)
    place(desk, at=[1350, 850])

    coffee_cup = prop("cup", width=60, height=90)
    place(coffee_cup, at=[500, 850])

    waiter = character("human", height=600, x=250, y=850, facing="right")

    narrate("Nhân vật tiến lại, cúi gập gối nhặt cốc, nhấc khi còn cúi, mang qua bàn và đặt xuống êm ái.", duration_ms=3500)

    with sequence():
        walk(waiter, to=420, duration_ms=1500)
        pickup(waiter, object=coffee_cup, hand="right", duration_ms=2500)
        walk(waiter, to=1050, duration_ms=2200)
        put_down(waiter, object=coffee_cup, on=desk.surface.left, duration_ms=800)
        wait(duration_ms=500)
`;

export const DEMO_3_SCRIPT = `# AnimScript Demo 3: Ngoi lam viec sau ban, che khuat chan/than, camera can va phu de
video(width=1920, height=1080, fps=60)

with scene("evening_desk_work", duration_ms=6000):
    room_window = prop("window", width=420, height=320)
    place(room_window, at=[500, 480])

    desk = prop("desk", width=850, height=450)
    place(desk, at=[1100, 850])

    work_laptop = prop("laptop", width=180, height=110)
    align(work_laptop.bottommid, to=desk.surface.center, offset=[-80, 0])

    lamp = prop("lamp", width=140, height=220)
    align(lamp.bottommid, to=desk.surface.right, offset=[-40, 0])

    coder = character("human", height=600, x=1020, y=850, facing="right")

    narrate("Buổi tối bình thường, tôi ngồi sau bàn học làm việc dưới ánh đèn bàn ấm áp, bên ngoài cửa sổ là trăng sao.", duration_ms=5000)

    with sequence():
        sit(coder, on=desk.seat, duration_ms=600)
        camera_focus(targets=[coder, work_laptop, lamp], padding=160, duration_ms=1200)
        wait(duration_ms=3500)
`;

export const DEMO_4_SPIDER_SCRIPT = `# AnimScript Demo 4: Chuyen Con Nhen Tam (4 Canh Hoan Chinh chay tren General Engine)
video(width=1920, height=1080, fps=60)

with scene("scene_1_spider_discovered", duration_ms=6000):
    room_window = prop("window", width=400, height=300)
    place(room_window, at=[500, 450])

    jar = prop("jar", width=140, height=200)
    place(jar, at=[680, 850])

    tam_spider = prop("spider", width=70, height=50)
    place(tam_spider, at=[680, 835])

    me = character("human", height=600, x=1350, y=850, facing="left")

    narrate("Tôi nhìn thấy một con nhện nhỏ trong chiếc lọ thủy tinh trên sàn nhà. Tôi bảo 'Để sau!' rồi quên bẵng nó.", duration_ms=5000)

    with sequence():
        look_at(me, target=[680, 800], duration_ms=400)
        wait(duration_ms=400)
        say(me, "Để sau!", duration_ms=1800)
        walk(me, to=1700, duration_ms=2500)

with scene("scene_2_close_up_labeling", duration_ms=6000):
    jar = prop("jar", width=220, height=310)
    place(jar, at=[960, 750])

    tam_spider = prop("spider", width=100, height=70)
    place(tam_spider, at=[960, 730])

    hand_actor = character("human", height=600, x=1400, y=850, facing="left")

    narrate("Chiếc lọ thủy tinh được dán nhãn đặt tên cho nó là 'Tám'.", duration_ms=5000)

    with sequence():
        camera_focus(targets=[jar], padding=180, duration_ms=800)
        reach(hand_actor.right_hand, to=jar.label_slot, duration_ms=1000)
        label_prop(jar, "Tám", slot="label_slot")
        wait(duration_ms=800)
        move(hand_actor, to=[1650, 850], duration_ms=1200)
        wait(duration_ms=1500)

with scene("scene_3_metabolic_gauge", duration_ms=5500):
    clock = prop("metabolic_clock", width=340, height=340)
    place(clock, at=[960, 580])

    narrate("Nó tự hạ tốc độ trao đổi chất để sống sót.", duration_ms=4500)

    with sequence():
        camera_focus(targets=[clock], padding=140, duration_ms=1000)
        wait(duration_ms=4000)

with scene("scene_4_evening_desk", duration_ms=6500):
    room_window = prop("window", width=420, height=320)
    place(room_window, at=[480, 480])

    desk = prop("desk", width=850, height=450)
    place(desk, at=[1100, 850])

    laptop = prop("laptop", width=180, height=110)
    align(laptop.bottommid, to=desk.surface.center, offset=[-80, 0])

    lamp = prop("lamp", width=140, height=220)
    align(lamp.bottommid, to=desk.surface.right, offset=[-40, 0])

    coder = character("human", height=600, x=1020, y=850, facing="right")

    narrate("Buổi tối bình thường, tôi ngồi sau bàn học làm việc dưới ánh đèn bàn ấm áp, bên ngoài cửa sổ là trăng sao.", duration_ms=5500)

    with sequence():
        sit(coder, on=desk.seat, duration_ms=600)
        camera_focus(targets=[coder, laptop, lamp], padding=160, duration_ms=1200)
        wait(duration_ms=4000)
`;

export const DEMO_1_IR = compileAnimScript(DEMO_1_SCRIPT).ir;
export const DEMO_2_IR = compileAnimScript(DEMO_2_SCRIPT).ir;
export const DEMO_3_IR = compileAnimScript(DEMO_3_SCRIPT).ir;
export const DEMO_4_SPIDER_IR = compileAnimScript(DEMO_4_SPIDER_SCRIPT).ir;

// ============================================================================
// V2 QA ACCEPTANCE COMPOSITIONS (1920x1080 @ 60fps)
// ============================================================================

export const QA01_SIT_STAND_SCRIPT = `# QA01: Tiep can ghe go -> Ngoi xuong -> Giu -> Dung len -> Buoc toi
video(width=1920, height=1080, fps=60)

with scene("qa01_sit_stand", duration_ms=8000):
    chair_prop = prop("chair", width=220, height=400)
    place(chair_prop, at=[960, 850])

    actor = character("human", height=600, x=750, y=850, facing="right")

    narrate("QA01: Đứng nghỉ ổn định, tiếp cận ghế gỗ nhìn nghiêng, ngồi xuống liên tục và đứng lên vững vàng.", duration_ms=3500)

    with sequence():
        wait(duration_ms=600)
        walk(actor, to=940, duration_ms=1000)
        sit(actor, on=chair_prop.seat, duration_ms=1800)
        wait(duration_ms=1500)
        stand(actor, duration_ms=1600)
        walk(actor, to=1080, duration_ms=1000)
        wait(duration_ms=500)
`;

export const QA02_FLOOR_PICKUP_SCRIPT = `# QA02: Nhin coc tren san -> Di toi -> Cui -> Cham/Nam -> Nhac khi con cui -> Dung len -> Mang qua ban -> Dat xuong
video(width=1920, height=1080, fps=60)

with scene("qa02_floor_pickup", duration_ms=14000):
    desk = prop("desk", width=800, height=450)
    place(desk, at=[1450, 850])

    coffee_cup = prop("cup", width=60, height=90)
    place(coffee_cup, at=[600, 850])

    actor = character("human", height=600, x=300, y=850, facing="right")

    narrate("QA02: Cúi gập hông gối nhặt cốc trên sàn, nhấc vật khi còn cúi, đứng lên mang đặt lên bàn.", duration_ms=4500)

    with sequence():
        look_at(actor, target=[600, 850], duration_ms=800)
        wait(duration_ms=400)
        walk(actor, to=520, duration_ms=1800)
        wait(duration_ms=400)
        pickup(actor, object=coffee_cup, hand="right", duration_ms=2800)
        wait(duration_ms=600)
        walk(actor, to=1120, duration_ms=2800)
        put_down(actor, object=coffee_cup, on=desk.surface.left, duration_ms=1200)
        wait(duration_ms=3200)
`;

export const QA03_WALK_RUN_STOP_SCRIPT = `# QA03: Dung -> Di cham -> Di nhanh -> Chay bo -> Giam ve di -> Dung -> Quay trai
video(width=1920, height=1080, fps=60)

with scene("qa03_walk_run_stop", duration_ms=12000):
    ground = prop("meadow", width=1920, height=200)
    place(ground, at=[960, 850])

    actor = character("human", height=600, x=220, y=850, facing="right")

    narrate("QA03: Đi chậm, đi nhanh, chạy có pha bay và nghiêng thân, giảm tốc dừng ổn định.", duration_ms=4000)

    with sequence():
        wait(duration_ms=800)
        walk(actor, to=440, duration_ms=2000)
        walk(actor, to=850, duration_ms=1800)
        run(actor, to=1450, duration_ms=2200)
        walk(actor, to=1680, duration_ms=1400)
        wait(duration_ms=800)
        rotate(actor, angle=180, duration_ms=300)
        walk(actor, to=1350, duration_ms=1500)
        wait(duration_ms=1200)
`;

export const QA04_JUMP_LAND_SCRIPT = `# QA04: Nhay tai cho (lay da, dap, bay, tiep dat, giam chan) -> Nhay tien ve truoc
video(width=1920, height=1080, fps=60)

with scene("qa04_jump_land", duration_ms=9000):
    ground = prop("meadow", width=1920, height=200)
    place(ground, at=[960, 850])

    actor = character("human", height=600, x=580, y=850, facing="right")

    narrate("QA04: Nhảy tại chỗ và nhảy tiến: đầy đủ pha lấy đà, gập gối trên không, tiếp đất giảm chấn.", duration_ms=4000)

    with sequence():
        wait(duration_ms=1000)
        jump(actor, to=580, height=180, duration_ms=1800)
        wait(duration_ms=1000)
        jump(actor, to=1180, height=170, duration_ms=2200)
        wait(duration_ms=2000)
`;

export const QA05_CONTACT_GAZE_SCRIPT = `# QA05: Mat cham den + long may doc lap (nhin trai, phai, xuong) -> Nhac khay mang qua ban
video(width=1920, height=1080, fps=60)

with scene("qa05_contact_and_gaze", duration_ms=12000):
    table1 = prop("desk", width=600, height=450)
    place(table1, at=[500, 850])

    table2 = prop("desk", width=600, height=450)
    place(table2, at=[1450, 850])

    tray = prop("tray", width=240, height=40)
    align(tray.bottommid, to=table1.surface.center)

    red_apple = prop("apple", width=40, height=40)
    align(red_apple.bottommid, to=tray.surface.center)

    actor = character("human", height=600, x=360, y=850, facing="right")

    narrate("QA05: Mắt chấm đen và lông mày đổi hướng nhìn; nhấc khay có vật trên mặt đỡ mang qua bàn.", duration_ms=4500)

    with sequence():
        look_at(actor, target=[150, 400], duration_ms=800)
        wait(duration_ms=400)
        look_at(actor, target=[750, 400], duration_ms=800)
        wait(duration_ms=400)
        look_at(actor, target=[500, 580], duration_ms=800)
        wait(duration_ms=400)
        reach(actor.right_hand, to=tray.grip, duration_ms=800)
        grab(actor, object=tray, hand="both", duration_ms=500)
        walk(actor, to=1250, duration_ms=3000)
        put_down(actor, object=tray, on=table2.surface.center, duration_ms=1200)
        wait(duration_ms=2100)
`;

export const QA01_IR = compileAnimScript(QA01_SIT_STAND_SCRIPT).ir;
export const QA02_IR = compileAnimScript(QA02_FLOOR_PICKUP_SCRIPT).ir;
export const QA03_IR = compileAnimScript(QA03_WALK_RUN_STOP_SCRIPT).ir;
export const QA04_IR = compileAnimScript(QA04_JUMP_LAND_SCRIPT).ir;
export const QA05_IR = compileAnimScript(QA05_CONTACT_GAZE_SCRIPT).ir;

// ============================================================================
// SHOWCASE 30S: "CHUYẾN ĐI CỦA CHÚ NGƯỜI QUE" (5 CẢNH, 30 GIÂY = 1800 FRAMES)
// ============================================================================

export const SHOWCASE_30S_SCRIPT = `# Showcase 30s: Chuyen Di Cua Chu Nguoi Que
video(width=1920, height=1080, fps=60)

with scene("scene_1_morning_meadow", duration_ms=6000):
    ground = prop("meadow", width=1920, height=200)
    place(ground, at=[960, 850])

    hero = character("human", height=600, x=250, y=850, facing="right")

    narrate("Chào buổi sáng! Chú người que bắt đầu ngày mới trên đồng cỏ bao la.", duration_ms=5000)

    with sequence():
        walk(hero, to=700, duration_ms=2200)
        run(hero, to=1150, duration_ms=1600)
        jump(hero, to=1550, height=160, duration_ms=1400)
        wait(duration_ms=800)

with scene("scene_2_coffee_break", duration_ms=6000):
    desk = prop("desk", width=800, height=450)
    place(desk, at=[1350, 850])

    coffee_cup = prop("cup", width=60, height=90)
    place(coffee_cup, at=[500, 850])

    actor = character("human", height=600, x=280, y=850, facing="right")

    narrate("Chú ghé qua lấy ly cà phê thơm nóng để nạp lại năng lượng.", duration_ms=5000)

    with sequence():
        walk(actor, to=420, duration_ms=1400)
        pickup(actor, object=coffee_cup, hand="right", duration_ms=1800)
        walk(actor, to=1050, duration_ms=1800)
        put_down(actor, object=coffee_cup, on=desk.surface.left, duration_ms=700)
        wait(duration_ms=300)

with scene("scene_3_magic_apple", duration_ms=6000):
    tray = prop("tray", width=240, height=40)
    place(tray, at=[1200, 850])

    apple = prop("apple", width=50, height=50)
    place(apple, at=[600, 850])

    hero = character("human", height=600, x=250, y=850, facing="right")

    narrate("Bất ngờ chú phát hiện quả táo đỏ ngọt ngào và hân hoan nhặt nó lên.", duration_ms=5000)

    with sequence():
        walk(hero, to=520, duration_ms=1600)
        pickup(hero, object=apple, hand="right", duration_ms=1800)
        say(hero, "Quả táo ngon quá!", duration_ms=1600)
        wait(duration_ms=1000)

with scene("scene_4_coding_night", duration_ms=6000):
    room_window = prop("window", width=420, height=320)
    place(room_window, at=[500, 480])

    desk = prop("desk", width=850, height=450)
    place(desk, at=[1100, 850])

    laptop = prop("laptop", width=180, height=110)
    align(laptop.bottommid, to=desk.surface.center, offset=[-80, 0])

    lamp = prop("lamp", width=140, height=220)
    align(lamp.bottommid, to=desk.surface.right, offset=[-40, 0])

    coder = character("human", height=600, x=1020, y=850, facing="right")

    narrate("Đêm xuống, chú ngồi sau bàn học làm việc dưới ánh đèn ấm áp.", duration_ms=5000)

    with sequence():
        sit(coder, on=desk.seat, duration_ms=800)
        camera_focus(targets=[coder, laptop, lamp], padding=160, duration_ms=1200)
        say(coder, "Code chạy mượt 60fps!", duration_ms=2200)
        wait(duration_ms=1800)

with scene("scene_5_farewell", duration_ms=6000):
    desk = prop("desk", width=700, height=400)
    place(desk, at=[1500, 850])

    hero = character("human", height=600, x=400, y=850, facing="right")

    narrate("Một ngày làm việc trọn vẹn và chú vẫy tay chào tạm biệt tất cả mọi người!", duration_ms=5000)

    with sequence():
        walk(hero, to=960, duration_ms=2200)
        look_at(hero, target=[960, 400], duration_ms=600)
        say(hero, "Hẹn gặp lại các bạn nhé!", duration_ms=2200)
        wait(duration_ms=1000)
`;

export const SHOWCASE_30S_IR = compileAnimScript(SHOWCASE_30S_SCRIPT).ir;
