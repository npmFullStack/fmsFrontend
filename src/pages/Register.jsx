// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerSchema, defaultRegisterValues } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
// Import the same image
import loginImage from '../assets/images/loginImage.png';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { registerMutation, isAuthenticated, userQuery } = useAuth();

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
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: defaultRegisterValues,
  });

  const onSubmit = async (data) => {
    try {
      await registerMutation.mutateAsync(data);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      if (error.response?.data?.errors) {
        // Set specific field errors
        Object.keys(error.response.data.errors).forEach((field) => {
          setError(field, { message: error.response.data.errors[field][0] });
        });
      } else {
        setError('root', { message: errorMessage });
      }
    }
  };

  if (isAuthenticated() && userQuery.data) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Main container with padding */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[85vh] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
          {/* Left side - Register form */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  Create Account
                </h2>
                <p className="mt-2 text-gray-600">
                  Sign up to get started with our platform
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5">
                  {/* First Name Field */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      {...register('first_name')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your first name"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      {...register('last_name')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your last name"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Contact Number Field */}
                  <div>
                    <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number (Optional)
                    </label>
                    <input
                      {...register('contact_number')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your contact number"
                    />
                    {errors.contact_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.contact_number.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-10"
                        placeholder="Enter your password (min. 8 characters)"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password_confirmation')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-10"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {errors.root && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{errors.root.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending || !isValid}
                    className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(!isValid || registerMutation.isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Back to Home Link */}
                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
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

export default Register;