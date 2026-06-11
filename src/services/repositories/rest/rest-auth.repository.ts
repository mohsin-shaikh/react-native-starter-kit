import type {
  AuthRepository,
  AuthSession,
  AuthTokens,
  LoginCredentials,
  SignupData,
} from "@/services/auth/auth.types";
import type { HttpClient } from "@/services/api/types";
import type { User } from "@/types";

/**
 * EXAMPLE real backend (REST). Not wired up yet — it shows the pattern:
 * a repository is a THIN translation layer between the domain contract and a
 * specific transport. To go live you would:
 *   1. set EXPO_PUBLIC_USE_MOCKS=false
 *   2. select this in repositories/index.ts
 *   3. adjust the paths / response mapping to match your API
 *
 * For Supabase/Firebase the same interface is implemented against their SDK
 * instead of an HttpClient — screens stay identical.
 */
export class RestAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Promise<AuthSession> {
    return this.http.post<AuthSession>("/auth/login", credentials, {
      skipAuth: true,
    });
  }

  signup(data: SignupData): Promise<AuthSession> {
    return this.http.post<AuthSession>("/auth/signup", data, {
      skipAuth: true,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.http.post("/auth/logout", { refreshToken });
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>(
      "/auth/refresh",
      { refreshToken },
      { skipAuth: true },
    );
  }

  me(_accessToken: string): Promise<User> {
    // Token is attached automatically by the HttpClient's AuthTokenProvider.
    return this.http.get<User>("/auth/me");
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.http.post(
      "/auth/forgot-password",
      { email },
      { skipAuth: true },
    );
  }
}
