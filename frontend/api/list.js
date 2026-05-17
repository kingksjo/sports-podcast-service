import { getGcpAccessToken } from './_gcp-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await getGcpAccessToken();
    const bucket = process.env.OUTPUT_BUCKET;

    // List all objects in the output bucket
    const listRes = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${bucket}/o`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!listRes.ok) {
      const errText = await listRes.text();
      throw new Error(`GCS list failed: ${listRes.status} — ${errText}`);
    }

    const listData = await listRes.json();
    const allItems = listData.items || [];

    // Filter to only completed podcast audio files
    const audioBlobs = allItems
      .map((item) => item.name)
      .filter((name) => name.endsWith('_podcast.wav'));

    if (audioBlobs.length === 0) {
      return res.status(200).json({ podcasts: [] });
    }

    // For each audio blob, fetch its metadata sidecar and generate a signed URL — in parallel
    const podcasts = await Promise.all(
      audioBlobs.map(async (blobName) => {
        const metaBlobName = blobName.replace('_podcast.wav', '_podcast_meta.json');

        // Fetch metadata sidecar (best-effort — non-fatal if missing)
        let metadata = null;
        try {
          const metaRes = await fetch(
            `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(metaBlobName)}?alt=media`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (metaRes.ok) {
            metadata = await metaRes.json();
          }
        } catch (_) {
          // Metadata missing — continue without it
        }

        // Generate a 1-hour signed GET URL for the audio
        const podcastUrl = await generateV4SignedGetUrl(token, bucket, blobName);

        return {
          blobName,
          podcastUrl,
          sport: metadata?.sport ?? null,
          match_title: metadata?.match_title ?? null,
          overview: metadata?.overview ?? null,
        };
      })
    );

    // Sort newest-first (UUID-prefixed blob names contain upload order implicitly;
    // fall back to lexicographic descending which approximates recency)
    podcasts.sort((a, b) => b.blobName.localeCompare(a.blobName));

    return res.status(200).json({ podcasts });
  } catch (err) {
    console.error('list error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function generateV4SignedGetUrl(accessToken, bucket, blobName) {
  const SA = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const now = new Date();
  const datestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const datetime = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const expireSeconds = 3600; // 1 hour

  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential = `${SA}/${credentialScope}`;
  const signedHeaders = 'host';

  const canonicalRequest = [
    'GET',
    `/${bucket}/${blobName}`,
    `X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=${encodeURIComponent(credential)}&X-Goog-Date=${datetime}&X-Goog-Expires=${expireSeconds}&X-Goog-SignedHeaders=${signedHeaders}`,
    `host:storage.googleapis.com\n`,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const crypto = await import('crypto');
  const hashedRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

  const stringToSign = [
    'GOOG4-RSA-SHA256',
    datetime,
    credentialScope,
    hashedRequest,
  ].join('\n');

  const signResponse = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SA}:signBlob`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: Buffer.from(stringToSign).toString('base64') }),
    }
  );

  const { signedBlob } = await signResponse.json();
  const signature = Buffer.from(signedBlob, 'base64').toString('hex');

  return (
    `https://storage.googleapis.com/${bucket}/${encodeURIComponent(blobName)}` +
    `?X-Goog-Algorithm=GOOG4-RSA-SHA256` +
    `&X-Goog-Credential=${encodeURIComponent(credential)}` +
    `&X-Goog-Date=${datetime}` +
    `&X-Goog-Expires=${expireSeconds}` +
    `&X-Goog-SignedHeaders=${signedHeaders}` +
    `&X-Goog-Signature=${signature}`
  );
}
