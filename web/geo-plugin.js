// Shows a proximity hint if the user is near a known site.
const GeoPlugin = (() => {
  const R = 6371; // km
  let SITES = null;

  const toRad = d => d * Math.PI / 180;
  function haversine(lat1, lon1, lat2, lon2) {
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  // URL overrides for easy demo/testing
  function getNearbyOverride() {
    try {
      const p = new URLSearchParams(location.search).get('nearby');
      if (!p) return null;
      if (p === '1' || p === 'on' || p === 'true' || p.toLowerCase() === 'giza') {
        return { lat: 29.9792, lon: 31.1342, label: 'demo' }; // Giza Pyramids
      }
      if (p.includes(',')) {
        const [a,b] = p.split(',').map(s => parseFloat(s.trim()));
        if (Number.isFinite(a) && Number.isFinite(b)) return { lat: a, lon: b, label: 'demo' };
      }
    } catch(_) {}
    return null;
  }

  function getRadiusOverride() {
    try {
      const v = parseFloat(new URLSearchParams(location.search).get('radiusKm'));
      if (Number.isFinite(v) && v > 0) return v;
    } catch(_) {}
    return null;
  }

  async function loadSites(url = "./geo-sites.json") {
    if (SITES) return SITES;
    const res = await fetch(url);
    const j = await res.json();
    SITES = j.sites || [];
    return SITES;
  }

  async function checkNearby({ maxKm = 1.5, containerId = "nearbyPanel" } = {}) {
    await loadSites();
    const el = document.getElementById(containerId);
    if (!el) return;

    const radiusOverride = getRadiusOverride();
    if (Number.isFinite(radiusOverride)) maxKm = radiusOverride;

    const override = getNearbyOverride();
    const render = (lat, lon, isDemo = false) => {
      let best = null;
      for (const s of SITES) {
        const d = haversine(lat, lon, s.lat, s.lon);
        if (d <= maxKm && (!best || d < best.d)) best = { ...s, d };
      }
      if (!best) { el.style.display = "none"; return; }
      el.style.display = "block";
      const demoBadge = isDemo ? '<span class="pill" style="margin-left:6px;font-size:11px;background:#eef">demo</span>' : '';
      el.innerHTML = `
        <div style="background:#fff3; backdrop-filter:blur(4px); border:1px solid #0002; border-radius:10px; padding:10px;">
          <strong>Nearby • قريب</strong> ${demoBadge}<br/>
          <span>${best.name_en} — ${best.name_ar}</span><br/>
          <span style="font-size:12px;color:#555">~${best.d.toFixed(2)} km</span>
        </div>`;
    };

    if (override) {
      render(override.lat, override.lon, true);
      return;
    }

    if (!navigator.geolocation) { el.style.display = "none"; return; }
    navigator.geolocation.getCurrentPosition(
      pos => render(pos.coords.latitude, pos.coords.longitude, false),
      _err => { el.style.display = "none"; },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  }

  return { checkNearby };
})();