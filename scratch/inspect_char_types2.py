with open('web-studio/src/remotion/types/character.ts', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines[60:130]):
    print(f'{i+61}: {l}', end='')
