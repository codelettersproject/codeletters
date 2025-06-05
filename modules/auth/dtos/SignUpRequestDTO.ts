interface SignUpRequestDTO {
  emailAddress: string;
  displayName: string;
  password?: string;
  name?: string;
  kind?: "e/p" | "e_oauth"
}

export default SignUpRequestDTO;
