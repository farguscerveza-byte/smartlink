// Vercel Edge Middleware: "preferred streaming service" smart redirect.
//
// If a returning visitor previously clicked a DSP link (see the click handler
// in each releases/<slug>/index.html), a `preferred_dsp` cookie is set with
// Domain=.hearjamesbeer.com so it's readable across every subdomain. On the
// next visit to any release's root path, redirect straight to that DSP if
// this release offers it — otherwise fall through to the normal landing page.
//
// Add new releases here (hostname -> platform -> URL) alongside the usual
// steps (releases/<slug>/, _assets/<slug>/, vercel.json rewrite, DNS/domain).
const RELEASE_LINKS = {
  'sib.hearjamesbeer.com': {
    spotify: 'https://open.spotify.com/track/77CpblGVheQxfusN80JB3R?si=eee26fcb186a495e',
    apple_music: 'https://music.apple.com/us/song/something-in-between/6771992859',
    tidal: 'https://tidal.com/album/526963580'
  }
};

export const config = {
  matcher: ['/']
};

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  const links = RELEASE_LINKS[host];
  if (!links) return;

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)preferred_dsp=([^;]+)/);
  const preferred = match && decodeURIComponent(match[1]);
  if (!preferred) return;

  const url = links[preferred];
  if (!url) return;

  return Response.redirect(url, 302);
}
