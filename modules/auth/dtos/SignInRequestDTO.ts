import type { RequestInet } from "@/_types";


interface SignInRequestDTO {
  identifier: string;
  password: string;
  _$inet?: RequestInet;
}

export default SignInRequestDTO;
