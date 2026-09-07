import LoginLeftSide from './LoginLeftSide'
import { Link, useNavigate } from 'react-router'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import PasswordInput from './PasswordInput'
import DemoFillButton from './DemoFillButton'
import { DEMO_CREDENTIALS } from '../assets/assets'

const LoginForm = ({role, title, subtitle}) => {

    const { login, logout } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const demo = DEMO_CREDENTIALS[role]

    const fillDemoCredentials = () => {
        setEmail(demo.email)
        setPassword(demo.password)
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const res = await login(email, password)
            if (res.role !== role) {
                logout()
                setError(`This account is not a ${role === "ADMIN" ? "admin" : "employee"} account. Please use the correct portal.`)
                return
            }
            toast.success("Logged in successfully")
            navigate("/dashboard")
        } catch (err) {
            const message = err.message || "Invalid email or password"
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LoginLeftSide />

      <div className='flex-1 flex items-center justify-center p-6 sm:p-12 bg-white'>
        <div className="w-full max-w-md animate-fade-in">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors"
          >
            <ArrowLeftIcon size={16} /> Back to portals
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-medium text-zinc-800">
              {title}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              {subtitle}
            </p>
                  </div>
                  {error && (
                      <div className='mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-3'>
                          <div className='w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0' />
                          {error}
                      </div>
                  )}

                  {demo && (
                      <div className='mb-6'>
                          <DemoFillButton
                              label={demo.label}
                              email={demo.email}
                              onFill={fillDemoCredentials}
                              disabled={loading}
                          />
                      </div>
                  )}

                  <form className='space-y-5' onSubmit={handleSubmit}>
                      <div>
                          <label className='block text-sm font-medium text-slate-700 mb-2'>Email adress</label>
                          <input type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required placeholder='jhon@emaple.com' />
                      </div>
                      <PasswordInput
                          label='Password'
                          labelClassName='block text-sm font-medium text-slate-700 mb-2'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder='Password'
                      />

                      <button type='submit' disabled={loading} className='w-full py-3 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center'> 
                          {loading && <Loader2Icon className='animate-spin h-4 w-4 mr-2' />}
                          sign in
                      </button>
                  </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm
