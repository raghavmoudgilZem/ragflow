import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';
import { AUTH_ERROR_MESSAGES } from '../constants/errorMessages';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('useAuthStore Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      error: null,
      isLoading: false,
    });
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================
  // 🔒 BASELINE TEST CASES
  // ==========================================================
  it('should handle corrupted JSON profile data in storage cleanly', () => {
    sessionStorage.setItem('userProfile', '{invalid-json-corrupted-string');
    const profile = sessionStorage.getItem('userProfile');
    let parsed = null;
    try {
      if (profile) parsed = JSON.parse(profile);
    } catch (e) {
      console.error("Failed to parse initial user profile state:", e);
    }
    expect(parsed).toBeNull();
  });

  it('should initialize correctly with empty base values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should clear validation errors cleanly from state memory layers', () => {
    useAuthStore.setState({ error: 'Runtime error trigger' });
    useAuthStore.getState().clearAuthError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('should handle login actions when the network layer is offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.OFFLINE);
  });

  it('should process login successfully using snake_case user payload models', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.post.mockResolvedValue({
      data: {
        accessToken: 'at-token',
        refreshToken: 'rt-token',
        user: {
          id: 'usr-1',
          email: 'veera@zemoso.com',
          nickname: 'Veera',
          avatar_url: 'svg-path',
          current_tenant_id: 'tn-99'
        }
      }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(true);
    expect(useAuthStore.getState().user?.id).toBe('usr-1');
  });

  it('should process login successfully using camelCase userProfile payload models', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.post.mockResolvedValue({
      data: {
        accessToken: 'at-token',
        refreshToken: 'rt-token',
        userProfile: {
          id: 'usr-2',
          email: 'veera@zemoso.com',
          nickname: 'Veera',
          avatarUrl: 'svg-path',
          currentTenantId: 'tn-100'
        }
      }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(true);
    expect(useAuthStore.getState().user?.currentTenantId).toBe('tn-100');
  });

  it('should extract error responses using message fields accurately', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: 'Custom server alert message' } }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe('Custom server alert message');
  });

  it('should extract error responses using error fields accurately', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: 'Explicit error context payload' } }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe('Explicit error context payload');
  });

  it('should fall back to the default login error message when axios responses omit detail fields', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValue({
      response: { data: {} }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.FALLBACK_FAILED);
  });

  it('should throw connection errors if mock port parameters are drop-dead frozen', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValue({ request: {} });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.MOCK_CONNECT_FAILED);
  });

  it('should fall back to the display name when login payloads omit a nickname', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.post.mockResolvedValue({
      data: {
        accessToken: 'at-token',
        refreshToken: 'rt-token',
        user: {
          id: 'usr-name-fallback',
          email: 'veera@zemoso.com',
          nickname: '',
          name: 'Veera Display'
        }
      }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Veera Display');
  });

  it('should handle non-axios structural processing crash flags safely', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedAxios.post.mockRejectedValue(new Error('Fatal evaluation crash'));

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.FALLBACK_FAILED);
  });

  it('should process registration requests using safe offline conditions', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const success = await useAuthStore.getState().registerUser({ email: 'v@z.com', password: '123', nickname: 'v' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.OFFLINE);
  });

  it('should handle registration updates accurately under successful resolutions', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    const success = await useAuthStore.getState().registerUser({ email: 'v@z.com', password: '123', nickname: 'v' });
    expect(success).toBe(true);
  });

  it('should return extracted server error structures upon registration failures via non-axios exceptions', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(false);
    mockedAxios.post.mockRejectedValue(new Error('Registration structure crash'));
    const success = await useAuthStore.getState().registerUser({ email: 'v@z.com', password: '123', nickname: 'v' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.FALLBACK_FAILED);
  });

  it('should surface response payload errors for registration failures', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValue({ response: { data: { message: 'Registration blocked' } } });

    const success = await useAuthStore.getState().registerUser({ email: 'v@z.com', password: '123', nickname: 'v' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe('Registration blocked');
  });

  it('should surface request-layer transport errors for registration failures', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.post.mockRejectedValue({ request: {} });

    const success = await useAuthStore.getState().registerUser({ email: 'v@z.com', password: '123', nickname: 'v' });
    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toBe(AUTH_ERROR_MESSAGES.MOCK_CONNECT_FAILED);
  });

  it('should initialize to a null profile when session storage contains invalid JSON', async () => {
    sessionStorage.setItem('userProfile', '{invalid-json');

    vi.resetModules();
    const { useAuthStore: reloadedStore } = await import('./useAuthStore');

    expect(reloadedStore.getState().user).toBeNull();
  });

  it('should perform secure session clean up on executing custom logouts', () => {
    sessionStorage.setItem('accessToken', 'alive-token');
    useAuthStore.setState({ user: { id: 'usr-test' } as any });
    useAuthStore.getState().logoutAction();
    expect(useAuthStore.getState().user).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();
  });

  // ==========================================================
  // 🏢 TENANT CONTEXT TEST CASES
  // ==========================================================
  it('should populate tenantContext fallback arrays during user login if entirely omitted from network response payload', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    mockedAxios.post.mockResolvedValue({
      data: {
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        user: {
          id: 'usr-empty-ctx',
          email: 'veera@zemoso.com',
          nickname: 'Veera Dev'
        }
      }
    });

    const success = await useAuthStore.getState().loginUser({ email: 'veera@zemoso.com', password: '123' });
    expect(success).toBe(true);

    const loggedInUser = useAuthStore.getState().user;
    expect(loggedInUser?.tenantContext).toBeDefined();
    expect(loggedInUser?.tenantContext?.members).toEqual([]);
    expect(loggedInUser?.tenantContext?.joinedTeams).toEqual([]);
  });

  it('should cleanly update Zustand store user state metrics when executing refreshTenantContext', () => {
    const baselineUser = {
      id: 'usr-45',
      email: 'veera@zemoso.com',
      tenantContext: { members: [], joinedTeams: [] }
    };
    useAuthStore.setState({ user: baselineUser as any });

    const newMembers = [{ id: 'mem-1', email: 'team@zemoso.com', nickname: 'Colleague', role: 'member' }];
    useAuthStore.getState().refreshTenantContext({ members: newMembers as any });

    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.tenantContext?.members).toHaveLength(1);
    expect(updatedUser?.tenantContext?.members?.[0].id).toBe('mem-1');
    expect(updatedUser?.tenantContext?.joinedTeams).toEqual([]);
  });

  it('should sync patch userProfile parameters in sessionStorage memory layers upon calling refreshTenantContext', () => {
    const initialStoredUser = {
      id: 'usr-45',
      tenantContext: { members: [], joinedTeams: [] }
    };
    sessionStorage.setItem('userProfile', JSON.stringify(initialStoredUser));
    useAuthStore.setState({ user: initialStoredUser as any });

    const newTeams = [{ id: 'team-xyz', name: 'RAGFlow Frontend Core Team' }];
    useAuthStore.getState().refreshTenantContext({ joinedTeams: newTeams as any });

    const retrievedStringProfile = sessionStorage.getItem('userProfile');
    expect(retrievedStringProfile).toBeDefined();

    const parsedStoredProfile = JSON.parse(retrievedStringProfile!);
    expect(parsedStoredProfile.tenantContext.joinedTeams).toHaveLength(1);
    expect(parsedStoredProfile.tenantContext.joinedTeams[0].id).toBe('team-xyz');
  });

  it('should safely retain current values when update fields evaluate as missing or undefined inside refreshTenantContext', () => {
    const existingUser = {
      id: 'usr-99',
      tenantContext: {
        members: [{ id: 'm-keep' } as any],
        joinedTeams: [{ id: 't-keep' } as any]
      }
    };
    useAuthStore.setState({ user: existingUser as any });

    useAuthStore.getState().refreshTenantContext({});

    const activeUser = useAuthStore.getState().user;
    expect(activeUser?.tenantContext?.members).toHaveLength(1);
    expect(activeUser?.tenantContext?.joinedTeams).toHaveLength(1);
  });

  it('should initialize empty tenant context arrays when no prior values exist inside refreshTenantContext', () => {
    sessionStorage.setItem('userProfile', JSON.stringify({ id: 'usr-empty-context' }));
    useAuthStore.setState({ user: { id: 'usr-empty-context' } as any });

    useAuthStore.getState().refreshTenantContext({});

    const activeUser = useAuthStore.getState().user;
    expect(activeUser?.tenantContext?.members).toEqual([]);
    expect(activeUser?.tenantContext?.joinedTeams).toEqual([]);

    const storedProfile = JSON.parse(sessionStorage.getItem('userProfile')!);
    expect(storedProfile.tenantContext.members).toEqual([]);
    expect(storedProfile.tenantContext.joinedTeams).toEqual([]);
  });

  it('should handle completely empty state user checks inside refreshTenantContext hook updates gracefully', () => {
    useAuthStore.setState({ user: null });

    expect(() => {
      useAuthStore.getState().refreshTenantContext({ members: [] });
    }).not.toThrow();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should intercept parsing crash flags silently when sessionStorage string values are corrupted during context refresh', () => {
    sessionStorage.setItem('userProfile', '{corrupted-string-data');

    const silentConsoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      useAuthStore.getState().refreshTenantContext({ members: [] });
    }).not.toThrow();

    expect(silentConsoleSpy).toHaveBeenCalledWith(
      "Silent intercept patch sync failure inside sessionStorage:",
      expect.any(Error)
    );
    silentConsoleSpy.mockRestore();
  });

  // ==========================================================
  // ✨ PROFILE UPDATE & updateProfileState TEST CASES
  // ==========================================================
  it('should update profile state and sync cleanly with sessionStorage when calling updateProfileState', () => {
    const initialUser = {
      id: 'usr-veera-123',
      email: 'veerababu.musamalla@zemosolabs.com',
      nickname: 'Veera',
      timeZone: 'UTC+8 Asia/Shanghai',
    };
    sessionStorage.setItem('userProfile', JSON.stringify(initialUser));
    useAuthStore.setState({ user: initialUser as any });

    useAuthStore.getState().updateProfileState({
      nickname: 'VeeraUpdated',
      timeZone: 'UTC+0 Europe/London',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=new',
    });

    const stateUser = useAuthStore.getState().user;
    expect(stateUser?.nickname).toBe('VeeraUpdated');
    expect(stateUser?.name).toBe('VeeraUpdated');
    expect(stateUser?.timeZone).toBe('UTC+0 Europe/London');
    expect(stateUser?.avatarUrl).toBe('https://api.dicebear.com/7.x/bottts/svg?seed=new');

    const storedProfile = JSON.parse(sessionStorage.getItem('userProfile')!);
    expect(storedProfile.nickname).toBe('VeeraUpdated');
    expect(storedProfile.timeZone).toBe('UTC+0 Europe/London');
  });

  it('should handle updateProfileState when no user profile exists in sessionStorage initially', () => {
    const initialUser = { id: 'usr-123', email: 'v@z.com' };
    useAuthStore.setState({ user: initialUser as any });

    useAuthStore.getState().updateProfileState({
      nickname: 'NewNickname',
    });

    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.nickname).toBe('NewNickname');

    const stored = JSON.parse(sessionStorage.getItem('userProfile')!);
    expect(stored.nickname).toBe('NewNickname');
  });

  it('should correctly evaluate name fallback resolution rules in updateProfileState', () => {
    const initialUser = { id: 'usr-123', email: 'v@z.com' };
    useAuthStore.setState({ user: initialUser as any });

    useAuthStore.getState().updateProfileState({
      name: 'ExplicitName',
    });

    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.name).toBe('ExplicitName');
  });

  it('should return empty state update when user is null in updateProfileState', () => {
    useAuthStore.setState({ user: null });

    useAuthStore.getState().updateProfileState({
      nickname: 'ShouldNotCrash',
    });

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should catch error gracefully if sessionStorage throws exception during updateProfileState', () => {
    const initialUser = { id: 'usr-123', email: 'v@z.com' };
    useAuthStore.setState({ user: initialUser as any });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    const silentConsoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      useAuthStore.getState().updateProfileState({ nickname: 'FailSync' });
    }).not.toThrow();

    expect(silentConsoleSpy).toHaveBeenCalledWith(
      'Failed to sync profile update into store and sessionStorage:',
      expect.any(Error)
    );

    silentConsoleSpy.mockRestore();
  });
});