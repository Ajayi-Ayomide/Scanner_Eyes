#!/usr/bin/env python3
import miniupnpc, argparse

ap = argparse.ArgumentParser()
ap.add_argument("--external_port", type=int, required=True)
ap.add_argument("--internal_port", type=int, required=True)
ap.add_argument("--proto", default="TCP")
ap.add_argument("--action", choices=["add","delete"], required=True)
args = ap.parse_args()

u = miniupnpc.UPnP()
u.discoverdelay = 200
n = u.discover()
u.selectigd()

if args.action == "add":
    ok = u.addportmapping(args.external_port, args.proto, u.lanaddr, args.internal_port, "Pi demo mapping", "")
    print("ADD:", ok)
else:
    ok = u.deleteportmapping(args.external_port, args.proto)
    print("DEL:", ok)
