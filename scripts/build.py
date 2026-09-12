"""Index Desktop/ and build a static site with automatic image previews. Python 3.10+."""
from __future__ import annotations
import argparse
import hashlib
import html as html_tools
import json
import re
import shutil
import warnings
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE_EXT = {'.png', '.jpg', '.jpeg', '.jfif', '.webp', '.gif', '.svg', '.avif', '.bmp', '.ico', '.tif', '.tiff', '.heic', '.heif'}
TEXT_EXT = {'.txt', '.md', '.markdown', '.json', '.csv', '.tsv', '.log', '.py', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.htm', '.xml', '.yaml', '.yml', '.ini', '.toml', '.sql', '.c', '.cpp', '.h', '.cs', '.java', '.sh'}
AUDIO_EXT = {'.mp3', '.wav', '.ogg', '.oga', '.opus', '.m4a', '.flac', '.aac', '.aiff', '.wma'}
VIDEO_EXT = {'.mp4', '.webm', '.mov', '.m4v', '.ogv', '.mkv', '.avi', '.mpeg', '.mpg', '.3gp', '.wmv'}
SKIP_NAMES = {'node_modules', '__pycache__', 'thumbs.db', 'desktop.ini'}
TEXT_LIMIT = 256_000
APP_FOLDERS = {'Desktop/About me': 'profile', 'Desktop/Experience': 'experience',
               'Desktop/Skills': 'skills', 'Desktop/Contact': 'contact', 'Desktop/Assistant': 'chat'}

def file_kind(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in IMAGE_EXT: return 'image'
    if ext in TEXT_EXT or ext == '': return 'text'
    if ext == '.pdf': return 'pdf'
    if ext in AUDIO_EXT: return 'audio'
    if ext in VIDEO_EXT: return 'video'
    return 'file'

def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding='utf-8-sig'))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f'Please check {path}: {error}') from error

def index_desktop(root: Path, path: Path) -> dict:
    relative = path.relative_to(root).as_posix()
    if path.is_dir():
        children = []
        for child in sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name.casefold())):
            if child.is_symlink() or child.name.startswith('.') or child.name.lower() in SKIP_NAMES:
                continue
            if not child.resolve().is_relative_to((root / 'Desktop').resolve()):
                raise ValueError(f'File outside Desktop: {relative}')
            children.append(index_desktop(root, child))
        result = {'path': relative, 'name': path.name, 'kind': 'folder', 'children': children}
        if relative in APP_FOLDERS:
            result['app'] = APP_FOLDERS[relative]
        return result
    kind = file_kind(path)
    result = {'path': relative, 'name': path.name, 'kind': kind, 'size': path.stat().st_size}
    if kind == 'text':
        with path.open('rb') as file:
            data = file.read(TEXT_LIMIT + 1)
        try:
            result['content'] = data[:TEXT_LIMIT].decode('utf-8-sig', errors='replace')
            result['truncated'] = len(data) > TEXT_LIMIT
            if '\x00' in result['content']:
                result['kind'] = 'file'
                result.pop('content')
                result.pop('truncated')
        except UnicodeError:
            result['kind'] = 'file'
    return result

