import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './AdminLoginPage.module.css'
import { adminLogin } from '../../../services'
import { useAuthenticationStore } from '../../../stores'
import { AlertTriangle, ArrowLeft, Hospital } from 'lucide-react'
import { Input } from '../../../components'

const AdminLoginPage = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated, fetchUserProfile } = useAuthenticationStore()

    const [form, setForm] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})

    //only redirect if already authenticated before attempting login
    useEffect(() => {
        if (isAuthenticated && user?.userType === 'admin') {
            navigate('/admin/dashboard', { replace: true })
        }
    }, []) // intentionally empty — only run on mount to catch already-logged-in admins

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setFieldErrors(prev => ({ ...prev, [name]: undefined }))
        setError(null)
    }

    const validate = () => {
        const errors: { username?: string; password?: string } = {}
        if (!form.username.trim()) errors.username = 'Username is required'
        if (!form.password) errors.password = 'Password is required'
        return errors
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const errors = validate()
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await adminLogin({ username: form.username.trim(), password: form.password })
            await fetchUserProfile()

            //manually mark as authenticated then navigate
            useAuthenticationStore.setState({ isAuthenticated: true })
            navigate('/admin/dashboard', { replace: true })
        } catch (err: any) {
            const message = err?.message || err?.error || 'Invalid username or password'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className={styles.container}>
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.logoWrapper}>
                    <Hospital size={32} color="white" strokeWidth={1.5} />
                </div>
                <h1 className={styles.title}>Admin Portal</h1>
                <p className={styles.subtitle}>Sign in with your admin credentials</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {error && (
                    <div className={styles.errorBanner}>
                        <AlertTriangle size={16} className={styles.errorIcon} />
                        {error}
                    </div>
                )}

                <Input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    leftIcon="user"
                    value={form.username}
                    onChange={handleChange}
                    error={fieldErrors.username}
                    label="Username"
                    autoComplete="username"
                    autoFocus
                />

                <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    leftIcon="lock"
                    rightIcon={showPassword ? 'eye-slash' : 'eye'}
                    onRightIconClick={() => setShowPassword(prev => !prev)}
                    value={form.password}
                    onChange={handleChange}
                    error={fieldErrors.password}
                    label="Password"
                    autoComplete="current-password"
                />

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.loadingWrapper}>
                            <span className={styles.spinner} />
                            Signing in...
                        </span>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className={styles.cardFooter}>
                <Link to="/" className={styles.backLink}>
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back to main site
                </Link>
            </div>
        </div>
    </div>
  )
}

export default AdminLoginPage