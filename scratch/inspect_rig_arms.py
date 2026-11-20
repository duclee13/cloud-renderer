with open('web-studio/src/remotion/components/character/StickmanRig.tsx', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'backArmOnly' in l:
        print(''.join(lines[i-5:i+45]))
        break
