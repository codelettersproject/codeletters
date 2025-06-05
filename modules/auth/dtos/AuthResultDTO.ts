import type { SafeSessionDocument } from "@/models/sessions";
import type { SafeUserDocument, UserMetadata } from "@/models/users";


interface AuthResultDTO {
  readonly target: SafeUserDocument;
  readonly session: SafeSessionDocument<{
    readonly role: string;
    readonly meta: UserMetadata;
  }>;
}

export default AuthResultDTO;
