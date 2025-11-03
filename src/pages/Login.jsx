// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
      navigate('/dashboard');
    } catch (error) {
      // Set form errors based on API response
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      if (error.response?.data?.errors?.email) {
        setError('email', { message: error.response.data.errors.email[0] });
      } else {
        setError('root', { message: errorMessage });
      }
    }
  };

  if (isAuthenticated() && userQuery.data) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-main">
      {/* Main container with padding */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[85vh] bg-main rounded-2xl overflow-hidden">
          {/* Left side - Login form */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-heading">
                  Welcome Back
                </h2>
                <p className="mt-2 text-muted">
                  Sign in to your logistics management dashboard
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="modal-label">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="modal-input"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="modal-error">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="modal-label">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="modal-input pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-content transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="modal-error">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {errors.root && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{errors.root.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending || !isValid}
                    className={`w-full modal-btn-primary ${(!isValid || loginMutation.isPending) ? 'modal-btn-disabled' : ''}`}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                {/* Back to Home Link */}
                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm text-primary hover:text-blue-700 transition-colors font-medium"
                  >
                    ← Back to home
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="hidden lg:block flex-1 relative">
            <div className="absolute inset-0 p-8 flex items-center justify-center">
              <div className="relative w-full h-full max-w-2xl mx-auto">
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