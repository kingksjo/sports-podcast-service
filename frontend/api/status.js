import { getGcpAccessToken } from './_gcp-auth.js';

function getOutputBlobName(inputBlobName) {
  return inputBlobName.replace('.mp3', '_podcast.wav');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { filename } = req.query;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  try {
    const token = await getGcpAccessToken();
    const outputBlobName = getOutputBlobName(filename);
    const bucket = process.env.OUTPUT_BUCKET;

    // Check if output file exists via GCS JSON API
    const checkRes = await fetch(
  `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(outputBlobName)}`,
  { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log('Token prefix:', token?.slice(0, 10));
  console.log('GCS status:', checkRes.status);
  const responseText = await checkRes.text();
  console.log('GCS response body:', responseText);

  if (checkRes.status === 404) {
    return res.status(200).json({ status: 'processing' });
  }

  if (!checkRes.ok) {
    throw new Error(`GCS check failed: ${checkRes.status} — ${responseText}`);
  }

    // Try metadata sidecar
    let metadata = null;
    const metaBlobName = outputBlobName.replace('_podcast.wav', '_podcast_meta.json');
    const metaRes = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(metaBlobName)}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (metaRes.ok) {
      metadata = await metaRes.json();
    }

    // Generate signed GET URL for audio
    const podcastUrl = await generateV4SignedGetUrl(token, bucket, outputBlobName);

    return res.status(200).json({
      status: 'ready',
      podcastUrl,
      ...(metadata && {
        sport: metadata.sport,
        match_title: metadata.match_title,
        overview: metadata.overview,
      }),
    });
  } catch (err) {
    console.error('status error:', err);
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