import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, defaultUserValues } from '../../schemas/userSchema';
import SharedModal from '../ui/SharedModal';
import { Loader2, Info } from 'lucide-react';

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

    return (
        <SharedModal isOpen={isOpen} onClose={onClose} title="Add User" size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        {errors.first_name && <span className="modal-error">{errors.first_name.message}</span>}
                    </div>
                    <div>
                        <label className="modal-label">Last Name</label>
                        <input
                            type="text"
                            placeholder="Enter last name"
                            className="modal-input"
                            {...register('last_name')}
                        />
                        {errors.last_name && <span className="modal-error">{errors.last_name.message}</span>}
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
                    {errors.email && <span className="modal-error">{errors.email.message}</span>}
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
                    {errors.contact_number && <span className="modal-error">{errors.contact_number.message}</span>}
                </div>

                {/* Info Message - Updated Styling */}
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-300">
                            <strong className="text-blue-400">Note:</strong> A random 8-character password will be automatically generated and sent to the user's email address.
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
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