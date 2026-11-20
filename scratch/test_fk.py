# Test FK at frame 520

def test_fk_f520():
    # Character at frame 520
    x = 1411.5
    y = 840
    boxX = 1411.5
    boxY = 767.6
    facing = "right"
    scale = 0.95
    torsoAngle = 2.3
    
    leftGrip = {"x": boxX - 48, "y": boxY - 52}
    rightGrip = {"x": boxX + 48, "y": boxY - 52}
    
    standingLegLength = 175
    crouchDepth = 4.3
    flightLift = 0
    hipY = -standingLegLength + crouchDepth - flightLift # -170.7
    shoulderUpperY = -155 + 16 # -139
    
    flipSign = 1
    import math
    torsoRad = torsoAngle * math.pi / 180
    cosTorso = math.cos(torsoRad)
    sinTorso = math.sin(torsoRad)
    
    # Left wrist
    dxL = ((leftGrip["x"] - x) / scale) * flipSign
    dyL = (leftGrip["y"] - y) / scale - hipY
    leftWristUpper = {
        "x": dxL * cosTorso + dyL * sinTorso,
        "y": -dxL * sinTorso + dyL * cosTorso
    }
    
    # Right wrist
    dxR = ((rightGrip["x"] - x) / scale) * flipSign
    dyR = (rightGrip["y"] - y) / scale - hipY
    rightWristUpper = {
        "x": dxR * cosTorso + dyR * sinTorso,
        "y": -dxR * sinTorso + dyR * cosTorso
    }
    
    print(f"Shoulder: (0, {shoulderUpperY})")
    print(f"Left wrist: ({leftWristUpper['x']:.2f}, {leftWristUpper['y']:.2f})")
    print(f"Right wrist: ({rightWristUpper['x']:.2f}, {rightWristUpper['y']:.2f})")

test_fk_f520()
