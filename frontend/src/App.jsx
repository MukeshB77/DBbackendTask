import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout, signup } from './features/auth/authSlice'
import { deactivateUser, fetchUsers } from './features/users/usersSlice'
import './App.css'

function AuthForm() {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (isSignup) {
      dispatch(signup({ name: name.trim(), email: email.trim(), password }))
    } else {
      dispatch(login({ email: email.trim(), password }))
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Campus community</h1>
        <p>{isSignup ? 'Create a student account.' : 'Sign in to your account.'}</p>

        {isSignup && (
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
        </button>
        <p className="form-switch">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </form>
    </main>
  )
}

function Dashboard() {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const { list: users, loading, error } = useSelector((state) => state.users)
  const [search, setSearch] = useState('')
  const isFaculty = user.role === 'faculty'

  useEffect(() => {
    if (isFaculty) dispatch(fetchUsers(token))
  }, [dispatch, isFaculty, token])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter((person) =>
      `${person.name} ${person.email} ${person.role}`.toLowerCase().includes(term),
    )
  }, [search, users])

  async function handleDeactivate(person) {
    if (window.confirm(`Deactivate ${person.name}'s account?`)) {
      await dispatch(deactivateUser({ id: person._id, token }))
    }
  }

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <h1>Campus community</h1>
          <p>Signed in as {user.name} ({user.role})</p>
        </div>
        <button className="secondary-button" onClick={() => dispatch(logout())}>
          Sign out
        </button>
      </header>

      {isFaculty ? (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>People</h2>
              <p>{users.length} active accounts</p>
            </div>
            <input
              className="search-input"
              type="search"
              placeholder="Search people"
              aria-label="Search people"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading && <p className="notice">Loading people…</p>}
          {error && <p className="error notice" role="alert">{error}</p>}
          {!loading && !error && filteredUsers.length === 0 && (
            <p className="notice">{search ? 'No matching people.' : 'No accounts yet.'}</p>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Profile</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((person) => (
                    <tr key={person._id}>
                      <td>{person.name}</td>
                      <td>{person.email}</td>
                      <td>{person.role}</td>
                      <td>{person.profile?.bio || '—'}</td>
                      <td>
                        {person.role === 'student' && (
                          <button
                            className="text-button"
                            onClick={() => handleDeactivate(person)}
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="content-card student-card">
          <h2>Welcome, {user.name}</h2>
          <p>Your student account is ready.</p>
          <dl>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Role</dt><dd>{user.role}</dd></div>
          </dl>
        </section>
      )}
    </main>
  )
}

function App() {
  const user = useSelector((state) => state.auth.user)
  return user ? <Dashboard /> : <AuthForm />
}

export default App
