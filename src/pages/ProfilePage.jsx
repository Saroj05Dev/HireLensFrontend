import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, uploadAvatar, clearError } from '../features/profile/profileSlice';
import { updateUser } from '../features/auth/authSlice';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { profile, loading, error, uploadingAvatar } = useSelector((state) => state.profile);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        title: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                title: profile.title || ''
            });
        }
    }, [profile]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateProfile(formData));
        
        if (updateProfile.fulfilled.match(result)) {
            setSuccessMessage('Profile updated successfully');
            setIsEditing(false);
            dispatch(updateUser({ name: formData.name }));
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const result = await dispatch(uploadAvatar(file));
            if (uploadAvatar.fulfilled.match(result)) {
                setSuccessMessage('Avatar uploaded successfully');
                dispatch(updateUser({ avatarUrl: result.payload.avatarUrl }));
            }
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-700';
            case 'RECRUITER':
                return 'bg-blue-100 text-blue-700';
            case 'INTERVIEWER':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1">Manage your personal information</p>
            </div>

            {error && (
                <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="mb-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                    {successMessage}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 md:p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            <div 
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                {profile?.avatarUrl ? (
                                    <img 
                                        src={profile.avatarUrl} 
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                        <span className="text-white text-3xl md:text-4xl font-semibold">
                                            {getInitials(profile?.name)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div 
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                {uploadingAvatar ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">Click to upload avatar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                />
                            ) : (
                                <p className="text-sm md:text-base text-gray-900 py-2">{profile?.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <p className="text-sm md:text-base text-gray-900 py-2">{profile?.email}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <span className={`inline-block px-3 py-1 text-xs md:text-sm font-medium rounded ${getRoleBadgeColor(profile?.role)}`}>
                                {profile?.role}
                            </span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Organization
                            </label>
                            <p className="text-sm md:text-base text-gray-900 py-2">{profile?.organizationName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-gray-400 text-xs">(optional)</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Frontend Developer"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            ) : (
                                <p className="text-sm md:text-base text-gray-900 py-2">
                                    {profile?.title || <span className="text-gray-400">Not set</span>}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            {isEditing ? (
                                <>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: profile?.name || '',
                                                title: profile?.title || ''
                                            });
                                        }}
                                        className="flex-1 md:flex-none px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </form>
                    
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mt-4"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
