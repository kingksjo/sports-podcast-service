import { randomUUID } from 'crypto';
import { getGcpAccessToken } from './_gcp-auth.js';

const ALLOWED_EXTENSIONS = ['.mp3'];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { filename } = req.query;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return res.status(400).json({ error: 'Only .mp3 files are allowed' });

  try {
    const token = await getGcpAccessToken();
    const blobName = `${randomUUID()}-${filename}`;
    const bucket = process.env.INPUT_BUCKET;
    const expiry = Math.floor(Date.now() / 1000) + 15 * 60; // 15 min

    // Use GCS XML API to generate a signed URL via service account impersonation
    const url = `https://storage.googleapis.com/${bucket}/${encodeURIComponent(blobName)}`;

    // Use signBlob via IAM Credentials API to create a V4 signed URL
    const signedUrl = await generateV4SignedPutUrl(token, bucket, blobName, expiry);

    return res.status(200).json({ signedUrl, blobName });
  } catch (err) {
    console.error('upload-url error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function generateV4SignedPutUrl(accessToken, bucket, blobName, expiresEpoch) {
  const SA = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const now = new Date();
  const datestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const datetime = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const expireSeconds = expiresEpoch - Math.floor(Date.now() / 1000);

  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential = `${SA}/${credentialScope}`;

  const headers = `content-type:audio/mpeg\nhost:storage.googleapis.com\n`;
  const signedHeaders = `content-type;host`;

  const canonicalRequest = [
    'PUT',
    `/${bucket}/${blobName}`,
    `X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=${encodeURIComponent(credential)}&X-Goog-Date=${datetime}&X-Goog-Expires=${expireSeconds}&X-Goog-SignedHeaders=${signedHeaders}`,
    headers,
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

  // Sign using IAM signBlob API (uses our access token)
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

  const signedUrl =
    `https://storage.googleapis.com/${bucket}/${encodeURIComponent(blobName)}` +
    `?X-Goog-Algorithm=GOOG4-RSA-SHA256` +
    `&X-Goog-Credential=${encodeURIComponent(credential)}` +
    `&X-Goog-Date=${datetime}` +
    `&X-Goog-Expires=${expireSeconds}` +
    `&X-Goog-SignedHeaders=${signedHeaders}` +
    `&X-Goog-Signature=${signature}`;

  return signedUrl;
}