with open('web-studio/src/remotion/components/character/StickmanRig.tsx', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'layer-character-arms' in l:
        print(''.join(lines[i:i+60]))
        break
