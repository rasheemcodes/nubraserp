import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RolesModule } from "../roles/roles.module";

@Module({
    imports: [RolesModule],
    providers: [AuthService],
    controllers: []
})
export class AuthModule {}