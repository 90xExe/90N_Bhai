"""Behavior checks for adding images once, under Desktop/."""
import contextlib
import io
import json
import re
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image
from build import build, image_nodes


class DesktopImageBuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='portfolio-build-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        for directory in ('Desktop/Projects/New event', 'config', 'assets'):
            (self.root / directory).mkdir(parents=True, exist_ok=True)
        (self.root / 'index.html').write_text('<html><script src="assets/content.js" defer></script></html>', encoding='utf-8')
        personal = {
            'About me/Profile.json': {'name':'Test Person','alias':'Test Alias','role':'Engineer','headline':'Test headline', 'stats':[], 'capabilities':[]},
            'Experience/Experience.json': {'title':'Experience','subtitle':'My work','note':'','items':[]},
            'Skills/Skills.json': {'title':'Skills','subtitle':'Tools','groups':[]},
            'Contact/Contact.json': {'title':'Contact','subtitle':'Hello','lead':'Get in touch','email':'test@example.com','links':[], 'services':[]},
            'Assistant/Assistant.json': {'name':'Ask {alias}','welcome':'Meet {name}. Email: {email}.','suggestions':[], 'questions':[]}
        }
        for relative,value in personal.items():
            path=self.root/'Desktop'/relative
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(json.dumps(value),encoding='utf-8')
        for filename in ('Introduction.txt','Bio.txt'):
            (self.root/'Desktop/About me'/filename).write_text('I am {name}.',encoding='utf-8')

    def photo(self, name, color='red', **options):
        path = self.root / 'Desktop/Projects/New event' / name
        path.parent.mkdir(parents=True, exist_ok=True)
        Image.new('RGB', (1200, 600), color).save(path, **options)
        return path

    def build(self, **options):
        with contextlib.redirect_stdout(io.StringIO()):
            return build(self.root, **options)

    def manifest(self, base):
        text = (base / 'assets/content.js').read_text(encoding='utf-8')
        return json.loads(text.split('window.PORTFOLIO = ', 1)[1].rstrip(';\n'))

    def test_only_desktop_upload_needed_and_originals_unchanged(self):
        paths = [self.photo('nested/ছবি #1.jpg'), self.photo('nested/ছবি #1.png', 'blue')]
        original_bytes = [path.read_bytes() for path in paths]
        data = self.build(require_thumbnails=True)
        nodes = list(image_nodes(data['desktop']))
        self.assertEqual(2, len(nodes))
        self.assertEqual(2, len({node['thumbnail'] for node in nodes}))
        self.assertFalse((self.root / 'assets/thumbnails').exists())
        for node in nodes:
            with Image.open(self.root / '_site' / node['thumbnail']) as thumbnail:
                self.assertLessEqual(thumbnail.width, 420)
                self.assertLessEqual(thumbnail.height, 320)
            self.assertEqual((self.root / node['path']).read_bytes(),
                             (self.root / '_site' / node['path']).read_bytes())
        self.assertEqual(original_bytes, [path.read_bytes() for path in paths])
        self.assertTrue(all('thumbnail' not in node for node in image_nodes(self.manifest(self.root)['desktop'])))
        self.assertEqual(data, self.manifest(self.root / '_site'))

    def test_replace_rename_delete_refreshes_previews(self):
        original = self.photo('event.jpg')
        data = self.build()
        old_node = next(image_nodes(data['desktop']))
        old_thumb = self.root / '_site' / old_node['thumbnail']
        before = old_thumb.read_bytes()
        self.photo('event.jpg', 'blue')
        self.build()
        self.assertNotEqual(before, old_thumb.read_bytes())
        renamed = original.with_name('renamed.jpg')
        original.rename(renamed)
        data = self.build()
        self.assertFalse(old_thumb.exists())
        current = next(image_nodes(data['desktop']))
        self.assertEqual('renamed.jpg', current['name'])
        renamed.unlink()
        self.assertEqual([], list(image_nodes(self.build()['desktop'])))
        self.assertFalse((self.root / '_site' / current['thumbnail']).exists())

    def test_exif_orientation_and_transparency(self):
        exif = Image.Exif()
        exif[274] = 6
        self.photo('rotated.jpg', exif=exif)
        alpha = self.root / 'Desktop/transparent.png'
        Image.new('RGBA', (80, 40), (255, 0, 0, 0)).save(alpha)
        nodes = {node['name']: node for node in image_nodes(self.build()['desktop'])}
        with Image.open(self.root / '_site' / nodes['rotated.jpg']['thumbnail']) as preview:
            self.assertGreater(preview.height, preview.width)
        with Image.open(self.root / '_site' / nodes['transparent.png']['thumbnail']) as preview:
            self.assertEqual(0, preview.getpixel((0, 0))[3])

    def test_unreadable_images_and_svg_keep_original_paths(self):
        (self.root / 'Desktop/broken.jpg').write_bytes(b'not an image')
        (self.root / 'Desktop/icon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
        self.photo('good.jpg')
        nodes = {node['name']: node for node in image_nodes(self.build()['desktop'])}
        self.assertIn('thumbnail', nodes['good.jpg'])
        for name in ('broken.jpg', 'icon.svg'):
            self.assertNotIn('thumbnail', nodes[name])
            self.assertTrue((self.root / '_site' / nodes[name]['path']).exists())

    def test_basic_local_preview_needs_no_pillow(self):
        self.photo('event.jpg')
        with patch.dict('sys.modules', {'PIL': None}):
            data = self.build()
            self.assertNotIn('thumbnail', next(image_nodes(data['desktop'])))
            self.build(export=False)
            with self.assertRaisesRegex(RuntimeError, 'Install build dependencies'):
                self.build(require_thumbnails=True)

    def test_legacy_thumbnail_copies_are_not_exported(self):
        legacy = self.root / 'assets/thumbnails/old.jpg'
        legacy.parent.mkdir(parents=True)
        legacy.write_bytes(b'legacy')
        self.photo('event.jpg')
        self.build()
        self.assertFalse((self.root / '_site/assets/thumbnails/old.jpg').exists())

    def test_added_and_removed_folder_change_manifest_cache_key(self):
        def key():
            html = (self.root / '_site/index.html').read_text(encoding='utf-8')
            return re.search(r'assets/content\.js\?v=([a-f0-9]{16})', html).group(1)
        source_html = (self.root / 'index.html').read_bytes()
        self.build()
        original_key = key()
        self.build()
        self.assertEqual(original_key, key())
        folder = self.root / 'Desktop/Projects/TEST'
        folder.mkdir()
        text = folder / 'about.txt'
        text.write_text('This folder was added on GitHub.', encoding='utf-8')
        data = self.build()
        added_key = key()
        self.assertNotEqual(original_key, added_key)
        project_root = next(node for node in data['desktop']['children'] if node['name']=='Projects')
        self.assertIn('TEST', [node['name'] for node in project_root['children']])
        text.write_text('Updated folder text.', encoding='utf-8')
        self.build()
        self.assertNotEqual(added_key, key())
        text.unlink()
        folder.rmdir()
        self.build()
        self.assertEqual(original_key, key())
        self.assertEqual(source_html, (self.root / 'index.html').read_bytes())

    def test_personal_files_drive_apps_assistant_and_social_links(self):
        profile=self.root/'Desktop/About me/Profile.json'
        value=json.loads(profile.read_text())
        value.update(name='Md. Nazim Uddin Noyon',alias='Sensei NUB')
        profile.write_text(json.dumps(value),encoding='utf-8')
        contact=self.root/'Desktop/Contact/Contact.json'
        value=json.loads(contact.read_text())
        value['links']=[{'label':'Instagram','url':'https://www.instagram.com/sensei_nub.gg/','icon':'image'}]
        contact.write_text(json.dumps(value),encoding='utf-8')
        data=self.build()
        self.assertEqual('Sensei NUB',data['profile']['alias'])
        self.assertEqual('I am Md. Nazim Uddin Noyon.',data['profile']['intro'])
        self.assertEqual('Ask Sensei NUB',data['assistant']['name'])
        self.assertIn('Md. Nazim Uddin Noyon',data['assistant']['welcome'])
        self.assertEqual(value['links'],data['profile']['links'])
        apps={node['app'] for node in data['desktop']['children'] if 'app' in node}
        self.assertEqual({'profile','experience','skills','contact','chat'},apps)
        self.assertFalse((self.root/'config/profile.json').exists())

    def test_common_and_iphone_images_preserve_original_files(self):
        from pillow_heif import register_heif_opener
        register_heif_opener()
        for extension in ('png','jpg','jpeg','webp','bmp','avif','tiff'):
            self.photo('image.'+extension)
        self.photo('phone.heic',format='HEIF')
        gif=self.root/'Desktop/Projects/New event/animated.GIF'
        Image.new('RGB',(60,40),'red').save(gif,save_all=True,append_images=[Image.new('RGB',(60,40),'blue')],duration=100,loop=0)
        nodes={node['name']:node for node in image_nodes(self.build(require_thumbnails=True)['desktop'])}
        self.assertEqual(9,len(nodes))
        for node in nodes.values():
            self.assertTrue((self.root/'_site'/node['thumbnail']).exists())
            self.assertEqual((self.root/node['path']).read_bytes(),(self.root/'_site'/node['path']).read_bytes())
        for name in ('image.tiff','phone.heic'):
            with Image.open(self.root/'_site'/nodes[name]['preview']) as preview:
                self.assertEqual((1200,600),preview.size)
        with Image.open(self.root/'_site'/nodes['animated.GIF']['path']) as original:
            self.assertEqual(2,original.n_frames)

    def test_documents_media_and_unknown_files_are_all_indexed(self):
        expected={'clip.MP4':'video','movie.webm':'video','sound.mp3':'audio','manual.PDF':'pdf',
                  'readme.txt':'text','notes.md':'text','archive.zip':'file','slides.pptx':'file','report.docx':'file','data.xlsx':'file','binary.custom':'file'}
        for name in expected:
            (self.root/'Desktop/Projects/New event'/name).write_bytes(b'example content')
        data=self.build()
        projects=next(node for node in data['desktop']['children'] if node['name']=='Projects')
        files=projects['children'][0]['children']
        self.assertEqual(expected,{node['name']:node['kind'] for node in files})
        for node in files:self.assertTrue((self.root/'_site'/node['path']).exists())


if __name__ == '__main__':
    unittest.main()
