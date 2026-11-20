with open('web-studio/src/animscript/types.ts', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'export interface ActionClipIR' in l:
        print(''.join(lines[i:i+30]))
        break
