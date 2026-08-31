import os

repo_dir = 'e:/BrosKi/unknown'
exclude_dirs = {'.git', '.venv', 'node_modules', 'dataset', 'dist'}

count = 0
for root, dirs, files in os.walk(repo_dir):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith('.py') or file.endswith('.js') or file.endswith('.jsx') or file.endswith('.md') or file.endswith('.json'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                content = content.replace('Unknown Intelligence', 'Unknown Intelligence')
                content = content.replace('Unknown-Intelligence', 'Unknown-Intelligence')
                content = content.replace('Unknowns', 'Unknowns')
                
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated {path}')
                    count += 1
            except Exception as e:
                print(f'Failed {path}: {e}')
print(f'Updated {count} files.')
