import r from "@/core/middlewares/r";
import EmailAndPasswordSignUpService from "@/modules/auth/services/EmailAndPasswordSignUpService";


export default r(["POST"], EmailAndPasswordSignUpService.handle);
