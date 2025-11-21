// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerSchema, defaultRegisterValues } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
// Import the same image
import registerImage from '../assets/images/registerImage.png';

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
      toast.success('Registration successful! Welcome aboard!');
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
      toast.error(errorMessage);
    }
  };

  if (isAuthenticated() && userQuery.data) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4">
      {/* Centered container with white background - made smaller */}
      <div className="w-full max-w-5xl bg-surface rounded-2xl overflow-hidden shadow-lg">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Register form */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-4">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-heading">
                  Create Your Account
                </h2>
                <p className="mt-1 text-content-muted text-xs">
                  Hello! Welcome to our platform. Let's get you started.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Name Fields - 2 columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* First Name Field */}
                  <div>
                    <label className="modal-label text-sm">
                      First Name
                    </label>
                    <input
                      {...register('first_name')}
                      type="text"
                      className="modal-input py-2 text-sm"
                      placeholder="First name"
                    />
                    {errors.first_name && (
                      <span className="modal-error text-xs">{errors.first_name.message}</span>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div>
                    <label className="modal-label text-sm">
                      Last Name
                    </label>
                    <input
                      {...register('last_name')}
                      type="text"
                      className="modal-input py-2 text-sm"
                      placeholder="Last name"
                    />
                    {errors.last_name && (
                      <span className="modal-error text-xs">{errors.last_name.message}</span>
                    )}
                  </div>
                </div>

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

                {/* Contact Number Field */}
                <div>
                  <label className="modal-label text-sm">
                    Contact Number (Optional)
                  </label>
                  <input
                    {...register('contact_number')}
                    type="tel"
                    className="modal-input py-2 text-sm"
                    placeholder="Contact number"
                  />
                  {errors.contact_number && (
                    <span className="modal-error text-xs">{errors.contact_number.message}</span>
                  )}
                </div>

                {/* Password Fields - 2 columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        placeholder="Min. 8 characters"
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

                  {/* Confirm Password Field */}
                  <div>
                    <label className="modal-label text-sm">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password_confirmation')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="modal-input py-2 text-sm pr-10"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-muted hover:text-heading transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <span className="modal-error text-xs">{errors.password_confirmation.message}</span>
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
                    disabled={registerMutation.isPending || !isValid}
                    className={`w-full modal-btn-primary py-2 text-sm ${(!isValid || registerMutation.isPending) ? 'modal-btn-disabled' : ''}`}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-xs text-content-muted">
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
                  src={registerImage}
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