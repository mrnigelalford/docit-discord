import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// I like to define them explicitly so devs know what's out there.
type SECRETS = "SOME_ENV_VAR" | "SOME_OTHER_ONE";

const secretmanagerClient = new SecretManagerServiceClient();

export async function callGetSecret(id: string) {
  // Run request
  const [version] = await secretmanagerClient.accessSecretVersion({ name: `projects/958507032882/secrets/${id}/versions/latest` });
  return version.payload.data.toString();
}