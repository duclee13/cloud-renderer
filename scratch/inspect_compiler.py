with open('web-studio/src/animscript/compiler.ts', encoding='utf-8') as f:
    code = f.read()

import re
matches = [l for l in code.splitlines() if 'sequence' in l or 'overlap' in l or 'ActionClip' in l or 'compile' in l]
for m in matches[:30]:
    print(m)
