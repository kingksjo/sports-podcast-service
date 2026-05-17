import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

const ALLOWED_EXTENSIONS = ['.mp3'];
const SIGNED_URL_EXPIRY = 15 * 60; // 15 minutes in seconds

async function getAuthenticatedStorage() {
  const oidcToken = await getVercelOidcToken();

  const credConfig = {
    type: 'external_account',
    audience: `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: async () => oidcToken,
    },
  };

  const authClient = ExternalAccountClient.fromJSON(credConfig);
  const { token } = await authClient.getAccessToken();

  const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    authClient: {
      // Duck-type a minimal auth object that Storage accepts
      getRequestHeaders: async () => ({ Authorization: `Bearer ${token}` }),
      getAccessToken: async () => ({ token }),
    },
  });

  return storage;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: 'filename is required' });
  }

  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({ error: 'Only .mp3 files are allowed' });
  }

  try {
    const storage = await getAuthenticatedStorage();

    const blobName = `${randomUUID()}-${filename}`;
    const bucket = storage.bucket(process.env.INPUT_BUCKET);
    const file = bucket.file(blobName);

    const [signedUrl] = await file.generateSignedPostPolicyV4({
      expires: Date.now() + SIGNED_URL_EXPIRY * 1000,
      conditions: [
        ['content-length-range', 0, 100 * 1024 * 1024], // max 100MB
        ['eq', '$Content-Type', 'audio/mpeg'],
      ],
      fields: { 'Content-Type': 'audio/mpeg' },
    });

    return res.status(200).json({ signedUrl, blobName });
  } catch (err) {
    console.error('upload-url error:', err);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}