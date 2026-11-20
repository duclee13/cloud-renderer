with open('web-studio/src/remotion/compositions/TestV5ActionsShowcase.tsx', encoding='utf-8') as f:
    lines = f.readlines()

# Let's inspect how stickmanState and boxElement are placed
for i, l in enumerate(lines):
    if 'stickmanState' in l:
        print(f'{i+1}: {l.strip()[:100]}')
