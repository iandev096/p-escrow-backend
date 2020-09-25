import { AuthVerifyUserGuard } from './auth-verify-user.guard';

describe('AuthVerifyUserGuard', () => {
  it('should be defined', () => {
    expect(new AuthVerifyUserGuard()).toBeDefined();
  });
});
