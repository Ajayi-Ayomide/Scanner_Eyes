#!/usr/bin/env python3
import json, argparse, os, sys
from datetime import datetime

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api_key", default=os.getenv("SHODAN_API_KEY"), help="Shodan API key")
    ap.add_argument("--query", default='port:554 product:"RTSP"', help='Shodan query, e.g. port:554 country:NG')
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--out", default=f"shodan_rtsp_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    args = ap.parse_args()

    if not args.api_key:
        print("Set --api_key or export SHODAN_API_KEY", file=sys.stderr)
        sys.exit(1)

    import shodan
    api = shodan.Shodan(args.api_key)

    results = []
    try:
        for res in api.search_cursor(args.query):
            item = {
                "ip_str": res.get("ip_str"),
                "port": res.get("port"),
                "org": res.get("org"),
                "location": res.get("location", {}),
                "product": res.get("product"),
                "transport": res.get("transport"),
                "hostnames": res.get("hostnames"),
                "tags": res.get("tags"),
            }
            results.append(item)
            if len(results) >= args.limit:
                break
    except shodan.exception.APIError as e:
        print(f"Shodan error: {e}", file=sys.stderr)
        sys.exit(2)

    with open(args.out, "w") as f:
        json.dump({"query": args.query, "count": len(results), "results": results}, f, indent=2)
    print(f"[✓] Saved {len(results)} results to {args.out}")

if __name__ == "__main__":
    main()
