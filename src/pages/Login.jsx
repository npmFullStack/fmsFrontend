// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginSchema, defaultLoginValues } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
// Import the image
import loginImage from '../assets/images/loginImage.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginMutation, isAuthenticated, userQuery } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated() && userQuery.data) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, userQuery.data, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: defaultLoginValues,
  });

  const onSubmit = async (data) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      // Set form errors based on API response
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      if (error.response?.data?.errors?.email) {
        setError('email', { message: error.response.data.errors.email[0] });
      } else {
        setError('root', { message: errorMessage });
      }
      toast.error(errorMessage);
    }
  };

  if (isAuthenticated() && userQuery.data) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4">
      {/* Centered container with white background - made smaller */}
      <div className="w-full max-w-3xl bg-surface rounded-2xl overflow-hidden shadow-lg">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Login form */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm w-full space-y-4">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-heading">
                  Welcome Back
                </h2>
                <p className="mt-1 text-content-muted text-xs">
                  Sign in to access your account
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-3">
                  {/* Email Field */}
                  <div>
                    <label className="modal-label text-sm">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="modal-input py-2 text-sm"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <span className="modal-error text-xs">{errors.email.message}</span>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="modal-label text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="modal-input py-2 text-sm pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-muted hover:text-heading transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="modal-error text-xs">{errors.password.message}</span>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {errors.root && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs">
                    <p className="text-red-800">{errors.root.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending || !isValid}
                    className={`w-full modal-btn-primary py-2 text-sm ${(!isValid || loginMutation.isPending) ? 'modal-btn-disabled' : ''}`}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                {/* Sign up link */}
                <div className="text-center">
                  <p className="text-xs text-content-muted">
                    Doesn't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>

                {/* Back to Home Link */}
                <div className="text-center">
                  <Link
                    to="/"
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    ← Back to home
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="hidden lg:block flex-1">
            <div className="h-full flex items-center justify-center p-6">
              <div className="w-full h-56 lg:h-full max-h-80">
                <img
                  src={loginImage}
                  alt="Logistics and Shipping"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;