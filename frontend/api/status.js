import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { Storage } from '@google-cloud/storage';

const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

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

function getOutputBlobName(inputBlobName) {
  return inputBlobName.replace('.mp3', '_podcast.wav');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: 'filename is required' });
  }

  try {
    const storage = await getAuthenticatedStorage();

    const outputBlobName = getOutputBlobName(filename);
    const bucket = storage.bucket(process.env.OUTPUT_BUCKET);
    const file = bucket.file(outputBlobName);

    const [exists] = await file.exists();

    if (!exists) {
      return res.status(200).json({ status: 'processing' });
    }

    // Check for metadata sidecar (optional — if you added it to Cloud Run)
    let metadata = null;
    try {
      const metaFile = bucket.file(outputBlobName.replace('_podcast.wav', '_podcast_meta.json'));
      const [metaExists] = await metaFile.exists();
      if (metaExists) {
        const [contents] = await metaFile.download();
        metadata = JSON.parse(contents.toString());
      }
    } catch (_) {
      // metadata is optional, silently skip
    }

    const [podcastUrl] = await file.generateSignedUrl({
      action: 'read',
      expires: Date.now() + SIGNED_URL_EXPIRY * 1000,
    });

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
    return res.status(500).json({ error: 'Failed to check status' });
  }
}