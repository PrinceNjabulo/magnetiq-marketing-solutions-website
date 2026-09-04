import { promises as dns } from "node:dns";
import { CrawlError } from "@/lib/errors";

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 0) return true; // 0.0.0.0/8
  if (a >= 224) return true; // multicast/reserved

  return false;
}

// Minimal expander that only needs to be correct enough to read the first
// hextet — not a general-purpose IPv6 parser (Node's dns.lookup already
// validated the address).
function firstHextet(ip: string): number {
  const [head] = ip.split("::");
  const headParts = head ? head.split(":").filter(Boolean) : [];
  const value = ip.includes("::") ? headParts[0] ?? "0" : ip.split(":")[0];
  const parsed = parseInt(value || "0", 16);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("::ffff:")) {
    const v4 = lower.slice("::ffff:".length);
    if (v4.includes(".") && isPrivateIPv4(v4)) return true;
  }

  const first = firstHextet(lower);
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local

  return false;
}

export function isPrivateIp(ip: string): boolean {
  return ip.includes(":") ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

// Resolves the hostname and rejects it if any address is private/loopback/
// link-local. This blocks the common SSRF case (a public domain whose DNS
// record points at an internal address) but doesn't pin the resolved IP for
// the actual connection, so it isn't proof against DNS-rebinding attacks —
// full pinning is deferred to Phase 8 hardening.
export async function assertPublicHostname(hostname: string): Promise<void> {
  let addresses: string[];
  try {
    const results = await dns.lookup(hostname, { all: true, verbatim: true });
    addresses = results.map((r) => r.address);
  } catch {
    throw new CrawlError("We couldn't resolve this domain.");
  }

  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw new CrawlError("This URL points to a private or internal address, which we can't audit.");
  }
}
