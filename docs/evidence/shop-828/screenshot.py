from pathlib import Path
from sys import argv
from playwright.sync_api import sync_playwright

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 762})
    for directory in argv[1:]:
        for file in sorted(Path(directory).resolve().glob('cold-*.html')):
            page.set_content(file.read_text(encoding="utf-8"))
            page.evaluate("document.fonts.ready")
            page.screenshot(path=str(file.with_suffix('.png')))
    browser.close()
