import r from "@/core/middlewares/r";
import AuthenticateUserWithEmailAndPasswordService from "@/modules/auth/services/AuthenticateUserWithEmailAndPasswordService";


export default r(["POST"], AuthenticateUserWithEmailAndPasswordService.handle);