def read_personal_content(root: Path):
    desktop = root / 'Desktop'
    profile = read_json(desktop / 'About me/Profile.json')
    profile['intro'] = (desktop / 'About me/Introduction.txt').read_text(encoding='utf-8-sig').strip()
    profile['bio'] = (desktop / 'About me/Bio.txt').read_text(encoding='utf-8-sig').strip()
    experience = read_json(desktop / 'Experience/Experience.json')
    skills = read_json(desktop / 'Skills/Skills.json')
    contact = read_json(desktop / 'Contact/Contact.json')
    profile.update(experience=experience['items'], skills=skills['groups'],
                   email=contact['email'], links=contact['links'],
                   pages={'experience':experience, 'skills':skills, 'contact':contact})
    for key in ('name', 'alias', 'role', 'headline'):
        if not isinstance(profile.get(key), str) or not profile[key].strip():
            raise ValueError(f'Desktop/About me/Profile.json needs a nonempty {key}.')
    for items, fields, filename in [
        (profile['experience'], ('dates','company','role','description'), 'Experience/Experience.json'),
        (profile['skills'], ('name','icon','description','items'), 'Skills/Skills.json'),
        (profile['links'], ('label','url','icon'), 'Contact/Contact.json')]:
        if not isinstance(items, list) or any(not isinstance(item, dict) or any(key not in item for key in fields) for item in items):
            raise ValueError(f'Please check the entries in Desktop/{filename}.')
    photo = root / profile.get('photo', '')
    if profile.get('photo') and photo.is_file() and photo.resolve().is_relative_to(desktop.resolve()):
        profile['photoVersion'] = hashlib.sha256(photo.read_bytes()).hexdigest()[:16]
    replacements = {'name': profile['name'], 'alias': profile['alias'], 'email':profile['email'],
                    'role':profile['role'], 'bio':profile['bio'],
                    'skills': ', '.join(item for group in profile['skills'] for item in group['items']),
                    'experience': '; '.join(f'{job["role"]} at {job["company"]} ({job["dates"]})' for job in profile['experience']),
                    'stats': '; '.join(f'{stat["value"]} {stat["label"]}' for stat in profile['stats']),
                    'social_links': '; '.join(f'{link["label"]}: {link["url"]}' for link in profile['links'])}
    def expand(value):
        if isinstance(value, list): return [expand(item) for item in value]
        if isinstance(value, dict): return {key:expand(item) for key,item in value.items()}
        if isinstance(value, str):
            for key,text in replacements.items(): value = value.replace('{' + key + '}', text)
        return value
    profile['intro'] = expand(profile['intro'])
    profile['bio'] = expand(profile['bio'])
    assistant = expand(read_json(desktop / 'Assistant/Assistant.json'))
    return profile, assistant


def make_manifest(root: Path) -> dict:
    desktop = root / 'Desktop'
    desktop.mkdir(exist_ok=True)
    profile, assistant = read_personal_content(root)
    for item in assistant.get('questions', []):
        if not isinstance(item.get('question'), str) or not isinstance(item.get('answer'), str):
            raise ValueError('Every custom Q&A needs a question and answer string.')
    metadata = read_json(root / 'config/projects.json') if (root / 'config/projects.json').exists() else {}
    return {'profile': profile, 'assistant': assistant, 'projects': metadata, 'desktop': index_desktop(root, desktop)}

def copy_tree_safe(source: Path, destination: Path, exclude=()):
    destination.mkdir(parents=True, exist_ok=True)
    for path in source.iterdir():
        if path.is_symlink() or path.name.startswith('.') or path.name.lower() in SKIP_NAMES or path.name in exclude:
            continue
        if path.is_dir():
            copy_tree_safe(path, destination / path.name)
        else:
            shutil.copy2(path, destination / path.name)

def write_manifest(path: Path, data: dict):
    path.parent.mkdir(exist_ok=True)
    # A classic script supports both file:// and GitHub Pages.
    path.write_text('/* Generated by scripts/build.py. Edit Desktop/ or config/ instead. */\nwindow.PORTFOLIO = ' + json.dumps(data, ensure_ascii=True, separators=(',', ':')) + ';\n', encoding='utf-8')


def image_nodes(node: dict):
    if node['kind'] == 'image':
        yield node
    for child in node.get('children', []):
        yield from image_nodes(child)


