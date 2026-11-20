# Test FK at frame 540 with correct arm layering
import math

x = 1358.5
y = 840
boxX = 1300.0
boxY = 760.0
scale = 0.95
facing = "left"
flipSign = -1
torsoAngle = 0
standingLegLength = 175
hipY = -standingLegLength
shoulderUpperY = -139

leftGrip = {"x": boxX - 48, "y": boxY - 52} # 1252 (far handle)
rightGrip = {"x": boxX + 48, "y": boxY - 52} # 1348 (near handle)

# Left wrist (back arm)
dxL = ((leftGrip["x"] - x) / scale) * flipSign
dyL = (leftGrip["y"] - y) / scale - hipY
print(f"Left arm (Back arm, to far handle 1252): local x = {dxL:.2f}, world x = {leftGrip['x']}")

# Right wrist (front arm)
dxR = ((rightGrip["x"] - x) / scale) * flipSign
dyR = (rightGrip["y"] - y) / scale - hipY
print(f"Right arm (Front arm, to near handle 1348): local x = {dxR:.2f}, world x = {rightGrip['x']}")
