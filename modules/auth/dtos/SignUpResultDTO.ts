import type { SafeUserDocument } from "@/models/users";


interface SignUpResultDTO {
  readonly target: SafeUserDocument;
}

export default SignUpResultDTO;
