import Service from "@/core/service";
import SignUpResultDTO from "@/modules/auth/dtos/SignUpResultDTO";
import SignUpRequestDTO from "@/modules/auth/dtos/SignUpRequestDTO";


abstract class SignUpController implements Service<never, SignUpResultDTO> {
  public abstract execute(): Promise<SignUpResultDTO>; 
  protected abstract _getCredentials(): SignUpRequestDTO | Promise<SignUpRequestDTO>;
}

export default SignUpController;
