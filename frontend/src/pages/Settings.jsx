import '../styles/settings.css'
import {useAuth} from "../context/AuthContext.jsx";
import {getLevel} from "../utils/levelLogic.js";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

export default function Settings() {
    const {user, token, logout, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [avatars, setAvatars] = useState([]);

    const [usernameStatus, setUsernameStatus] = useState({type: '', msg: ''})
    const [passwordStatus, setPasswordStatus] = useState({type: '', msg: ''})
    const [deleteStatus, setDeleteStatus] = useState({type: '', msg: ''})

    const [confirmDelete, setConfirmDelete] = useState(false)

    // Get Avatars
    const fetchAvatars = async () => {
        try {
            refreshToken()
            const response = await fetch('http://localhost:3000/api/settings/fetch-avatars', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            setAvatars(data)
        } catch (err) {
            console.log(err)
        }
    }

    // Update Avatar
    const updateAvatar = async (selectedAvatar) => {
        user.avatar = selectedAvatar

        try {
            refreshToken()
            const response = await fetch('http://localhost:3000/api/settings/update-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar: selectedAvatar })
            });
            const data = await response.json();

            if (response.ok) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    storedUser.avatar = selectedAvatar;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                }
                window.location.reload();
            } else {
                console.error("Failed to update avatar:", data.message);
            }
        } catch(err) {
            console.error("Network error updating avatar:", err);
        }

    }

    const getDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = String(date.getFullYear()).slice(-2);
        return `Unlocked At: ${d}/${m}/${y}`;
    };

    // Set Public / Private Profile
    const toggleVisibility = async (e) => {
        const isChecked = e.target.checked ? 1 : 0
        user.is_public = isChecked

        try {
            refreshToken()
            const response = await fetch('http://localhost:3000/api/settings/toggle-visibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    isPublic: isChecked
                })
            })

            if (response.ok){
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    storedUser.is_public = isChecked;
                    localStorage.setItem('user', JSON.stringify(storedUser));
                }
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to Update Visibility", err)
        }
    }

    // Update username
    const updateUsername = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newUsername = formData.get("username");
        if(!newUsername) return;

        user.username = newUsername;
        try {
            refreshToken()
            const response = await fetch('http://localhost:3000/api/settings/update-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newUsername: newUsername})
            })
            const data = await response.json();

            if(response.ok) {
                const { token: newToken } = data;
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const updatedUser = { ...storedUser, username: newUsername };

                localStorage.setItem('user', JSON.stringify(updatedUser));
                localStorage.setItem('token', newToken);

                setUsernameStatus({type: 'success', msg: 'Username Updated! Refreshing...'});
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setUsernameStatus({type: 'error', msg: data.message || 'Error Updating Username'});
            }
        } catch (err) {
            setUsernameStatus({type: 'error', msg: 'Server Error'})
        }
    }

    // Update Password
    const updatePassword = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const oldPassword = formData.get("oldPassword")
        const newPassword = formData.get("newPassword")

        try {
            refreshToken()
            const response = await fetch('http://localhost:3000/api/settings/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            })
            const data = await response.json();

            if (response.ok) {
                setPasswordStatus({type: 'success', msg: 'Password Updated Successfully!'})
                e.target.reset()
                setTimeout(() => setPasswordStatus({ type: '', msg: '' }), 5000);
            } else {
                setPasswordStatus({type: 'error', msg: data.message || 'Error Updating Username'});
            }
        } catch (err) {
            setPasswordStatus({type: 'error', msg: 'Server Error'})
        }
    }

    // Handle delete
    const deleteAccount = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/settings/delete-account', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (response.ok) {
                setDeleteStatus({type: 'success', msg: 'Account Deleted Successfully. Logging Out ...'})
                setTimeout(() => logout(), 5000);
            } else {
                setDeleteStatus({type: 'error', msg: data.message || 'Error Deleting Account. Please try again!'});
            }
        } catch (err) {
            setDeleteStatus({type: 'error', msg: 'Server Error'})
        }
    }

    useEffect(() => {
        fetchAvatars();
    }, [])

    return (
        <div className='settings-wrapper'>
            <div className='settings-page'>
                <div className='set-header'>
                    <h1>Settings</h1>
                    <button className='back' onClick={() => navigate(-1)}>Back</button>
                </div>

                {/* User Card */}
                <div className='set-user'>
                    <div className='set-info'>
                        <span className='set-avatar'>{user.avatar}</span>
                        <div className='set-details'>
                            <h2>{user.username}</h2>
                            <span className='set-star'>⭐ Level {getLevel(user.xp)}</span>
                        </div>
                    </div>
                </div>

                {/* Profile & Privacy */}
                <div className='set-section top'>
                    <h2 className='set-title'>Profile & Privacy</h2>
                    <div className='set-grid'>
                        <div className='set-card'>
                            <h3>Avatar Selection</h3>
                            <div className="avatar-picker">
                                {avatars.map(av => (
                                    <button
                                        key={av.id}
                                        className={`avatar-btn 
                                                   ${user.avatar === av.icon ? 'active' : ''} 
                                                   ${!av.is_unlocked ? 'locked' : ''}`}
                                        disabled={!av.is_unlocked}
                                        onClick={() => av.is_unlocked && updateAvatar(av.icon)}
                                        title={
                                            av.is_free === 1 ? `${getDate(av.unlocked_at)}`
                                                : av.is_unlocked ? `Achieved: ${av.achievement_name} - ${getDate(av.unlocked_at)}` : `Unlock: ${av.achievement_name} (Gold Tier)`}
                                    >
                                        {av.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='set-card'>
                            <h3>Account Visibility</h3>
                            <div className='toggle-wrapper'>
                                <div className='toggle-text'>
                                    <span>Public Profile</span>
                                    <p className='set-hint-inline'>Allow other users to view your stats, level, and earned badges via your profile link.</p>
                                </div>
                                <label className='switch'>
                                    <input
                                        type='checkbox'
                                        checked={user.is_public === 1}
                                        onChange={toggleVisibility}
                                    />
                                    <span className='slider'></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className='set-section bottom'>
                    <h2 className='set-title'>Account Management</h2>
                    <div className='set-grid'>
                        {/* Username Card */}
                        <div className='set-card'>
                            <h3>Change Username</h3>
                            <form className='input-stack' onSubmit={updateUsername}>
                                <input type="type" placeholder={`Current: ${user.username}`} className="set-input" disabled />
                                <input type="type" name='username' placeholder="New Username ...." className="set-input" required onChange={() => setUsernameStatus({type: '', msg: ''})} />
                                <button type="submit" className="set-btn-cyan">Change Username</button>
                            </form>

                            {usernameStatus.msg && (
                                <span className={`status-msg ${usernameStatus.type}`}>
                                    {usernameStatus.msg}
                                </span>
                            )}
                        </div>

                        {/* Password Card */}
                        <div className='set-card'>
                            <h3>Change Password</h3>
                            <form className='input-stack' onSubmit={updatePassword}>
                                <input type="password" name="oldPassword" placeholder="Old Password" required className="set-input" onChange={() => setPasswordStatus({type: '', msg: ''})} />
                                <input type="password" name="newPassword" placeholder="New Password" required className="set-input" onChange={() => setPasswordStatus({type: '', msg: ''})} />
                                <button type="submit" className="set-btn-cyan">Change Password</button>
                            </form>

                            {passwordStatus.msg && (
                                <span className={`status-msg ${passwordStatus.type}`}>
                                    {passwordStatus.msg}
                                </span>
                            )}
                        </div>

                        {/* Delete Account */}
                        <div className='set-card danger-zone'>
                            <h3>Danger Zone</h3>
                            <div className="danger-content">
                                <p>Deleting your account will permanently wipe all XP, level progress, and achievements. This cannot be undone.</p>

                                {!confirmDelete ? (
                                    <button
                                        className='set-btn-red'
                                        onClick={() => setConfirmDelete(true)}
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <>
                                        <div className="confirm-actions">
                                            <p className="are-you-sure">Are you absolutely sure?</p>
                                            <button className='set-btn-red' onClick={deleteAccount}>
                                                Yes, Delete Everything
                                            </button>
                                            <button className='set-btn-cancel' onClick={() => setConfirmDelete(false)}>
                                                Cancel
                                            </button>
                                        </div>

                                        {deleteStatus.msg && (
                                            <span className={`status-msg ${deleteStatus.type}`}>
                                                {deleteStatus.msg}
                                            </span>
                                         )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}