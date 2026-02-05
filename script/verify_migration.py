#!/usr/bin/env python3
"""
One-time verification: Compare migrated Starlight site against live esphome.io

Usage:
    npm run build  # Build site first
    pip install requests beautifulsoup4
    python script/verify_migration.py
"""

import re
import sys
from pathlib import Path
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Run: pip install requests beautifulsoup4")
    sys.exit(1)

LIVE_SITE = "https://esphome.io"
DIST_DIR = Path("dist")


def local_to_live_url(local_path: str) -> str:
    """Convert local dist path to live site URL.

    Starlight: /components/sensor/dht/index.html
    Hugo:      /components/sensor/dht.html
    """
    # Remove index.html and add .html
    if local_path.endswith("/index.html"):
        path = local_path[:-11] + ".html"  # Remove /index.html, add .html
    elif local_path == "index.html":
        path = "/"  # Homepage
    else:
        path = "/" + local_path

    # Handle root
    if path == ".html":
        path = "/"

    return urljoin(LIVE_SITE, path)


def extract_content(html: str) -> dict:
    """Extract comparable content from HTML."""
    soup = BeautifulSoup(html, 'html.parser')

    # Title
    title = soup.find('title')
    title_text = title.get_text().strip() if title else ""
    # Remove site name suffix if present
    title_text = re.sub(r'\s*[|—-]\s*ESPHome.*$', '', title_text)

    # Main content area - try multiple selectors
    main = (
        soup.find('article') or
        soup.find('main') or
        soup.find(class_='content') or
        soup.find(class_='document')
    )

    content_text = ""
    if main:
        # Remove nav, aside, and other non-content elements
        for elem in main.find_all(['nav', 'aside', 'footer', 'script', 'style']):
            elem.decompose()
        content_text = main.get_text(separator=' ', strip=True)
        # Normalize whitespace
        content_text = re.sub(r'\s+', ' ', content_text)

    # Headings
    headings = []
    for h in soup.find_all(['h1', 'h2', 'h3']):
        text = h.get_text().strip()
        # Remove anchor links like "¶" or "#"
        text = re.sub(r'[¶#]$', '', text).strip()
        if text:
            headings.append(text.lower())

    return {
        'title': title_text,
        'content': content_text,
        'headings': set(headings),
        'content_length': len(content_text),
    }


def word_similarity(s1: str, s2: str) -> float:
    """Calculate Jaccard similarity based on words."""
    words1 = set(re.findall(r'\w+', s1.lower()))
    words2 = set(re.findall(r'\w+', s2.lower()))

    if not words1 or not words2:
        return 0.0

    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union)


def check_page(local_file: Path) -> dict:
    """Compare a single page against live site."""
    rel_path = str(local_file.relative_to(DIST_DIR))
    live_url = local_to_live_url(rel_path)

    result = {
        'local': rel_path,
        'live_url': live_url,
        'status': 'ok',
        'issues': [],
        'similarity': 1.0,
    }

    # Skip non-doc pages
    skip_patterns = ['404', 'pagefind', 'sitemap', '_astro']
    if any(p in rel_path for p in skip_patterns):
        result['status'] = 'skipped'
        return result

    # Read local file
    try:
        local_html = local_file.read_text(encoding='utf-8')
        local_data = extract_content(local_html)
    except Exception as e:
        result['status'] = 'error'
        result['issues'].append(f"Failed to read local: {e}")
        return result

    # Fetch live page
    try:
        resp = requests.get(live_url, timeout=15, allow_redirects=True)

        if resp.status_code == 404:
            result['status'] = 'new_page'
            return result

        if resp.status_code != 200:
            result['status'] = 'error'
            result['issues'].append(f"HTTP {resp.status_code}")
            return result

        live_data = extract_content(resp.text)

    except requests.exceptions.Timeout:
        result['status'] = 'error'
        result['issues'].append("Timeout")
        return result
    except Exception as e:
        result['status'] = 'error'
        result['issues'].append(f"Failed to fetch: {e}")
        return result

    # Compare content
    similarity = word_similarity(local_data['content'], live_data['content'])
    result['similarity'] = similarity

    if similarity < 0.5:
        result['status'] = 'content_diff'
        result['issues'].append(f"Low similarity: {similarity:.0%}")
    elif similarity < 0.7:
        result['status'] = 'content_diff'
        result['issues'].append(f"Moderate diff: {similarity:.0%}")

    # Check if major headings are missing
    if local_data['headings'] and live_data['headings']:
        missing_headings = live_data['headings'] - local_data['headings']
        # Only flag if significant headings are missing
        significant_missing = [h for h in missing_headings if len(h) > 3]
        if len(significant_missing) > 3:
            result['issues'].append(f"Missing {len(significant_missing)} headings")

    return result


def main():
    if not DIST_DIR.exists():
        print(f"Error: {DIST_DIR} not found. Run 'npm run build' first.")
        sys.exit(1)

    # Find all HTML files
    html_files = list(DIST_DIR.rglob("*.html"))
    print(f"Found {len(html_files)} HTML files to verify\n")

    results = {
        'ok': [],
        'new_page': [],
        'content_diff': [],
        'error': [],
        'skipped': [],
    }

    # Process with thread pool
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_page, f): f for f in html_files}

        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            results[result['status']].append(result)

            # Progress indicator
            status_char = {
                'ok': '.',
                'new_page': '+',
                'content_diff': '!',
                'error': 'x',
                'skipped': '-',
            }[result['status']]

            print(status_char, end='', flush=True)
            if i % 80 == 0:
                print(f" [{i}/{len(html_files)}]")

    print(f"\n\n{'='*50}")
    print("RESULTS")
    print('='*50)
    print(f"  OK (match):        {len(results['ok']):4d}")
    print(f"  New pages:         {len(results['new_page']):4d}")
    print(f"  Content diff:      {len(results['content_diff']):4d}")
    print(f"  Errors:            {len(results['error']):4d}")
    print(f"  Skipped:           {len(results['skipped']):4d}")
    print('='*50)

    total_compared = len(results['ok']) + len(results['content_diff'])
    if total_compared > 0:
        match_rate = len(results['ok']) / total_compared * 100
        print(f"\nMatch rate: {match_rate:.1f}%")

    # Show content differences
    if results['content_diff']:
        print(f"\n--- Pages with content differences ({len(results['content_diff'])}) ---")
        # Sort by similarity (worst first)
        sorted_diffs = sorted(results['content_diff'], key=lambda x: x['similarity'])
        for r in sorted_diffs[:30]:
            print(f"  {r['similarity']:5.0%}  {r['local']}")
            for issue in r['issues']:
                print(f"         {issue}")

    # Show errors
    if results['error']:
        print(f"\n--- Errors ({len(results['error'])}) ---")
        for r in results['error'][:20]:
            print(f"  {r['local']}: {', '.join(r['issues'])}")

    # Show new pages
    if results['new_page']:
        print(f"\n--- New pages not on live site ({len(results['new_page'])}) ---")
        for r in results['new_page'][:20]:
            print(f"  {r['local']}")
        if len(results['new_page']) > 20:
            print(f"  ... and {len(results['new_page']) - 20} more")

    # Exit code based on match rate
    if total_compared > 0 and match_rate >= 90:
        print("\n✓ Verification PASSED")
        return 0
    else:
        print("\n✗ Verification needs review")
        return 1


if __name__ == '__main__':
    sys.exit(main())