def generate_thumbnails(output: Path, data: dict, required: bool = False):
    try:
        from PIL import Image, ImageOps
    except ImportError:
        if required:
            raise RuntimeError('Install build dependencies: python -m pip install -r scripts/requirements.txt')
        print('Using original images for previews. GitHub builds optimize them automatically.')
        return
    generated = 0
    try:
        from pillow_heif import register_heif_opener
        register_heif_opener()
    except ImportError:
        if required:
            raise RuntimeError('Install image build dependencies: python -m pip install -r scripts/requirements.txt')
    for node in image_nodes(data['desktop']):
        source = output / node['path']
        # Keep the original extension to distinguish photo.jpg from photo.png.
        relative = Path(node['path']).relative_to('Desktop')
        thumb = output / 'assets' / 'thumbnails' / relative.parent / (relative.name + '.webp')
        if source.suffix.lower() == '.svg':
            continue  # SVG already scales cleanly; use the original.
        try:
            with warnings.catch_warnings():
                warnings.simplefilter('error', Image.DecompressionBombWarning)
                with Image.open(source) as original:
                    preview = ImageOps.exif_transpose(original)
                    if source.suffix.lower() in {'.tif', '.tiff', '.heic', '.heif'}:
                        # Keep the original; generate a browser-readable full-size preview.
                        full = output / 'assets' / 'previews' / relative.parent / (relative.name + '.png')
                        full.parent.mkdir(parents=True, exist_ok=True)
                        preview.convert('RGBA' if 'A' in preview.getbands() else 'RGB').save(full, 'PNG')
                        node['preview'] = full.relative_to(output).as_posix()
                    preview.thumbnail((420, 320), Image.Resampling.LANCZOS)
                    has_alpha = 'A' in preview.getbands() or 'transparency' in preview.info
                    preview = preview.convert('RGBA' if has_alpha else 'RGB')
                    thumb.parent.mkdir(parents=True, exist_ok=True)
                    preview.save(thumb, 'WEBP', quality=80, method=4)
            node['thumbnail'] = thumb.relative_to(output).as_posix()
            generated += 1
        except (OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
            # Unsupported/corrupt formats must not break the rest of the portfolio.
            thumb.unlink(missing_ok=True)
            print(f'Using original preview for {node["path"]!a}: {error}')
    print(f'Generated {generated} image previews in _site only.')


def version_desktop_script(output: Path, profile=None):
    """Version local entry assets so content, names, scripts and styles update together."""
    index = output / 'index.html'
    html = index.read_text(encoding='utf-8')
    if profile:
        title = html_tools.escape(f'{profile["alias"]}’s Desktop — {profile["name"]}')
        html = re.sub(r'<title>[^<]*</title>', lambda _: f'<title>{title}</title>', html)
        values = {'name':profile['name'], 'alias':profile['alias'], 'identity':f'{profile["name"]} · {profile["alias"]}'}
        html = re.sub(r'(<[^>]+data-profile="(name|alias|identity)"[^>]*>)[^<]*(</[^>]+>)',
                      lambda m: m[1] + html_tools.escape(values[m[2]]) + m[3], html)
        description = html_tools.escape(f'{profile["name"]} ({profile["alias"]}). {profile["role"]}. {profile["intro"]}', quote=True)
        html = re.sub(r'(<meta name="description" content=")[^"]*(">)', lambda m:m[1]+description+m[2],html)
    if len(re.findall(r'\bsrc=[\"\']assets/content\.js(?:\?[^\"\']*)?[\"\']', html)) != 1:
        raise ValueError('index.html must load assets/content.js exactly once.')
    def versioned(match):
        asset = output / match[2]
        if not asset.is_file() or not asset.resolve().is_relative_to(output.resolve()):
            return match[0]
        version = hashlib.sha256(asset.read_bytes()).hexdigest()[:16]
        return f'{match[1]}{match[2]}?v={version}{match[3]}'
    html = re.sub(r'(\b(?:src|href)=[\"\'])(assets/[^\"\'?]+)(?:\?[^\"\']*)?([\"\'])', versioned, html)
    index.write_text(html, encoding='utf-8')


def build(root: Path = ROOT, export: bool = True, require_thumbnails: bool = False):
    root = root.resolve()
    data = make_manifest(root)
    # Source previews use Desktop originals; no second source folder to maintain.
    write_manifest(root / 'assets' / 'content.js', data)
    if export:
        output = root / '_site'
        # Delete only this known generated directory; never follow a symlink.
        if output.is_symlink() or output.resolve() != root / '_site':
            raise ValueError('Unsafe build output path')
        if output.exists():
            shutil.rmtree(output)
        output.mkdir()
        shutil.copy2(root / 'index.html', output / 'index.html')
        copy_tree_safe(root / 'assets', output / 'assets', exclude={'thumbnails', 'previews'})
        copy_tree_safe(root / 'Desktop', output / 'Desktop')
        generate_thumbnails(output, data, required=require_thumbnails)
        write_manifest(output / 'assets' / 'content.js', data)
        version_desktop_script(output, data['profile'])
        (output / '.nojekyll').touch()
    def count(node):
        return 1 + sum(count(child) for child in node.get('children', []))
    print(f'Indexed {count(data["desktop"]) - 1} desktop items; {len(data["assistant"]["questions"])} custom answers.')
    print('Ready: ' + str(root / ('_site/index.html' if export else 'index.html')))
    return data

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--index-only', action='store_true', help='Refresh local content without generating _site/')
    parser.add_argument('--require-thumbnails', action='store_true', help='Fail if image build dependencies are missing (used by GitHub Actions)')
    args = parser.parse_args()
    build(export=not args.index_only, require_thumbnails=args.require_thumbnails)
