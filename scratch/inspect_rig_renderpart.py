with open('web-studio/src/remotion/components/character/StickmanRig.tsx', encoding='utf-8') as f:
    code = f.read()

import re
matches = [l for l in code.splitlines() if 'renderPart' in l or 'frontArm' in l or 'backArm' in l]
for m in matches:
    print(m)
