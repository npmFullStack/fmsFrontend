import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, defaultUserValues } from '../../schemas/userSchema';
import SharedModal from '../ui/SharedModal';
import { Loader2, AlertCircle } from 'lucide-react';

const AddUser = ({ isOpen, onClose, onSave, isLoading = false }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(userSchema),
        mode: 'onChange',
        defaultValues: defaultUserValues,
    });

    useEffect(() => {
        if (isOpen) reset(defaultUserValues);
    }, [isOpen, reset]);

    const onSubmit = (data) => {
        // Trim the values and send the data (password will be auto-generated in backend)
        const formattedData = {
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim(),
            contact_number: data.contact_number?.trim() || '',
            // Password removed - will be auto-generated in backend
        };
        onSave(formattedData);
    };

    const handleClose = () => {
        reset(defaultUserValues);
        onClose();
    };

    return (
        <SharedModal isOpen={isOpen} onClose={handleClose} title="Add User" size="sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* First Name & Last Name - One Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="modal-label">First Name</label>
                        <input
                            type="text"
                            placeholder="Enter first name"
                            className="modal-input"
                            {...register('first_name')}
                        />
                        {errors.first_name && <span className="modal-error text-sm">{errors.first_name.message}</span>}
                    </div>
                    <div>
                        <label className="modal-label">Last Name</label>
                        <input
                            type="text"
                            placeholder="Enter last name"
                            className="modal-input"
                            {...register('last_name')}
                        />
                        {errors.last_name && <span className="modal-error text-sm">{errors.last_name.message}</span>}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="modal-label">Email</label>
                    <input
                        type="email"
                        placeholder="Enter email address"
                        className="modal-input"
                        {...register('email')}
                    />
                    {errors.email && <span className="modal-error text-sm">{errors.email.message}</span>}
                </div>

                {/* Contact Number - Numbers Only */}
                <div>
                    <label className="modal-label">Contact Number (Optional)</label>
                    <input
                        type="tel"
                        placeholder="Enter contact number"
                        className="modal-input"
                        {...register('contact_number', {
                            pattern: {
                                value: /^[0-9+-\s()]*$/,
                                message: 'Please enter a valid phone number'
                            }
                        })}
                        onInput={(e) => {
                            // Allow only numbers, +, -, (, ), and spaces
                            e.target.value = e.target.value.replace(/[^0-9+-\s()]/g, '');
                        }}
                    />
                    {errors.contact_number && <span className="modal-error text-sm">{errors.contact_number.message}</span>}
                </div>

                {/* Info Box - Updated to match AddPort design */}
                <div className="email-notice border border-blue-700 bg-blue-900 py-2">
                    <div className="flex items-start gap-3 pl-3">
                        <AlertCircle className="email-notice-icon text-blue-100 w-4 h-4 mt-0.5" />
                        <div className="email-notice-text text-blue-200 text-sm">
                            <p className="font-medium">Note:</p>
                            <p>A random 8-character password will be automatically generated and sent to the user's email address.</p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`modal-btn-cancel ${isLoading ? 'modal-btn-disabled' : ''}`}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={`modal-btn-primary ${(!isValid || isLoading) ? 'modal-btn-disabled' : ''}`}
                        disabled={!isValid || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Add User'
                        )}
                    </button>
                </div>
            </form>
        </SharedModal>
    );
};

export default AddUser;