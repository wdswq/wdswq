import { useAppStore } from '@/lib/store'

describe('App Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({ user: null, theme: 'light' })
  })

  it('initializes with default values', () => {
    const store = useAppStore.getState()
    
    expect(store.user).toBeNull()
    expect(store.theme).toBe('light')
  })

  it('updates user', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
    
    useAppStore.getState().setUser(user)
    
    expect(useAppStore.getState().user).toEqual(user)
  })

  it('updates theme', () => {
    useAppStore.getState().setTheme('dark')
    
    expect(useAppStore.getState().theme).toBe('dark')
  })

  it('clears user', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
    
    useAppStore.getState().setUser(user)
    expect(useAppStore.getState().user).toEqual(user)
    
    useAppStore.getState().setUser(null)
    expect(useAppStore.getState().user).toBeNull()
  })
})