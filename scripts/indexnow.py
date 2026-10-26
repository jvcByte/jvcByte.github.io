#!/usr/bin/env python3
"""Submit every URL in sitemap.xml to IndexNow.

The key is public by design: it proves control of the host because only the
owner can place it at the web root. Run this after a deploy.
"""
import json
import re
import sys
import urllib.error
import urllib.request

KEY = "414c09aa3c5981352bbf4ea238037c99"
HOST = "www.jvcbyte.dev"
ENDPOINT = "https://api.indexnow.org/indexnow"


def main() -> int:
    urls = re.findall(r"<loc>(.*?)</loc>", open("sitemap.xml", encoding="utf-8").read())
    if not urls:
        print("no URLs found in sitemap.xml")
        return 1

    body = {
        "host": HOST,
        "key": KEY,
        "keyLocation": f"https://{HOST}/{KEY}.txt",
        "urlList": urls,
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        r = urllib.request.urlopen(req, timeout=30)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}")
        return 1
    print(f"submitted {len(urls)} URLs -> HTTP {r.status}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
