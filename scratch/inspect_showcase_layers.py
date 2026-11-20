with open('web-studio/src/remotion/compositions/TestV5ActionsShowcase.tsx', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'StickmanRig' in l or 'box' in l or 'cardboard' in l:
        print(f'{i+1}: {l.strip()[:100]}')
