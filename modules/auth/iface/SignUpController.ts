import Service from "@/core/service";
import AuthResultDTO from "@/modules/auth/dtos/AuthResultDTO";
import SignUpRequestDTO from "@/modules/auth/dtos/SignUpRequestDTO";


abstract class SignUpController implements Service<never, AuthResultDTO> {
  public abstract execute(): Promise<AuthResultDTO>; 
  protected abstract _getCredentials(): SignUpRequestDTO | Promise<SignUpRequestDTO>;
}

export default SignUpController;
