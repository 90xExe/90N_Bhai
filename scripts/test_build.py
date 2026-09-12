"""Behavior checks for adding images once, under Desktop/."""
import contextlib
import io
import json
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
        (self.root / 'index.html').write_text('<html></html>', encoding='utf-8')
        (self.root / 'config/profile.json').write_text('{}', encoding='utf-8')
        (self.root / 'config/assistant.json').write_text('{"questions":[]}', encoding='utf-8')

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


if __name__ == '__main__':
    unittest.main()
