import React, { useState } from 'react';
import { useAdminResetPassword } from '../hooks/useAdminResetPassword';

interface Props {
  userId: string;
  onClose: () => void;
}

const AdminResetPasswordModal: React.FC<Props> = ({ userId, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { resetPassword} = useAdminResetPassword();

  // Validate password function
  const validatePassword = (password: string) => {
    const errors = [];
    if (!password) {
      errors.push('Password is required');
    }
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (password.includes(' ')) {
      errors.push('Password cannot contain spaces');
    }
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = passwordErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);
    setConfirmTouched(false);
    
    if (!isPasswordValid) {
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    await resetPassword(userId, newPassword);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reset Password for User</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3 position-relative">
                <input
                  type="password"
                  className={`form-control ${passwordTouched && !isPasswordValid ? 'is-invalid' : ''}`}
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                  required
                />
                {passwordTouched && passwordErrors.length > 0 && (
                  <div className="invalid-feedback">
                    {passwordErrors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-3 position-relative">
                <input
                  type="password"
                  className={`form-control ${confirmTouched && (newPassword !== confirmPassword || !isPasswordValid) ? 'is-invalid' : ''}`}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setConfirmTouched(true);
                  }}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                {confirmTouched && confirmPassword && isPasswordValid && (
                  newPassword === confirmPassword ? (
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'green' }}>
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                  ) : (
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'red' }}>
                      <i className="bi bi-x-circle-fill"></i>
                    </span>
                  )
                )}
                {confirmTouched && newPassword !== confirmPassword && isPasswordValid && (
                  <div className="invalid-feedback">Passwords do not match.</div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Close</button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              onClick={handleSubmit} 
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPasswordModal;
