import math

def cosineSmooth(t):
    c = max(0.0, min(1.0, t))
    return 0.5 - 0.5 * math.cos(c * math.pi)

def lerp(a, b, t):
    return a + (b - a) * t

groundY = 840

def get_state(frame):
    # Obstacle
    obstacleVisible = frame < 285
    # Box
    boxBaseX = 1530
    boxBaseY = groundY
    boxVisible = frame >= 270 # Box is placed on stage
    
    # Apple
    appleBaseX = 1380
    appleBaseY = groundY
    appleVisible = frame >= 240 # Apple appears as jumper lands
    
    rootX = 240
    crouchDepth = 0
    flightLift = 0
    torsoTiltDeg = 0
    headTiltDeg = 0
    facingFactor = 1.0
    gaitPhase = 0.0
    pupilGaze = {"x": 0.0, "y": 0.0}
    
    appleX = appleBaseX
    appleY = appleBaseY
    boxX = boxBaseX
    boxY = boxBaseY
    holdingTarget = None
    
    if frame < 160:
        # Action 1
        pass
    elif frame < 270:
        # Action 2: Jump f160 - f270
        localF = frame - 160
        if localF < 75: # f160 - f235
            t = localF / 75.0
            rootX = lerp(970, 1260, t)
            flightLift = math.sin(t * math.pi) * 160
            torsoTiltDeg = -12 + 24 * t
            if localF >= 35: # Anticipation gaze 18f+
                gt = (localF - 35) / 40.0
                egt = cosineSmooth(gt)
                pupilGaze = {"x": lerp(0.5, 0.85, egt), "y": lerp(0.0, 0.9, egt)}
                headTiltDeg = lerp(0, 6, egt)
        else: # f235 - f270 (cushion & reach)
            p = (localF - 75) / 35.0
            ep = cosineSmooth(p)
            rootX = lerp(1260, 1320, ep)
            flightLift = 0
            crouchDepth = lerp(20, 55, ep)
            torsoTiltDeg = lerp(12, 48, ep)
            pupilGaze = {"x": 0.85, "y": 0.9}
            headTiltDeg = 4.0 * (1 - ep)
            # Arm reaching
            gripX = lerp(1330, appleBaseX, ep)
            gripY = lerp(groundY - 60, appleBaseY - 20, ep)
            holdingTarget = {"rightGrip": {"x": gripX, "y": gripY}}
    elif frame < 470:
        # Action 3: Touch & Lift -> Walk to box -> Place on box -> Crouch
        localF = frame - 270 # 0 to 200
        if localF < 40: # f270 - f310: Touch (f290) & lift starts f292
            p = localF / 40.0
            rootX = 1320
            if localF < 20: # f270 - f290: reach to apple
                tp = localF / 20.0
                etp = cosineSmooth(tp)
                crouchDepth = 55
                torsoTiltDeg = 48
                gripX = appleBaseX
                gripY = appleBaseY - 20
                appleX = appleBaseX
                appleY = appleBaseY
                holdingTarget = {"rightGrip": {"x": gripX, "y": gripY}}
            else: # f290 - f310: lift apple & rise simultaneously! (Zero-dwell touch at f290)
                lp = (localF - 20) / 20.0
                elp = cosineSmooth(lp)
                # Apple lifts
                appleX = lerp(appleBaseX, 1345, elp)
                appleY = lerp(appleBaseY, groundY - 60, elp)
                # Body rises simultaneously
                crouchDepth = lerp(55, 25, elp)
                torsoTiltDeg = lerp(48, 22, elp)
                holdingTarget = {"rightGrip": {"x": appleX, "y": appleY - 20}}
                pupilGaze = {"x": 0.85, "y": 0.5}
        elif localF < 140: # f310 - f410: Walking with apple to box!
            wp = (localF - 40) / 100.0
            ewp = cosineSmooth(wp)
            # Root walks from 1320 to 1430
            rootX = lerp(1320, 1430, ewp)
            gaitPhase = (localF / 26.0) * math.pi * 2
            # Body completes rise to upright
            if wp < 0.3:
                rp = wp / 0.3
                erp = cosineSmooth(rp)
                crouchDepth = lerp(25, 0, erp)
                torsoTiltDeg = lerp(22, 0, erp)
            else:
                crouchDepth = 0
                torsoTiltDeg = 0
            
            # Apple carried at chest
            appleX = rootX + 45
            appleY = groundY - 145 + math.sin(gaitPhase) * 4
            holdingTarget = {"rightGrip": {"x": appleX, "y": appleY - 20}}
            pupilGaze = {"x": 0.9, "y": 0.2} # Looking at box lid
        elif localF < 185: # f410 - f455: Placing apple on box lid (lid at Y = groundY - 135)
            pp = (localF - 140) / 45.0
            epp = cosineSmooth(pp)
            rootX = 1430
            crouchDepth = 0
            torsoTiltDeg = 0
            # Apple placed from chest to box lid (box at 1530, lid top is groundY - 135)
            targetLidX = boxBaseX
            targetLidY = groundY - 135
            appleX = lerp(1430 + 45, targetLidX, epp)
            appleY = lerp(groundY - 145, targetLidY, epp)
            holdingTarget = {"rightGrip": {"x": appleX, "y": appleY - 20}}
            pupilGaze = {"x": 0.8, "y": 0.4}
        else: # f455 - f480: Release apple & Crouch to handles
            cp = (localF - 185) / 15.0
            ecp = cosineSmooth(cp)
            rootX = 1430
            crouchDepth = lerp(0, 45, ecp)
            torsoTiltDeg = lerp(0, 24, ecp)
            # Apple rests on box lid
            appleX = boxBaseX
            appleY = groundY - 135
            # Hands slide to handles
            leftGripX = lerp(1430 - 30, boxBaseX - 48, ecp)
            leftGripY = lerp(groundY - 140, boxBaseY - 52, ecp)
            rightGripX = lerp(boxBaseX, boxBaseX + 48, ecp)
            rightGripY = lerp(groundY - 140, boxBaseY - 52, ecp)
            holdingTarget = {
                "leftGrip": {"x": leftGripX, "y": leftGripY},
                "rightGrip": {"x": rightGripX, "y": rightGripY}
            }
    else:
        # Action 4: Lift + Turn + Walk (f480 - f720)
        localF = frame - 480 # 0 to 240
        if localF < 75: # f480 - f555: Simultaneous Lift + Turn + Walk!
            tp = localF / 75.0
            # Lift: 0 to 1
            liftP = cosineSmooth(min(1.0, localF / 50.0))
            crouchDepth = lerp(45, 0, liftP)
            torsoTiltDeg = lerp(24, 0, liftP)
            curBoxY = lerp(groundY, groundY - 80, liftP)
            
            # Turn: starts at f495 (localF = 15, when lift is 35%!)
            turnLocalF = max(0.0, localF - 15)
            turnP = cosineSmooth(min(1.0, turnLocalF / 50.0))
            facingFactor = lerp(1.0, -1.0, turnP) # +1 -> 0 -> -1
            
            # Walk: starts at f505 (localF = 25, mid-turn!)
            walkLocalF = max(0.0, localF - 25)
            walkP = cosineSmooth(min(1.0, walkLocalF / 50.0))
            rootX = lerp(1430, 1340, walkP)
            gaitPhase = (walkLocalF / 32.0) * math.pi * 2
            
            # Box sweeps across belly
            boxX = rootX + facingFactor * 62
            boxY = curBoxY
            appleX = boxX
            appleY = boxY - 135
            
            holdingTarget = {
                "leftGrip": {"x": boxX - 48, "y": boxY - 52},
                "rightGrip": {"x": boxX + 48, "y": boxY - 52}
            }
        else: # f555 - f720: Carry walk facing left
            p = (localF - 75) / 165.0
            facingFactor = -1.0
            rootX = lerp(1340, 950, p)
            crouchDepth = 0
            torsoTiltDeg = -4
            gaitPhase = ((localF - 75) / 36.0) * math.pi * 2
            bobbing = math.sin(gaitPhase) * 5
            boxX = rootX - 65
            boxY = groundY - 80 + bobbing
            appleX = boxX
            appleY = boxY - 135
            holdingTarget = {
                "leftGrip": {"x": boxX - 48, "y": boxY - 52},
                "rightGrip": {"x": boxX + 48, "y": boxY - 52}
            }

    return {
        "frame": frame,
        "rootX": rootX,
        "crouchDepth": crouchDepth,
        "torsoTiltDeg": torsoTiltDeg,
        "facingFactor": facingFactor,
        "boxX": boxX,
        "boxY": boxY,
        "appleX": appleX,
        "appleY": appleY,
        "holdingTarget": holdingTarget
    }

# Run test on key frames:
for f in [205, 240, 275, 290, 310, 360, 410, 445, 470, 480, 500, 520, 540, 555, 620]:
    s = get_state(f)
    print(f"F{f:03d}: rootX={s['rootX']:.1f}, crouch={s['crouchDepth']:.1f}, torso={s['torsoTiltDeg']:.1f}, facing={s['facingFactor']:.2f}, box=({s['boxX']:.1f},{s['boxY']:.1f}), apple=({s['appleX']:.1f},{s['appleY']:.1f})")
